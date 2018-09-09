'use strict';
/**
 * The text printer for the Fresnel command-line interface.
 *
 * This module is invoked by {@link module:cli} to turn information from
 * {@link module:conductor conductor} into lines of text.
 *
 * @private
 * @module printer
 */

const color = {
	bold: '\u001b[1m',
	red: '\u001b[31m',
	yellow: '\u001b[33m',
	green: '\u001b[32m',
	reset: '\u001b[0m'
};

// eslint-disable-next-line no-control-regex
const rColor = /\u001b\[\d+m/g;

/**
 * Get the width of a string as visible on a TTY.
 *
 * @ignore
 * @param {string} str
 * @return {string}
 */
function width( str ) {
	// 1. Strip TTY escape sequences (e.g. color codes)
	str = str.replace( rColor, '' );
	// 2. Strip Unicode variation selectors
	// (e.g. the codepoint that changes the color of an emoji)
	str = str.replace( /[\ufe00-\ufe0f]/, '' );
	// 3. Multibyte friendly string length
	// https://blog.jonnew.com/posts/poo-dot-length-equals-two
	return Array.from( str ).length;
}

/**
 * Like String.prototype.padStart (ES2017; Node 8), but TTY-width aware.
 *
 * @ignore
 * @param {string} str
 * @param {number} length
 * @param {string} [pad]
 * @return {string}
 */
function padFirst( str, length, pad = ' ' ) {
	const add = length - width( str );
	if ( add > 0 ) {
		str = pad.repeat( add ) + str;
	}
	return str;
}

/**
 * Like String.prototype.padEnd (ES2017; Node 8), but TTY-width aware.
 *
 * @ignore
 * @param {string} str
 * @param {number} length
 * @param {string} [pad]
 * @return {string}
 */
function padLast( str, length, pad = ' ' ) {
	const add = length - width( str );
	if ( add > 0 ) {
		str += pad.repeat( add );
	}
	return str;
}

/**
 * @ignore
 * @param {number} num
 * @param {string} unit
 * @param {Object} [options]
 * @return {string}
 */
function format( num, unit, options = {} ) {
	const prefix = options.plus ?
		// If options.plus is set, "+ ", "- " or "  ".
		( num > 0 ? '+ ' : ( num < 0 ? '- ' : '  ' ) ) :
		// Otherwise, "-" or "".
		( num < 0 ? '- ' : '' );
	const abs = Math.abs( num );
	if ( abs === 0 ) {
		return `${prefix}${abs} ${unit}`;
	}
	if ( abs > 0 && abs < 1 ) {
		const fraction = Math.ceil( num * 10 );
		return `< ${prefix}0.${fraction} ${unit}`;
	}
	if ( unit === 'ms' ) {
		const s = Math.trunc( abs / 1000 );
		const ms = Math.round( abs % 1000 );
		if ( s > 0 ) {
			return `${prefix}${s}.${padLast( String( ms ), 3, '0' )} s`;
		}
		return `${prefix}${ms} ms`;
	}
	// TODO: 1000+ bytes into 1 KB, etc.)
	const round = Math.round( abs );
	return `${prefix}${round} ${unit}`;
}

/**
 * @param {Function} writeln
 * @param {string} event
 * @param {string|undefined} message
 */
function progress( writeln, event, message ) {
	switch ( event ) {
		case 'conductor/record-start':
			writeln( `Recording ${message.scenarios.length} scenario(s) with ${message.runs} run(s) each...` );
			break;
		default:
			writeln( `[${event}]`, message || '' );
	}
}

/**
 * @param {Function} writeln
 * @param {Array[]} rows
 */
function printTable( writeln, rows ) {
	const BORDER_START = '|-';
	const BORDER_SEP = '-|';
	const ROW_START = '| ';
	const CELL_SEP = ' |';
	const PAD_COLS = 1;

	const colWidths = rows[ 0 ].map( ( value, colIndex ) => {
		const cellWidths = rows.map( ( row ) => width( row[ colIndex ] ) );

		return Math.max( ...cellWidths ) + PAD_COLS;
	} );

	const borderLine = BORDER_START + colWidths.map( ( colWidth ) => {
		return '-'.repeat( colWidth );
	} ).join( BORDER_SEP ) + BORDER_SEP;

	// Border at the top
	writeln( borderLine );

	rows.forEach( ( row, rowIndex ) => {
		const line = ROW_START + row.map( ( value, colIndex ) => {
			if ( colIndex === 0 ) {
				return padLast( value, colWidths[ colIndex ] );
			}
			return padFirst( value, colWidths[ colIndex ] );
		} ).join( CELL_SEP ) + CELL_SEP;

		writeln( line );

		if ( rowIndex === 0 ) {
			// Border between head and body
			writeln( borderLine );
		}
	} );

	// Border at the end
	writeln( borderLine );
}

/**
* @param {Function} writeln
* @param {Object} compared
*/
function comparison( writeln, compared ) {
	const head = [
		'Metric',
		'Before',
		'After',
		'Diff',
		''
	];

	for ( const scenario in compared ) {
		const reports = compared[ scenario ];
		for ( const report in reports ) {
			writeln( '' );
			writeln( `### scenario ${scenario}: ${report}` );
			writeln( '' );
			const metrics = reports[ report ];
			const rows = [ head ];
			for ( const metricKey in metrics ) {
				const metric = metrics[ metricKey ];
				const row = [
					// Metric
					`${metric.caption} (${metricKey})`,
					// Before
					format( metric.a.mean, metric.unit ) +
						` (± ${format( metric.a.stdev, metric.unit )})`,
					// After
					format( metric.b.mean, metric.unit ) +
						` (± ${format( metric.b.stdev, metric.unit )})`,
					// Diff
					format( metric.diff, metric.unit, { plus: true } ),
					// Symbol (optional)
					''
				];
				if ( metric.judgement === true ) {
					// Yay
					row[ 3 ] = color.green + row[ 3 ] + color.reset;
					row[ 4 ] = color.green + '✓' + color.reset;
				} else if ( metric.judgement === false ) {
					// Boo
					row[ 3 ] = color.red + row[ 3 ] + color.reset;
					row[ 4 ] = color.red + '✘' + color.reset;
				}
				rows.push( row );
			}
			printTable( writeln, rows );
		}
	}
}

module.exports = { progress, comparison, rColor };
