#<< toaster/core/module

class Config

	# requires
	fs = require "fs"
	path = require "path"
	pn = path.normalize
	exec = (require "child_process").exec
	colors = require 'colors'
	cs = require "coffee-script"
	
	# variables
	vendors: {}
	modules: {}
	builds: {}

	constructor: (@toaster) ->
		# basepath
		@basepath = @toaster.basepath

		# mounting full basepath
		filepath = pn "#{@basepath}/toaster.coffee"
		
		if path.existsSync filepath
			fix_scope = /(^[\s\t]?)(vendor|src|module|build)+(\()/mg
			code = cs.compile fs.readFileSync( filepath, "utf-8" ), {bare:1}
			code = code.replace fix_scope, "$1this.$2$3"
			eval code
			
		else
			error "File not found: ".yelllow + " #{filepath.red}\n" +
				  "Try running:".yellow + " toaster -i".green +
				  " or type".yellow + " #{'toaster -h'.green} " +
				  "for more info".yellow



	vendor:(name, src)=>
		@vendors[name] = pn "#{@basepath}/#{src}"


	
	src:( dirpath )=>
		unless @root_src?
			@root_src = pn "#{@basepath}/#{dirpath}/"

			unless path.existsSync @root_src
				error	"Source folder doens't exist:\n\t#{@root_src.red}\n" + 
						"Check your #{'toaster.coffee'.yellow} and try again." +
						"\n\t" + pn( "#{@basepath}/toaster.coffee" ).yellow
				return process.exit()
		else
			warn "Can't define #{'two src folders'.bold}, pls ".yellow +
				 "link (#{'ln -s'.white}#{') what you need.'.yellow}".yellow



	module:(name, params = {})=>
		params.name = name
		params.src = @root_src
		
		unless path.existsSync pn "#{@root_src}#{name}"
			error	"Inexistent path informed for module #{name.red}:\n" + 
					"\t#{@root_src}#{name}".red + "\n" +
					"Check your #{'toaster.coffee'.yellow} and try again." +
					"\n\t" + pn( "#{@basepath}/toaster.coffee" ).yellow
			return process.exit()

		params.bare = params.bare ? false
		params.packaging = params.packaging ? true
		params.expose = if params.expose == undefined ? null else params.expose
		params.minify = params.minify ? false
		@modules[name] = params



	build:( name, params )=>
		params.name = name
		params.vendors = params.vendors ? []
		params.webroot = params.webroot ? ""
		params.release = pn "#{@basepath}/#{params.release}"
		params.debug = pn "#{@basepath}/#{params.debug}"
		@builds[name] = params