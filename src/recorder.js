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
 * @ignore
 * @param {Function[]} fns Array of callbacks to call serially, awaiting any
 *  returned promises in-between.
 * @return {Promise}
 */
function chainAsyncFunctions( fns ) {
	let chain = Promise.resolve();
	for ( const fn of fns ) {
		chain = chain.then( () => Promise.resolve( fn() ) );
	}
	return chain;
}

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
 * @return {Promise}
 * @fulfil {Object} Probe data objects.
 */
function run( options, probes, writer, browser, progress ) {
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

	let context;
	let page;
	return browser.createIncognitoBrowserContext()
		.then( ( v ) => {
			context = v;
			return context.newPage();
		} )
		.then( ( v ) => {
			page = v;
			return page.setViewport( options.viewport );
		} )
		.then( () => {
			// Run 'setup' callbacks
			const fns = Array.from( probes ).map( ( probe ) => {
				return () => probe.before && probe.before(
					page,
					writer.prefix( probe.name + '--' )
				);
			} );
			return chainAsyncFunctions( fns );
		} )
		.then( () => {
			// Load the url
			progress( 'recorder/navigate', url );
			return page.goto( url );
		} )
		.then( () => {
			// Run 'collect' callbacks
			const fns = Array.from( probes ).map( ( probe ) => {
				return () => probe.after && probe.after(
					page,
					writer.prefix( probe.name + '--' ),
					( data ) => { Object.assign( datas[ probe.name ], data ); }
				);
			} );
			return chainAsyncFunctions( fns );
		} )
		.then( () => {
			return context.close();
		} )
		.then( () => {
			return datas;
		} );
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
 * @return {Promise}
 */
function warmup( options, browser ) {
	const url = expandString( options.url, process.env );

	let context;
	let page;
	return browser.createIncognitoBrowserContext()
		.then( ( v ) => {
			context = v;
			return context.newPage();
		} )
		.then( ( v ) => {
			page = v;
			return page.setViewport( options.viewport );
		} )
		.then( () => {
			return page.goto( url );
		} )
		.then( () => {
			return context.close();
		} );
}

module.exports = { run, warmup };
