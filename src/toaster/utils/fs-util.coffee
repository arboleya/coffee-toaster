class FsUtil
	
	# requires
	path = 	require "path"
	fs = require "fs"
	pn = (require "path").normalize
	exec = (require "child_process").exec

	# static variables
	@snapshots: {}

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
		folders = folderpath.split "/"
		for folder, index in folders
			continue if folder == ""
			if !path.existsSync( folder = folders.slice( 0, index + 1 ).join "/" )
				fs.mkdirSync folder, '0755'



	@find:(folderpath, pattern, fn)->
		exec "find #{folderpath} -name '#{pattern}'", (error, stdout, stderr)=>
			buffer = []
			for item in items = stdout.trim().split "\n"
				buffer.push item if item != "." && item != ".." && item != ""
			fn buffer



	@ls_folders:(basepath, fn)->
		exec "find -type d", (error, stdout, stderr)=>
			buffer = []
			for item in items = stdout.trim().split "\n"
				buffer.push item if item != "." && item != ".." && item != ""
			fn buffer



	@watched = {}
	@watch_file:(filepath, onchange, dispatch_create)->
		filepath = pn filepath

		if dispatch_create
			onchange?( {type:"file", path:filepath, action:"created"} )
		
		onchange?( {type:"file", path:filepath, action:"watching"} )
		
		@watched[filepath] = true
		fs.watchFile filepath, {interval : 250}, (curr,prev)=>
			mtime = curr.mtime.valueOf() != prev.mtime.valueOf()
			ctime = curr.ctime.valueOf() != prev.ctime.valueOf()
			if mtime || ctime
				onchange?( {type: "file", path:filepath, action: "updated"} )



	@watch_folder:(folderpath, filter_regexp, onchange, dispatch_create)->
		folderpath = pn folderpath
		onchange?( {type:"folder", path:folderpath, action:"watching"} )
		
		exec "ls #{folderpath}", (error, stdout, stderr)=>
			
			FsUtil.snapshots[folderpath] = FsUtil.format_ls folderpath, stdout

			for item in FsUtil.snapshots[folderpath]
				if item.type == "folder"
					FsUtil.watch_folder item.path, filter_regexp, onchange
				else
					if filter_regexp == null || filter_regexp.test item.path
						if dispatch_create
							onchange {
								type:item.type,
								path:item.path
								action: "created"
							}
						
						FsUtil.watch_file item.path, onchange
		
		fs.watchFile folderpath, {interval : 250}, (curr,prev)=>

			exec "ls #{folderpath}", (error, stdout, stderr)=>
				
				a = FsUtil.snapshots[folderpath]
				b = FsUtil.format_ls( folderpath, stdout )
				diff = ArrayUtil.diff a, b, "path"
				
				for item in diff
					info = item.item
					info.action = item.action
					
					if info.action == "created"
						if info.type == "file"
							if filter_regexp?
								unless filter_regexp.test info.path
									continue
							
							onchange?( info )	
							FsUtil.watch_file info.path, onchange
						
						else if info.type == "folder"
							
							onchange?( info )
							FsUtil.watch_folder	info.path,
												filter_regexp,
												onchange,
												true

					else if info.action == "deleted"
						if @watched[info.path] is true
							@watched[info.path]
							onchange?( info )
							fs.unwatchFile item.path

				snapshot = FsUtil.format_ls folderpath, stdout
				FsUtil.snapshots[folderpath] = snapshot



	@format_ls:(folderpath, stdout)->
		list = stdout.toString().trim().split "\n"
		for item, index in list
			if item == "\n" || item == ""
				list.splice index, 1
			else
				stats = fs.lstatSync "#{folderpath}/#{item}"
				list[index] =
					type: if stats.isDirectory() then "folder" else "file"
					path: "#{folderpath}/#{item}"
		list