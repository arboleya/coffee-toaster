fs = require "fs"
path = require "path"

pn = path.normalize
exec = (require "child_process").exec

cs = require "coffee-script"
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

			contents = cs.compile fs.readFileSync( filepath, "utf-8" ), {bare:1}
			@modules = [].concat( eval contents )
			
			for module in @modules
				module.src = pn "#{@basepath}/#{module.src}"
				module.release = pn "#{@basepath}/#{module.release}"
				@compile module 
		else
			new Machine().toast @basepath
	
	compile:(module)->
		@collect module, (files)=>
			
			ordered = @reorder files
			
			linenum = 1
			for file, i in ordered
				file.start = linenum
				file.length = file.raw.split("\n").length
				file.end = file.start + ( file.length - 1 )
				linenum = file.end + 1
			
			contents = @merge ordered
			
			try
				contents = cs.compile( contents )
				fs.writeFileSync module.release, contents
				console.log "#{'Toasted with love:'.magenta} #{module.release}"
			
			catch err
				msg = err.message
				line = msg.match( /(line\s)([0-9]+)/ )[2]
				
				for file in ordered
					if line >= file.start && line <= file.end
						line = (line - file.start) + 1
						msg = msg.replace /line\s[0-9]+/, "line #{line}"
						msg = msg.substr( 0, 1 ).toUpperCase() + msg.substr( 1 ).toLowerCase()
						console.log "ERROR!".bold.red, msg,
							"\n\t#{file.path.red}"
			
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
				
				if @find buffer, name, "name"
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
				
				buffer.push {
					path:file
					name:name
					dependencies:dependencies
					raw:raw
				}
			
			fn buffer
	
	missing: {},
	reorder:(classes, cycling = false)->
		@missing = {} if !cycling
		initd = {}
		for klass, i in classes
			initd["#{klass.name}"] = 1
			if klass.dependencies.length
				
				index = 0
				while index < klass.dependencies.length
					dependency = klass.dependencies[index]
					
					if initd[dependency]
						index++
						continue
						
					result = @find classes, dependency, "name"
					if result?
						
						src = result.item.dependencies
						if @find( src, klass.name )?
							klass.dependencies.splice( index, 1 )
							console.log "WARNING! ".bold.yellow,
								"You have a circular loop between classes",
								"#{dependency.yellow.bold} and",
								"#{klass.name.yellow.bold}."
							continue
						else
							classes.splice( index, 0, result.item )
							classes.splice( result.index + 1, 1 )
							classes = @reorder classes, true
					
					else if !@missing[dependency]
						@missing[dependency] = 1
						klass.dependencies.push dependency
						klass.dependencies.splice index, 1
						console.log "WARNING ".bold.red, "Dependence #{dependency.bold.cyan} not found for class #{klass.name.bold.cyan}"
					
					index++
		classes
	
	findall:(path, search_folders, fn)->
		query = if search_folders then "-type d" else "-name '*.coffee'"
		exec "find #{path} #{query}", (error, stdout, stderr)=>
			buffer = []
			for item in items = stdout.trim().split "\n"
				buffer.push item if item != "." && item != ".." && item != ""
			fn buffer
	
	find:(source, search, by_property)->
		for j, i in source
			if j == search || j[by_property] == search
				return {item: j, index: i}
		return
	
	merge:(input)->
		(klass.raw for klass in input).join "\n"


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