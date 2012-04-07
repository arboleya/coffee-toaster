#<< toaster/generators/question
#<< toaster/generators/config

class Project extends Question

	# requirements
	path = require "path"
	fs = require "fs"

	constructor:(@basepath)->



	create:(folderpath, name, src, release)->
		if !folderpath || folderpath == true
			console.log "#{'Error'.bold.red} You need to inform" +
						"a target path!"
			return console.log "\ttoaster -n myawesomeapp".green
		
		if folderpath.substr( 0, 1 ) != "/"
			target = "#{@basepath}/#{folderpath}"
		else
			target = folderpath
		
		if name? && src? && release?
			return @scaffold target, name, src, release
		
		default_name = target.split('/').pop()

		console.log "#{'Let\'s toast something fresh! :)'.grey.bold}"
		console.log ". With this as your basepath: #{target.cyan}"
		console.log ". Please tell me:"

		question1 = "\tWhere do you want your src folder? [src] : "
		question2 = "\tWhat will be the name of your main module? (i.e. app) : "
		question3 = "\tWhere do you want your release file? [release/app.js] : "

		@ask question1, /.*/, (src)=>
			@ask question2, /.+/, (module)=>
				@ask question3, /.*/, (release)=>
					src = src || "src"
					module = module || "app"
					release = release || "release/app.js"
					@scaffold target, src, module, release
					process.exit()



	scaffold:(target, src, module, release)=>
		srcdir = "#{target}/" + ( src || "src" )
		vendorsdir = "#{target}/vendors"
		releasefile = "#{target}/" + ( release || "release/app.js" )
		releasedir = releasefile.split("/").slice(0, -1).join "/"
		
		if path.existsSync target
			console.log "#{'Error'.bold.red} Folder exists! #{target}".red
			return
		
		fs.mkdirSync target, 0755
		console.log "#{'Created'.green.bold} #{target}"

		fs.mkdirSync srcdir, 0755
		console.log "#{'Created'.green.bold} #{srcdir}"

		fs.mkdirSync vendorsdir, 0755
		console.log "#{'Created'.green.bold} #{vendorsdir}"
		
		fs.mkdirSync releasedir, 0755
		console.log "#{'Created'.green.bold} #{releasedir}"
		
		name = name
		srcdir = srcdir.replace( target, "" ).substr 1
		releasefile = releasefile.replace( target, "" ).substr 1
		
		new Config( target ).write name, srcdir, releasefile