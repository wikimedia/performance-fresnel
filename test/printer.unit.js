'use strict';

const path = require( 'path' );
const fs = require( 'fs' );

const printer = require( '../src/printer' );

QUnit.module( 'printer', () => {
	QUnit.test( 'comparison() - negative near-zero', ( assert ) => {
		let out = '';
		printer.comparison(
			( str ) => { out += str + '\n'; },
			{
				0: {
					myreport: {
						x: {
							caption: 'The X factor',
							unit: 'ms',
							a: {
								mean: 117,
								stdev: 2
							},
							b: {
								mean: 111,
								stdev: 5
							},
							diff: -0.3,
							judgement: null
						}
					}
				}
			}
		);

		const expected = fs.readFileSync(
			path.join( __dirname, 'fixtures/negativenearzero-compare.txt' ),
			'utf8'
		);
		assert.propEqual(
			out.trim().replace( printer.rColor, '' ).split( '\n' ),
			expected.trim().split( '\n' ),
			'result'
		);
	} );
} );
