#<< toaster/generators/question

class Config extends Question
	
	tpl : """module '%name'
				\tsrc: '%src'
				\trelease: '%release'
				
	"""
	
	constructor:(@basepath)->
	
	create:(folderpath)->
		if folderpath? and folderpath != true
			@basepath = "#{@basepath}/#{folderpath}" 
		
		console.log "#{'Let\'s toast this sly little project! :)'.grey.bold}"
		console.log ". With this as your basepath: #{@basepath.cyan}"
		console.log ". Please, tell me:"
		
		default_name = @basepath.split( "/" ).pop()

		question1 = "\tWhat's your module name? (#{default_name})"
		question2 = "\tWhere's its src folder? (i.e. src)"
		question3 = "\tWhere do you want your release file? " +
					"(i.e. release/app.js)"
		
		@ask question1, /.*/, (name)=>
			@ask question2, /.+/, (src)=>
				@ask question3, /.+/, (release)=>
					@write name || default_name, src, release
					process.exit()
	
	write:(name, src, release)->
		path = pn "#{@basepath}/toaster.coffee"
		toaster = @tpl.replace "%name", name
		toaster = toaster.replace "%src", src
		toaster = toaster.replace "%release", release
		
		fs.writeFileSync path, toaster
		console.log "#{'Created'.green.bold} #{path}"