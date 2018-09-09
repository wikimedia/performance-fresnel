'use strict';
/**
 * Registry of built-in Fresnel probes.
 *
 * @ignore
 * @module probes
 */

const probes = Object.create( null );

probes.navtiming = require( './navtiming' );
probes.paint = require( './paint' );
probes.screenshot = require( './screenshot' );
probes.trace = require( './trace' );
probes.transfer = require( './transfer' );

module.exports = probes;
