fs = require "fs"
os = require "os"
path = require 'path'
spawn = (require 'child_process').spawn

snapshot = exports.snapshot = ( folderpath, buffer = {} )->
	folderpath = path.resolve folderpath

	for file in (files = fs.readdirSync folderpath)

		absolute = path.resolve "#{folderpath}/#{file}"
		relative = absolute.replace folderpath, ''

		try
			if fs.lstatSync( absolute ).isDirectory()
				buffer[ relative ] = 'folder'
				snapshot absolute, buffer
			else
				unless /.gitkeep/.test relative
					buffer[ relative ] = fs.readFileSync( absolute ).toString()
		catch error
		  throw error

	buffer

exports.spawn_toaster = (args, options) ->
	toaster_path = path.join __dirname, '..', '..', 'bin', 'toaster'

	# Win32 urges some MAGIC in order to do basic things such as spawn a node
	# program or any other program that isn't a .exe. Gorgeous.
	if os.platform() is 'win32'
		runner = "cmd"
		args = ['/S', '/C', 'node', toaster_path].concat args

	# No magic need for *unix systems.
	else
		runner = toaster_path
		spawn toaster_path, args, options || cwd: __dirname

	spawn runner, args, options || {cwd: __dirname}