'use strict';

const is = require( './util/is' );

/**
 * A probe is a set of callbacks to run client-side when {@link module:conductor~record recording}
 * scenarios.
 *
 * #### probe.before
 *
 * The `before` callback runs before the web page starts loading. Use this to make changes to the
 * browser tab (via {@link external:puppeteer/Page}, or higher-level objects accessed via that,
 * such as {@link external:puppeteer/Browser}). Examples of things one might do here:
 * set the viewport, start timeline tracing, disable JavaScript, grant permission for Geo location,
 * simulate a certain GPS position, etc.
 *
 * Parameters:
 *
 * - {@link external:puppeteer/Page} `page`: The browser tab.
 * - {@link Writer} `writer`: Use this to obtain file paths to write
 *   artefacts to.
 *
 * #### probe.after
 *
 * The `after` callback runs once the web page has finished loading. Use this to capture your
 * data. Typically by using `page.evaluate()` to send JavaScript code to the browser which will be
 * executed client-side in the context of the page. From there, you can access the DOM, other
 * web platform APIs, as well as any custom JavaScript interfaces exposed by code from the
 * web page itself.
 *
 * Parameters:
 *
 * - {@link external:puppeteer/Page} `page`: The browser tab.
 * - {@link Writer} `writer`: Use this to obtain file paths to write artefacts to.
 * - Function `addData`: Use this to store key/value pairs that should be
 *   saved as part of the Fresnel record. These must be serialisable as JSON.
 *
 * @global
 * @typedef {Object} Probe
 * @property {Function} [before]
 * @property {Function} [after]
 * @property {Object} [metrics]
 */

/**
 * Whether a given export is a valid {@link Probe}.
 *
 * @ignore
 * @param {mixed|Probe} value
 * @throw {Error} If invalid
 */
function isProbe( value ) {
	is.like( value, {
		before: [ 'function', 'undefined' ],
		after: [ 'function', 'undefined' ],
		name: 'string'
	}, 'probe' );
}

/**
 * A report analyses data from a {@link Probe} when {@link module:conductor~record recording}
 * and {@link module:conductor~compare comparing} scenario data.
 *
 *     const compute = require( 'fresnel/src/compute' );
 *     module.exports = {
 *         probes: [ 'x' ],
 *         metrics: {
 *             example: {
 *                 caption: 'An example metric.'
 *                 unit: 'ms',
 *                 analyse: ( series ) => compute.stats( series.x.mykey ),
 *                 compare: ( a, b ) => compute.compareStdev( a, b )
 *             }
 *         }
 *     };
 *
 * #### report.probes
 *
 * Specify one or probes that provide the data needed for this report. The recording phase
 * uses this to determine which probes to run.
 *
 * #### report.metrics
 *
 * An object with one or more metric specifications. The key is the internal
 * name for the metric, and the value is an object with the following properties:
 *
 * - string `caption` - A short description of this metric.
 * - string `unit` - The unit for this metric.
 *   Must be one of: `ms`, or `B`.
 * - Function `analyse` - A callback to aggregate and analyse data from thes probes,
 *   as gathered from multiple runs.
 * - Function `compare` - A callback to compare the two sets of analysed data, from
 *   two recordings.
 * - number `threshold` (optional) - If the compared difference is more than this
 *   value, a warning will be shown.
 *
 * ### metric.analyse callback
 *
 * During each run of the same scenario, a probe can capture data into an object.
 * Here, the values from those objects have combined from each run into an array.
 *
 * The analyser for a single metric, has access to all data from probes, and
 * must return an object with a `mean` and `stdev` property. This simplest
 * way to do that to pass a series to {@link module:compute~stats compute.stats}
 * and return its result.
 *
 * For example, if probe `x` collects `{ mykey: 10 }` and `{ mykey: 12 }` from
 * two runs of the same scenario, it will be available here as `series.x.mykey`
 * containing `[ 10, 12 ]`.
 *
 * **Parameters**:
 *
 * - Object `series` - An object with for each probe, an array of data
 *   from multiple runs.
 *
 * **Returns**: `Object` - An stats object with a `mean` and `stdev` property.
 *
 * ### metric.compare callback
 *
 * **Parameters**:
 *
 * - Object `a`: A stats object from the analyse callback.
 * - Object `b`: A stats object from the analyse callback.
 *
 * **Returns**: `number` - Difference between A and B, in the metric's unit,
 * or 0 if no significant change was found.
 *
 * @global
 * @typedef {Object} Report
 * @property {Probe[]|string[]} probes
 * @property {Object} metrics
 */

/**
 * Whether a given export is a valid {@link Report}.
 *
 * @ignore
 * @param {mixed|Report} value
 * @throw {Error} If invalid
 */
function isReport( value ) {
	is.like( value, {
		probes: 'array',
		metrics: 'object',
		name: 'string'
	}, 'report' );
	for ( const metric in value.metrics ) {
		is.like( value.metrics[ metric ], {
			caption: 'string',
			unit: 'string',
			analyse: 'function',
			compare: 'function',
			threshold: [ 'number', 'undefined' ]
		}, 'report#metric' );
	}
}

/**
 * @private
 * @class
 */
class Registry {
	/**
	 * @param {Function} validate Object shape validator (one of isProbe or isReport).
	 * @param {Object.<Object<Function>>} values Plain objects keyed by a given name.
	 */
	constructor( validate, values ) {
		this.validate = validate;
		this.values = values;
	}

	/**
	 * @param {string|Object} name Name for object, or object itself
	 * @return {Object}
	 * @throws {Error} If an unknown name is specified
	 */
	get( name ) {
		let object;
		if ( typeof name === 'string' ) {
			// a probe or report specified by name in .fresnel.yml
			if ( !( name in this.values ) ) {
				throw new Error( `Unknown probe name: ${name}` );
			}
			object = Object.assign( { name: name }, this.values[ name ] );
		} else {
			// an object passed directly (programmatically, or from a unit test).
			object = name;
		}

		this.validate( object );
		return object;
	}
}

// Attach statically
Registry.isProbe = isProbe;
Registry.isReport = isReport;

module.exports = Registry;
