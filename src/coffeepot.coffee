# toaster init $name $src $release
# toaster

fs = require "fs"
sys = require "sys"
path = require "path"
coffee = require "coffee-script"

spawn = require('child_process').spawn
child = spawn('bad_command')

exec = (require "child_process").exec

exports.run =->
	coffeepot = new CoffeePot

class CoffeePot
	
	constructor:->
		@basepath = path.resolve(".")
		
		a = process.argv
		if a.length > 2
			console.log "sera???"
			switch a[2]
				when "new"
					exec "mkdir #{a[3]}", (err, stdout, stderr)=>
						@init()
				else
					child.stderr.setEncoding( "utf-8" )
					child.stderr.on "data", (data) =>
						console.log ">>>> #{data}"
				
			# console.log "You need to inform a folder! (coffee new myapp)"
			
		else if a.length > 2
			if a[2].substr( 0, 1) == "/"
				@basepath = a[2]
			else
				@basepath += "/#{a[2]}"
			@init()
	
	init:->
		
		console.log @basepath
		
		toaster = "#{@basepath}/toaster.coffee"
		if path.existsSync toaster
			exec "coffee -p --bare #{toaster}", (error, stdout, stderr)=>
				@modules = [].concat( eval( stdout ) )
				for module in @modules
					module.basepath = @basepath
					@compile module
		else
			console.log "You haven't toasted this project yet, lets do it:"
			console.log "\t1: What's you source folder, relative to this path?"
			console.log "\t\t #{@basepath}"
	
	compile:(module)->
		
		filepath = path.normalize "#{@basepath}/#{module.release}"
		folderpath = filepath.split( "/" ).slice( 0, -1 ).join( "/" )
		
		fs.writeFileSync filepath, @clean( @reorder( @collect( module ) ) )
		exec "coffee -c #{filepath}", (err, stdout, stderr)=>
			console.time( "Compiled with cheese!\r\n\t#{filepath}"
			if !module.watcher
				module.watcher = new CoffeeWatcher( this, module )
	
	collect:(path, buffer = [])->
		
		path = path.src || path
		for file in fs.readdirSync( path )
			
			filepath = "#{path}/#{file}"
			if fs.statSync( filepath ).isDirectory()
				@collect( filepath, buffer )
			
			else if filepath.substr( -6 ) == "coffee"
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



class CoffeeWatcher
	
	constructor:(@toaster, @module)->
		console.log "Listening to..."
		src = path.normalize "#{@module.basepath}/#{@module.src}"
		
		exec "find #{src} -name '*.coffee'", (error, stdout, stderr)=>
			for file in files = stdout.trim().split("\n")
				filepath = path.normalize file
				console.log "... #{filepath}"
				fs.watchFile filepath, {interval : 250}, (curr,prev)=>
					mtime = curr.mtime.valueOf() != prev.mtime.valueOf()
					ctime = curr.ctime.valueOf() != prev.ctime.valueOf()
					@toaster.compile @module if mtime || ctime
			console.log "--------------------------------------------------"
			
			

# TODO: create class
class CoffeeInit
	# interactive create toaster.coffee