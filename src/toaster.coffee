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
#<< toaster/config

class Toaster
	modules: []

	constructor:->

		@parser = new Parser
		@builder = new Builder

		if @parser.argv.h
			return console.log @parser.opts.help()

		@basepath = path.resolve "."
		@config = new toaster.Config( @basepath )

		if @parser.argv.v
			path = pn __dirname + "/../build/VERSION"
			console.log fs.readFileSync path, "utf-8"
		
		else if @parser.argv.n
			new Project( @basepath ).create argv.n
		
		else if @parser.argv.i
			new toaster.generators.Config( @basepath ).create argv.i
		
		else
			@init_modules()


	init_modules:->
		for k, v of @config.modules
			@modules[module.name] = new Module @, v, @parser.opts


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
		@builds[name] = params


	# build_all:()->
	# 	@builder.join @modules, @builds if @builds?
	# 