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
#<< toaster/grains/*
#<< toaster/parser
#<< toaster/builder

class Toaster
	
	constructor:->
		@parser = new Parser
		@builder = new Builder
		
		[opts, argv] = [@parser.opts, @parser.argv]
		
		return console.log opts.help() if argv.h
		
		@basepath = path.resolve "."
		
		if argv.v
			path = pn __dirname + "/../build/VERSION"
			console.log fs.readFileSync path, "utf-8"
		
		else if argv.n
			new Project( @basepath ).create argv.n
		
		else if argv.i
			new Config( @basepath ).create argv.i
		
		else if argv.c || argv.w
			@compile_andor_watch()
		
		else
			console.log opts.help()
	
	build:()->
		@builder.join @modules, @builds if @builds?
	
	compile_andor_watch:->
		filepath = pn "#{@basepath}/toaster.coffee"
		
		if path.existsSync filepath
			
			contents = cs.compile fs.readFileSync( filepath, "utf-8" ), {bare:1}
			eval contents

			@modules = [].concat modules ? []
			@builds = [].concat builds ? []

			for build in @builds
				build.release = pn "#{@basepath}/#{build.release}"
			
			for module in modules
				module.src = pn "#{@basepath}/#{module.src}"
				module.release = pn "#{@basepath}/#{module.release}"
				new Script @, module, opts
				
				# ANNOTATIONS FOR FUTURE IMPLEMENTATION, BASED IN THIS CONFIG
				# FILE EXAMPLE:
				#
				# --------------------------------------------------------------
				# 	project =
				# 		name: "My Awesome App"
				# 		grains:
				# 			scripts: [
				# 				name: "My Script Module"
				# 				src: "src/scripts"
				# 				release: "release/app.js"
				# 			]
				# 			kup: [
				# 				name: "My Kup Module"
				# 				something_more_here: "third_eye"
				# 			]
				# 			css: [
				# 				name: "My Css Module"
				# 				something_else: "pituitary_gland"
				# 			]
				# --------------------------------------------------------------
				# 
				# INDIVUDAL HANDLERS FOR EACH KING, THE CS ONE IS ALREADY DONE.
				# THE OTHER TWO ARE PENDING.
				# 
				# handling coffeescript 
				# if module.grains.scripts?
				# 	for script in module.grains.scripts
				# 		script.src = pn "#{@basepath}/#{script.src}"
				# 		script.release = pn "#{@basepath}/#{script.release}"
				# 		new Script script
				#
				# handling coffeekup
				# if module.grains.kup?
				# 	TODO: implement markupsupport
				#
				# handling coffeecss
				# if module.grains.css?
				#	TODO: implement styles support
		else
			console.log "ERROR! ".bold.red
			console.log "\tFile not found: #{filepath.red}"
			console.log "\tTry running: "+ "toaster -i".green +
				" or type #{'toaster -h'.green} for more info"