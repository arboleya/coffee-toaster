fs = require "fs"
cs = require "coffee-script"

#<< FsUtil, ArrayUtil, StringUtil

class Script
	
	constructor: (@config, @opts) ->
		@src = @config.src
		@release = @config.release
		@compile if @opts.argv.w then @watch else null 
	
	watch: =>

		# watch entire source folder
		FsUtil.watch_folder @src, /.coffee$/, (info) =>

			# Titleize the type for use in the log messages bellow
			type = StringUtil.titleize info.type
			
			# seitch over created, deleted, updated and watching
			switch info.action

				# when a new file is created
				when "created"
					msg = "#{('New ' + info.type + ' created:').green}"
					console.log "#{msg} #{info.path}"
					@compile()
				
				# when a file is deleted
				when "deleted"
					msg = "#{(type + ' deleted, stop watching: ').red}"
					console.log "#{msg} #{info.path}"
					@compile()
				
				# when a file is updated
				when "updated"
					msg = "#{(type + ' changed').yellow}"
					console.log "#{msg} #{info.path}"
					@compile()
				
				# when a file starts being watched
				when "watching"
					msg = "#{('Watching ' + info.type).cyan}"
					console.log "#{msg} #{info.path}"
	
	compile: (cb) ->
		# collect all files
		@collect (files)=>

			# process all requirements
			processed = @process_requirements files

			# reorder everything charmingly
			ordered = @reorder processed
			
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
			
			# and finall executs de callback
			cb?()
	
	collect: (cb) ->

		# search for all *.coffee files inside src folder
		FsUtil.find @src, "*.coffee", (files) =>

			# initializes buffer array to keep all tracked files
			buffer = []

			# looping through all files
			for file in files
				
				# read file content and initialize dependencies array
				raw = fs.readFileSync file, "utf-8"
				dependencies = []
				
				# assemble some information about the file
				filepath       = file.replace( @src, "" ).substr 1
				filename       = /\w+\.\w+/.exec( filepath )[ 0 ]
				filefolder     = filepath.replace( "/#{filename}", "") + "/"

				# if the file is in the top level
				if filepath.indexOf("/") is -1
					filefolder = ""
				
				# assemble namespace info about the file
				namespace = filefolder.replace(/\//g, ".").slice 0, -1

				# validate if there is a class inside the file
				rgx = "(class)+\\s+(\\w+)(\\s*$|\\s+(extends)\\s+(\\w+)\\s*$)"
				
				# validate if there is a class extends inside the file
				rgx_ext = /(class)+\s+(\w+)\s+(extends)\s+(\w+)\s*$/m
				
				# if there is a class inside the file
				if raw.match( new RegExp rgx, "m" )?
					
					# if the file is not in the root src folder (outside any
					# folder/package )
					if namespace != ""
						# then modify the class declarations before starting
						# the parser thing, adding the package the headers
						# declarations
						repl = "pkg( '#{namespace}' ).$2 = $1 $2"
						repl += "$3" if rgx_ext.test raw
						raw = raw.replace new RegExp( rgx, "gm" ), repl
					
					# assemble some more infos about the file.
					#		classname: ClassName
					#		namespace: package.subpackage
					#		classpath: package.subpackage.ClassName
					classname = raw.match( new RegExp( rgx, "m") )[2]
					
					if namespace is ""
						classpath = classname
					else
						classpath = "#{namespace}.#{classname}"
				
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
				}
			# finally executes callback, passing the collected buffer
			cb buffer
	
	process_requirements: ( files ) ->

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

				# otherwise its index to the dead array
				_dead_indexes.push index

				# and find all files under that namespace
				reg = new RegExp dependency.replace /(\/)/g, "\\$1"
				found = ArrayUtil.find_all files, reg, "filepath", true, true

				# if nothing is found under the given namespace
				if found.length <= 0
					console.log "#{'WARNING'.bold.yellow} Nothing found".yellow,
								"inside #{dependency.yellow}"
					continue
				
				# otherwise rewrites found array with filepath info only
				found[k] = found[k].item.filepath for v, k in found
				
				# concat all dependencies together
				_dependencies = _dependencies.concat found
			
			# desc sorting dead_indexes for proper removal
			_dead_indexes = _dead_indexes.sort().reverse()

			# remove all dead_indexes from the dependencies array
			file.dependencies.splice dead, 1 for dead in _dead_indexes

			# concat the found dependencies into the file dependencies
			file.dependencies = file.dependencies.concat _dependencies

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

		# initialized files array, will cache every file as it is read
		initd = []
		
		# looping through all files
		for file, i in files

			# mark file as initialized
			initd.push file

			# if theres no dependencies, go to next file
			continue if file.dependencies.length is 0
			
			# otherwise loop thourgh all file dependencies
			for dependency, index in file.dependencies

				# continue if the dependency was already initialized
				continue if ArrayUtil.has initd, dependency, "filepath"

				# otherwise search by the dependency
				found = ArrayUtil.find files, dependency, "filepath"

				# if it's found
				if found?

					# if there's some circular dependency loop
					if ArrayUtil.has(
						found.item.dependencies,
						file.filepath,
						"filepath"
					)
						# remove it from the dependencies
						file.dependencies.splice index, 1

						# then prints a warning msg and continue
						console.log "WARNING! ".bold.yellow,
							"You have a circular dependcy loop between files",
							"#{dependency.yellow.bold} and",
							"#{file.filepath.yellow.bold}."
						continue
					
					# otherwise if no circular dependency is found, reorder
					# the specific dependency and run reorder recursively until
					# everything is beautiful
					else
						files.splice index, 0, found.item
						files.splice found.index + 1, 1
						files = @reorder files, true
				
				# otherwise if the dependency is not found
				else if @missing[dependency] != true
					# then add it to the @missing hash (so it will be ignored
					# until reordering finishes)
					@missing[dependency] = true
					
					# move it to the end of the dependencies array (avoiding
					# it from being touched again)
					file.dependencies.push dependency
					file.dependencies.splice index, 1

					# ..and finally prints a warning msg
					console.log "WARNING! ".bold.yellow,
						"Dependency #{dependency.yellow.bold} not found",
						"for class #{file.classpath.yellow.bold}."
		
		# after all, return everything in the proper order
		files
	
	merge: (files) ->
		# merge the array and return it
		(file.raw for file in files).join "\n"