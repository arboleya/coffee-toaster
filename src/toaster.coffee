# ------------------------------------------------------------------------------
# Requires
# ------------------------------------------------------------------------------

fs = require "fs"
path = require "path"

pn = path.normalize
exec = (require "child_process").exec

colors = require 'colors'

# ------------------------------------------------------------------------------
# Global Vars
# ------------------------------------------------------------------------------
opts = null
argv = null


# ------------------------------------------------------------------------------
# Exports
# ------------------------------------------------------------------------------
exports.run =->
	toaster = new Toaster

# ------------------------------------------------------------------------------
# Imports
# ------------------------------------------------------------------------------
#<< toaster/generators/*
#<< toaster/core/*
#<< toaster/parser

class Toaster
	modules: []
	vendors: []
	builds: []

	constructor:->
		@parser = new Parser
		@builder = new Builder
		
		[opts, argv] = [@parser.opts, @parser.argv]
		
		return console.log opts.help() if argv.h
		
		@basepath = path.resolve "."
		
		if argv.v
			path = pn __dirname + "/../build/VERSION"
			console.log fs.readFileSync path, "utf-8"
		
		else if argv.n
			new Project( @basepath ).create argv.n
		
		else if argv.i
			new Config( @basepath ).create argv.i
		
		else if argv.c || argv.w
			@compile_andor_watch()
		
		else
			console.log opts.help()
	
	build_all:()->
		@builder.join @modules, @builds if @builds?
	

	module:(name, params)=>
		params.name = name
		params.src = pn "#{@basepath}/#{params.src}"
		params.release = pn "#{@basepath}/#{params.release}"
		@modules.push params

	vendor:(name, params)=>
		params.name = name
		params.src = pn "#{@basepath}/#{params.src}"
		@vendors.push params

	build:( name, params )=>
		params.name = name
		params.release = pn "#{@basepath}/#{params.release}"
		@builds.push params


	compile_andor_watch:->
		module = @module
		vendor = @vendor
		build = @build

		filepath = pn "#{@basepath}/toaster.coffee"
		
		if path.existsSync filepath
			
			eval( cs.compile fs.readFileSync( filepath, "utf-8" ), {bare:1} )
			new Script @, module, opts for module in @modules
		
		else
			console.log "ERROR! ".bold.red
			console.log "\tFile not found: #{filepath.red}"
			console.log "\tTry running: "+ "toaster -i".green +
				" or type #{'toaster -h'.green} for more info"