class Toast

	# requires
	fs = require "fs"
	path = require "path"
	pn = path.normalize
	exec = (require "child_process").exec
	colors = require 'colors'
	cs = require "coffee-script"

	src_folders: null

	constructor: (@toaster) ->
		# basepath
		@basepath = @toaster.basepath

		# mounting full basepath
		filepath = pn "#{@basepath}/toaster.coffee"
		
		if path.existsSync filepath
			fix_scope = /(^[\s\t]?)(toast)+(\()/mg
			code = cs.compile fs.readFileSync( filepath, "utf-8" ), {bare:1}
			code = code.replace fix_scope, "$1this.$2$3"
			eval code

		else
			error "File not found: ".yelllow + " #{filepath.red}\n" +
				  "Try running:".yellow + " toaster -i".green +
				  " or type".yellow + " #{'toaster -h'.green} " +
				  "for more info".yellow
	
	toast:( srcpath, params = {} )=>
		if @src_folders?
			warn "Can't toast twice simultaneously, link all folders that " +
				 "you need in on config.'.yellow}".yellow
			return

		@src_folders = []

		if srcpath instanceof Object
			params = srcpath
		else
			@src_folders.push {path: srcpath, alias: params.alias || null}

		if params.folders?
			for folder, alias of params.folders
				if folder.substr 0, 1 is not "/"
					folder = pn "#{@basepath}/#{folder}/"
				@src_folders.push {path: folder, alias: alias}

		for item in @src_folders
			unless path.existsSync item.path
				error	"Source folder doens't exist:\n\t#{item.path.red}\n" + 
						"Check your #{'toaster.coffee'.yellow} and try again." +
						"\n\t" + pn( "#{@basepath}/toaster.coffee" ).yellow
				return process.exit()

		# VENDORS
		@vendors = params.vendors ? []

		# OPTIONS
		@exclude = params.exclude ? []
		@bare = params.bare ? false
		@packaging = params.packaging ? true
		@expose = if params.expose == undefined ? null else params.expose
		@minify = params.minify ? false

		# HTTP FOLDER / RELEASE / DEBUG
		@httpfolder = params.httpfolder ? ""
		@release = pn "#{@basepath}/#{params.release}"
		@debug = pn "#{@basepath}/#{params.debug}"