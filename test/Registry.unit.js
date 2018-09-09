'use strict';
/**
 * Unit tests for `Registry`.
 */

const Registry = require( '../src/Registry' );

QUnit.module( 'writer', () => {
	QUnit.test( 'get()', ( assert ) => {
		// Reject
		assert.throws( () => {
			const registry = new Registry( Registry.isProbe, {
				foo: {},
				bar: {}
			} );
			registry.get( 'quux' );
		}, 'unknown probe' );

		assert.throws( () => {
			const registry = new Registry( Registry.isProbe, {
				foo: {
					beforehand: () => {}
				}
			} );
			registry.get( 'foo' );
		}, 'bad probe' );
	} );
} );
