exports.run =-> toaster = new Toaster

#<< toaster/utils/*
#<< toaster/generators/*
#<< toaster/config
#<< toaster/cli

class Toaster

	# requirements
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

		# version
		if @cli.argv.v
			filepath = pn __dirname + "/../package.json"
			contents = fs.readFileSync( filepath, "utf-8" )
			schema = JSON.parse( contents ).version
			return log schema
		
		# scaffolds basic structure for new projects
		else if @cli.argv.n
			new Project( @basepath ).create @cli.argv.n

		# initializes a toaster file template into an existent project
		else if @cli.argv.i
			new toaster.generators.Config( @basepath ).create @cli.argv.i

		# watch
		else if @cli.argv.w
			@config = new toaster.Config @
			@builder = new Builder @, @cli
			return

		# help
		else
			return log @cli.opts.help()