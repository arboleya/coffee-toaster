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
	modules: {}

	constructor:->

		@parser = new Parser
		@builder = new Builder @

		if @parser.argv.h
			return console.log @parser.opts.help()

		@basepath = path.resolve "."

		if @parser.argv.v
			path = pn __dirname + "/../build/VERSION"
			console.log fs.readFileSync path, "utf-8"
		
		else if @parser.argv.n
			new Project( @basepath ).create @parser.argv.n
		
		else if @parser.argv.i
			new toaster.generators.Config( @basepath ).create @parser.argv.i
		
		else
			@config = new toaster.Config @basepath
			@init_modules()


	init_modules:->
		for k, v of @config.modules
			@modules[v.name] = new Module @, v, @parser.opts