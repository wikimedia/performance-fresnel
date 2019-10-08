'use strict';
/**
 * The program interface for Fresnel commands.
 *
 * Interacts with: {@link external:puppeteer/Browser puppeteer/Browser},
 * {@link Writer}, {@link Probe}, and {@link Report}.
 *
 * @module conductor
 */

const fs = require( 'fs' );
const path = require( 'path' );
const puppeteer = require( 'puppeteer' );

const Registry = require( './Registry' );
const Writer = require( './Writer' );
const hasOwn = Object.prototype.hasOwnProperty;
const is = require( './util/is' );
const probesIndex = require( './probes' );
const recorder = require( './recorder' );
const reportsIndex = require( './reports' );

/**
 * Create a Fresnel record.
 *
 * This runs the scenarios from the given configuration object, and saves the
 * record and probe artefacts to an out subdirectory named after the label.
 *
 * The Scenario URL may have placeholders for variables. These allow scenarios
 * to adapt to the current environment. For example, when testing an app
 * like MediaWiki, the hostname and port of the web server may vary in each
 * CI or development environment.
 *
 * @param {Object} config Configuration object, e.g. from `.fresnel.yml`.
 * @param {string} outputDir File path
 * @param {string} label Record label. Must be valid as a directory name.
 * @param {Function} progress Callback for handling internal events
 *  as the recording progresses.
 * @return {Object} Fresnel record.
 * @throws {Error} If configuration is invalid.
 * @throws {Error} If Writer can't create the output directory.
 */
async function record( config, outputDir, label, progress = () => {} ) {
	// Step 1: Preparations
	//
	// - Apply default config.
	// - Validate config.
	// - Create output directory (if needed).
	// - Open the probes and reports registries.
	// - Create an empty recording to store the data we'll gather.

	config = Object.assign( { warmup: false, runs: 1 }, config );
	is.config( config );
	const writer = new Writer( outputDir ).child( label );
	const probeReg = new Registry( Registry.isProbe, probesIndex );
	const reportReg = new Registry( Registry.isReport, reportsIndex );

	// The record will contain meta-data about every scenario,
	// and the data collected by probes on each of the runs.
	const record = {
		scenarios: {}
	};

	// Step 2: Start the browser
	//
	// - Determine the CLI options for the Chromium executable.
	//   Wikimedia CI uses Docker and sets --no-sandbox through this mechanism.
	// - Use puppeteer to launch the browser (Headless Chromium).

	const launchOpts = ( process.env.CHROMIUM_FLAGS ) ?
		{ args: process.env.CHROMIUM_FLAGS.split( /\s+/ ) } :
		{};
	const browser = await puppeteer.launch( launchOpts )

	// Step 3: Perform each configured scenario
	//
	// - Warmup the given url on the server by opening it once in a browser (optional).
	// - Open the url N times in a browser, and each time collect data
	//   from the probes and add the probe's data to the record.
	// - Close the browser.

	progress( 'conductor/record-start', config );

	try {
		for ( const key in config.scenarios ) {
			const scenario = config.scenarios[ key ];
			record.scenarios[ key ] = {
				options: {
					url: scenario.url,
					viewport: scenario.viewport,
					reports: scenario.reports || []
				},
				runs: []
			};

			// Get the Probe objects for this scenario.
			const probes = new Set();
			if ( scenario.reports ) {
				scenario.reports.forEach( ( reportKey ) => {
					const report = reportReg.get( reportKey );
					report.probes.forEach( ( key ) => probes.add( probeReg.get( key ) ) );
				} );
			}
			if ( scenario.probes ) {
				scenario.probes.forEach( ( key ) => probes.add( probeReg.get( key ) ) );
			}

			if ( config.warmup ) {
				progress( 'conductor/warmup' );
				await recorder.warmup( scenario, browser );
			}

			for ( let run = 0; run < config.runs; run++ ) {
				progress( 'conductor/record-run', { scenario: key, run: run } );
				const probeDatas = await recorder.run(
					scenario,
					probes,
					writer.child( `scenario-${key}-run-${run}` ),
					browser,
					progress
				);
				record.scenarios[ key ].runs.push( probeDatas );
			}
		}

	} finally {
		// Use finally, as this should also happen in case of failure.
		// This ensures the Fresnel process can exit cleanly after an error
		// (it can't exit with an active child process).
		await browser.close();
	}

	// Step 4: Analyse the data.
	//
	// Combine values from individual runs. For two runs like this:
	//
	//     record.scenarios[key].runs: [
	//       {
	//         myProbe: { x: 1.4 }
	//       },
	//       {
	//         myProbe: { x: 2.1 }
	//       }
	//     ]
	//
	// The combined version becomes:
	//
	//     record.scenarios[key].combined: {
	//       myProbe: {
	//         x: [ 1.4, 2.1 ]
	//       }
	//     }
	//
	// Then, the Report objects analyse the data and we get:
	//
	//     record.scenarios[key].analysed: {
	//       myProbe: {
	//         x: { mean: 1.75, stdev: 0.35 }
	//       }
	//     }
	//
	function addCombinedData( scenario ) {
		const combined = scenario.combined = {};
		for ( const run of scenario.runs ) {
			for ( const probeName in run ) {
				if ( !hasOwn.call( combined, probeName ) ) {
					combined[ probeName ] = {};
				}
				const data = combined[ probeName ];

				for ( const dataKey in run[ probeName ] ) {
					if ( !hasOwn.call( data, dataKey ) ) {
						data[ dataKey ] = [ run[ probeName ][ dataKey ] ];
					} else {
						data[ dataKey ].push( run[ probeName ][ dataKey ] );
					}
				}
			}
		}
	}
	function addAnalysedData( scenario ) {
		const analysed = scenario.analysed = {};
		for ( const reportName of scenario.options.reports ) {
			analysed[ reportName ] = {};

			const report = reportReg.get( reportName );
			for ( const metric in report.metrics ) {
				analysed[ reportName ][ metric ] =
					report.metrics[ metric ].analyse( scenario.combined );
			}
		}
	}

	for ( const key in record.scenarios ) {
		addCombinedData( record.scenarios[ key ] );
		addAnalysedData( record.scenarios[ key ] );
	}

	// Step 5: Lastly, write the record to disk.
	fs.writeFileSync( writer.getPath( 'record.json' ), JSON.stringify( record, null, 2 ) );

	progress( 'conductor/record-end', { label: label } );

	return record;
}

