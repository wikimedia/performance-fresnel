'use strict';
/**
 * Functions to help with numerical computations.
 *
 * @module compute
 */

/**
 * Perform subtraction on each pair from two sequences.
 *
 * Example:
 *
 *     const seqA = [ 3.0, 3.0, 4.5 ];
 *     const seqB = [ 2.5, 2.6, 3.3 ];
 *     subtract( seqA, seqB );
 *     // [ 0.5, 0.4, 1.2 ]
 *
 * @param {number[]} seqA
 * @param {number[]} seqB
 * @return {number[]}
 */
function subtract( seqA, seqB ) {
	return seqA.map( ( a, i ) => a - seqB[ i ] );
}

/**
 * Compute statistics about a sequence of numbers.
 *
 * Example:
 *
 *     stats( [ 3, 4, 5 ] );
 *     // mean: 4.0, stdev: 0.82
 *
 * @param {number[]} values
 * @return {Object} An object holding the mean average (`mean`)
 *  and standard deviation (`stdev`).
 */
function stats( values ) {
	// The mean average:
	// - sum total
	// - number of values
	// - answer = sum / number
	let sum = 0;
	for ( const value of values ) {
		sum += value;
	}
	const mean = sum / values.length;

	// The standard deviation:
	// - the mean average
	// - distances from values to the mean, squared
	// - sum of squared distances
	// - answer = square root of (sum / number)
	// Formula courtesy of Khan Academy
	// https://www.khanacademy.org/math/probability/data-distributions-a1/summarizing-spread-distributions/a/calculating-standard-deviation-step-by-step
	let sqDiffSum = 0;
	for ( const value of values ) {
		sqDiffSum += Math.pow( value - mean, 2 );
	}
	const stdev = Math.sqrt( sqDiffSum / values.length );

	return { mean, stdev };
}

/**
 * Compare two objects from `stats()`.
 *
 * Example:
 *
 *     const a = stats( [ 3, 4, 5 ] );       // mean: 4.0, stdev: 0.82
 *     const b = stats( [ 1.0, 1.5, 2.0 ] ); // mean: 1.5, stdev: 0.41
 *     compareStdev( a, b );
 *     // -1.27
 *
 * This is computed by creating a range of 1 stdev aroud each mean,
 * and if they don't overlap, the distance between them is returned.
 *
 * In the above example, the range for sequence A is `3.18 ... 4.82`,
 * and the range for B is `1.09 ... 1.91`. The ranges don't overlap and
 * the distance between 3.18 and 1.91 is -1.27.
 *
 * @param {Object} before
 * @param {Object} after
 * @return {number} The difference between the before and after means, after
 * compensating for 1 standard deviation. If lower numbers are better for
 * your metric, then a negative difference represents an improvement.
 */
function compareStdev( before, after ) {
	const beforeStart = before.mean - before.stdev;
	const beforeEnd = before.mean + before.stdev;

	const afterStart = after.mean - after.stdev;
	const afterEnd = after.mean + after.stdev;

	if ( afterEnd < beforeStart ) {
		// Got lower
		return afterEnd - beforeStart;
	}
	if ( beforeEnd < afterStart ) {
		// Got higher
		return afterStart - beforeEnd;
	}
	// Unchanged
	return 0;
}

module.exports = { subtract, stats, compareStdev };
