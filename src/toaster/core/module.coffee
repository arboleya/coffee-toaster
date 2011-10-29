cs = require "coffee-script"

#<< toaster/utils/*
#<< toaster/core/script

class Module

	pkg_helper = """
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

	# # module requirements to load
	# 	toaster
	# 	config
	# 	opts

	# # module config variables
	# 	name
	# 	src
	# 	vendors
	# release

	constructor: (@toaster, @config, @opts) ->

		# expanding config variables
		@name = @config.name
		@src = @config.src
		@vendors = @config.vendors
		@release = @config.release

		# initializes buffer array to keep all tracked files
		@files = []

		# search for all *.coffee files inside src folder
		FsUtil.find @src, "*.coffee", (result) =>

			# instantiates everything, on class for each file
			for file in result
				@files.push new Script @, file, @opts

			# compile module for the first time and write it to the filesystem
			@write()

			# watch for file changes
			@watch() if @opts.argv.w

	watch:()->

		# watch entire source folder
		FsUtil.watch_folder @src, /.coffee$/, (info) =>

			# Titleize the type for use in the log messages bellow
			type = StringUtil.titleize info.type

			# relative filepath
			relative_path = info.path.replace "#{@src}/", ""

			# switch over created, deleted, updated and watching
			switch info.action

				# when a new file is created
				when "created"

					# initiate file and adds it to the array
					if info.type == "file"
						@files.push new Script @, info.path, @opts

					# cli msg
					msg = "#{('New ' + info.type + ' created:').bold.green}"
					console.log "#{msg} #{info.path.green}"

				# when a file is deleted
				when "deleted"

					# removes files from array
					file = ArrayUtil.find @files, relative_path, "filepath"
					@files.splice file.index, 1

					# cli msg
					msg = "#{(type + ' deleted, stop watching: ').bold.red}"
					console.log "#{msg} #{info.path.red}"


				# when a file is updated
				when "updated"

					# updates file information
					file = ArrayUtil.find @files, relative_path, "filepath"
					file.item.getinfo()

					# cli msg
					msg = "#{(type + ' changed').bold.yellow}"
					console.log "#{msg} #{info.path.yellow}"

				# when a file starts being watched
				when "watching"
					msg = "#{('Watching ' + info.type + ':').bold.cyan}"
					console.log "#{msg} #{info.path.cyan}"

			@write() unless info.action is "watching"

	compile:(include_vendors = true)->
		
		# expands all dependencies wild-cards
		file.expand_dependencies() for file in @files

		# reorder everything
		@reorder()

		# merge everything
		output = "#{@get_root_namespaces()}\n#{@pkg_helper}\n"
		output += (file.raw for file in @files).join "\n"

		# .. write it to the output with the root namespaces inside of it
		output = output.replace "{root_namespaces}", @get_root_namespaces()

		# tries to compile production file
		try
			# .. compile with coffee
			compiled = cs.compile output

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

			return null

		# returns the compiled output
		return compiled


	get_root_namespaces:()->

		# gets all the root namespaces in src folder
		root_namespaces = {}
		for file in @files
			if file.filefolder != ""
				pkg = file.namespace.split(".").shift()
				root_namespaces[pkg] = "#{pkg} = {}\n"

		# .. merge them into one single buffer
		namespaces_buffer = ""
		namespaces_buffer += k for v, k of root_namespaces

		return namespaces_buffer

	write:()->

		# assigns compiled buffer to variable and abort method if its null
		return unless (contents = @compile())?

		# gets all vendors concatenated the right way
		vendors = @toaster.builder.merge_vendors @vendors

		# writing file
		fs.writeFileSync @release, "#{vendors}\n#{contents}"

		# informing user through cli
		console.log "#{'.'.bold.green} #{@release}"

		# if debug is enabled and no error has ocurred, then compile
		# individual files as well
		if @opts.argv.debug

			# evaluating the toaster file folder (path)
			toaster = @release.split("/").slice(0,-1).join('/') + "/toaster"

			# constructs the toaster/src folder
			toaster_src = "#{toaster}/src"

			# cleaning before deploying
			FsUtil.rmdir_rf toaster if path.existsSync toaster

			# creating new structure
			FsUtil.mkdir_p toaster_src

			# template for importing others js's
			tmpl = "document.write('<scri'+'pt src=\"%SRC%\"></scr'+'ipt>')"

			# starting buffer with the pklg_helper
			toaster_buffer = "#{vendors}\n#{@get_root_namespaces()}\n" +
							 "#{@pkg_helper}\n"

			# loop through all ordered files
			for file, index in @files

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
				toaster_buffer += tmpl.replace( "%SRC%", relative ) + "\n"

			# write toaster loader file w/ all imports (buffer) inside it
			toaster = "#{toaster}/toaster.js"
			fs.writeFileSync toaster, toaster_buffer

		@toaster.builder.build()


	missing = {}
	reorder: (cycling = false) ->

		# if cycling is true or @missing is null, initializes empty array
		# for holding missing dependencies
		# 
		# cycling means the redorder method is being called recursively,
		# no other methods call it with cycling = true
		@missing = {} if cycling is false

		# looping through all files
		for file, i in @files

			# if theres no dependencies, go to next file
			continue if !file.dependencies.length && !file.baseclasses.length
			
			# otherwise loop thourgh all file dependencies
			for filepath, index in file.dependencies

				# search for dependency
				dependency = ArrayUtil.find @files, filepath, "filepath"
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
						console.log "WARNING!".bold.yellow,
							"You have a circular dependcy loop between files",
							"#{filepath.yellow.bold} and",
							file.filepath.yellow.bold
						continue
					
					# otherwise if no circular dependency is found, reorder
					# the specific dependency and run reorder recursively until
					# everything is beautiful
					else
						@files.splice index, 0, dependency.item
						@files.splice dependency.index + 1, 1
						@reorder true
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

			# tries to validate if all base classes was imported
			file_index = ArrayUtil.find @files, file.filepath, "filepath"
			file_index = file_index.index

			for bc in file.baseclasses
				found = ArrayUtil.find @files, bc, "classname"
				not_found = (found.index > file_index) || (found == null)

				if not_found && !@missing[bc]
					@missing[bc] = true
					console.log "#{'WARNING!'.bold} Base class".yellow,
								bc.bold.white,
								"not found for class".yellow,
								file.classname.bold.white,
								"in file".yellow,
								file.filepath.yellow
