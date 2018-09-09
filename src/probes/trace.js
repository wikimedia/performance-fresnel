'use strict';
/**
 * Capture a trace file that can later be opened in Chrome DevTools
 * or [timeline-viewer](https://chromedevtools.github.io/timeline-viewer/).
 *
 * @module probes/trace
 * @see {@link Probe}
 */

module.exports = {
	before( page, writer ) {
		// Start tracing
		return page.tracing.start( {
			path: writer.getPath( 'trace.json' )
		} );
	},

	after( page ) {
		// Stop tracing
		return page.tracing.stop();
	}
};
