exports.run=()-> new Toaster

#<< toaster/utils/*
#<< toaster/generators/*
#<< toaster/toast
#<< toaster/cli

exports.toaster = toaster
exports.Toaster = class Toaster

	# requirements
	fs = require "fs"
	path = require "path"
	pn = path.normalize
	exec = (require "child_process").exec
	colors = require 'colors'

	constructor:( basedir, config, options, skip_initial_build = false )->
		@basepath = basedir || path.resolve "."
		@cli = new Cli options

		if options?
			for k, v of options
				@cli.argv[k] = v

		# version
		if @cli.argv.v
			filepath = pn __dirname + "/../package.json"
			contents = fs.readFileSync( filepath, "utf-8" )
			schema = JSON.parse( contents )
			return log schema.version
		
		# scaffolds basic structure for new projects
		else if @cli.argv.n
			new Project( @basepath ).create @cli.argv.n

		# initializes a toaster file template into an existent project
		else if @cli.argv.i
			new toaster.generators.Config( @basepath ).create @cli.argv.i

		# watch
		else if @cli.argv.w
			@toast = new toaster.Toast @, config
			@build() unless skip_initial_build

		# help
		else
			return log @cli.opts.help()

	build:( header_code = "", footer_code = "" )->
		for builder in @toast.builders
			builder.build header_code, footer_code