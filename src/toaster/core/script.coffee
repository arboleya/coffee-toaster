fs = require "fs"
cs = require "coffee-script"

#<< toaster/utils/*

class Script
	
	constructor: (@toaster, @config, @opts) ->
		@src = @config.src
		@release = @config.release
		@compile if @opts.argv.w then @watch else null 
	
	watch: =>

		# watch entire source folder
		FsUtil.watch_folder @src, /.coffee$/, (info) =>

			# Titleize the type for use in the log messages bellow
			type = StringUtil.titleize info.type
			
			# switch over created, deleted, updated and watching
			switch info.action

				# when a new file is created
				when "created"
					msg = "#{('New ' + info.type + ' created:').green}"
					console.log "#{msg} #{info.path}"
				
				# when a file is deleted
				when "deleted"
					msg = "#{(type + ' deleted, stop watching: ').red}"
					console.log "#{msg} #{info.path}"
				
				# when a file is updated
				when "updated"
					msg = "#{(type + ' changed').yellow}"
					console.log "#{msg} #{info.path}"
				
				# when a file starts being watched
				when "watching"
					msg = "#{('Watching ' + info.type).cyan}"
					console.log "#{msg} #{info.path}"
			
			@compile() unless info.action is "watching"
	
	compile: (cb) ->
		# collect all files
		@collect (files)=>

			# process all requirements
			expanded = @expand_wildcards files

			# reorder everything charmingly
			ordered = @reorder expanded
			
			# gather all information about files x line numbers inside each one
			linenum = 1
			for file, i in ordered
				file.start = linenum
				file.length = file.raw.split("\n").length
				file.end = file.start + ( file.length - 1 )
				linenum = file.end + 1
			
			# gets all the root packages in src folder
			root_packages = {}
			for file in files
				if file.filefolder != ""
					pkg = file.namespace.split(".").shift()
					root_packages[pkg] = "#{pkg} = {}\n"
			
			# .. and merge them into a buffer
			pkg_buffer = ""
			pkg_buffer += obj for pkg, obj of root_packages

			# pkg_helper to be appended to the merged files in order to provide
			# packaging functionality
			pkg_helper = """
				#{pkg_buffer}
				pkg = ( ns )->
					curr = null
					parts = [].concat = ns.split( "." )
					for part, index in parts
						if curr == null
							curr = eval part
							continue
						else
							unless curr[ part ]?
								curr = curr[ part ] = {}
							else
								curr = curr[ part ]
					curr
				
			"""
			
			# merge pkg_hepler and all file's contents into one single string
			# buffer to be compiled
			contents = "#{pkg_helper}\n#{@merge ordered}"

			# tries to compile production file
			try
				# compiling coffeescript
				contents = cs.compile contents

				# writing file
				fs.writeFileSync @release, contents

				# informing user through cli
				console.log "#{'.'.green} #{@release}"
			
			# if there's some error
			catch err

				# get the error msg
				msg = err.message
				
				# if it has some line information
				if /(line\s)([0-9]+)/g.test msg

					# get the line number
					line = msg.match( /(line\s)([0-9]+)/ )[2]

					# loop through all ordered files
					for file in ordered

						# checks if the error line corresponds to some line
						# inside that file. if yes, then replaces the line info
						# inside the error msg
						if line >= file.start && line <= file.end
							line = (line - file.start) + 1
							msg = msg.replace /line\s[0-9]+/, "line #{line}"
							msg = StringUtil.ucasef msg
				
				# prints the error msg
				console.log "ERROR!".bold.red, msg,
					"\n\t#{file.filepath.red}"
			
			# if debug is enabled and no error has ocurred, then compile
			# individual files as well
			if @opts.argv.debug and msg is undefined

				# evaluating the toaster file folder (path)
				toaster = "#{@release.split("/").slice(0,-1).join '/'}/toaster"

				# constructs the toaster/src folder
				toaster_src = "#{toaster}/src"
				
				# cleaning before deploying
				FsUtil.rmdir_rf toaster if path.existsSync toaster

				# creating new structure
				FsUtil.mkdir_p toaster_src
				
				# template for importing others js's
				tmpl = "document.write('<scri'+'pt src=\"%SRC%\"></scr'+'ipt>')"

				# starting buffer with the pklg_helper
				buffer = "#{pkg_helper}\n"

				# loop through all ordered files
				for file, index in ordered

					# evaluates its path relative to the src folder
					relative = file.filepath

					# and replace file extension from .coffee to .js
					relative = relative.replace ".coffee", ".js"
					
					# then computes the filepath
					filepath = "#{toaster_src}/#{relative}"
					
					# ..and extract its folder path
					folderpath = filepath.split('/').slice(0,-1).join "/"
					
					# if the container folder doesnt exist yet
					if !path.existsSync folderpath
						# create it
						FsUtil.mkdir_p folderpath
					
					# computing relative path to test folder
					relative = "./toaster/src/#{relative}"
					
					# writing file
					fs.writeFileSync filepath, cs.compile file.raw, {bare:1}

					# adding to the buffer
					buffer += tmpl.replace( "%SRC%", relative ) + "\n"
					
				# write toaster loader file w/ all imports (buffer) inside it
				toaster = "#{toaster}/toaster.js"
				fs.writeFileSync toaster, cs.compile buffer, {bare:1}
			
			# and rebuilds everything
			@toaster.build_all()
			
			# and finall executs de callback
			cb?()
	
	collect: (cb) ->

		# search for all *.coffee files inside src folder
		FsUtil.find @src, "*.coffee", (files) =>

			# initializes buffer array to keep all tracked files
			buffer = []

			# looping through all files
			for file in files

				# read file content and initialize dependencies
				# and extends array
				raw = fs.readFileSync file, "utf-8"
				dependencies = []
				baseclasses = []

				# assemble some information about the file
				filepath   = file.replace( @src, "" ).substr 1
				filename   = /[\w-]+\.[\w-]+/.exec( filepath )[ 0 ]
				filefolder = filepath.replace( "/#{filename}", "") + "/"
				namespace  = ""
				# if the file is in the top level
				if filepath.indexOf("/") is -1
					filefolder = ""
				
				# assemble namespace info about the file
				namespace = filefolder.replace(/\//g, ".").slice 0, -1

				# validate if there is a class inside the file
				rgx = "(^|=\\s*)(class)+\\s+(\\w+)" +
					  "(\\s*$|\\s+(extends)\\s+(\\w+)\\s*$)"
				
				# filter classes that extends another classes
				rgx_ext = "(^|=\\s*)(class)\\s(\\w+)\\s(extends)\\s(\\w+)\\s*$"
				
				# if there is a class inside the file
				if raw.match( new RegExp rgx, "m" )?

					# if the file is not in the root src folder (outside any
					# folder/package )
					if namespace != ""
						# then modify the class declarations before starting
						# the parser thing, adding the package the headers
						# declarations
						repl = "$1pkg( '#{namespace}' ).$3 = $2 $3"
						repl += "$4" if new RegExp(rgx_ext, "m").test raw
						raw = raw.replace new RegExp( rgx, "gm" ), repl
					
					# assemble some more infos about the file.
					#		classname: ClassName
					#		namespace: package.subpackage
					#		classpath: package.subpackage.ClassName
					classname = raw.match( new RegExp( rgx, "m") )[3]
					
					# assure namespace is correct
					if namespace is ""
						classpath = classname
					else
						classpath = "#{namespace}.#{classname}"
					
					# colletcts the base classes, in case some class in the file
					# extends something
					for klass in raw.match( new RegExp rgx_ext, "gm" ) ? []
						baseclass = klass.match( new RegExp(rgx_ext, "m"))[5]
						baseclasses.push baseclass
				
				# if the file was already buffered, prints a warning msg,
				# skip it and move on
				continue if ArrayUtil.find buffer, filepath, "filepath"
				
				# then if there's other dependencies
				if /(#<<\s)(.*)/g.test raw

					# collect all and loop through them
					requirements = raw.match /(#<<\s)(.*)/g
					for item in requirements
						# 1. filter dependency name
						# 2. trim it 
						# 3. split all dependencies
						# 4. concat it with the dependencies array
						item         = /(#<<\s)(.*)/.exec( item )[ 2 ]
						item         = item.replace /\s/g, ""
						item         = [].concat item.split ","
						dependencies = dependencies.concat item
				
				# assemble the file hash info and push it into buffer
				buffer.push {
					raw:           raw

					classname:     classname
					namespace:     namespace
					classpath:     classpath
					
					filepath:      filepath
					filename:      filename
					filefolder:    filefolder

					dependencies:  dependencies
					baseclasses:   baseclasses
				}
			
			# finally executes callback, passing the collected buffer
			cb buffer
	
	expand_wildcards: ( files ) ->

		# loop through all files
		for file in files
			
			# initialize empty arrays for keeping the processed dependencies
			# and the dead index, for after removal
			_dependencies = []
			_dead_indexes = []
			
			# looping through file dependencies
			for dependency, index in file.dependencies
				
				# if dependency is not a wild-card (namespace.*)
				if dependency.substr(-1) != "*"
					# then add file extension to it and continue
					file.dependencies[index] += ".coffee"
					continue

				# otherwise adds its index to the dead array
				_dead_indexes.push index

				# and find all files under that namespace
				reg = new RegExp dependency.replace /(\/)/g, "\\$1"
				found = ArrayUtil.find_all files, reg, "filepath", true, true

				# if nothing is found under the given namespace
				if found.length <= 0
					console.log "#{'WARNING!'.bold.yellow} Nothing found".yellow,
								"#{'inside'.yellow} #{dependency.white}"
					continue
				
				# otherwise rewrites found array with filepath info only
				found[k] = found[k].item.filepath for v, k in found
				
				# save index and found itens, to be processed bellow
				_dependencies.push found
			
			# replace all wildcars by its found matches
			while len = _dependencies.length
				f = _dependencies.pop()
				ArrayUtil.replace_into file.dependencies, len-1, f
			
		# return the files after processing everything
		files
	
	missing = {}
	reorder: (files, cycling = false) ->

		# if cycling is true or @missing is null, initializes empty array
		# for holding missing dependencies
		# 
		# cycling means the redorder method is being called recursively,
		# no other methods call it with cycling = true
		@missing = {} if cycling is false

		# looping through all files
		for file, i in files

			# if theres no dependencies, go to next file
			continue if !file.dependencies.length && !file.baseclasses.length
			
			# otherwise loop thourgh all file dependencies
			for filepath, index in file.dependencies

				# search for dependency
				dependency = ArrayUtil.find files, filepath, "filepath"
				dependency_index = dependency.index if dependency?

				# continue if the dependency was already initialized
				continue if dependency_index < i && dependency?

				# if it's found
				if dependency?

					# if there's some circular dependency loop
					if ArrayUtil.has(
						dependency.item.dependencies,
						file.filepath,
						"filepath"
					)
						# remove it from the dependencies
						file.dependencies.splice index, 1

						# then prints a warning msg and continue
						console.log "WARNING! ".bold.yellow,
							"You have a circular dependcy loop between files",
							"#{filepath.yellow.bold} and",
							file.filepath.yellow.bold
						continue
					
					# otherwise if no circular dependency is found, reorder
					# the specific dependency and run reorder recursively until
					# everything is beautiful
					else
						files.splice index, 0, dependency.item
						files.splice dependency.index + 1, 1
						files = @reorder files, true
						break
				
				# otherwise if the dependency is not found
				else if @missing[filepath] != true
					# then add it to the @missing hash (so it will be ignored
					# until reordering finishes)
					@missing[filepath] = true

					# move it to the end of the dependencies array (avoiding
					# it from being touched again)
					file.dependencies.push filepath
					file.dependencies.splice index, 1

					# ..and finally prints a warning msg
					console.log "WARNING!".bold.yellow,
								"Dependency #{filepath.bold.white}".yellow,
								"not found for class".yellow,
								"#{file.classpath.white.bold}."

			file_index = ArrayUtil.find files, file.filepath, "filepath"
			file_index = file_index.index

			for bc in file.baseclasses
				found = ArrayUtil.find files, bc, "classname"
				not_found = (found.index > file_index) || (found == null)
				# console.log "\tFOUND: " + found.index
				# console.log "\tNOT_FOUND: " + not_found

				if not_found && !@missing[bc]
					@missing[bc] = true
					console.log "#{'WARNING!'.bold} Base class".yellow,
								bc.bold.white,
								"not found for class".yellow,
								file.classname.bold.white,
								"in file".yellow,
								file.filepath.yellow

		# after all, return everything in the proper order
		files
	
	merge: (files) ->
		# merge the array and return it
		(file.raw for file in files).join "\n"