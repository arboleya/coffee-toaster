#<< toaster/generators/question

class Config extends toaster.generators.Question

	# requirements
	path = require "path"
	pn = path.normalize
	fs = require "fs"

	# variables
	tpl: """
# => SRC FOLDER
toast '%src%'

	# EXCLUDED FOLDERS (optional)
	# exclude: ['folder/to/exclude', 'another/folder/to/exclude', ... ]

	# => VENDORS (optional)
	# vendors: ['vendors/x.js', 'vendors/y.js', ... ]

	# => OPTIONS (optional, default values listed)
	# bare: false
	# packaging: true
	# expose: ''
	# minify: true

	# => HTTPFOLDER (optional), RELEASE / DEBUG (required)
	httpfolder: '%httpfolder%'
	release: '%release%'
	debug: '%debug%'
"""
	
	constructor:(@basepath)->



	create:(folderpath)=>
		if folderpath? and folderpath != true
			@basepath = "#{@basepath}/#{folderpath}" 
		
		q1 = "Path to your src folder? [src] : "
		q2 = "Path to your release file? [www/js/app.js] : "
		q3 = "Starting from your webroot '/', what's the folderpath to "+
			 "reach your release file? (i.e. js) (optional) : "

		@ask q1.magenta, /.+/, (src)=>
			@ask q2.magenta, /.+/, (release)=>
				@ask q3.cyan, /.*/, (httpfolder)=>
					@write src, release, httpfolder



	write:(src, release, httpfolder)=>
		filepath = pn "#{@basepath}/toaster.coffee"

		rgx = /(\/)?((\w+)(\.*)(\w+$))/
		parts = rgx.exec( release )
		filename = parts[2]

		if filename.indexOf(".") > 0
			debug = release.replace rgx, "$1$3-debug$4$5"
		else
			debug = "#{release}-debug"

		buffer = @tpl.replace "%src%", src
		buffer = buffer.replace "%release%", release
		buffer = buffer.replace "%debug%", debug
		buffer = buffer.replace "%httpfolder%", httpfolder

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
	
	save:(filepath, contents)->
		fs.writeFileSync filepath, contents
		log "#{'Created'.green.bold} #{filepath}"
		process.exit()