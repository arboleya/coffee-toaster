#<< toaster/utils/*

class Builder

	# requirements
	fs = require 'fs'
	path = require 'path'
	cs = require "coffee-script"
	uglify = require("uglify-js").uglify
	uglify_parser = require("uglify-js").parser

	# variables
	toaster_helper: """
		__t = ( ns, expose )->
			curr = null
			parts = [].concat = ns.split "."
			for part, index in parts
				if curr == null
					curr = eval part
					expose[part] = curr if expose?
					continue
				else
					unless curr[ part ]?
						curr = curr[ part ] = {}
						expose[part] = curr if expose?
					else
						curr = curr[ part ]
			curr

	"""

	include_tmpl: "document.write('<scri'+'pt src=\"%SRC%\"></scr'+'ipt>')"



	constructor:(@toaster, @config, @opts)->
		@src = @config.src

		@vendors = @config.vendors ? []

		@bare = @config.bare ? @opts.argv.bare
		@packaging = @config.packaging ? @opts.argv.packaging
		@expose = @config.expose ? @opts.argv.expose
		@minify = @config.minify ? @opts.argv.minify

		@webroot = @config.webroot ? ''
		@release = @config.release
		@debug = @config.debug

		@init()



	init:()->
		# initializes buffer array to keep all tracked files-
		@files = []

		# search for all *.coffee files inside src folder
		FsUtil.find @src, "*.coffee", (result) =>

			# collects every files into Script instances
			@files.push new Script @, file, @opts, @bare for file in result

			# builds for the first time
			@build =>
				# ...and start watching for file changes
				@watch() if @opts.argv.w


	
	build:( fn )=>
		# get all root namespaces
		FsUtil.ls_folders @src, ( folders )=>

			# prepare namespaces declarations (plus exposes)
			namespaces = ""
			for folder in folders
				folder = folder.match /([^\/]+)$/mg
				declaration = ""
				declaration += "var #{folder} = " if @packaging
				declaration += "#{@expose}.#{@folder} = " if @expose?
				declaration += "{};" if declaration.length
				namespaces += "#{declaration}\n"

			# prepare helper
			helper = cs.compile @toaster_helper, {bare:true}

			# prepare vendors
			vendors = @merge_vendors()

			# prepare release contents
			contents = [ vendors, helper, namespaces, @compile() ]
			
			# write release file
			fs.writeFileSync @release, contents.join( "\n" )

			# notify user through cli
			log "#{'+'.bold.green} #{@release}"

			# compiling for debug
			if @opts.argv.d
				files = @compile_for_debug()

				# saving boot loader
				if @opts.argv.d
					for f, i in files
						include = "#{@webroot}/toaster/#{f}"
						tmpl = @include_tmpl.replace "%SRC%", include
						files[i] = tmpl

					# prepare boot loader contents
					contents = [ vendors, helper, namespaces, files.join "\n" ]

					# write boot-loader file
					fs.writeFileSync @debug, contents.join( "\n" )
			
			fn?()



	watch:()->
		# watch entire source folder
		FsUtil.watch_folder @src, /.coffee$/, (info) =>

			# Titleize the type for use in the log messages bellow
			type = StringUtil.titleize info.type

			# relative filepath
			relative_path = info.path.replace @src, ""

			# switch over created, deleted, updated and watching
			switch info.action

				# when a new file is created
				when "created"

					# initiate file and adds it to the array
					if info.type == "file"
						# toaster/core/script
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

			# rebuilds modules unless notificiation is 'watching'
			@build() unless info.action is "watching"



	compile:()->
		# validating syntax
		try
			cs.compile file.raw for file in @files
		
		# if there's some error
		catch err

			# catches and shows it, and abort the compilation
			msg = err.message.replace '"', '\\"'
			msg = "#{msg.white} at file: " + "#{file.filepath}".bold.red
			error msg
			return null

		# otherwise move ahead, and expands all dependencies wild-cards
		file.expand_dependencies() for file in @files

		# reordering files
		@reorder()

		# merging everything
		output = (file.raw for file in @files).join "\n"

		# compiling
		compiled = cs.compile output, {bare: @bare}

		# uglifying
		if @minify
			ast = uglify_parser.parse compiled
			ast = uglify.ast_mangle ast
			ast = uglify.ast_squeeze ast
			compiled = uglify.gen_code ast
		
		# returns the compiled output
		return compiled



	compile_for_debug:()->
		release_path = @release.split("/").slice(0, -1).join "/"
		release_path += "/toaster"

		# cleaning previous/existent structure
		FsUtil.rmdir_rf release_path if path.existsSync release_path

		# creating new structre from scratch
		FsUtil.mkdir_p release_path

		# initializing empty array of filepaths
		files = []

		# loop through all ordered files
		for file, index in @files

			# computing releative filepath (replacing .coffee by .js)
			relative_path = file.filepath.replace ".coffee", ".js"

			# computing absolute filepath
			absolute_path = "#{release_path}/#{relative_path}"

			# extracts its folder path
			folder_path = absolute_path.split('/').slice(0,-1).join "/"

			# create container folder if it doesnt exist yet
			FsUtil.mkdir_p folder_path if !path.existsSync folder_path

			# writing file
			fs.writeFileSync absolute_path, cs.compile file.raw, {bare:0}

			# adds to the files buffer
			files.push relative_path

		# returns all filepaths
		return files



	missing = {}
	reorder: (cycling = false) ->
		# log "Module.reorder"

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



	merge_vendors:()=>
		buffer = []
		for vendor in @vendors
			if path.existsSync vendor
				buffer.push fs.readFileSync vendor, 'utf-8'
			else
				warn "Vendor not found at ".white + vendor.yellow.bold

		return buffer.join "\n"