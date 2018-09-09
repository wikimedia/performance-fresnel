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

	QUnit.test( 'compareStdev() - decrease', ( assert ) => {
		const a = compute.stats( [ 3, 4, 5 ] );
		const b = compute.stats( [ 1.0, 1.5, 2.0 ] );
		assert.strictEqual(
			compute.compareStdev( a, b ).toFixed( 3 ),
			'-1.275'
		);
	} );

	QUnit.test( 'compareStdev() - increase', ( assert ) => {
		const a = compute.stats( [ 1.0, 1.5, 2.0 ] );
		const b = compute.stats( [ 3, 4, 5 ] );
		assert.strictEqual(
			compute.compareStdev( a, b ).toFixed( 3 ),
			'1.275'
		);
	} );

	QUnit.test( 'compareStdev() - unchanged', ( assert ) => {
		const a = compute.stats( [ 2, 3, 4 ] );
		const b = compute.stats( [ 3, 4, 5 ] );
		assert.strictEqual(
			compute.compareStdev( a, b ),
			0
		);
	} );
} );
