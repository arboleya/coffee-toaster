# ------------------------------------------------------------------------------
# Requires
# ------------------------------------------------------------------------------

fs = require "fs"
path = require "path"

pn = path.normalize
exec = (require "child_process").exec

colors = require 'colors'
optimist = require 'optimist'


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
#<< Project, Config
#<< Script, Kup, Css


class Toaster
	
	constructor:->
		@help = new Help
		
		[opts, argv] = [@help.opts, @help.argv]
		
		if( argv.h )
			console.log opts.help()
			return
		
		@basepath = path.resolve "."
		
		if argv.v
			path = pn __dirname + "/../build/VERSION"
			console.log fs.readFileSync path, "utf-8"
		if argv.n
			new Project( @basepath ).create()
		else if argv.i
			new Config( @basepath ).create()
		else if argv.w
			@watch()
		else
			console.log opts.help()
	
	watch:->
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
			console.log "ERROR! ".bold.red
			console.log "\tFile not found: #{filepath.red}"
			console.log "\tTry running: "+ "toaster -i".green +
				" or type #{'toaster -h'.green} for more info"

class Help
	constructor:->
		usage = "#{'CoffeeToaster'.bold}\n"
		usage += "  Minimalist dependency management for CoffeeScript\n\n".grey
		
		usage += "#{'Usage'.bold}\n"
		usage += "  toaster #{'[options]'.bold} #{'[path]'.bold}\n\n"
		
		usage += "#{'Examples'.bold}\n"
		usage += "  toaster -ns myawsomeapp   (required)\n"
		usage += "  toaster -cs [myawsomeapp] (optional)\n"
		usage += "  toaster -ws [myawsomeapp] (optional)\n"
		# usage += "  toaster -nk myawsomeapp\n"
		# usage += "  toaster -nc myawsomeapp\n"
		# usage += "  toaster -nskc myawsomeapp"
		
		adendo = "use w/ [-s]"
		# adendo = "use w/ [-s, -k, -c]"
		
		@argv = (@opts = optimist.usage( usage )
    		.alias('n', 'new')
			# .boolean( 'n' )
			.describe('n', "Scaffold a very basic new App, #{adendo}")
			
			.alias('i', 'init')
			# .boolean( 'i' )
			.describe('i', "Create a config (toaster.coffee) file, #{adendo}")
			
			.alias('w', 'watch')
			# .boolean( 'w' )
			.describe('w', "Start watching/compiling your project, #{adendo}")
			
			.alias('d', 'debug')
			.boolean( 'd' )
			.default('d', false)
			.describe('d', 'Debug mode (compile js files individually)')
			
			.alias('s', 'script')
			.boolean( 's' )
			.default('s', false)
			.describe('s', 'Enable CoffeeScript handling')
			
			# .alias('k', 'kup')
			# .boolean( 'k' )	
			# .default('k', false)
			# .describe('k', 'Enable CoffeeKup handling')
			# 
			# .alias('c', 'css')
			# .boolean( 'c' )
			# .default('c', false)
			# .describe('c', 'Enable CoffeeCss handling')
			
			.alias('v', 'version')
			# .boolean( 'v' )
			.describe('v', '')
			
			.alias('h', 'help')
			# .boolean( 'h' )
			.describe('h', '')
		).argv