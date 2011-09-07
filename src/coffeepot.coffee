# toaster new /path/fo/folder
# toaster

fs = require "fs"
path = require "path"
pn = path.normalize
coffee = require "coffee-script"
exec = (require "child_process").exec

exports.run =->
	toaster = new Toaster


class Toaster
	
	
	constructor:->
		@basepath = path.resolve(".")
		
		argv = process.argv[2..]
		if argv.length && argv[0] == "new"
			@base
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
		contents = @clean( @reorder( @collect( module.src ) ) )
		fs.writeFileSync module.release, contents
		
		exec "coffee -c #{module.release}", (error, stdout, stderr)=>
			console.log "Toasted with love:\r\n\t#{module.release}"
			if !module.watcher
				module.watcher = new Watcher( this, module )
		
		true
	
	collect:(path, buffer = [])->
		for file in fs.readdirSync path
			filepath = pn "#{path}/#{file}"
			if fs.statSync( filepath ).isDirectory()
				@collect filepath, buffer
			else if filepath.substr -6 == "coffee"
				raw = fs.readFileSync( filepath, "utf-8" )
				name = /(class\s)([\S]+)/g.exec( raw )[ 2 ]
				
				if /(extends\s)([\S]+)/g.test raw
					ext = /(extends\s)([\S]+)/g.exec( raw )[ 2 ]
				
				if !@find buffer, name
					buffer.push {name: name, ext:ext, raw:raw}
		buffer
	
	reorder:(classes)->
		initd = {}
		for klass, i in classes
			initd["#{klass.name}"] = 1
			if klass.ext
				if !initd["#{klass.ext}"]
					result = @find classes, klass.ext
					classes.splice( i, 0, result.item )
					classes.splice( result.index + 1, 1 )
					classes = @reorder( classes )
		classes
	
	find:(classes, name)->
		for j, i in classes
			return {item: j, index: i} if j.name == name
	
	clean:(input)->
		(input[ i ] = klass.raw for klass, i in input).join "\r\n"



class Watcher
	
	constructor:(@toaster, @module)->
		console.log "Watching:"
		exec "find #{@module.src} -name '*.coffee'", (error, stdout, stderr)=>
			for file in files = stdout.trim().split("\n")
				filepath = pn file
				console.log "... \t#{filepath}"
				fs.watchFile filepath, {interval : 250}, (curr,prev)=>
					mtime = curr.mtime.valueOf() != prev.mtime.valueOf()
					ctime = curr.ctime.valueOf() != prev.ctime.valueOf()
					@toaster.compile @module if mtime || ctime
			console.log "--------------------------------------------------"



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
					@ask "\tWhere's its src folder? (i.e. src)", /.*/, (src)=>
						@ask "\tWhere do you want your release file? (i.e. release/app.js)", /.*/, (release)=>
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