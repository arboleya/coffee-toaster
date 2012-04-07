#<< toaster/generators/question

class Config extends Question

	# requirements
	path = require "path"
	pn = path.normalize
	fs = require "fs"

	# variables
	tpl: """
# VENDORS
# vendor 'id', 'vendors/id.js'
# vendor 'id_b', 'vendors/id_b.js'


# ROOT SRC FOLDER
src 'src'


# MODULES
module '%module%' # module folder name (inside src)
	vendors: ['_', 'jquery'] # (ordered vendor's array)
	bare: false # default = false (compile coffeescript with bare option)
	packaging: true # default = true
	expose: "window" # default = null (if informed, link all objects inside it)
	minify: false # default = false (minifies release file only)

# module 'another_module_folder'
# 	(...)


# BUILD ROUTINES
build "main"
	modules: ['%module%']
	release: 'release/app.js'
	debug: '%debug%'

# build 'another_build_routine'
# 	(...)
	"""
	
	constructor:(@basepath)->



	create:(folderpath)=>
		if folderpath? and folderpath != true
			@basepath = "#{@basepath}/#{folderpath}" 
		
		log "#{'Let\'s toast this sly little project! :)'.grey.bold}"
		log ". With this as your basepath: #{@basepath.cyan}"
		log ". Please, tell me:"

		question1 = "\tWhere's your src folder? [src]: "
		question2 = "\tWhere do you want your release file? " +
					"[release/app.js] : "
		
		# @ask question1, /.*/, (name)=>
		@ask question1, /.+/, (src)=>
			@ask question2, /.+/, (release)=>
				@write src, "module_folder", release



	write:(src, module, release)=>
		filepath = pn "#{@basepath}/toaster.coffee"

		toaster = @tpl.replace "%src%", src
		toaster = toaster.replace /(%module%)/, module
		toaster = toaster.replace "%release%", release
		toaster = toaster.replace "%release%", release.replace ".js", "-debug.js"
		
		if path.existsSync filepath
			question = "\tDo you want to overwrite the file: #{filepath.yellow}"
			question += " ? [y/N] : ".white
			@ask question, /.*?/, (overwrite)=>
				if overwrite.match /n/i
					return process.exit()
		
		fs.writeFileSync filepath, toaster
		log "#{'Created'.green.bold} #{filepath}"

		process.exit()