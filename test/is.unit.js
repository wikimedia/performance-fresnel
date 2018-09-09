'use strict';
/**
 * Unit tests for `is`.
 */

const is = require( '../src/util/is' );

QUnit.module( 'util/is', () => {
	QUnit.test( 'like() - single type', ( assert ) => {
		// Accept
		assert.strictEqual( is.like( { x: [] }, { x: 'array' } ), undefined );
		assert.strictEqual( is.like( { x: {} }, { x: 'object' } ), undefined );
		assert.strictEqual( is.like( { x: null }, { x: 'null' } ), undefined );
		assert.strictEqual( is.like( { x: true }, { x: 'boolean' } ), undefined );
		assert.strictEqual( is.like( { x: 1 }, { x: 'number' } ), undefined );
		assert.strictEqual( is.like( { x: 'hi' }, { x: 'string' } ), undefined );

		// Reject
		assert.throws( () => {
			is.like( undefined, { x: 'string' } );
		}, 'non-object root' );

		assert.throws( () => {
			is.like( {}, { x: 'string' } );
		}, 'missing key' );

		assert.throws( () => {
			is.like( { x: {} }, { x: 'array' } );
		}, 'bad type object for array' );

		assert.throws( () => {
			is.like( { x: 1 }, { x: 'string' } );
		}, 'bad type number for string' );

		assert.throws( () => {
			is.like( { x: 'yep', y: 'nope' }, { x: 'string' } );
		}, 'unknown key' );
	} );

	QUnit.test( 'like() - multi type', ( assert ) => {
		// Accept
		assert.strictEqual( is.like( { x: 'hi' }, { x: [ 'string' ] } ), undefined );
		assert.strictEqual( is.like( { x: 1 }, { x: [ 'string', 'number' ] } ), undefined );
		assert.strictEqual( is.like( {}, { x: [ 'string', 'undefined' ] } ), undefined );

		// Reject
		assert.throws( () => {
			is.like( { x: 1 }, { x: [ 'string', 'undefined' ] } );
		}, 'bad type number for optional string' );
	} );

	QUnit.test( 'like() - plain object', ( assert ) => {
		function Thing() {}

		// Accept
		const accept = {
			'object literal': {},
			'null-object': Object.create( null )
		};
		for ( const msg in accept ) {
			assert.strictEqual(
				is.like( { x: accept[ msg ] }, { x: 'object' } ),
				undefined,
				msg
			);
		}

		// Reject
		const reject = {
			undefined: undefined,
			null: null,
			'array literal': [],
			'custom instance': new Thing()
		};
		for ( const msg in reject ) {
			assert.throws( () => {
				is.like( { x: reject[ msg ] }, { x: 'object' } );
			}, msg );
		}
	} );
} );
