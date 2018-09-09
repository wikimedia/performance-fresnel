'use strict';
/**
 * Report on Paint Timing API metrics.
 *
 * @module reports/paint
 * @see {@link Report}
 * @see <https://www.w3.org/TR/paint-timing/>
 */

const compute = require( '../compute' );

module.exports = {
	probes: [
		'paint'
	],

	metrics: {
		TTFP: {
			caption: 'Time to first paint',
			unit: 'ms',
			analyse: ( series ) => compute.stats( series.paint[ 'first-paint' ] ),
			compare: ( a, b ) => compute.compareStdev( a, b )
		},

		TTFCP: {
			caption: 'Total to first contentful paint',
			unit: 'ms',
			analyse: ( series ) => compute.stats( series.paint[ 'first-contentful-paint' ] ),
			compare: ( a, b ) => compute.compareStdev( a, b )
		}
	}
};
