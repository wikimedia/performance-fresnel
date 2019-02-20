'use strict';

const printer = require( '../src/printer' );

QUnit.module( 'printer', () => {
	QUnit.test( 'format()', ( assert ) => {
		assert.strictEqual(
			printer.format( -0.29, 'ms' ),
			'- <0.3 ms',
			'near-zero negative'
		);

		assert.strictEqual(
			printer.format( 42, 'ms' ),
			'42 ms',
			'the answer'
		);

		assert.strictEqual(
			printer.format( 42, 'ms', { plus: true } ),
			'+ 42 ms',
			'the answer as difference'
		);
	} );
} );
