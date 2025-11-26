'use strict';
/**
 * Unit tests for `Writer`.
 */

const fs = require( 'fs' );
const path = require( 'path' );

const Writer = require( '../src/Writer' );
const mktmpdir = require( './util/tmpdir' );

QUnit.module( 'writer', ( hooks ) => {
	let testDir;
	hooks.beforeEach( () => {
		testDir = mktmpdir( 'fresnel_test' );
	} );
	hooks.afterEach( () => {
		fs.rmSync( testDir, { force: true, recursive: true } );
	} );

	QUnit.test( 'Writer#constructor()', ( assert ) => {
		// Accept
		{
			const writer = new Writer( testDir );
			assert.ok( writer instanceof Writer, 'new sub directory' );
		}
		{
			const writer = new Writer( testDir );
			assert.ok( writer instanceof Writer, 'pre-existing directory' );
		}

		// Reject
		{
			assert.throws( () => new Writer( path.join( testDir, 'missing/parent' ) ), 'two levels away from pre-existing directory' );
		}
	} );

	QUnit.test( 'Writer#child()', ( assert ) => {
		const writer = new Writer( testDir );

		// Accept: three chained child directories
		writer.child( 'aa' ).child( 'bb' ).child( 'cc' );
		// This Node.js API throws if the path is not found
		fs.accessSync( path.join( testDir, 'aa/bb/cc' ) );

		// Reject
		assert.throws( () => {
			writer.child( '' );
		}, 'empty string as name' );

		assert.throws( () => {
			writer.child( 'aa/bb' );
		}, 'traversing name' );

		assert.throws( () => {
			writer.child( '..' );
		}, 'only dots as name' );
	} );

	QUnit.test( 'Writer#prefix()', ( assert ) => {
		const writer = new Writer( testDir );

		// Accept: Create child with prefix
		writer.prefix( 'aa-' ).child( 'bb' );
		fs.accessSync( path.join( testDir, 'aa-bb' ) );

		assert.expect( 0 );
	} );
} );
