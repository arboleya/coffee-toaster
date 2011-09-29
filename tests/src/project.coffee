# LIBRARIES
fs = require 'fs'
path = require 'path'
cs = require 'coffee-script'

vows = require 'vows'
assert = require 'assert'
feature = require('vows-bdd').Feature

# CLASSES
{Project} = require "#{__dirname}/../lib/toaster.js"
{FsUtil} = require "#{__dirname}/../lib/toaster.js"

# VARIABLES
BASEPATH		= "/Users/nybras/Workspace/serpentem/coffee-toaster/tests"
APP_FOLDER		= "myawesomeapp"
APP_PATH		= "#{BASEPATH}/#{APP_FOLDER}"
NAME			= "My Awesome App"
SRC				= "src"
RELEASE_FOLDER	= "release"
RELEASE_FILE	= "#{RELEASE_FOLDER}/app.js"

project = null

# FEATURES
feature('Project Scaffolding', module)
	
	.scenario('Scaffolding a new project')
	
	.given "A new Project instance", ->
		project = new Project BASEPATH
		@callback()
	
	.when 'I create a new project from template', ->
		project.create APP_FOLDER, NAME, SRC, RELEASE_FILE
		@callback()
	
	.then "the project, src and release folders should be created", ->
		assert.isTrue path.existsSync APP_PATH
		assert.isTrue path.existsSync "#{APP_PATH}/#{SRC}"
		assert.isTrue path.existsSync "#{APP_PATH}/#{RELEASE_FOLDER}"
	
	.and "the toaster.coffee must to be created as well", ->
		assert.isTrue path.existsSync "#{APP_PATH}/toaster.coffee"
	
	.and "need to have the proper content", ->
		filepath = "#{APP_PATH}/toaster.coffee"
		contents = cs.compile fs.readFileSync( filepath, "utf-8" ), {bare:1}
		module = [].concat( eval contents ).shift()
		
		assert.equal module.name, NAME
		assert.equal module.src, SRC
		assert.equal module.release, RELEASE_FILE
	
	.complete ->
		FsUtil.rmdir_rf APP_PATH
	
	.finish( module )