/**
 * Compare two Fresnel records.
 *
 * @param {string} outputDir File path
 * @param {string} labelA Record label
 * @param {string} labelB Record label
 * @return {Object} Comparison
 * @throws {Error} If records could not be read
 */
async function compare( outputDir, labelA, labelB ) {
	const reportReg = new Registry( Registry.isReport, reportsIndex );

	// Step 1: Read the original records
	const fileA = path.join( path.resolve( outputDir ), labelA, 'record.json' );
	const fileB = path.join( path.resolve( outputDir ), labelB, 'record.json' );
	const recordA = require( fileA );
	const recordB = require( fileB );

	// Step 2: Compare the analysed records.
	function makeJudgement( threshold, diff ) {
		if ( threshold > 0 ) {
			// This metric is characterised as "lower values are better".
			// - If the difference is positive and higher than this, it's bad.
			// - If the difference is negative and bigger than this, it's good.
			if ( diff > threshold ) {
				return false;
			}
			if ( diff < 0 && Math.abs( diff ) > threshold ) {
				return true;
			}
			return null;
		}
		// Idea: Support metrics characterised as "higher values are better".
		// Use a negative threshold value.
		// - If the difference is negative and lower than this, it's bad.
		// - If the difference is positive and bigger than this, it's good.
		return null;
	}
	function makeComparison( recordA, recordB ) {
		const result = {};
		const warnings = [];

		for ( const scenarioKey in recordA.scenarios ) {
			const compared = result[ scenarioKey ] = {};

			const scenarioA = recordA.scenarios[ scenarioKey ];
			const scenarioB = recordB.scenarios[ scenarioKey ];

			for ( const reportName in scenarioA.analysed ) {
				const report = reportReg.get( reportName );
				compared[ reportName ] = {};

				for ( const metricKey in report.metrics ) {
					const metric = report.metrics[ metricKey ];
					const a = scenarioA.analysed[ reportName ][ metricKey ];
					const b = scenarioB.analysed[ reportName ][ metricKey ];
					/* istanbul ignore if */
					if ( !a || !b ) {
						// If the evaluated commit changes the Fresnel configuration,
						// so that one of the scenarios or metrics exists in only one
						// of "before" or "after", then we can't compare it.
						continue;
					}
					const diff = metric.compare( a, b );
					const judgement = makeJudgement( metric.threshold, diff );
					const item = compared[ reportName ][ metricKey ] = {
						caption: metric.caption,
						unit: metric.unit,
						a: a,
						b: b,
						diff: diff,
						compareUnit: metric.compareUnit || metric.unit,
						judgement: judgement
					};
					if ( judgement === false ) {
						warnings.push( item );
					}
				}
			}
		}

		return { result, warnings };
	}

	return makeComparison( recordA, recordB );
}

module.exports = { record, compare };
