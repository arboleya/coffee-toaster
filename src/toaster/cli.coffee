optimist = require 'optimist'

class Cli
	constructor:->
		usage = "#{'CoffeeToaster'.bold}\n"
		usage += "  Minimalist dependency management for CoffeeScript\n\n".grey
		
		usage += "#{'Usage:'}\n"
		usage += "  toaster [#{'options'.green}] [#{'path'.green}]\n\n"
		
		usage += "#{'Examples:'}\n"
		usage += "  toaster -n myawsomeapp   (#{'required'.red})\n"
		usage += "  toaster -i [myawsomeapp] (#{'optional'.green})\n"
		usage += "  toaster -w [myawsomeapp] (#{'optional'.green})"
		
		@argv = (@opts = optimist.usage( usage )
    		.alias('n', 'new')
			.describe('n', "Scaffold a very basic new App")
			
			.alias('i', 'init')
			.describe('i', "Create a config (toaster.coffee) file")
			
			.alias('w', 'watch')
			.describe('w', "Start watching/compiling your project")
			
			.alias('c', 'compile')
			.boolean( 'c' )
			.describe('c', "Compile the entire project, without watching it.")

			.alias('d', 'debug')
			.boolean( 'd' )
			.default('d', null )
			.describe('d', 'Debug mode (compile js files individually)')

			.alias('b', 'bare')
			.boolean( 'b' )
			.default('b', false )
			.describe('b', 'Compile files with "coffee --bare" (no js wrapper)')

			.alias('p', 'packaging')
			.boolean( 'p' )
			.default('p', false )
			.describe('p', 'Enables/disables the packaging system')

			.alias('m', 'minify')
			.boolean( 'm' )
			.default('m', false )
			.describe('m', 'Minify release code using uglify.')

			.alias('e', 'exports')
			.string('e')
			.default('e', null )
			.describe('e', 'Specify a macro scope to list everything.')

			.alias('v', 'version')
			.describe('v', '')
			
			.alias('h', 'help')
			.describe('h', '')
		).argv