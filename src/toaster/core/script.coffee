fs = require "fs"
cs = require "coffee-script"

#<< toaster/utils/array-util

class Script

	constructor: (@module, @realpath, @opts) ->
		@getinfo()


	getinfo:()->

		# read file content and initialize dependencies
		# and baseclasses array
		@raw = fs.readFileSync @realpath, "utf-8"
		@dependencies_collapsed = []
		@baseclasses = []

		# assemble some information about the file
		@filepath   =  @realpath.replace( @module.src, "" ).substr 1
		@filename   = /[\w-]+\.[\w-]+/.exec( @filepath )[ 0 ]
		@filefolder = @filepath.replace( "/#{@filename}", "") + "/"
		@namespace  = ""

		# if the file is in the top level
		if @filepath.indexOf("/") is -1
			@filefolder = ""
		
		# assemble namespace info about the file
		@namespace = @filefolder.replace(/\//g, ".").slice 0, -1

		# validate if there is a class inside the file
		rgx = "(^|=\\s*)(class)+\\s+(\\w+)" +
			  "(\\s*$|\\s+(extends)\\s+(\\w+)\\s*$)"
		
		# filter classes that extends another classes
		rgx_ext = "(^|=\\s*)(class)\\s(\\w+)\\s(extends)\\s(\\w+)\\s*$"
		
		# if there is a class inside the file
		if @raw.match( new RegExp rgx, "m" )?

			# if the file is not in the root src folder (outside any
			# folder/package )
			if @namespace != ""
				# then modify the class declarations before starting
				# the parser thing, adding the package headers declarations
				# as well as the exports thing

				exports = @module.exports
				if exports != false
					exports = "#{@module.exports}.$3 = "
				else
					exports = ""
				
				if( @module.packaging )
					repl = "$1pkg( '#{@namespace}' ).$3 = #{exports} $2 $3"
					repl += "$4" if new RegExp(rgx_ext, "m").test @raw
					@raw = @raw.replace new RegExp( rgx, "gm" ), repl
			
			# assemble some more infos about the file.
			#		classname: ClassName
			#		namespace: package.subpackage
			#		classpath: package.subpackage.ClassName
			@classname = @raw.match( new RegExp( rgx, "m") )[3]
			
			# assure namespace is correct
			if @namespace is ""
				@classpath = @classname
			else
				@classpath = "#{@namespace}.#{@classname}"
			
			# colletcts the base classes, in case some class in the file
			# extends something
			for klass in @raw.match( new RegExp rgx_ext, "gm" ) ? []
				@baseclass = @klass.match( new RegExp(rgx_ext, "m"))[5]
				@baseclasses.push baseclass
		
		# then if there's other dependencies
		if /(#<<\s)(.*)/g.test @raw

			# collect all and loop through them
			requirements = @raw.match /(#<<\s)(.*)/g
			for item in requirements
				# 1. filter dependency name
				# 2. trim it 
				# 3. split all dependencies
				# 4. concat it with the dependencies array
				item         = /(#<<\s)(.*)/.exec( item )[ 2 ]
				item         = item.replace /\s/g, ""
				item         = [].concat item.split ","
				@dependencies_collapsed = @dependencies_collapsed.concat item

	expand_dependencies:()->

		# referencies the module's files array
		files = @module.files

		# resets the dependencies array
		@dependencies = []

		# looping through file dependencies
		for dependency, index in @dependencies_collapsed
			
			# if dependency is not a wild-card (namespace.*)
			if dependency.substr(-1) != "*"

				# then add file extension to it and continue
				@dependencies.push "#{dependency}.coffee"
				continue

			# otherwise find all files under that namespace
			reg = new RegExp dependency.replace /(\/)/g, "\\$1"
			found = ArrayUtil.find_all files, reg, "filepath", true, true

			# if nothing is found under the given namespace
			if found.length <= 0
				console.log "#{'WARNING!'.bold.yellow} Nothing found".yellow,
							"#{'inside'.yellow} #{dependency.white}"
				continue
			
			# otherwise rewrites found array with filepath info only
			@dependencies.push expanded.item.filepath for expanded in found