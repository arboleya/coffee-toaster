#<< toaster/generators/question
#<< toaster/generators/config

class Project extends toaster.generators.Question

	# requirements
	path = require "path"
	fs = require "fs"
	fsu = require 'fs-util'

	{FsUtil} = toaster.utils


	constructor:(@basepath)->

	create:(folderpath, name, src, release)->
		if (typeof folderpath) isnt 'string'
			error_msg = "You need to inform a target path!\n"
			error_msg += "\ttoaster -n myawesomeapp".green
			return error error_msg

		if name? && src? && release?
			return @scaffold folderpath, name, src, release

		q1 = "Path to your src folder? [src] : "
		q2 = "Path to your release file? [www/js/app.js] : "
		q3 = "Starting from your webroot '/', what's the folderpath to "+
			 "reach your release file? (i.e. js) (optional) : "

		@ask q1.magenta, /.*/, (src = null)=>
			@ask q2.magenta, /.*/, (release = null)=>
				@ask q3.cyan, /.*/, (httpfolder = null)=>
					$src = src || "src"
					$release = release || "www/js/app.js"
					if src is '' and release is '' and httpfolder is ''
						$httpfolder = 'js'
					else
						$httpfolder = httpfolder || ""
					@scaffold folderpath, $src, $release, $httpfolder
					process.exit()



	scaffold:(target, src, release, httpfolder)=>
		target = path.resolve target
		srcdir = path.join target, src
		vendorsdir = path.join target, "vendors"
		releasefile = path.join target, release
		releasedir = path.dirname releasefile

		log "#{'Created'.green.bold} #{target}" if fsu.mkdir_p target
		log "#{'Created'.green.bold} #{srcdir}" if fsu.mkdir_p srcdir
		log "#{'Created'.green.bold} #{vendorsdir}" if fsu.mkdir_p vendorsdir
		log "#{'Created'.green.bold} #{releasedir}" if fsu.mkdir_p releasedir

		srcdir = srcdir.replace( target, "" ).substr 1
		releasefile = releasefile.replace( target, "" ).substr 1

		config = new toaster.generators.Config target
		config.write srcdir, releasefile, httpfolder
