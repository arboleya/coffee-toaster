#<< toaster/generators/question

class Config extends Question

	# requirements
	path = require "path"
	pn = path.normalize
	fs = require "fs"

	# variables
	tpl: """
# VENDORS
# vendor 'vendor_id', 'vendors/id.js'
# vendor 'vendor_id_b', 'vendors/id_b.js'


# ROOT SRC FOLDER
src '%src%'


# MODULES
module '%module%' # module folder name (inside src)
	# vendors: ['id', 'id_b'] # (ordered vendor's array)
	bare: false # default = false (compile coffeescript with bare option)
	packaging: true # default = true
	expose: null # default = null (if informed, link all objects inside it)
	minify: false # default = false (minifies release file only)

# module 'another_module_folder'
# 	(...)


# BUILD ROUTINES
build "main"
	# vendors: ['vendor_id', 'vendor_id_b']
	modules: ['%module%']
	release: '%release%'
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
		
		@ask question1, /.+/, (src)=>
			@ask question2, /.+/, (release)=>
				@write src, "module_folder", release



	write:(src, module, release)=>
		filepath = pn "#{@basepath}/toaster.coffee"

		rgx = /(\/)?((\w+)(\.*)(\w+$))/
		parts = rgx.exec( release )
		filename = parts[2]

		if filename.indexOf(".") > 0
			debug = release.replace rgx, "$1$3-debug$4$5"
		else
			debug = "#{release}-debug"

		buffer = @tpl.replace "%src%", src
		buffer = buffer.replace /(\%module\%)/g, module
		buffer = buffer.replace "%release%", release
		buffer = buffer.replace "%debug%", debug
		
		if path.existsSync filepath
			question = "\tDo you want to overwrite the file: #{filepath.yellow}"
			question += " ? [y/N] : ".white
			@ask question, /.*?/, (overwrite)=>
				if overwrite.match /y/i
					@save filepath, buffer
					process.exit()
		else
			@save filepath, buffer
			process.exit()
	
	save:( filepath, contents)->
		fs.writeFileSync filepath, contents
		log "#{'Created'.green.bold} #{filepath}"
		process.exit()