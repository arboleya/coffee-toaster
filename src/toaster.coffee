exports.run =-> toaster = new Toaster

#<< toaster/generators/*
#<< toaster/config
#<< toaster/cli

class Toaster

	# requires
	fs = require "fs"
	path = require "path"
	pn = path.normalize
	exec = (require "child_process").exec
	colors = require 'colors'

	# variables
	modules: {}

	constructor:->

		@basepath = path.resolve "."
		@cli = new Cli

		if @cli.argv.v
			version_path = pn __dirname + "/../build/VERSION"
			return log fs.readFileSync( version_path, "utf-8" ).replace /\n/, ""
			
		else if @cli.argv.n
			new Project( @basepath ).create @cli.argv.n
		
		else if @cli.argv.i
			new toaster.generators.Config( @basepath ).create argv.i
		
		else if @cli.argv.w
			@config = new toaster.Config @
			@builder = new Builder @, @cli
			return
		else
			return log @cli.opts.help()