#<< toaster/generators/question
#<< toaster/generators/config

class Project extends Question

	# requirements
	path = require "path"
	pn = path.normalize
	fs = require "fs"

	constructor:(@basepath)->



	create:(folderpath, name, src, release)->
		if !folderpath || folderpath == true
			return error	"You need to inform a target path!\n" +
							"\ttoaster -n myawesomeapp".green
		
		if folderpath.substr( 0, 1 ) != "/"
			target = "#{@basepath}/#{folderpath}"
		else
			target = folderpath
		
		if name? && src? && release?
			return @scaffold target, name, src, release
		
		default_name = target.split('/').pop()

		log "#{'Let\'s toast something fresh! :)'.grey.bold}"
		log ". With this as your basepath: #{target.cyan}"
		log ". Please tell me:"

		q1 = "\tWhere do you want your src folder? [src] : "
		q2 = "\tWhat will be the name of your main module? [app] : "
		q3 = "\tWhere do you want your release file? [www/app.js] : "
		q4 = "\tStarting from your webroot ('/'), what's the folderpath to \n"+
			 "\treach your release file? (i.e. javascript) (optional) : "
		
		@ask q1.magenta, /.*/, (src)=>
			@ask q2.cyan, /.*/, (module)=>
				@ask q3.magenta, /.*/, (release)=>
					@ask q4.cyan, /.*/, (webroot)=>
						src = src || "src"
						module = module || "app"
						release = release || "www/app.js"
						@scaffold target, src, module, release, webroot
						process.exit()



	scaffold:(target, src, module, release, webroot)=>
		srcdir = pn "#{target}/#{src}"
		moduledir = pn "#{srcdir}/#{module}" 
		vendorsdir = pn "#{target}/vendors"
		releasefile = pn "#{target}/#{release}"
		releasedir = releasefile.split("/").slice(0, -1).join "/"
		
		if path.existsSync target
			return error "Folder exists! #{target.red}"
		
		fs.mkdirSync target, '0755'
		log "#{'Created'.green.bold} #{target}"

		fs.mkdirSync srcdir, '0755'
		log "#{'Created'.green.bold} #{srcdir}"

		fs.mkdirSync moduledir, '0755'
		log "#{'Created'.green.bold} #{moduledir}"

		fs.mkdirSync vendorsdir, '0755'
		log "#{'Created'.green.bold} #{vendorsdir}"
		
		fs.mkdirSync releasedir, '0755'
		log "#{'Created'.green.bold} #{releasedir}"
		
		srcdir = srcdir.replace( target, "" ).substr 1
		releasefile = releasefile.replace( target, "" ).substr 1
		
		new Config( target ).write srcdir, module, releasefile, webroot