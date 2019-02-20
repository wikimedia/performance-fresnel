'use strict';
/**
 * End-to-end test for `cli`.
 */

const path = require( 'path' );
const fs = require( 'fs' );

const rimraf = require( 'rimraf' );

const cli = require( '../src/cli' );
const fileUrl = require( './util/file-url' );
const mktmpdir = require( './util/tmpdir' );
const { rColor } = require( '../src/printer' );

QUnit.module( 'e2e/cli', ( hooks ) => {
	let orgEnv, orgLog, orgError, orgCwd, out, tmpDir, fixtureDir;
	hooks.beforeEach( () => {
		// Stub
		orgEnv = process.env;
		// Inherit original so that CHROMIUM_FLAGS may still apply
		process.env = Object.create( process.env );
		orgLog = console.log;
		orgError = console.error;
		out = '';
		console.log = console.error = ( str ) => {
			out += str + '\n';
		};

		tmpDir = mktmpdir( 'fresnel_test' );
		process.env.FRESNEL_DIR = tmpDir;

		fixtureDir = path.join( __dirname, 'fixtures' );
		process.env.TEST_FIXTUREURL = fileUrl( fixtureDir );

		orgCwd = process.cwd();
	} );
	hooks.afterEach( () => {
		process.chdir( orgCwd );
		rimraf.sync( tmpDir );

		// Restore
		console.log = orgLog;
		console.error = orgError;
		process.env = orgEnv;
	} );

	QUnit.test( 'record', ( assert ) => {
		process.chdir( path.join( fixtureDir, 'basic' ) );

		return cli( 'record' )
			.then( () => {
				const actual = require( path.join( tmpDir, 'default/record.json' ) );
				const expected = require( './fixtures/basic-records/one/record.json' );

				assert.propEqual( actual, expected, 'record' );
			} );
	} );

	QUnit.test( 'compare - forward', ( assert ) => {
		process.env.FRESNEL_DIR = path.join( __dirname, 'fixtures/basic-records' );

		return cli( 'compare', 'one', 'two' ).then( () => {
			const expected = fs.readFileSync( path.join( __dirname, 'fixtures/basic-compare-forward.txt' ), 'utf8' );
			assert.propEqual(
				out.trim().replace( rColor, '' ).split( '\n' ),
				expected.trim().split( '\n' ),
				'result'
			);
		} );
	} );

	QUnit.test( 'compare - backward', ( assert ) => {
		process.env.FRESNEL_DIR = path.join( __dirname, 'fixtures/basic-records' );

		const fail = cli( 'compare', 'two', 'one' );
		assert.rejects( fail, 'exit code' );

		return fail.catch( () => {
			const expected = fs.readFileSync(
				path.join( __dirname, 'fixtures/basic-compare-backward.txt' ),
				'utf8'
			);
			assert.propEqual(
				out.trim().replace( rColor, '' ).split( '\n' ),
				expected.trim().split( '\n' ),
				'result'
			);
		} );
	} );

	QUnit.test( 'record - error', ( assert ) => {
		assert.rejects( cli( 'record', 'too', 'many' ), 'exit code' );

		assert.strictEqual( /DESCRIPTION/.test( out ), true, 'help shown on error' );
	} );

	QUnit.test( 'compare - error', ( assert ) => {
		assert.rejects( cli( 'compare', 'solo' ), 'exit code' );

		assert.strictEqual( /DESCRIPTION/.test( out ), true, 'help shown on error' );
	} );

	QUnit.test( 'help', ( assert ) => {
		return cli( 'help' )
			.then( () => {
				assert.strictEqual( /Usage: fresnel/.test( out ), true, 'output' );
			} );
	} );

	QUnit.test( 'help record', ( assert ) => {
		return cli( 'help', 'record' )
			.then( () => {
				assert.strictEqual( /DESCRIPTION/.test( out ), true, 'help shown' );
			} );
	} );

	QUnit.test( 'help compare', ( assert ) => {
		return cli( 'help', 'compare' )
			.then( () => {
				assert.strictEqual( /DESCRIPTION/.test( out ), true, 'help shown' );
			} );
	} );

	QUnit.test( 'version', ( assert ) => {
		return cli( 'version' )
			.then( () => {
				assert.strictEqual( /Fresnel \d/.test( out ), true, 'output' );
			} );
	} );

	QUnit.test( 'unknown command', ( assert ) => {
		assert.rejects( cli( 'whatever' ), 'exit code' );

		assert.strictEqual( /unknown command/i.test( out ), true, 'output' );
	} );
} );
