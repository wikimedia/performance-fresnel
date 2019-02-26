'use strict';
/**
 * End-to-end test for `conductor`.
 */

const path = require( 'path' );

const rimraf = require( 'rimraf' );

const conductor = require( '../src/conductor' );
const fileUrl = require( './util/file-url' );
const mktmpdir = require( './util/tmpdir' );

QUnit.module( 'e2e/conductor', ( hooks ) => {
	let tmpDir;
	hooks.beforeEach( () => {
		tmpDir = mktmpdir( 'fresnel_test' );
	} );
	hooks.afterEach( () => {
		rimraf.sync( tmpDir );
	} );

	QUnit.test( 'record() - clean state per run', ( assert ) => {
		// Confirm that each run gets a fresh browser context with
		// no cookies or localStorage values from previous runs.
		const testprobe = {
			name: 'testprobe',
			after( page, writer, addData ) {
				return page
					.evaluate( () => {
						/* eslint-env browser */
						const data = {
							// This should be null every time
							value: localStorage.getItem( 'test-fresh' )
						};
						// The value set here should never be seen again
						localStorage.setItem( 'test-fresh', 'some old value' );
						return data;
					} )
					.then( ( data ) => {
						addData( data );
					} );
			}
		};

		const file = path.join( __dirname, 'fixtures/basic/one.html' );
		const config = {
			runs: 2,
			scenarios: [ {
				url: fileUrl( file ),
				viewport: { width: 800, height: 600 },
				probes: [ testprobe ]
			} ]
		};

		return conductor.record( config, tmpDir, 'default' ).then( ( record ) => {
			assert.propEqual(
				record.scenarios[ 0 ].runs,
				[
					{ testprobe: { value: null } },
					{ testprobe: { value: null } }
				],
				'results'
			);
		} );
	} );

	QUnit.test( 'record() - result', ( assert ) => {
		process.env.TEST_FIXTUREURL = fileUrl( path.join( __dirname, 'fixtures' ) );
		const config = {
			warmup: false,
			runs: 1,
			scenarios: [ {
				url: '{TEST_FIXTUREURL}/basic/one.html',
				viewport: { width: 800, height: 600 },
				reports: [ 'navtiming', 'paint' ],
				probes: [ 'screenshot', 'trace' ]
			} ]
		};

		return conductor.record( config, tmpDir, 'default' ).then( ( record ) => {

			const expected = require( './fixtures/basic-records/one/record.json' );
			assert.propEqual( record, expected, 'record' );
		} );
	} );

	QUnit.test( 'compare()', ( assert ) => {
		const outputDir = path.join( __dirname, 'fixtures/basic-records' );

		return conductor.compare( outputDir, 'one', 'two' ).then( ( compared ) => {

			const expected = require( './fixtures/basic-compare.json' );
			assert.propEqual( compared.result, expected, 'result' );
		} );
	} );
} );
