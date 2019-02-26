'use strict';
/**
 * Utility for checking and validating JavaScript values.
 *
 * @private
 * @module util/is
 */

const hasOwn = Object.prototype.hasOwnProperty;
const objToString = Object.prototype.toString;

class Validation extends Error {
	constructor( message, inputName ) {
		super( message );
		this.name = 'Validation' + ( inputName ? ` of ${inputName}` : '' );
	}
}

/**
 * @ignore
 * @param {mixed} value
 * @return {boolean}
 */
function plainObject( value ) {
	// Reject null, undefined, and various built-in types
	if ( !value || objToString.call( value ) !== '[object Object]' ) {
		return false;
	}
	// Reject instances of anything other than direct Object.prototype
	// (e.g. from an object literal) or Object.create( null ).
	const proto = Object.getPrototypeOf( value );
	return ( proto === null || proto === Object.prototype );
}

/**
 * @ignore
 * @param {mixed} value
 * @return {string}
 */
function type( value ) {
	if ( Array.isArray( value ) ) {
		return 'array';
	}
	if ( plainObject( value ) ) {
		return 'object';
	}
	if ( value === null ) {
		return 'null';
	}
	const of = typeof value;
	switch ( of ) {
		case 'undefined':
		case 'boolean':
		case 'number':
		case 'string':
		case 'symbol':
		case 'function':
			return of;
		case 'object':
		default:
			return 'unknown';
	}
}

/**
 * Validate an object's shape.
 *
 * Supports primitives and JSON-compatible structures (array, plain object).
 *
 * @param {Object|undefined} value
 * @param {Object} shape
 * @param {string} [name]
 * @throws {Error} If invalid
 */
function like( value, shape, name ) {
	if ( !plainObject( value ) ) {
		throw new Validation( 'Non-object', name );
	}
	for ( const key in shape ) {
		const expected = shape[ key ];
		const actual = type( value[ key ] );
		if ( Array.isArray( expected ) ) {
			if ( expected.indexOf( actual ) === -1 ) {
				throw new Validation( `Expected "${key}" as ${expected.join( '|' )}, got ${actual}`, name );
			}
		} else if ( actual !== expected ) {
			throw new Validation( `Expected "${key}" as ${expected}, got ${actual}`, name );
		}
	}
	for ( const key in value ) {
		if ( !hasOwn.call( shape, key ) ) {
			throw new Validation( `Unexpected key "${key}"`, name );
		}
	}
}

/**
 * Whether a given value is a valid Fresnel scenario.
 *
 * @param {Object} value
 * @throw {Error} If invalid
 */
function scenario( value ) {
	like( value, {
		url: 'string',
		viewport: 'object',
		reports: [ 'array', 'undefined' ],
		probes: [ 'array', 'undefined' ]
	}, 'scenario' );
	like( value.viewport, {
		height: 'number',
		width: 'number'
	}, 'scenario.viewport' );
}

/**
 * Whether a given value is a valid Fresnel configuration object.
 *
 * @param {Object} value
 * @throw {Error} If invalid
 */
function config( value ) {
	like( value, {
		warmup: 'boolean',
		runs: 'number',
		scenarios: [ 'object', 'array' ]
	}, 'config' );
	for ( const key in value.scenarios ) {
		scenario( value.scenarios[ key ] );
	}
}

module.exports = { like, scenario, config };
