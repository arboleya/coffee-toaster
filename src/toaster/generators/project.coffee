#<< Config

exports.Project = class Project extends Question
	
	constructor:(@basepath)->
	
	create:(folderpath, name, src, release)->
		if !folderpath || folderpath == true
			console.log "#{'Error'.bold.red} You need to inform" +
						"a target path!"
			return console.log "\ttoaster new myawesomeapp".green
		
		if folderpath.substr( 0, 1 ) != "/"
			target = "#{@basepath}/#{folderpath}"
		else
			target = folderpath
		
		if name? && src? && release?
			return @scaffold target, name, src, release
		
		default_name = target.split('/').pop()

		console.log ". #{'Wonderful!'.rainbow}",
			"#{'Let\'s toast something fresh! :)'.grey.bold}"
		console.log ". With this as your basepath: #{target.cyan}"
		console.log ". Please, tell me:"
		question1 = "\tWhat's your app name? (#{default_name})"
		question2 = "\tWhere's its src folder? (src)"
		question3 = "\tWhere do you want your release file? (release/app.js)"
		
		@ask question1, /.*/, (name)=>
			@ask question2, /.*/, (src)=>
				@ask question3, /.*/, (release)=>
					@scaffold target, name || default_name, src, release
					process.exit()
	
	scaffold:(target, name, src, release)->
		srcdir = "#{target}/" + ( src || "src" )
		releasefile = "#{target}/" + ( release || "release/app.js" )
		releasedir = releasefile.split("/").slice(0, -1).join "/"
		
		if path.existsSync target
			console.log "#{'Error'.bold.red} Folder exists! #{target}".red
			return
		
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