'use strict';
/**
 * Report with transfer sizes from the Resource Timing API.
 *
 * @module reports/transfer
 * @see {@link Report}
 * @see <https://www.w3.org/TR/resource-timing-2/>
 */

const parseurl = require( 'url' ).parse;
const compute = require( '../compute' );

const rImg = /\.(?:jpeg|jpg|gif|png|svg)$/;
const rFont = /\.(?:woff2|woff:ttf)$/;

function getSizesFromEntries( category, entries ) {
	const sizes = {
		html: 0,
		css: 0,
		js: 0,
		img: 0,
		other: 0,
		total: 0
	};

	entries.forEach( ( entry ) => {
		sizes.total += entry.transferSize;

		const path = parseurl( entry.name ).pathname;
		switch ( entry.initiatorType ) {
			case 'navigation':
				sizes.html += entry.transferSize;
				break;
			case 'link':
				// From <link> element or Link header.
				// e.g. a stylesheet, or preloaded image.
				// Upstream issue: https://github.com/w3c/resource-timing/issues/132
				if ( rImg.test( path ) ) {
					sizes.img += entry.transferSize;
				} else {
					sizes.css += entry.transferSize;
				}
				break;
			case 'script':
				sizes.js += entry.transferSize;
				break;
			case 'img':
				sizes.img += entry.transferSize;
				break;
			// Resource requested by CSS.
			// e.g. an imported stylesheet, background image, or font file.
			case 'css':
				/* istanbul ignore else */
				if ( rImg.test( path ) ) {
					sizes.img += entry.transferSize;
				} else if ( rFont.test( path ) ) {
					sizes.other += entry.transferSize;
				} else {
					sizes.css += entry.transferSize;
				}
				break;
			case 'xmlhttprequest':
			case 'fetch':
			case 'beacon':
			case 'other':
			default:
				sizes.other += entry.transferSize;
				break;
		}
	} );

	return sizes[ category ];
}

module.exports = {
	probes: [ 'transfer' ],

	// TODO: Improve the transfer-based metrics to have a concept of
	// of 'interaction-blocking', which measures only the startup module
	// (and any other requests that don't contain page-specific leaf modules).
	//
	// To do this cleanly, we may want to separate "probes" (which gather data)
	// from "metrics" (which interpret data), so that we can have the 'transfer'
	// probe collect the data with only minimal aggregation (e.g. by url, and by type),
	// with maybe "render-blocking" which is fairly universal. And then, the "mediawiki"
	// metrics interprets that data also, and defines a "interaction-blocking-bytes"
	// metric based on load.php urls and other MediaWiki-specific things.

	metrics: {
		pageWeight: {
			caption: 'Total size of all transfers during page load',
			unit: 'B',
			analyse: ( series ) => compute.stats(
				series.transfer.entries.map( getSizesFromEntries.bind( null, 'total' ) )
			),
			compare: ( a, b ) => compute.compareStdev( a, b ),
			threshold: 1
		},
		html: {
			caption: 'Transfer size of HTML document',
			unit: 'B',
			analyse: ( series ) => compute.stats(
				series.transfer.entries.map( getSizesFromEntries.bind( null, 'html' ) )
			),
			compare: ( a, b ) => compute.compareStdev( a, b )
		},
		css: {
			caption: 'Transfer size of CSS resources',
			unit: 'B',
			analyse: ( series ) => compute.stats(
				series.transfer.entries.map( getSizesFromEntries.bind( null, 'css' ) )
			),
			compare: ( a, b ) => compute.compareStdev( a, b ),
			threshold: 1
		},
		js: {
			caption: 'Transfer size of JavaScript resources',
			unit: 'B',
			analyse: ( series ) => compute.stats(
				series.transfer.entries.map( getSizesFromEntries.bind( null, 'js' ) )
			),
			compare: ( a, b ) => compute.compareStdev( a, b )
		},
		img: {
			caption: 'Transfer size of Image document',
			unit: 'B',
			analyse: ( series ) => compute.stats(
				series.transfer.entries.map( getSizesFromEntries.bind( null, 'img' ) )
			),
			compare: ( a, b ) => compute.compareStdev( a, b )
		},
		other: {
			caption: 'Transfer size of other resources',
			unit: 'B',
			analyse: ( series ) => compute.stats(
				series.transfer.entries.map( getSizesFromEntries.bind( null, 'other' ) )
			),
			compare: ( a, b ) => compute.compareStdev( a, b )
		}
	}
};
