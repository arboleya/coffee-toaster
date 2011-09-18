require 'fs'

class FsUtil
	@snapshots: {}
	
	@find:(path, pattern, fn)->
		exec "find #{path} -name '#{pattern}'", (error, stdout, stderr)=>
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
	
	@watch_file:(path, onchange)->
		path = pn path
		onchange?( {type:"file", path:path, action:"watching"} )
		
		fs.watchFile path, {interval : 250}, (curr,prev)=>
			mtime = curr.mtime.valueOf() != prev.mtime.valueOf()
			ctime = curr.ctime.valueOf() != prev.ctime.valueOf()
			if mtime || ctime
				onchange?( {type: "file", path: path, action: "updated"} )
	
	@watch_folder:(path, onchange)->
		path = pn path
		onchange?( {type:"folder", path:path, action:"watching"} )
		
		exec "ls #{path}", (error, stdout, stderr)=>
			
			FsUtil.snapshots[path] = FsUtil.format_ls path, stdout
			
			for item in FsUtil.snapshots[path]
				if item.type == "folder"
					FsUtil.watch_folder item.path, onchange
				else
					FsUtil.watch_file item.path, onchange
		
		fs.watchFile path, {interval : 250}, (curr,prev)=>
			
			exec "ls #{path}", (error, stdout, stderr)=>
				
				a = FsUtil.snapshots[path]
				b = FsUtil.format_ls( path, stdout )
				diff = ArrayUtil.diff a, b, "path"
				
				for item in diff
					info = item.item
					info.action = item.action
					
					switch info.action
						
						when "created"
							onchange?( info )
							
							if info.type == "file"
								FsUtil.watch_file info.path, onchange
							else if info.type == "folder"
								FsUtil.watch_folder info.path, onchange
						
						when "deleted"
							onchange?( info )
							fs.unwatchFile item.path

				FsUtil.snapshots[path] = FsUtil.format_ls path, stdout

	@format_ls:(path, stdout)->
		list = stdout.toString().trim().split "\n"
		for item, index in list
			if item == "\n" || item == ""
				list.splice index, 1
			else
				stats = fs.lstatSync "#{path}/#{item}"
				list[index] =
					type: if stats.isDirectory() then "folder" else "file"
					path: "#{path}/#{item}"
		list