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
 * @return {Object} An object holding the mean average (`mean`),
 *  standard deviation (`stdev`) and values (`values`).
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

	return { mean, stdev, values };
}

/**
 * Compare two objects from `stats()`.
 *
 * Example:
 *
 *     const a = stats( [ 3, 4, 5 ] );       // mean: 4.0, stdev: 0.82
 *     const b = stats( [ 1.0, 1.5, 2.0 ] ); // mean: 1.5, stdev: 0.41
 *     diffStdev( a, b );
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
 * @return {number} The difference between the before and after mean averages,
 * after having compensated for 1 standard deviation. If lower numbers are better
 * for your metric, then a negative difference represents an improvement.
 */
function diffStdev( before, after ) {
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

/**
 * Perform an approximate Mann-Whitney U test on two sets of values to test
 * whether the values in the second set are significantly higher. The test
 * is a non-parametric test that compares the ranks of the values without
 * assuming they are distributed in a particular way.
 *
 * For details of the test and calculations see:
 * https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test
 *
 * This implementation is paraphrased from:
 * https://github.com/JuliaStats/HypothesisTests.jl/blob/b28a4587fe/src/mann_whitney.jl
 *
 * Assumptions made by this implementation:
 * - each set contains the same number of values
 * - we are interested in whether values in the second set are higher
 * - the sample is large enough to use the approximate test
 *
 * @param {Object} before
 * @param {Object} after
 * @return {number} The p-value representing the likelihood of getting the
 * observed U score (or more extreme) under the null hypothesis, that a
 * randomly-chosen value from either set is equally likely to be higher or
 * lower than a randomly-chosen value from the other set.
 */
function mannWhitney( before, after ) {
	const beforeLen = before.values.length;
	const afterLen = after.values.length;
	const values = before.values.concat( after.values );

	const [ order, adjustment ] = ranks( values );
	const sumBeforeRanks = order
		.slice( 0, beforeLen )
		.reduce( ( a, b ) => {
			return a + b;
		} );

	const U = sumBeforeRanks - ( beforeLen * ( beforeLen + 1 ) / 2 );
	// U statistic mean
	const mu = U - ( beforeLen * afterLen / 2 );
	// U statistic standard deviation
	const sigma = Math.sqrt(
		(
			beforeLen * afterLen * (
				beforeLen + afterLen + 1 - adjustment / (
					( beforeLen + afterLen ) * ( beforeLen + afterLen - 1 )
				)
			)
		) / 12
	)

	if ( mu === 0 && sigma === 0 ) {
		// Values all equal
		return 1;
	} else {
		const z = ( mu + 0.5 ) / sigma;
		// Approximation to Normal distribution CDF from
		// http://web2.uwindsor.ca/math/hlynka/zogheibhlynka.pdf
		return 1 / ( 1 + Math.pow(
			Math.E, ( 0.0054 - 1.6101 * z - 0.0674 * Math.pow( z, 3 ) )
		) );
	}
}

/**
 * Compare two sets of values using the Mann-Witney U test.
 *
 * @see {@link module:compute~mannWhitney #mannWhitney}
 * @param {Object} before
 * @param {Object} after
 * @return {number} Number between 0.0 and 1.0. A higher number may suggest the values have
 * increased, and a lower number may suggest the values remained the same or got lower.
 * It is computed as 1 minus the {@link module:compute~mannWhitney Mann-Whitney p-value}.
 */
function diffMannWhitney( before, after ) {
	return 1 - mannWhitney( before, after );
}

/**
 * Find the rank for each value, giving any tied values the mean of the ranks
 * that they cover. The ranks are used to calculate the U score. Also find
 * the adjustment constant, used for calculating the standard deviation of U.
 *
 * Example:
 *
 *     values: [ 4, 9, 8, 7, 3, 6, 6 ]
 *     sorted: [ 3, 4, 6, 6, 7, 8, 9 ]
 *     place:  [ 1, 6, 5, 4, 0, 2, 3 ]
 *     ranks:  [ 2, 7, 6, 5, 1, 3.5, 3.5 ]
 *
 * @param {number[]} values
 * @return {Array} ranks of the values, adjustment constant
 */
function ranks( values ) {
	// Sort the values
	const sorted = values.slice().sort( ( a, b ) => {
		return a - b;
	} );

	// Find the index of each value in the sorted array
	const startSearch = {};
	const place = sorted.map( ( v, i ) => {
		const ret = values.indexOf( v, startSearch[ v ] );
		startSearch[ v ] = ret + 1;
		return ret;
	} );

	// Find the rank of each value
	// The rank is usually the index + 1, except...
	// For tied values, the rank is the mean of their indices + 1
	let adjustment = 0;
	let i = 0;
	const order = [];
	while ( i < values.length ) {
		let j = i;

		while (
			j + 1 <= values.length &&
			values[ place[ i ] ] === values[ place[ j + 1 ] ]
		) {
			j += 1;
		}

		if ( j > i ) {
			// There are tied values, so find the mean of their ranks
			const numTies = j - i + 1;
			let meanRank = 0;
			for ( let k = i; k < j + 1; k++ ) {
				meanRank += k;
			}
			meanRank /= numTies;
			for ( let k = i; k < j + 1; k++ ) {
				order[ place[ k ] ] = meanRank + 1;
			}

			// Adjustment constant is t^3 - t, where t is the number of ties
			adjustment += Math.pow( numTies, 3 ) - numTies;
		} else {
			// This value is unique
			order[ place[ i ] ] = i + 1;
		}

		i = j + 1;
	}

	return [ order, adjustment ];
}

module.exports = { subtract, stats, diffStdev, mannWhitney, diffMannWhitney };
