#=> VENDORS
vendor 'jquery', 'vendors/jquery.js'
vendor '_', 'vendors/_.js'


#=> SRC / MODULES
src('src')
	.module 'basic',
		vendors: ['_', 'jquery']
		bare: false # default = false
		packaging: true # default = false
		expose: "window" # default = null (disabled)
		minify: false # default = false


#=> BUILD ROUTINES
build "main"
	modules: ['basic']
	release: './release/app.js'
	debug: './release/app-debug.js'