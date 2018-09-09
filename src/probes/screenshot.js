'use strict';
/**
 * Capture a screenshot from the browser viewport after the
 * page has finished loading.
 *
 * @module probes/screenshot
 * @see {@link Probe}
 */

module.exports = {
	after( page, writer ) {
		return page.screenshot( {
			path: writer.getPath( 'image.png' )
		} );
	}
};
