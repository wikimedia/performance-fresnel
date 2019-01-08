'use strict';
/**
 * Capture a trace file that can later be opened in Chrome DevTools
 * or [timeline-viewer](https://chromedevtools.github.io/timeline-viewer/).
 *
 * @module probes/trace
 * @see {@link Probe}
 */

module.exports = {
	async before( page, writer ) {
		// Start tracing
		await page.tracing.start( {
			path: writer.getPath( 'trace.json' )
		} );
	},

	async after( page ) {
		// Stop tracing
		await page.tracing.stop();
	}
};
