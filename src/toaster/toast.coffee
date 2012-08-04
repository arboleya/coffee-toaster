class Toast

	# requires
	fs = require "fs"
	path = require "path"
	pn = path.normalize
	exec = (require "child_process").exec
	colors = require 'colors'
	cs = require "coffee-script"

	# variables
	builders: []

	constructor: (@toaster) ->

		# basepath
		@basepath = @toaster.basepath

		if (config = @toaster.cli.argv["config"])?
			config = JSON.parse( config ) unless config instanceof Object
			@toast item for item in [].concat( config )
		else
			config_file = @toaster.cli.argv["config-file"]
			filepath = config_file || pn "#{@basepath}/toaster.coffee"

			if fs.existsSync( filepath )

				contents = fs.readFileSync( filepath, "utf-8" )

				fix_scope = /(^[\s\t]?)(toast)+(\()/mg
				code = cs.compile contents, {bare:1}
				code = code.replace fix_scope, "$1this.$2$3"

				eval code
			else
				error "File not found: ".yellow + " #{filepath.red}\n" +
				  "Try running:".yellow + " toaster -i".green +
				  " or type".yellow + " #{'toaster -h'.green} " +
				  "for more info".yellow

	
	toast:( srcpath, params = {} )=>
		if srcpath instanceof Object
			params = srcpath
		else if srcpath.substr( 0, 1 ) != "/"
			srcpath = "#{@toaster.basepath}/#{srcpath}"

		# configuration object shared between builders
		debug = if params.debug then pn "#{@basepath}/#{params.debug}" else null
		config =
				# RUNNING BUILDERS
				is_building: false

				# BASEPATH
				basepath: @basepath
				
				# SRC FOLDERS
				src_folders: []

				# FILES CONTRAINER ARRAY
				files: []
				
				# VENDORS
				vendors: params.vendors ? []

				# OPTIONS
				exclude: params.exclude ? []
				bare: params.bare ? false
				packaging: params.packaging ? true
				expose: params.expose ? null
				minify: params.minify ? true

				# HTTP FOLDER / RELEASE / DEBUG
				httpfolder: params.httpfolder ? ""
				release: pn "#{@basepath}/#{params.release}"
				debug: debug

		# compute vendors full path
		config.vendors[i] = pn "#{@basepath}/#{v}" for v, i in config.vendors

		unless srcpath instanceof Object
			config.src_folders.push {
				path: srcpath,
				alias: params.alias || null
			}

		if params.folders?
			for folder, alias of params.folders
				if folder.substr 0, 1 is not "/"
					folder = pn "#{@basepath}/#{folder}/"
				config.src_folders.push {path: folder, alias: alias}

		for item in config.src_folders
			unless fs.existsSync item.path
				error	"Source folder doens't exist:\n\t#{item.path.red}\n" + 
						"Check your #{'toaster.coffee'.yellow} and try again." +
						"\n\t" + pn( "#{@basepath}/toaster.coffee" ).yellow
				return process.exit()

		@builders.push new toaster.core.Builder @toaster, @toaster.cli, config