# requirements
# ------------------------------------------------------------------------------
fs = require 'fs'
path = require 'path'
events = require "events"

vows = require "vows"
assert = require "assert"

#<< utils
{FsUtil} = (require __dirname + "/../lib/toaster").toaster.utils

error_message = "ERROR Parse error on line 12: Unexpected 'UNARY' at file: app.coffee"

vows.describe( 'Compiling' )
.addBatch( 'Compiling a project': 
	'that has syntax error on file "app.js" at line 12':
		topic:->
			report_msg = null
			toaster = spawn_toaster ['-c', 'templates/error_with_line_number']

			toaster.stdout.on 'data', (data)->
				unless report_msg?
					report_msg = data.toString().stripColors.replace /\n/g, ""

			toaster.stderr.on 'data', ( error )->
				@callback error

			toaster.on 'exit', (data)=>
				@callback null, report_msg

			undefined

		'should rise the error precisely':( err, reported_msg )->
			assert.equal err, null
			assert.equal reported_msg, error_message
).export module