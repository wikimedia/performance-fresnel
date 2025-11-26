'use strict';

const path = require( 'path' );

/**
 * Convert a file path to a file url. (test-only utility)
 *
 * @ignore
 * @param {string} str
 * @return {string} URL
 */
module.exports = function ( str ) {
	let pathName = path.resolve( String( str ) ).replace( /\\/g, '/' );

	// Windows drive letter must be prefixed with a slash
	if ( pathName[ 0 ] !== '/' ) {
		pathName = `/${ pathName }`;
	}

	// Escape required characters for path components
	// See https://tools.ietf.org/html/rfc3986#section-3.3
	return encodeURI( `file://${ pathName }` ).replace( /[?#]/g, encodeURIComponent );
};

/*
From https://github.com/sindresorhus/file-url/tree/v2.0.2

Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
