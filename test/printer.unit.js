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

		assert.strictEqual(
			printer.format( 851, 'B' ),
			'851 B',
			'hundreds of bytes'
		);

		assert.strictEqual(
			printer.format( 14372, 'B' ),
			'14.4 kB',
			'tens of thousands of bytes'
		);

		assert.strictEqual(
			printer.format( 358512, 'B' ),
			'359 kB',
			'hundreds of thousands of bytes'
		);

		assert.strictEqual(
			printer.format( 1358512, 'B' ),
			'1.4 MB',
			'millions of bytes'
		);
	} );
} );
