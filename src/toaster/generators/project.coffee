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

		log "#{'Let\'s toast something fresh! :)'.grey.bold}"
		log ". With this as your basepath: #{target.cyan}"
		log ". Please tell me:"

		q1 = "\tWhere do you want your src folder? [src] : "
		q2 = "\tWhere do you want your release file? [www/js/app.js] : "
		q3 = "\tStarting from your webroot '/', what's the folderpath to "+
			 "reach your release file? (i.e. javascript) (optional) : "

		@ask q1.magenta, /.*/, (src = null)=>
			@ask q2.magenta, /.*/, (release = null)=>
				@ask q3.cyan, /.*/, (httpfolder = null)=>
					$src = src || "src"
					$release = release || "www/js/app.js"
					if src is '' and release is '' and httpfolder is ''
						$httpfolder = 'js'
					else
						$httpfolder = httpfolder || ""
					@scaffold target, $src, $release, $httpfolder
					process.exit()



	scaffold:(target, src, release, httpfolder)=>
		srcdir = pn "#{target}/#{src}"
		vendorsdir = pn "#{target}/vendors"
		releasefile = pn "#{target}/#{release}"
		releasedir = releasefile.split("/").slice(0, -1).join "/"
		
		log "#{'Created'.green.bold} #{target}" if FsUtil.mkdir_p target
		log "#{'Created'.green.bold} #{srcdir}" if FsUtil.mkdir_p srcdir
		log "#{'Created'.green.bold} #{vendorsdir}" if FsUtil.mkdir_p vendorsdir
		log "#{'Created'.green.bold} #{releasedir}" if FsUtil.mkdir_p releasedir

		srcdir = srcdir.replace( target, "" ).substr 1
		releasefile = releasefile.replace( target, "" ).substr 1

		new Config( target ).write srcdir, releasefile, httpfolder