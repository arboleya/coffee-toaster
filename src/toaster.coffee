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
	
	build:()->
		@builder.join @modules, @builds if @builds?
	
	compile_andor_watch:->
		filepath = pn "#{@basepath}/toaster.coffee"
		
		if path.existsSync filepath
			
			contents = cs.compile fs.readFileSync( filepath, "utf-8" ), {bare:1}
			eval contents

			@modules = [].concat modules ? []
			@builds = [].concat builds ? []

			for build in @builds
				build.release = pn "#{@basepath}/#{build.release}"
			
			for module in @modules
				module.src = pn "#{@basepath}/#{module.src}"
				module.release = pn "#{@basepath}/#{module.release}"
				new Script @, module, opts
		else
			console.log "ERROR! ".bold.red
			console.log "\tFile not found: #{filepath.red}"
			console.log "\tTry running: "+ "toaster -i".green +
				" or type #{'toaster -h'.green} for more info"