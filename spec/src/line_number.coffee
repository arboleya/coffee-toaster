# requirements
# ------------------------------------------------------------------------------
fs = require 'fs'
path = require 'path'
vows = require "vows"
assert = require "assert"

#<< utils
{FsUtil} = (require __dirname + "/../lib/toaster").toaster.utils

vows.describe( 'Builder' )
.addBatch( 'A project builded': 
	'with a syntax error on file "app.js" line 1':
		topic: 'on file at line 1',
		'should alert against the file "app.js" at line 1':( msg )->
			console.log "asserting " + msg
			assert.equal msg, "on file at line 1"

).export module