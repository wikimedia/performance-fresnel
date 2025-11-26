'use strict';

const fs = require( 'fs' );
const path = require( 'path' );

/**
 * @ignore
 * @param {string} name
 * @throws {Error} If name cannot be used for a file.
 */
function validateName( name ) {
	if (
		// Empty
		name === '' ||
		// Only dots
		/^\.+$/.test( name ) ||
		// Traversal on different operating systems
		/[/?<>\\:*|":]/.test( name )
	) {
		throw new Error( `Invalid file name: "${ name }"` );
	}
}

/**
 * Represents a directory and an (optional) prefix for files and
 * subdirectories created within it.
 *
 * @class
 */
class Writer {
	/**
	 * The specified directory will be created if needed.
	 * Any parent directories must exist beforehand.
	 *
	 * @param {string} dir File path
	 * @param {string} prefix
	 * @throws {Error} If directory can't be created.
	 */
	constructor( dir, prefix = '' ) {
		// Create as needed
		try {
			fs.accessSync( dir, fs.constants.W_OK );
		} catch ( err ) {
			fs.mkdirSync( dir );
		}

		/**
		 * @private
		 * @property {string}
		 */
		this.dir = dir;

		/**
		 * @private
		 * @property {string}
		 */
		this.namePrefix = prefix;
	}

	/**
	 * Get the file path for a resource in this writer's directory.
	 *
	 * @param {string} name File name
	 * @return {string} File path
	 */
	getPath( name ) {
		const segment = this.namePrefix + name;
		validateName( segment );
		return path.join( this.dir, segment );
	}

	/**
	 * Create a Writer object for the same directory, with
	 * an added prefix for any files and subdirectories.
	 *
	 * @param {string} prefix
	 * @return {Writer}
	 */
	prefix( prefix ) {
		return new Writer( this.dir, this.namePrefix + prefix );
	}

	/**
	 * Create a Writer object for a subdirectory of the current one.
	 *
	 * @param {string} name
	 * @return {Writer}
	 */
	child( name ) {
		return new Writer( this.getPath( name ) );
	}
}

module.exports = Writer;
