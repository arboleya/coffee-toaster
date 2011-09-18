cs = require "coffee-script"

#<< FsUtil, ArrayUtil, StringUtil

class Script
	
	constructor:(@config)->
		@src = @config.src
		@release = @config.release
		@watch()
		@compile()
	
	watch:=>
		FsUtil.watch_folder @src, (info)=>
			type = StringUtil.titleize info.type
			
			switch info.action
				when "created"
					msg = "#{('New ' + info.type + ' created:').green}"
					console.log "#{msg} #{info.path}"
					@compile()
				
				when "deleted"
					msg = "#{(type + ' deleted, stop watching: ').red}"
					console.log "#{msg} #{info.path}"
					@compile()
				
				when "updated"
					msg = "#{(type + ' changed').yellow}"
					console.log "#{msg} #{info.path}"
					@compile()
				
				when "watching"
					msg = "#{('Watching ' + info.type).cyan}"
					console.log "#{msg} #{info.path}"
	
	compile:()->
		@collect (files)=>
			ordered = @reorder( files )
			
			linenum = 1
			for file, i in ordered
				file.start = linenum
				file.length = file.raw.split("\n").length
				file.end = file.start + ( file.length - 1 )
				linenum = file.end + 1
			
			contents = @merge( ordered )
			
			try
				contents = cs.compile( contents )
				fs.writeFileSync @release, contents
				console.log "#{'Toasted with love:'.magenta} #{@release}"
			catch err
				msg = err.message
				line = msg.match( /(line\s)([0-9]+)/ )[2]
				for file in ordered
					if line >= file.start && line <= file.end
						line = (line - file.start) + 1
						msg = msg.replace /line\s[0-9]+/, "line #{line}"
						msg = StringUtil.ucasef msg
						console.log "ERROR!".bold.red, msg,
							"\n\t#{file.path.red}"
	
	collect:(fn)->
		FsUtil.find @src, "*.coffee", (files)=>
			buffer = []
			for file in files
				
				raw = fs.readFileSync file, "utf-8"
				dependencies = []
				
				# class name
				if /(class\s)([\S]+)/g.test raw
					name = /(class\s)([\S]+)/g.exec( raw )[ 2 ]
				
				if ArrayUtil.find buffer, name
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
					path: file
					name:name,
					dependencies:dependencies,
					raw:raw
				}
			fn buffer
	
	missing: {},
	reorder:(classes, cycling = false)->
		@missing = {} if !cycling
		initd = {}
		
		for klass, i in classes
			initd["#{klass.name}"] = 1
			if !klass.dependencies.length
				continue
			
			index = 0
			while index < klass.dependencies.length
				dependency = klass.dependencies[index]
				
				if initd[dependency]
					index++
					continue
				
				found = ArrayUtil.find classes, dependency, "name"
				if found?
					
					if ArrayUtil.has found.item.dependencies, klass.name, "name"
						
						klass.dependencies.splice( index, 1 )
						console.log "WARNING! ".bold.yellow,
							"You have a circular loop between classes",
							"#{dependency.yellow.bold} and",
							"#{klass.name.yellow.bold}."
						continue
					else
						classes.splice( index, 0, found.item )
						classes.splice( found.index + 1, 1 )
						classes = @reorder classes, true
				
				else if !@missing[dependency]
					@missing[dependency] = 1
					klass.dependencies.push dependency
					klass.dependencies.splice index, 1
					console.log "WARNING! ".bold.yellow,
						"Dependence #{dependency.yellow.bold} not found",
						"for class #{klass.name.yellow.bold}."
				index++
				
		classes
	
	check_syntax:(files)->
		for file in files
			try cs.compile file catch err
				return {path:file, err:err}
		return false
	
	merge:(input)->
		(klass.raw for klass in input).join "\n"