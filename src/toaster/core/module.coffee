cs = require "coffee-script"

uglify = require("uglify-js").uglify;
uglify_parser = require("uglify-js").parser;

#<< toaster/utils/*
#<< toaster/core/script

class Module

	pkg_helper:	 """
		pkg = ( ns )->
			curr = null
			parts = [].concat = ns.split( "." )
			for part, index in parts
				if curr == null
					curr = eval part
					continue
				else
					unless curr[ part ]?
						curr = curr[ part ] = %expose%{}
					else
						curr = curr[ part ]
			curr

	"""

	constructor: (@toaster, @config, @opts) ->

		# expanding config variables
		@name = @config.name
		@src = @config.src
		@vendors = @config.vendors ? []
		@release = @config.release ? null

		@bare = @opts.argv.bare ? @config.bare
		@expose = @config.expose ? @opts.argv.expose
		@package = @config.package ? @opts.argv.package
		@minify = @config.minify ? @opts.argv.minify

		# overrides the default macro scope
		if @expose?
			expose = "#{@expose}[part] = "
		else
			expose = ""
		
		@pkg_helper = @pkg_helper.replace "%expose%", expose
		
		# initializes buffer array to keep all tracked files
		@files = []

		# search for all *.coffee files inside src folder
		FsUtil.find @src, "*.coffee", (result) =>

			# instantiates everything, on class for each file
			for file in result
				@files.push new Script @, file, @opts, @bare

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
					log "#{msg} #{info.path.green}"

				# when a file is deleted
				when "deleted"

					# removes files from array
					file = ArrayUtil.find @files, relative_path, "filepath"
					@files.splice file.index, 1

					# cli msg
					msg = "#{(type + ' deleted, stop watching: ').bold.red}"
					log "#{msg} #{info.path.red}"

				# when a file is updated
				when "updated"

					# updates file information
					file = ArrayUtil.find @files, relative_path, "filepath"
					file.item.getinfo()

					# cli msg
					msg = "#{(type + ' changed: ').bold.cyan}"
					log "#{msg} #{info.path.cyan}"

				# when a file starts being watched
				when "watching"
					msg = "#{('Watching ' + info.type + ':').bold.cyan}"
					log "#{msg} #{info.path.cyan}"

			@write() unless info.action is "watching"

	compile:(include_vendors = true)->
		
		# validating syntax
		try
			cs.compile file.raw for file in @files
		
		# if there's some error, catches and shows it, and abort the compilation
		catch err
			msg = err.message.replace '"', '\\"'
			msg = "#{msg.white} at file: " + "#{file.filepath}".bold.red
			error msg
			return null

		# otherwise mode ahead, and expands all dependencies wild-cards
		file.expand_dependencies() for file in @files

		# reorder everything
		@reorder()

		# merge everything
		output = ""
		output = "#{@get_root_namespaces()}\n#{@pkg_helper}\n" if @package
		
		output += (file.raw for file in @files).join "\n"

		# .. write it to the output with the root namespaces inside of it
		namespaces = if @package then @get_root_namespaces() else ""
		output = output.replace "{root_namespaces}", namespaces
		
		# if no error has ocurried, compile the release file
		compiled = cs.compile output, {bare: @bare}

		# uglify
		if @minify
			ast = uglify_parser.parse compiled
			ast = uglify.ast_mangle ast
			ast = uglify.ast_squeeze ast
			compiled = uglify.gen_code ast
		
		# returns the compiled output
		return compiled


	get_root_namespaces:()->

		# gets all the root namespaces in src folder
		root_namespaces = {}
		for file in @files
			if file.filefolder != ""
				pkg = file.namespace.split(".").shift()

				if @expose?
					pkg = "#{@expose}.#{pkg} = #{pkg}"
				
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

		# merge vendors and content
		contents = "#{vendors}\n#{contents}"
		
		# writing file
		fs.writeFileSync @release, contents if /(\/\w+\.\w+$)/gi.test @release

		# informing user through cli
		log "#{'.'.bold.green} #{@release}"

		# if debug is enabled and no error has ocurred, then compile
		# individual files as well
		if @opts.argv.debug

			# evaluating the toaster file folder (path)
			toaster = @release.split("/").slice(0,-1).join('/') + "/toaster"
			toaster = @release.replace( /(\/\w+\.\w+$)/gi, "" ) + "/toaster"

			# constructs the toaster/src folder
			toaster_src = "#{toaster}/#{@name}/src"

			# cleaning before deploying
			FsUtil.rmdir_rf toaster_src if path.existsSync toaster_src

			# creating new structure
			FsUtil.mkdir_p toaster_src

			# template for importing others js's
			tmpl = "document.write('<scri'+'pt src=\"%SRC%\"></scr'+'ipt>')"

			# starting buffer with the pklg_helper
			toaster_buffer = "#{vendors}\n#{@get_root_namespaces()}\n" +
							 "#{cs.compile @pkg_helper, {bare:1}}\n\n"

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
				relative = "./toaster/#{@name}/src/#{relative}"

				# writing file
				fs.writeFileSync filepath, cs.compile file.raw, {bare:1}

				# adding to the buffer
				toaster_buffer += tmpl.replace( "%SRC%", relative ) + "\n"

			# write toaster loader file w/ all imports (buffer) inside it
			toaster = "#{toaster}/#{@name}/#{@name}.js"

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
					if ArrayUtil.has dependency.item.dependencies, file.filepath

						# remove it from the dependencies
						file.dependencies.splice index, 1

						# then prints a warning msg and continue
						warn "Circular dependency found between ".yellow +
						     filepath.grey.bold + " and ".yellow +
						     file.filepath.grey.bold
						
						continue

					# otherwise if no circular dependency is found, reorder
					# the specific dependency and run reorder recursively
					# until everything is beautiful
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
					warn "#{'Dependency'.yellow} #{filepath.bold.grey} " +
						 "#{'not found for file'.yellow} " +
						 file.filepath.grey.bold

			# validate if all base classes was properly imported
			file_index = ArrayUtil.find @files, file.filepath, "filepath"
			file_index = file_index.index

			for bc in file.baseclasses
				found = ArrayUtil.find @files, bc, "classname"
				not_found = (found == null) || (found.index > file_index)

				if not_found && !@missing[bc]
					@missing[bc] = true
					warn "Base class ".yellow +
						 "#{bc} ".bold.grey +
						 "not found for class ".yellow +
						 "#{file.classname} ".bold.grey +
						 "in file ".yellow +
						 file.filepath.bold.grey