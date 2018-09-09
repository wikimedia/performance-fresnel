'use strict';
/**
 * @private
 * @module util/ponyfill
 */

/* istanbul ignore file */

/**
 * Ponyfill for Promise.prototype.finally (ES2018; Node 10).
 *
 * Based on <https://github.com/tc39/proposal-promise-finally/blob/fd934c0/spec.md>.
 *
 * Basically, the returned Promise is fulfilled or rejected the same way as
 * original promise, the 'finally' callback does not contribute to the resolution
 * chain and any return value from the callback is ignored.
 *
 * @param {Promise} promise
 * @param {Function} callback
 * @return {Promise}
 */
function final( promise, callback ) {
	if ( promise.finally ) {
		return promise.finally( callback );
	}
	return promise.then(
		( val ) => {
			return Promise.resolve( callback() ).then( () => val );
		},
		( err ) => {
			return Promise.resolve( callback() ).then( () => {
				throw err;
			} );
		}
	);
}

module.exports = { final };
