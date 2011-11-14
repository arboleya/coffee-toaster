#<< toaster/utils/array-util

fs = require 'fs'
path = require 'path'

class Builder
	constructor:(@toaster)->

	build:()->

		builds = @toaster.config.builds
		for name, build of builds
			

			modules = @merge_modules build.modules
			vendors = @merge_vendors @unify_vendors( build.modules )

			fs.writeFileSync build.release, "#{vendors}\n#{modules}"
		
		# return unless @toaster.cli.argv.d

		# tmpl = "document.write('<scri'+'pt src=\"%SRC%\"></scr'+'ipt>')"
		# buffer = []

		# for name of @toaster.modules
		# 	buffer.push tmpl.replace "%SRC%", "toaster/#{name}/#{name}.js"
		
		# fs.writeFileSync build.release, "#{vendors}\n#{modules}"
		# log buffer.join "\n"

	unify_vendors:( modules )->

		unique = []
		for module in modules

			unless (module = @toaster.modules[module])?
				return console.log "MODULE NOT FOUND!"
			
			for vendor in module.vendors
				unique.push vendor unless ArrayUtil.has unique, vendor
		
		unique

	merge_vendors:( vendors )->

		# merge all vendors in the proper order and return it
		buffer = []

		for vendor_name in vendors

			if (vendor = @toaster.config.vendors[vendor_name])?

				if path.existsSync vendor
					buffer.push fs.readFileSync vendor, 'utf-8'
				else
					console.log "WARNING!".bold.yellow,
						"Vendor".white,
						vendor_name.yellow.bold,
						"not found at".white,
						vendor.yellow.bold
			else
				console.log "WARNING!".bold.yellow,
					"Vendor".yellow,
					vendor_name.white.bold
					"not found for module".yellow,
					@name.white.bold

		return buffer.join "\n"

	merge_modules:( modules )->

		buffer = []
		for module in modules
			if (module=@toaster.modules[module])?
				buffer.push module.compile()
			else
				console.log "MODULE NOT FOUN!"
		
		buffer.join "\n"
