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
			console.log "ERROR! ".bold.red
			console.log "\tFile not found: #{filepath.red}"
			console.log "\tTry running: "+ "toaster -i".green +
				" or type #{'toaster -h'.green} for more info"



	vendor:(name, src)=>
		@vendors[name] = pn "#{@basepath}/#{src}"


	
	src:( path )=>
		unless @root_src?
			@root_src = path
		else
			warn "Can't define #{"two src folders".bold}, pls ".yellow +
				 "link (#{'ln -s'.white}#{') what you need.'.yellow}".yellow



	module:(name, params)=>
		params.name = name
		params.src = pn "#{@basepath}/#{@root_src}/"
		params.release = pn "#{@basepath}/#{params.release}" if params.release?
		@modules[name] = params



	build:( name, params )=>
		params.name = name
		params.vendors = params.vendors ? []
		params.release = pn "#{@basepath}/#{params.release}"
		params.debug = pn "#{@basepath}/#{params.debug}"
		@builds[name] = params