#<< toaster/generators/question

class Config extends Question

	# requirements
	path = require "path"
	pn = path.normalize
	fs = require "fs"

	# variables
	tpl: """
# => SRC FOLDER
toast '%src%'
	# => VENDORS (optional)
	# vendors: ['vendors/x.js', 'vendors/y.js', ... ]

	# => OPTIONS (optional, default values listed)
	# bare: false
	# packaging: true
	# expose: ''
	# minify: false

	# => WEBROOT (optional), RELEASE / DEBUG (required)
	webroot: '%webroot%'
	release: '%release%'
	debug: '%debug%'
	"""
	
	constructor:(@basepath)->



	create:(folderpath)=>
		if folderpath? and folderpath != true
			@basepath = "#{@basepath}/#{folderpath}" 
		
		log "#{'Let\'s toast this sly little project! :)'.grey.bold}"
		log ". With this as your basepath: #{@basepath.cyan}"
		log ". Please, tell me:"

		q1 = "\tWhere's your src folder? (i.e. src): "
		q2 = "\tWhere do you want your release file? (i.e. www/js/app.js) : "
		q3 = "\tStarting from your webroot '/', what's the folderpath to "+
			 "reach your release file? (i.e. js) (optional) : "

		@ask q1.magenta, /.+/, (src)=>
			@ask q2.magenta, /.+/, (release)=>
				@ask q3.cyan, /.*/, (webroot)=>
					@write src, release, webroot



	write:(src, release, webroot)=>
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
		buffer = buffer.replace "%webroot%", webroot

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