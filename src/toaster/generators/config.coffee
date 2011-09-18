class Config extends Question
	
	tpl: """modules =
				\tname: '%name'
				\tsrc: '%src'
				\trelease: '%release'
				
	"""
	
	constructor:(@basepath)->
	
	create:()->
		
		console.log "It seems this project hasn't been toasted yet."
		@ask "Do you wanna toast it? (Y/n)", /.*/, (data)=>
			if data != "" && data.toLowerCase != "y"
				return process.exit()
			else
				console.log ". #{'Wonderful!'.rainbow}",
					"#{'Let\'s toast this sly little project! :)'.grey.bold}"
				console.log ". With this as your basepath: #{@basepath.cyan}"
				console.log ". Please, tell me:"
				
				question1 = "\tWhat's your app name? (none)"
				question2 = "\tWhere's its src folder? (i.e. src)"
				question3 = "\tWhere do you want your release file?" +
							"(i.e. release/app.js)"
				
				@ask question1, /.+/, (name)=>
					@ask question2, /.+/, (src)=>
						@ask question3, /.+/, (release)=>
							@write name, src, release
							process.exit()
	
	write:(name, src, release)->
		path = pn "#{@basepath}/toaster.coffee"
		toaster = @tpl.replace "%name", name
		toaster = toaster.replace "%src", src
		toaster = toaster.replace "%release", release
		
		fs.writeFileSync path, toaster
		console.log "#{'Created'.green.bold} #{path}"