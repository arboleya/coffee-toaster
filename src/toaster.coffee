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
#<< toaster/config
#<< toaster/cli

class Toaster
	modules: {}

	constructor:->

		@cli = new Cli

		if @cli.argv.h
			return console.log @cli.opts.help()

		@basepath = path.resolve "."
		@config = new toaster.Config( @basepath )

		if @cli.argv.v
			path = pn __dirname + "/../build/VERSION"
			console.log fs.readFileSync path, "utf-8"
		
		else if @cli.argv.n
			new Project( @basepath ).create @cli.argv.n
		
		else if @cli.argv.i
			new toaster.generators.Config( @basepath ).create argv.i
		
		else
			@init_modules()
		
		@builder = new Builder @


	init_modules:->
		for k, v of @config.modules
			@modules[v.name] = new Module @, v, @cli.opts