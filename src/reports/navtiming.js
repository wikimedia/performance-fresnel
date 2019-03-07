'use strict';
/**
 * Report on Navigation Timing API metrics.
 *
 * @module reports/navtiming
 * @see {@link Report}
 * @see <https://www.w3.org/TR/navigation-timing-2/>
 */

const compute = require( '../compute' );

module.exports = {
	probes: [
		'navtiming'
	],
	metrics: {
		responseStart: {
			caption: 'Time to first byte',
			unit: 'ms',
			analyse: ( series ) => compute.stats( series.navtiming.responseStart ),
			compare: ( a, b ) => compute.compareStdev( a, b )
		},

		loadEventEnd: {
			caption: 'Total page load time',
			unit: 'ms',
			analyse: ( series ) => compute.stats( series.navtiming.loadEventEnd ),
			compare: ( a, b ) => compute.compareStdev( a, b ),
			threshold: 1
		},

		processing: {
			caption: 'Time from responseEnd to domComplete',
			unit: 'ms',
			analyse: ( series ) => compute.stats( compute.subtract(
				series.navtiming.domComplete,
				series.navtiming.responseEnd
			) ),
			compare: ( a, b ) => compute.compareStdev( a, b ),
			threshold: 10
		},

		onLoad: {
			caption: 'Time from loadEventStart to loadEventEnd',
			unit: 'ms',
			analyse: ( series ) => compute.stats( compute.subtract(
				series.navtiming.loadEventEnd,
				series.navtiming.loadEventStart
			) ),
			compare: ( a, b ) => compute.compareStdev( a, b ),
			threshold: 1
		}
	}
};
