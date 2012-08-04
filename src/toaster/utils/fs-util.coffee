#<< toaster/utils/fn-util

class FsUtil
	
	# requires
	path = 	require "path"
	fs = require "fs"
	pn = (require "path").normalize

	FnUtil = toaster.utils.FnUtil
	ArrayUtil = toaster.utils.ArrayUtil

	# static methods
	@rmdir_rf:(folderpath, root=true)->
		files = fs.readdirSync folderpath
		for file in files
			file = "#{folderpath}/#{file}"
			stats = fs.lstatSync file
			if stats.isDirectory()
				FsUtil.rmdir_rf file, false
				fs.rmdirSync file
			else
				fs.unlinkSync file
		fs.rmdirSync folderpath if root



	@mkdir_p:(folderpath)->
		folderpath = (folderpath.slice 0, -1)  if (folderpath.slice -1) == "/"
		folders = folderpath.split "/"
		for folder, index in folders
			continue if (folder = folders.slice( 0, index + 1 ).join "/") == ""
			exists = fs.existsSync folder
			if exists and index is folders.length - 1
				throw new Error error( "Folder exists: #{folder.red}" )
				return false
			else if !exists
				fs.mkdirSync folder, '0755'

		return true


	@cp_dir:(from, to)->

		from = (from.slice 0, -1)  if (from.slice -1) == "/"
		to = (to.slice 0, -1)  if (to.slice -1) == "/"

		for file_from in (files = @find from, /.*/, false)

			file_to = file_from.replace from, to
			dir = ((file_to.split '/').slice 0, -1).join '/'

			@mkdir_p dir unless fs.existsSync dir
			fs.writeFileSync file_to, (fs.readFileSync file_from, "utf-8")


	@find:( folderpath, pattern, include_dirs = false )->

		found = []
		files = fs.readdirSync folderpath

		for file in files

			filepath = pn "#{folderpath}/#{file}"
			if fs.lstatSync( filepath ).isDirectory()
				if include_dirs and filepath.match pattern
					found = found.concat filepath

				found_under = FsUtil.find filepath, pattern, include_dirs
				found = found.concat found_under
			else
				found.push filepath if filepath.match pattern

		return found



	@ls_folders:( folderpath )->
		found = []
		files = fs.readdirSync folderpath

		for file in files
			filepath = "#{folderpath}/#{file}"
			found.push filepath if fs.lstatSync( filepath ).isDirectory()
		
		return found



	@take_snapshot:( folderpath )->
		found = []
		files = fs.readdirSync folderpath

		for file in files
			filepath = "#{folderpath}/#{file}"
			if fs.lstatSync( filepath ).isDirectory()
				type = "folder"
			else
				type = "file"

			found.push type: type, path: filepath
		
		return found



	@watch_file:(filepath, onchange, dispatch_create)->
		filepath = pn filepath

		FsUtil.unwatch_file filepath

		if dispatch_create
			onchange?( type:"file", path:filepath, action:"created" )
		
		onchange?( type:"file", path:filepath, action:"watching" )

		fs.watchFile filepath, {interval : 250}, (curr,prev)=>
			mtime = curr.mtime.valueOf() != prev.mtime.valueOf()
			ctime = curr.ctime.valueOf() != prev.ctime.valueOf()
			if mtime || ctime
				onchange?( {type: "file", path:filepath, action: "updated"} )


	@unwatch_file:( filepath, onchange )->
		FsUtil.watched[filepath] = false
		fs.unwatchFile filepath




	@snapshots: {}
	@watchers: {}
	@watched: {}



	@watch_folder:(folderpath, filter_regexp, onchange, dispatch_create)->

		# initialize listeners array
		if FsUtil.watchers[folderpath]
			watchers = FsUtil.watchers[folderpath]
		else
			watchers = FsUtil.watchers[folderpath] = []

		folderpath = pn folderpath
		onchange?( type:"folder", path:folderpath, action:"watching" )

		# take snapshot
		FsUtil.snapshots[folderpath] = FsUtil.take_snapshot folderpath

		# loop all items
		# ----------------------------------------------------------------------
		for item in FsUtil.snapshots[folderpath]

			# watch subfolders
			# ------------------------------------------------------------------
			if item.type == "folder"
				if dispatch_create
					onchange
						type:item.type
						path:item.path
						action: "created"

				FsUtil.watch_folder item.path,
									filter_regexp,
									onchange,
									dispatch_create

			# watch files
			# ------------------------------------------------------------------
			else if filter_regexp == null || filter_regexp.test item.path
				if dispatch_create
					onchange type:item.type, path:item.path, action: "created"
				FsUtil.watch_file item.path, onchange


		# add watcher to watchers/listeners array
		watchers.push {
			folderpath: folderpath
			filter: filter_regexp
			onchange: onchange
			dispatch_create: dispatch_create
		}

		# watch folder if its not being watched already
		unless FsUtil.watched[folderpath]
			FsUtil.watched[folderpath] = true
			on_folder_change = FnUtil.proxy FsUtil._on_folder_change, folderpath

			fs.unwatchFile folderpath
			fs.watchFile folderpath, {interval : 250}, on_folder_change



	@_on_folder_change:( folderpath, curr, prev)=>
		# abort if the folder doest not exist
		return unless fs.existsSync folderpath

		# get previous and current folder snapshot to compare
		a = FsUtil.snapshots[folderpath]
		b = FsUtil.snapshots[folderpath] = FsUtil.take_snapshot folderpath

		# differs the two snapshots states
		diff = ArrayUtil.diff a, b, "path"
		
		# if there's no diff, abort the execution
		return  unless diff.length

		# saving watchers reference
		watchers = FsUtil.watchers[folderpath]

		# loop all diff itens
		# ----------------------------------------------------------------------
		for item in diff
			# console.log ".........."
			# console.log "ITEM..."

			info = item.item
			info.action = item.action
			
			# item created
			# ------------------------------------------------------------------
			if info.action == "created"
				
				# item is file
				# --------------------------------------------------------------
				if info.type == "file"
					
					# console.log "FILE CREATED!"
					# looping all watchers (listeners)
					for watcher in watchers

						# dispatch item if it passes the filter regexp
						if watcher.filter.test info.path
							# console.log "ON CHANGE!"
							watcher.onchange?( info )
							FsUtil.watch_file info.path, watcher.onchange

				# item is folder
				# --------------------------------------------------------------
				else if info.type == "folder"
					for watcher in watchers
						watcher.onchange?( info )
						FsUtil.watch_folder info.path,
											watcher.filter,
											watcher.onchange,
											true

			# item deleted
			# ------------------------------------------------------------------
			else if info.action == "deleted"

				# item is file
				# --------------------------------------------------------------
				if info.type == "file"

					# looping all watchers (listeners)
					for watcher in watchers

						# dispatch item if it passes the filter regexp
						if watcher.filter.test info.path
							watcher.onchange?( info )

					# unwatch file
					# FsUtil.unwatch_file( path )
					fs.unwatchFile info.path
					FsUtil.watched[info.path] = false

				# item is folder
				# --------------------------------------------------------------
				else if info.type == "folder"

					# notifies all watchers about the folder removal
					for watcher in watchers
						watcher.onchange?( info )

					FsUtil.unwatch_folder info.path



	@unwatch_folder:( folderpath, onchange )->

		# loop through all watchers
		for watcher_path, list of FsUtil.watchers

			# if it matches the folder path resets all its listeners
			if new RegExp("^#{folderpath}").test( watcher_path )
				FsUtil.watchers[watcher_path] = null

		# loop through all watched items
		for item, exists of FsUtil.watched

			# if its still being watched and matches the regexp
			if exists && new RegExp("^#{folderpath}").test( item )
				
				# unwatch item
				FsUtil.watched[item] = false
				fs.unwatchFile item