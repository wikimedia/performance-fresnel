'use strict';
/**
 * End-to-end test for `conductor`.
 */

const path = require( 'path' );
const rimraf = require( 'rimraf' );

const conductor = require( '../src/conductor' );
const fileUrl = require( './util/file-url' );
const mktmpdir = require( './util/tmpdir' );

function map( obj, fn ) {
	const derived = {};
	for ( const key in obj ) {
		derived[ key ] = fn( obj[ key ] );
	}
	return derived;
}

QUnit.module( 'e2e/probes', ( hooks ) => {
	let tmpDir;
	hooks.beforeEach( () => {
		tmpDir = mktmpdir( 'fresnel_test' );
	} );
	hooks.afterEach( () => {
		rimraf.sync( tmpDir );
	} );

	QUnit.test( 'transfer - record', ( assert ) => {
		const file = path.join( __dirname, 'fixtures/basic/one.html' );
		const config = {
			warmup: false,
			runs: 1,
			scenarios: [ {
				url: fileUrl( file ),
				viewport: { width: 800, height: 600 },
				reports: [ 'transfer' ]
			} ]
		};

		return conductor.record( config, tmpDir, 'default' ).then( ( record ) => {
			assert.propEqual(
				record.scenarios[ 0 ].analysed.transfer,
				{
					pageWeight: { mean: 116208, stdev: 0, values: [ 116208 ] },
					html: { mean: 5900, stdev: 0, values: [ 5900 ] },
					css: { mean: 315, stdev: 0, values: [ 315 ] },
					js: { mean: 35797, stdev: 0, values: [ 35797 ] },
					img: { mean: 53286, stdev: 0, values: [ 53286 ] },
					other: { mean: 20910, stdev: 0, values: [ 20910 ] }
				},
				'analysed.transfer'
			);
		} );
	} );

	QUnit.test( 'transfer - compare', ( assert ) => {
		const outputDir = path.join( __dirname, 'fixtures/transfer-records' );

		return conductor.compare( outputDir, 'before', 'after' ).then( ( compared ) => {
			assert.propEqual(
				map( compared.result[ 0 ].transfer, ( obj ) => obj.diff ),
				{
					pageWeight: -150.10999999998603,
					html: -76.63000000000011,
					css: 0,
					js: -70.35000000000582,
					img: 0,
					other: 0
				},
				'compared.transfer'
			);
		} );
	} );
} );
