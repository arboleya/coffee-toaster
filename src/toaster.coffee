exports.run=()-> new Toaster

#<< toaster/toast
#<< toaster/cli
#<< toaster/misc/inject-ns

exports.toaster = toaster
exports.Toaster = class Toaster

	# requirements
	fs = require "fs"
	fsu = require "fs-util"
	path = require "path"
	exec = (require "child_process").exec
	colors = require 'colors'

	# variable - before filter container
	before_build: null

	constructor:( basedir, options = null, skip_initial_build = false )->

		@basepath = path.resolve( basedir || "." )
		@cli = new toaster.Cli options

		# increments basepath if some path is given for args -n, -i, -c, -w, -d
		# just one of these could have a path, so only the first found will be
		# considered.
		for flag in ('nicwd'.split '')
			if (typeof (base = @cli.argv[flag]) is 'string')
				@basepath = path.resolve base
				break

		# injecting options into @cli.argv to maintain interoperability
		if options?
			@cli.argv[k] = v for k, v of options

		# printing version
		if @cli.argv.v
			filepath = path.join __dirname, "/../package.json"
			contents = fs.readFileSync filepath, "utf-8"
			schema = JSON.parse contents
			return log schema.version
		
		# scaffolding basic structure for new projects
		else if @cli.argv.n
			new toaster.generators.Project( @basepath ).create @cli.argv.n

		# initializing a toaster file template into an existent project
		else if @cli.argv.i
			new toaster.generators.Config( @basepath ).create()

		# injecting namespace declarations
		else if @cli.argv.ns
			@toast = new toaster.Toast @
			new toaster.misc.InjectNS @toast.builders

		# starting watching'n'compiling process
		else if (base = @cli.argv.w || @cli.argv.c)
			config = if options and options.config then options.config else null
			@toast = new toaster.Toast @
			@build() unless skip_initial_build

		# showing help screen
		else
			return log @cli.opts.help()

	# can be called by apps using toaster as lib, build the project with options
	# to inject header and footer code which must to be in coffee as well and
	# will be compiled together the app.
	build:( header_code = "", footer_code = "" )->
		for builder in @toast.builders
			builder.build header_code, footer_code

	# resets the toaster completely - specially used when the `toaster.coffee`
	# config file is edited :)
	reset:()->
		builder.reset() for builder in @toast.builders
		exports.run()