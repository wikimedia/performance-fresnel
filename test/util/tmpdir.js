'use strict';

const fs = require( 'fs' );
const os = require( 'os' );
const path = require( 'path' );

/**
 * Create a temporary directory. (test-only utility)
 *
 * @ignore
 * @param {string} prefix Prefix for the name of the temporary directory
 * @return {string} Directory path
 */
module.exports = function ( prefix ) {
	return fs.mkdtempSync( path.join( os.tmpdir(), prefix ) );
};
