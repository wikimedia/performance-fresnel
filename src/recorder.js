'use strict';
/**
 * Represents a single run of a Fresnel scenario in a browser.
 *
 * Interacts with: {@link external:puppeteer/Page puppeteer/Page},
 * {@link Probe}.
 *
 * @private
 * @module recorder
 */

/**
 * Replace curly-brace placeholders with values from the given object.
 *
 *     expandString( 'Hello {PLANET}', { PLANET: 'World' } );
 *     // > "Hello World"
 *
 * @ignore
 * @param {string} str
 * @param {Object} vars
 * @return {string}
 */
function expandString( str, vars ) {
	return str.replace( /{([A-Z_]+)}/g, ( _, key ) => vars[ key ] );
}

/**
 * Run the scenario in the given browser and record data from the probes.
 *
 * A scenario consists of running the following steps:
 *
 * - Create a new browser tab.
 * - Set the viewport.
 * - Run "before" callbacks of probes.
 * - Load the url.
 * - Run "after" callback of probes.
 *
 * @param {Object} options Scenario options
 * @param {string} options.url
 * @param {Object} options.viewport
 * @param {Probe[]|Set} probes List of probes
 * @param {Writer} writer File writer for this scenario
 * @param {external:puppeteer/Browser} browser
 * @param {Function} progress
 * @return {Object} Probe data objects.
 */
async function run( options, probes, writer, browser, progress ) {
	const url = expandString( options.url, process.env );

	// This will store the data collected by probes, keyed by probe name.
	const datas = {};
	for ( const probe of probes ) {
		datas[ probe.name ] = {};
	}

	// Each run should be similar to the first (no http cache or local storage shared
	// between runs). Simply creating and closing tabs within the same browser process
	// for each run would violate that. Instead, create a new (temporary) profile for
	// each run, and create the tab within that. Puppeteer refers to temporary profiles
	// as "incognito contexts", but.. this doesn't actually involve "Incognito mode".

	const context = await browser.createIncognitoBrowserContext();
	const page = await context.newPage();

	await page.setViewport( options.viewport );

	// Run 'setup' callbacks
	for ( const probe of probes ) {
		if ( probe.before ) {
			await probe.before(
				page,
				writer.prefix( probe.name + '--' )
			);
		}
	}

	// Load the url
	progress( 'recorder/navigate', url );
	await page.goto( url );

	// Run 'collect' callbacks
	for ( const probe of probes ) {
		if ( probe.after ) {
			await probe.after(
				page,
				writer.prefix( probe.name + '--' ),
				( data ) => { Object.assign( datas[ probe.name ], data ); }
			);
		}
	}

	await context.close();

	return datas;
}

/**
 * Warm up a given scenario. (Probes are active during warmups.)
 *
 * Called from {@link module:conductor~record conductor}.
 *
 * @param {Object} options Scenario options
 * @param {string} options.url
 * @param {Object} options.viewport
 * @param {external:puppeteer/Browser} browser
 */
async function warmup( options, browser ) {
	const url = expandString( options.url, process.env );

	const context = await browser.createIncognitoBrowserContext();
	const page = await context.newPage();

	await page.setViewport( options.viewport );
	await page.goto( url );
	await context.close();
}

module.exports = { run, warmup };
