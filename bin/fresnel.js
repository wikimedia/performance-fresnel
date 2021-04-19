#!/usr/bin/env node
'use strict';

/* eslint-disable no-process-exit */

// argv: 0 = bin/node
// 1 = bin/fresnel
// 2... = command and any params
require( '../src/cli.js' )( ...process.argv.slice( 2 ) )
	.catch( ( err ) => {
		if ( typeof err === 'number' ) {
			process.exit( err );
		} else {
			console.error( err );
			process.exit( 1 );
		}
	} );
