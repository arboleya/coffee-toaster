# requirements
# ------------------------------------------------------------------------------
fs = require 'fs'
path = require 'path'
vows = require "vows"
assert = require "assert"
spawn = (require 'child_process').spawn

{FsUtil} = (require __dirname + "/../lib/toaster").toaster.utils


# takes a snapshot of the entire folder tree and file contents
# ------------------------------------------------------------------------------
snapshot = ( folderpath, buffer = {} )->
	for file in (files = fs.readdirSync folderpath)

		filepath = "#{folderpath}/#{file}"
		alias = filepath.replace "#{folderpath}/", ''

		if fs.lstatSync( filepath ).isDirectory()
			buffer[ alias ] = 'folder'
			snapshot filepath, buffer
		else
			unless /.gitkeep/.test alias
				buffer[ alias ] = fs.readFileSync( filepath ).toString()

	return buffer



# spawnning toaster (shorcut)
# ------------------------------------------------------------------------------
spawn_toaster = (args, options) ->
	spawn __dirname + '/../bin/toaster', args, options || {cwd: __dirname}



# testing new project creation
# ------------------------------------------------------------------------------
vows.describe('Generators (-n, -i)')
.addBatch( 'A new project created':

	# testing default values
	# --------------------------------------------------------------------------
	'with default values':
		topic: ->
			# cleaning first
			if path.existsSync (folder = __dirname + "/tmp/new_default_project")
				FsUtil.rmdir_rf folder

			toaster = spawn_toaster ['-n', 'tmp/new_default_project']
			toaster.stdout.on 'data', (data)-> toaster.stdin.write '\n'
			toaster.stderr.on 'data', (data)=>
				console.log data.toString()
				@callback null, null

			toaster.on 'exit', (code)=>
				model = snapshot "#{__dirname}/templates/new_default_project"
				created = snapshot "#{__dirname}/tmp/new_default_project"
				@callback model, created

			undefined

		'should match the default template':( model, created )->
			assert.isObject model
			assert.isObject created
			for alias, contents of model
				a = created[ alias ]
				b = contents
				assert.equal a, b

	# testing custom values
	# --------------------------------------------------------------------------
	'with custom values':
		topic: ->

			# cleaning first
			if path.existsSync (folder = __dirname + "/tmp/new_custom_project")
				FsUtil.rmdir_rf folder

			toaster = spawn_toaster ['-n', 'tmp/new_custom_project']
			toaster.stdout.on 'data', (data)->

				question = data.toString()
				if question.indexOf( "Path to your src folder" ) >= 0
					toaster.stdin.write 'custom_src'

				else if question.indexOf( "Path to your release file" ) >= 0
					toaster.stdin.write 'custom_www/custom_js/custom_app.js'

				else if question.indexOf( "" ) >= 0
					toaster.stdin.write 'custom_js'

			toaster.stderr.on 'data', (data)->
				console.log data.toString()
				@callback null, null

			toaster.on 'exit', (code)=>
				model = snapshot "#{__dirname}/templates/new_custom_project"
				created = snapshot "#{__dirname}/tmp/new_custom_project"
				@callback model, created

			undefined

		'should match the custom template':( model, created )->
			assert.isObject model
			assert.isObject created
			for alias, contents of model
				a = created[ alias ]
				b = contents
				assert.equal a, b

# testing existent projects initialization
# ------------------------------------------------------------------------------
# vows.describe( "Initializing" )
).addBatch( 'A config file created for an existent project':
	topic: ->
		template = (__dirname + "/templates/existing_project/toaster.coffee")
		folder = (__dirname + "/tmp/existing_project/")
		created = "#{folder}/toaster.coffee"

		# cleaning first
		FsUtil.rmdir_rf folder if path.existsSync folder
		fs.mkdirSync folder, "0777"

		toaster = spawn_toaster ['-i', 'tmp/existing_project']
		toaster.stdout.on 'data', (data)->

				question = data.toString()
				if question.indexOf( "Path to your src folder" ) >= 0
					toaster.stdin.write 'src'

				else if question.indexOf( "Path to your release file" ) >= 0
					toaster.stdin.write 'www/js/app.js'

				else if question.indexOf( "" ) >= 0
					toaster.stdin.write 'js'

		toaster.stderr.on 'data', (data)=>
			console.log data.toString()
			@callback null, null

		toaster.on 'exit', (code)=>
			model = fs.readFileSync template, "utf-8"
			created = fs.readFileSync created, "utf-8"
			@callback model, created

		undefined

	'should match the \'toaster.coffe\' template':( model, created )->
		assert.equal model, created

).export module