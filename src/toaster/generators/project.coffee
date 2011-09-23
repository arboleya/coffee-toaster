#<< Config

class Project extends Question
	
	constructor:(@basepath)->
	
	create:()->
		if !(arg_path = argv._[0])
			console.log "You need to inform a target path!".red
			return console.log "\ttoaster new myawesomeapp".green
		
		if arg_path.substr 0, 1 != "/"
			target = "#{@basepath}/#{arg_path}"
		else
			target = arg_path
		
		console.log ". #{'Wonderful!'.rainbow}",
			"#{'Let\'s toast something fresh! :)'.grey.bold}"
		console.log ". With this as your basepath: #{target.cyan}"
		console.log ". Please, tell me:"
		
		question1 = "\tWhat's your app name? (none)"
		question2 = "\tWhere's its src folder? (src)"
		question3 = "\tWhere do you want your release file? (release/app.js)"
		
		@ask question1, /.+/, (name)=>
			@ask question2, /.*/, (src)=>
				@ask question3, /.*/, (release)=>
					
					srcdir = "#{target}/" + ( src || "src" )
					releasefile = "#{target}/" + ( release || "release/app.js" )
					releasedir = releasefile.split("/").slice(0, -1).join "/"
					
					fs.mkdirSync target, 0755
					console.log "#{'Created'.green.bold} #{target}"
					fs.mkdirSync srcdir, 0755
					console.log "#{'Created'.green.bold} #{srcdir}"
					fs.mkdirSync releasedir, 0755
					console.log "#{'Created'.green.bold} #{releasedir}"
					
					name = name
					srcdir = srcdir.replace( target, "" ).substr 1
					releasefile = releasefile.replace( target, "" ).substr 1
					
					new Config( target ).write name, srcdir, releasefile
					
					process.exit()