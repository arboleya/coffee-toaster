cs = require "coffee-script"

#<< toaster/utils/*
#<< toaster/core/script

class Module

	pkg_helper: """
		{root_namespaces}
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

	# initializes buffer array to keep all tracked files
	files: []

	constructor: (@toaster, @config, @opts) ->

		# expanding config variables
		@name = @config.name
		@src = @config.src
		@vendors = @config.vendors
		@release = @config.release

		# search for all *.coffee files inside src folder
		FsUtil.find @src, "*.coffee", (result) =>

			# instantiates everything, on class for each file
			@files.push new Script @, file, @opts for file in result

			# compile module for the first time
			@write @compile()

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
					msg = "#{('New ' + info.type + ' created:').green}"
					console.log "#{msg} #{info.path}"

				# when a file is deleted
				when "deleted"
				
					# removes files from array
					file = ArrayUtil.find @files, relative_path, "filepath"
					@files.splice file.index, 1

					# cli msg
					msg = "#{(type + ' deleted, stop watching: ').red}"
					console.log "#{msg} #{info.path}"


				# when a file is updated
				when "updated"

					# updates file information
					file = ArrayUtil.find @files, relative_path, "filepath"
					file.item.getinfo()

					# cli msg
					msg = "#{(type + ' changed').yellow}"
					console.log "#{msg} #{info.path}"

				# when a file starts being watched
				when "watching"
					msg = "#{('Watching ' + info.type).cyan}"
					console.log "#{msg} #{info.path}"

			@write @compile() unless info.action is "watching"

	compile:(include_vendors = true)->
		# expands all dependencies wild-cards
		file.expand_dependencies() for file in @files

		# reorder everything
		@reorder()

		# merge everything
		output = @pkg_helper + (file.raw for file in @files).join "\n"

		# gets all the root namespaces in src folder
		root_namespaces = {}
		for file in @files
			if file.filefolder != ""
				pkg = file.namespace.split(".").shift()
				root_namespaces[pkg] = "#{pkg} = {}\n"

		# .. merge them into one single buffer
		namespaces_buffer = ""
		namespaces_buffer += k for v, k of root_namespaces

		# .. write it to the output
		output = output.replace "{root_namespaces}", namespaces_buffer

		# .. compile with coffee
		compiled = cs.compile output

		# if include_vendors is true
		if include_vendors

			# them merge all vendors in the proper order
			vendors = ""
			for vendor_name in @vendors

				if (vendor = @toaster.config.vendors[vendor_name])

					if path.existsSync vendor
						vendors += "#{fs.readFileSync vendor, 'utf-8'}\n"
					else
						console.log "WARNING!".bold.yellow,
							"Vendor".white,
							vendor_name.yellow.bold,
							"not found at".white,
							vendor.yellow.bold
				else
					console.log "WARNING!".bold.yellow,
						"Vendor".yellow,
						vendor_name.white.bold
						"not found for module".yellow,
						@name.white.bold

			# and prepend to the output
			compiled = vendors + compiled

	write:(contents)->
		# writing file
		fs.writeFileSync @release, contents

		# informing user through cli
		console.log "#{'.'.green} #{@release}"


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
