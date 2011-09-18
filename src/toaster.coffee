fs = require "fs"
path = require "path"

pn = path.normalize
exec = (require "child_process").exec

coffee = require "coffee-script"
colors = require 'colors'


exports.run =->
	toaster = new Toaster

#<< Script, Kup, Css
#<< Project, Config

class Toaster
	
	constructor:->
		@basepath = path.resolve(".")
		argv = process.argv[2..]
		
		if argv.length && argv[0] == "new"
			new Project( @basepath ).create argv
		else
			@basepath += "/#{argv[0]}" if argv.length
			@basepath = @basepath.replace /\/[^\/]+\/\.{2}/, ""
			@init()
	
	init:->
		filepath = pn "#{@basepath}/toaster.coffee"
		
		if path.existsSync filepath
			
			contents = cs.compile fs.readFileSync( filepath, "utf-8" ), {bare:1}
			modules = [].concat( eval contents )
			
			for module in modules
				module.src = pn "#{@basepath}/#{module.src}"
				module.release = pn "#{@basepath}/#{module.release}"
				new Script module
				
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
				# THE OTHER TWO IS PENDING.
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
				# 	TODO: implement coffeeku support
				#
				# handling coffeecss
				# if module.grains.css?
				#	TODO: implement coffeeku support
		else
			new Config( @basepath ).create()
