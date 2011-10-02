optimist = require 'optimist'

class Parser
	constructor:->
		usage = "#{'CoffeeToaster'.bold}\n"
		usage += "  Minimalist dependency management for CoffeeScript\n\n".grey
		
		usage += "#{'Usage:'}\n"
		usage += "  toaster [#{'options'.green}] [#{'path'.green}]\n\n"
		
		usage += "#{'Examples:'}\n"
		usage += "  toaster -n myawsomeapp   (#{'required'.red})\n"
		usage += "  toaster -i [myawsomeapp] (#{'optional'.green})\n"
		usage += "  toaster -w [myawsomeapp] (#{'optional'.green})\n"
		
		# usage += "\n"
		# usage += "  For more examples, try:\n"
		# usage += "    toaster -e\n"
		# usage += "    toaster --exammples"
		
		# usage += "  toaster -nk myawsomeapp\n"
		# usage += "  toaster -nc myawsomeapp\n"
		# usage += "  toaster -nskc myawsomeapp"
		
		adendo = "" #"use w/ [-s]"
		# adendo = "use w/ [-s, -k, -c]"
		
		@argv = (@opts = optimist.usage( usage )
    		.alias('n', 'new')
			# .boolean( 'n' )
			.describe('n', "Scaffold a very basic new App, #{adendo}")
			
			.alias('i', 'init')
			# .boolean( 'i' )
			.describe('i', "Create a config (toaster.coffee) file, #{adendo}")
			
			.alias('w', 'watch')
			# .boolean( 'w' )
			.describe('w', "Start watching/compiling your project, #{adendo}")
			
			# .alias('c', 'compile')
			# .boolean( 'c' )
			# .describe('c', "Compile the entire project, without watching it.")
			
			.alias('d', 'debug')
			.boolean( 'd' )
			.default('d', false)
			.describe('d', 'Debug mode (compile js files individually)')
			
			# .alias('s', 'script')
			# .boolean( 's' )
			# .default('s', false)
			# .describe('s', 'Enable CoffeeScript handling')
			
			# .alias('k', 'kup')
			# .boolean( 'k' )	
			# .default('k', false)
			# .describe('k', 'Enable CoffeeKup handling')
			# 
			# .alias('c', 'css')
			# .boolean( 'c' )
			# .default('c', false)
			# .describe('c', 'Enable CoffeeCss handling')
			# 
			# .alias('e', 'examples')
			# .boolean( 'e' )
			# .default( 'e', false )
			# .describe('e', 'Print a list of usage examples, with description')
			
			.alias('v', 'version')
			# .boolean( 'v' )
			.describe('v', '')
			
			.alias('h', 'help')
			# .boolean( 'h' )
			.describe('h', '')
		).argv