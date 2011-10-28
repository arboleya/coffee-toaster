#<< toaster/utils/array-util

fs = require 'fs'
path = require 'path'

class Builder
	constructor:(@toster)->

	join:( modules, builds )->

		for build in builds

			files = []
			for module in build.modules
				found = ArrayUtil.find modules, module, "name"
				files.push found.item.release if found?

			mods_buffer = ""
			for file in files
				if path.existsSync file
					mods_buffer += "\n" + fs.readFileSync file, "utf-8"
			
			fs.writeFileSync build.release, mods_buffer
			console.log "#{'.'.green} #{build.release}"