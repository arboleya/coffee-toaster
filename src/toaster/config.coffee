# ------------------------------------------------------------------------------
# Requires
# ------------------------------------------------------------------------------

fs = require "fs"
path = require "path"

pn = path.normalize
exec = (require "child_process").exec

colors = require 'colors'

class Config

	modules: {}
	vendors: {}
	builds: {}

	constructor: (@basepath) ->

		# creating local references
		module = @module
		vendor = @vendor
		build = @build

		# mounting full path
		filepath = pn "#{@basepath}/toaster.coffee"
		
		if path.existsSync filepath
			eval( cs.compile fs.readFileSync( filepath, "utf-8" ), {bare:1} )
		else
			console.log "ERROR! ".bold.red
			console.log "\tFile not found: #{filepath.red}"
			console.log "\tTry running: "+ "toaster -i".green +
				" or type #{'toaster -h'.green} for more info"

	module:(name, params)=>
		params.name = name
		params.src = pn "#{@basepath}/#{params.src}"
		params.release = pn "#{@basepath}/#{params.release}"
		@modules[name] = params

	vendor:(name, src)=>
		@vendors[name] = pn "#{@basepath}/#{src}"

	build:( name, params )=>
		params.name = name
		params.release = pn "#{@basepath}/#{params.release}"
		@builds[name] params