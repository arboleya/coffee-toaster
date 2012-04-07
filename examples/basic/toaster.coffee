# VENDORS
vendor 'jquery', 'vendors/jquery.js'
vendor '_', 'vendors/_.js'

# ROOT SRC FOLDER
src 'src'

# MODULES
module 'basic' # module folder (inside src)
	vendors: ['_', 'jquery'] # (ordered vendor's array)
	bare: false # default = false (compile coffeescript with bare option)
	packaging: true # default = true
	expose: "window" # default = null (if informed, link all objects inside it)
	minify: false # default = false (minifies release file only)

# BUILD ROUTINES
build "main"
	modules: ['basic']
	release: './release/app.js'
	debug: './release/app-debug.js'