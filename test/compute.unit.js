'use strict';
/**
 * Unit tests for `compute`.
 */

const compute = require( '../src/compute' );

QUnit.module( 'compute', () => {
	QUnit.test( 'stats()', ( assert ) => {
		const x = compute.stats( [ 3, 4, 5 ] );
		assert.propEqual(
			{ mean: x.mean.toFixed( 3 ), stdev: x.stdev.toFixed( 3 ) },
			{ mean: '4.000', stdev: '0.816' }
		);
		const y = compute.stats( [ 1.0, 1.5, 2.0 ] );
		assert.propEqual(
			{ mean: y.mean.toFixed( 3 ), stdev: y.stdev.toFixed( 3 ) },
			{ mean: '1.500', stdev: '0.408' }
		);
	} );

	QUnit.test( 'diffStdev() - decrease', ( assert ) => {
		const a = compute.stats( [ 3, 4, 5 ] );
		const b = compute.stats( [ 1.0, 1.5, 2.0 ] );
		assert.strictEqual(
			compute.diffStdev( a, b ).toFixed( 3 ),
			'-1.275'
		);
	} );

	QUnit.test( 'diffStdev() - increase', ( assert ) => {
		const a = compute.stats( [ 1.0, 1.5, 2.0 ] );
		const b = compute.stats( [ 3, 4, 5 ] );
		assert.strictEqual(
			compute.diffStdev( a, b ).toFixed( 3 ),
			'1.275'
		);
	} );

	QUnit.test( 'diffStdev() - unchanged', ( assert ) => {
		const a = compute.stats( [ 2, 3, 4 ] );
		const b = compute.stats( [ 3, 4, 5 ] );
		assert.strictEqual(
			compute.diffStdev( a, b ),
			0
		);
	} );

	QUnit.test( 'mannWhitney() - unchanged', ( assert ) => {
		const a = compute.stats( [ 3, 4, 2, 7, 8, 5, 6 ] );
		const b = compute.stats( [ 3.5, 2.5, 7.5, 8.5, 4.5, 6.5, 1.5 ] );
		assert.strictEqual(
			compute.mannWhitney( a, b ).toFixed( 3 ),
			'0.550'
		);
	} );

	QUnit.test( 'mannWhitney() - increase', ( assert ) => {
		const a = compute.stats( [ 5, 4, 6, 7, 2, 8, 3 ] );
		const b = compute.stats( [ 9.5, 12.5, 6.5, 10.5, 11.5, 7.5, 8.5 ] );
		assert.strictEqual(
			compute.mannWhitney( a, b ).toFixed( 3 ),
			'0.004'
		);
	} );

	QUnit.test( 'mannWhitney() - decrease', ( assert ) => {
		const a = compute.stats( [ 9.5, 10.5, 8.5, 11.5, 12.5, 6.5, 7.5 ] );
		const b = compute.stats( [ 3, 7, 8, 6, 4, 5, 2 ] );
		assert.strictEqual(
			compute.mannWhitney( a, b ).toFixed( 3 ),
			'0.998'
		);
	} );

	QUnit.test( 'mannWhitney() - unchanged, tied ranks', ( assert ) => {
		const a = compute.stats( [ 2, 2, 3, 3, 1, 1, 2 ] );
		const b = compute.stats( [ 1, 2, 3, 1, 1, 2, 4 ] );
		assert.strictEqual(
			compute.mannWhitney( a, b ).toFixed( 3 ),
			'0.606'
		);
	} );

	QUnit.test( 'mannWhitney() - increase, tied ranks', ( assert ) => {
		const a = compute.stats( [ 2, 2, 3, 3, 1, 1, 2 ] );
		const b = compute.stats( [ 5, 5, 2, 5, 2, 3, 4 ] );
		assert.strictEqual(
			compute.mannWhitney( a, b ).toFixed( 3 ),
			'0.017'
		);
	} );

	QUnit.test( 'mannWhitney() - decrease, tied ranks', ( assert ) => {
		const a = compute.stats( [ 5, 4, 5, 5, 2, 2, 3 ] );
		const b = compute.stats( [ 1, 2, 2, 2, 3, 1, 3 ] );
		assert.strictEqual(
			compute.mannWhitney( a, b ).toFixed( 3 ),
			'0.988'
		);
	} );

	QUnit.test( 'mannWhitney() - exactly the same', ( assert ) => {
		const a = compute.stats( [ 5, 5, 5, 5, 5, 5, 5 ] );
		const b = compute.stats( [ 5, 5, 5, 5, 5, 5, 5 ] );
		assert.strictEqual(
			compute.mannWhitney( a, b ),
			1
		);
	} );
} );
