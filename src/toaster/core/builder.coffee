#<< toaster/utils/array-util

class Builder

	# requirements
	fs = require 'fs'
	path = require 'path'
	cs = require "coffee-script"

	# variables
	toaster_helper:	 """
		__t = ( ns, expose )->
			curr = null
			parts = [].concat = ns.split "."
			for part, index in parts
				if curr == null
					curr = eval part
					expose[part] = curr if expose?
					continue
				else
					unless curr[ part ]?
						curr = curr[ part ] = {}
						expose[part] = curr if expose?
					else
						curr = curr[ part ]
			curr

	"""

	include_tmpl: "document.write('<scri'+'pt src=\"%SRC%\"></scr'+'ipt>')"



	constructor:(@toaster, @opts)->
		@init_modules()



	init_modules:()->
		@mods_num = 0;
		for name, props of @toaster.config.modules
			@mods_num++
			mod = @toaster.modules[name] = new Module @toaster, props, @opts
			mod.init @after_init_modules



	after_init_modules:()=>
		@build() if --@mods_num is 0



	build:()=>
		builds = @toaster.config.builds

		for name, build of builds

			# prepare namespaces declarations (plus exposes)
			namespaces = ""
			for module in build.modules
				mod = @toaster.modules[module]

				declaration = ""
				declaration += "var #{mod.name} = " if mod.packaging
				declaration += "#{mod.expose}.#{mod.name} = " if mod.expose?
				declaration += "{};" if declaration.length

				namespaces += "#{declaration}\n"

			# prepare helper
			helper = cs.compile @toaster_helper, {bare:true}

			# merge all modules into one
			modules = @merge_modules build, @toaster.cli.argv.d

			# unify vendros across modules and merge them
			vendors = @merge_vendors @unify_vendors( build.modules )

			# prepare release contents
			contents = [ vendors, helper, namespaces, modules ]
			
			# write release file
			fs.writeFileSync build.release, contents.join( "\n" )

			# notify user through cli
			log "#{'+'.bold.green} #{build.release}"

			# compiling for debug
			if @opts.argv.d
				release_path = build.release.split("/").slice(0, -1).join "/"
				release_path += "/toaster"
				files = []

				# compile all moduels, collecting all compiled filepaths
				for module in build.modules
					mod = @toaster.modules[module]
					files = files.concat( mod.compile_for_debug release_path )

				# saving boot loader
				if @opts.argv.d
					for f, i in files
						tmpl = @include_tmpl.replace "%SRC%", "./toaster/#{f}"
						files[i] = tmpl

					# prepare boot loader contents
					contents = [ vendors, helper, namespaces, files.join "\n" ]

					# write boot-loader file
					fs.writeFileSync build.debug, contents.join( "\n" )



	unify_vendors:( modules )=>
		unique = []
		for module in modules
			unless (mod = @toaster.modules[module])?
				return log "(unify vendors) MODULE NOT FOUND! -> #{module}"
			for vendor in mod.vendors
				unique.push vendor unless ArrayUtil.has unique, vendor
		unique



	merge_vendors:( vendors )=>
		buffer = []
		for vendor_name in vendors
			if (vendor = @toaster.config.vendors[vendor_name])?
				if path.existsSync vendor
					buffer.push fs.readFileSync vendor, 'utf-8'
				else
					log "Vendor".white, vendor_name.yellow.bold,
						"not found at".white, vendor.yellow.bold
			else
				log "Vendor".white, vendor_name.yellow.bold,

		return buffer.join "\n"



	merge_modules:( build, compile_mods_for_debug )=>
		buffer = []
		for module in build.modules
			if (mod=@toaster.modules[module])?
				buffer.push mod.compile()
			else
				log "(merge modules) MODULE NOT FOUND! => #{module}"
		buffer.join "\n"