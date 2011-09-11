fs = require "fs"
path = require "path"
pn = path.normalize
coffee = require "coffee-script"
exec = (require "child_process").exec

exports.run =->
	toaster = new Toaster

#<< Machine, Watcher

class Toaster
	
	constructor:->
		@basepath = path.resolve(".")
		argv = process.argv[2..]
		if argv.length && argv[0] == "new"
			new Machine().make @basepath, argv
		else
			@basepath += "/#{argv[0]}" if argv.length
			@basepath = @basepath.replace /\/[^\/]+\/\.{2}/, ""
			@init()
	
	init:->
		filepath = pn "#{@basepath}/toaster.coffee"
		if path.existsSync filepath
			exec "coffee -p --bare #{filepath}", (error, stdout, stderr)=>
				@modules = [].concat( eval( stdout ) )
				for module in @modules
					module.src = pn "#{@basepath}/#{module.src}"
					module.release = pn "#{@basepath}/#{module.release}"
					@compile module 
		else
			new Machine().toast @basepath
	
	compile:(module)->
		@collect module, (files)=>
			contents = @clean( @reorder( files, true ) )
			fs.writeFileSync module.release, contents
			exec "coffee -c #{module.release}", (error, stdout, stderr)=>
				console.log "Toasted with love: #{module.release}"
				module.watcher = new Watcher( this, module ) if !module.watcher
	
	collect:(module, fn)->
		@findall module.src, false, (files)=>
			buffer = []
			for file in files
				raw = fs.readFileSync file, "utf-8"
				dependencies = []
				
				# class name
				if /(class\s)([\S]+)/g.test raw
					name = /(class\s)([\S]+)/g.exec( raw )[ 2 ]
				
				if @find buffer, name
					continue
				
				# class dependencies
				if /(extends\s)([\S]+)/g.test raw
					dependencies.push /(extends\s)([\S]+)/g.exec( raw )[ 2 ]
				
				if /(#<<\s)(.*)/g.test raw
					requirements = raw.match /(#<<\s)(.*)/g
					for item in requirements
						item = /(#<<\s)(.*)/.exec( item )[ 2 ]
						item = item.replace /\s/g, ""
						item = [].concat item.split ","
						dependencies = dependencies.concat item
				
				buffer.push {name:name, dependencies:dependencies, raw:raw}
			fn buffer
	
	reorder:(classes, debug = false)->
		initd = {}
		for klass, i in classes
			initd["#{klass.name}"] = 1
			
			if klass.dependencies.length
				for dependency, index in klass.dependencies
					if !initd[dependency]
						result = @find classes, dependency
						classes.splice( index, 0, result.item )
						classes.splice( result.index + 1, 1 )
						classes = @reorder( classes )
		classes
	
	findall:(path, search_folders, fn)->
		query = if search_folders then "-type d" else "-name '*.coffee'"
		exec "find #{path} #{query}", (error, stdout, stderr)=>
			buffer = []
			for item in items = stdout.trim().split "\n"
				buffer.push item if item != "." && item != ".."
			fn buffer
	
	find:(classes, name)->
		for j, i in classes
			return {item: j, index: i} if j.name == name
	
	clean:(input)->
		(input[ i ] = klass.raw for klass, i in input).join "\r\n"



class Machine

	tpl: "modules = \r\n\tname: '%name'\r\n\tsrc: '%src'\r\n\trelease: '%release'"

	make:(@basepath, argv)->

		[action, target] = [argv[0] if argv[0], argv[1] if argv[1]]
		if target == undefined
			console.log "You need to inform a target path!"
			return console.log "toaster new myawesomeapp"

		if target.substr( 0, 1 ) != "/"
			target = path.normalize( "#{@basepath}/#{target}" )

		console.log ". Wonderful! Let's toast this sly little project! :)"
		console.log ". First, consider this as your basepath: #{target}"
		console.log ". Now tell me:"
		@ask "\tWhat's your app name? (none)", /.+/, (name)=>
			@ask "\tWhere's its src folder? (src)", /.*/, (src)=>
				@ask "\tWhere do you want your release file? (release/app.js)", /.*/, (release)=>

					srcdir = src || "src"
					releasefile = release || "release/app.js"
					releasedir = releasefile.split("/").slice( 0, 1).join "/"

					# config file
					toaster = "#{target}/toaster.coffee"
					contents = @tpl.replace "%name", name
					contents = contents.replace "%src", srcdir
					contents = contents.replace "%release", releasefile

					fs.mkdirSync target, 0755
					fs.mkdirSync "#{target}/#{srcdir}", 0755
					fs.mkdirSync "#{target}/#{releasedir}", 0755
					fs.writeFileSync toaster, contents

					process.exit()

	toast:(@basepath)->
		console.log "It seems this project hasn't been toasted yet."

		@ask "Do you wanna toast it? (Y/n)", /.*/, (data)=>
			if data != "" && data.toLowerCase != "y"
				return process.exit()
			else
				console.log ". Wonderful! Let's toast this sly little project! :)"
				console.log ". First, consider this as your basepath: #{@basepath}"
				console.log ". Now tell me:"

				@ask "\tWhat's your app name? (none)", /.+/, (name)=>
					@ask "\tWhere's its src folder? (i.e. src)", /.+/, (src)=>
						@ask "\tWhere do you want your release file? (i.e. release/app.js)", /.+/, (release)=>
							path = pn "#{@basepath}/toaster.coffee"
							toaster = @tpl.replace "%name", name
							toaster = toaster.replace "%src", src
							toaster = toaster.replace "%release", release
							fs.writeFileSync path, toaster
							process.exit()

	ask:(question, format, fn)->
		stdin = process.stdin
		stdout = process.stdout

		stdin.resume()
		stdout.write "#{question} "
		
		stdin.once 'data', (data)=>
			data = data.toString().trim()
			if format.test data
				fn data
			else
				stdout.write "It should match: #{format}\n"
				@ask question, format, fn

class Watcher
	snapshots: {}
	
	constructor:(@toaster, @module)->
		@toaster.findall @module.src, false, (files)=>
			@watch_file file for file in files
		@toaster.findall @module.src, true, (folders)=>
			@watch_folder folder for folder in folders

	watch_file:(path)->
		path = pn path
		console.log "Watching file: #{path}"
		fs.watchFile path, {interval : 250}, (curr,prev)=>
			mtime = curr.mtime.valueOf() != prev.mtime.valueOf()
			ctime = curr.ctime.valueOf() != prev.ctime.valueOf()
			@toaster.compile @module if mtime || ctime

	watch_folder:(path)->
		path = pn path
		console.log "Watching folder: #{path}"
		
		exec "ls #{path}", (error, stdout, stderr)=>
			@snapshots[path] = @clean_ls stdout
		
		fs.watchFile path, {interval : 250}, (curr,prev)=>
			exec "ls #{path}", (error, stdout, stderr)=>
				diff = @diff @snapshots[path], @clean_ls stdout
				for item in diff
					switch item.action
						when "created"
							console.log "New file created, start watching: #{path}/#{item.path}"
							@watch_file "#{path}/#{item.path}"
						when "deleted"
							console.log "File deleted, stop watching: #{path}/#{item.path}"
							fs.unwatchFile "#{path}/#{item.path}"
				
				@snapshots[path] = @clean_ls stdout
	
	diff:(a,b)->
		diff = []
		
		for item in a
			if !@has item, b
				diff.push {action:"deleted", path: item}
		
		for item in b
			if !@has item, a
				diff.push {action:"created", path: item}
		
		diff
	
	has:(search, source)->
		for item in source
			if item == search
				return true
		false
	
	clean_ls:(stdout)->
		list = stdout.trim().split "\n"
		for item, index in list
			if item == "\n"
				list.splice index, 1
		
		list