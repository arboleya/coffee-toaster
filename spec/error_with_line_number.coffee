fs = require 'fs'
os = require 'os'
path = require 'path'
events = require "events"

vows = require "vows"
assert = require "assert"

{FsUtil} = (require "#{__dirname}/../lib/toaster").toaster.utils
{spawn_toaster,snapshot} = require "#{__dirname}/utils/utils"

error_message = "ERROR Parse error on line 12: Unexpected 'UNARY' at file: "
error_message += if os.platform() is "win32" then "\\" else "/"
error_message += "app.coffee"

vows.describe( 'Error with line number' )
.addBatch( 'Compiling a project': 
  'that has syntax error on file "app.js" at line 12':
    topic:->
      report_msg = null
      folder = path.resolve "#{__dirname}/_templates/error_with_line_number"
      toaster = spawn_toaster ['-c', folder]

      toaster.stdout.on 'data', (data)->
        unless report_msg?
          report_msg = data.toString().stripColors.replace /\n/g, ""

      toaster.stderr.on 'data', ( error )=>
        @callback error.toString()

      toaster.on 'exit', (data)=>
        @callback null, report_msg

      undefined

    'should rise the error precisely':( err, reported_msg )->
      assert.equal err, null
      assert.equal reported_msg, error_message
).export module