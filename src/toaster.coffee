fs = require "fs"
path = require "path"

pn = path.normalize
exec = (require "child_process").exec

coffee = require "coffee-script"
colors = require 'colors'

exports.run =->
	toaster = new Toaster


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
			contents = @clean( @reorder( files ) )
			fs.writeFileSync module.release, contents
			exec "coffee -c #{module.release}", (error, stdout, stderr)=>
				if error
					console.log "#{'Compile Error:'.red}"
					console.log stderr
				else
					console.log "#{'Toasted with love:'.magenta} #{module.release}"
				
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
	
	missing: {},
	reorder:(classes, cycling = false)->
		@missing = {} if !cycling
		initd = {}
		for klass, i in classes
			initd["#{klass.name}"] = 1
			if klass.dependencies.length
				for dependency, index in klass.dependencies
					if !initd[dependency]
						result = @find classes, dependency
						if result?
							classes.splice( index, 0, result.item )
							classes.splice( result.index + 1, 1 )
							classes = @reorder classes, true
						else if !@missing[dependency]
							@missing[dependency] = 1
							klass.dependencies.push dependency
							klass.dependencies.splice index, 1
							console.log "WARNING ".bold.red, "Dependence #{dependency.bold.cyan} not found for class #{klass.name.bold.cyan}"
		classes
	
	findall:(path, search_folders, fn)->
		query = if search_folders then "-type d" else "-name '*.coffee'"
		exec "find #{path} #{query}", (error, stdout, stderr)=>
			buffer = []
			for item in items = stdout.trim().split "\n"
				buffer.push item if item != "." && item != ".." && item != ""
			fn buffer
	
	find:(classes, name)->
		for j, i in classes
			return {item: j, index: i} if j.name == name
	
	clean:(input)->
		(input[ i ] = klass.raw for klass, i in input).join "\r\n"



class Machine
	tpl: "modules = \r\n\tname: '%name'\r\n\tsrc: '%src'\r\n\trelease: '%release'\r\n"
	
	make:(@basepath, argv)->
		[action, target] = [argv[0] if argv[0], argv[1] if argv[1]]
		if target == undefined
			console.log "You need to inform a target path!".red
			return console.log "toaster new myawesomeapp".green
		
		if target.substr( 0, 1 ) != "/"
			target = path.normalize( "#{@basepath}/#{target}" )
		
		console.log ". #{'Wonderful!'.rainbow} #{'Let\'s toast something fresh! :)'.grey.bold}"
		console.log ". First, consider this as your basepath: #{target.cyan}"
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
					console.log "#{'Created'.green.bold} #{target}"
					fs.mkdirSync "#{target}/#{srcdir}", 0755
					console.log "#{'Created'.green.bold} #{target}/#{srcdir}"
					fs.mkdirSync "#{target}/#{releasedir}", 0755
					console.log "#{'Created'.green.bold} #{target}/#{releasedir}"
					fs.writeFileSync toaster, contents
					console.log "#{'Created'.green.bold} #{toaster}"
					
					process.exit()
	
	toast:(@basepath)->
		console.log "It seems this project hasn't been toasted yet."
		
		@ask "Do you wanna toast it? (Y/n)", /.*/, (data)=>
			if data != "" && data.toLowerCase != "y"
				return process.exit()
			else
				console.log ". #{'Wonderful!'.rainbow} #{'Let\'s toast this sly little project! :)'.grey.bold}"
				console.log ". First, consider this as your basepath: #{@basepath.cyan}"
				console.log ". Now tell me:"
				
				@ask "\tWhat's your app name? (none)", /.+/, (name)=>
					@ask "\tWhere's its src folder? (i.e. src)", /.+/, (src)=>
						@ask "\tWhere do you want your release file? (i.e. release/app.js)", /.+/, (release)=>
							path = pn "#{@basepath}/toaster.coffee"
							toaster = @tpl.replace "%name", name
							toaster = toaster.replace "%src", src
							toaster = toaster.replace "%release", release
							
							fs.writeFileSync path, toaster
							console.log "#{'Created'.green.bold} #{path}"
							
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
				stdout.write "\t#{'Invalid option! It should match:'.red} #{format.toString().cyan}\n"
				@ask question, format, fn


class Watcher
	snapshots: {}
	
	constructor:(@toaster, @module)->
		@watch_folder module.src
	
	watch_file:(path)->
		path = pn path
		console.log "#{'Watching file:'.cyan} #{path}"
		fs.watchFile path, {interval : 250}, (curr,prev)=>
			mtime = curr.mtime.valueOf() != prev.mtime.valueOf()
			ctime = curr.ctime.valueOf() != prev.ctime.valueOf()
			if mtime || ctime
				console.log "#{'File Changed:'.yellow} #{path}"
				@toaster.compile @module
	
	watch_folder:(path)->
		path = pn path
		console.log "#{'Watching folder:'.cyan} #{path}"
		
		exec "ls #{path}", (error, stdout, stderr)=>
			@snapshots[path] = @format_ls path, stdout
			for item in @snapshots[path]
				if item.type == "folder"
					@watch_folder item.path
				else
					@watch_file item.path
		
		fs.watchFile path, {interval : 250}, (curr,prev)=>
			exec "ls #{path}", (error, stdout, stderr)=>
				diff = @diff( @snapshots[path], @format_ls( path, stdout ) )
				if diff.length
					@toaster.compile @module
				for item in diff
					switch item.action
						when "created"
							switch item.type
								when "file"
									console.log "#{'New file created:'.green} #{item.path}"
									@watch_file item.path
								when "folder"
									console.log "#{'New folder created:'.green} #{item.path}"
									@watch_folder item.path
						when "deleted"
							prefix = item.type.substr( 0, 1).toUpperCase()
							prefix += item.type.substr( 1 )
							msg = "#{prefix} deleted, stop watching:"
							console.log "#{msg.red} #{item.path}"
							fs.unwatchFile item.path
				
				@snapshots[path] = @format_ls path, stdout
	
	format_ls:(path, stdout)->
		list = stdout.toString().trim().split "\n"
		for item, index in list
			if item == "\n" || item == ""
				list.splice index, 1
			else
				stats = fs.lstatSync "#{path}/#{item}"
				list[index] = {
					type: if stats.isDirectory() then "folder" else "file"
					path: "#{path}/#{item}"
				}
		list
	
	diff:(a,b)->
		diff = []
		
		for item in a
			if !@has item, b
				console.log 
				diff.push {type:item.type, path: item.path, action:"deleted"}
		
		for item in b
			if !@has item, a
				diff.push {type:item.type, path: item.path, action:"created"}
		
		diff
	
	has:(search, source)->
		for item in source
			if item.path == search.path
				return true
		false