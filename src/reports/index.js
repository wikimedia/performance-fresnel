'use strict';
/**
 * Registry of built-in Fresnel reports.
 *
 * @ignore
 * @module reports
 */

const reports = Object.create( null );

reports.navtiming = require( './navtiming' );
reports.paint = require( './paint' );
reports.transfer = require( './transfer' );

module.exports = reports;
