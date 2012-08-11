fs = require "fs"
spawn = (require 'child_process').spawn

exports.snapshot = snapshot = ( folderpath, buffer = {} )->
	for file in (files = fs.readdirSync folderpath)

		filepath = "#{folderpath}/#{file}"
		alias = filepath.replace "#{folderpath}/", ''

		try
			if fs.lstatSync( filepath ).isDirectory()
				buffer[ alias ] = 'folder'
				snapshot filepath, buffer
			else
				unless /.gitkeep/.test alias
					buffer[ alias ] = fs.readFileSync( filepath ).toString()
		catch error
		  throw error

	buffer

exports.spawn_toaster = (args, options) ->
	spawn __dirname + '/../../bin/toaster', args, options || {cwd: __dirname}