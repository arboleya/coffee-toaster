class Toast

	# requires
	fs = require "fs"
	path = require "path"
	pn = path.normalize
	exec = (require "child_process").exec
	colors = require 'colors'
	cs = require "coffee-script"

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
		if @src?
			warn "Can't define #{'two src folders'.bold}, pls ".yellow +
				 "link (#{'ln -s'.white}#{') what you need.'.yellow}".yellow
			return
		
		# SRC FOLDER
		@src = pn "#{@basepath}/#{srcpath}/"

		unless path.existsSync @src
			error	"Source folder doens't exist:\n\t#{@root_src.red}\n" + 
					"Check your #{'toaster.coffee'.yellow} and try again." +
					"\n\t" + pn( "#{@basepath}/toaster.coffee" ).yellow
			return process.exit()
		
		# VENDORS
		@vendors = params.vendors ? []

		# OPTIONS
		@bare = params.bare ? false
		@packaging = params.packaging ? true
		@expose = if params.expose == undefined ? null else params.expose
		@minify = params.minify ? false

		# RELEASE / DEBUG
		@webroot = params.webroot ? ""
		@release = pn "#{@basepath}/#{params.release}"
		@debug = pn "#{@basepath}/#{params.debug}"