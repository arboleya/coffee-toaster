Toaster = require( "coffee-toaster" ).Toaster

# PASSSING CONFIG FILE (single)
# new Toaster __dirname, {w:true, d:true, "config-file": "config.single.coffee"}

# # PASSSING CONFIG FILE (multi)
# new Toaster __dirname, {w:true, d:true, "config-file": "config.multi.coffee"}


# # PASSING OBJECT (single)
# new Toaster __dirname,
# 	w:true
# 	d:true
# 	config:
# 		# => SRC FOLDERS AND VENDORS
# 		folders: 'src': ''
# 		vendors:[]

# 		# OPTIONS
# 		bare: false
# 		packaging: true
# 		expose: 'window'
# 		minify: false

# 		# RELEASING
# 		httpfolder: ''
# 		release: "www/js/app.js"
# 		debug: 'www/js/app-debug.js'

# PASSING OBJECT (multi)
new Toaster __dirname,
	w:true
	d:true
	config:
		# => SRC FOLDERS AND VENDORS
		folders:
			'src/app': 'app'
			'src/artists': 'artists'
			'src/genres': 'genres'
		vendors:[]

		# OPTIONS
		bare: false
		packaging: true
		expose: 'window'
		minify: false

		# RELEASING
		httpfolder: ''
		release: "www/js/app.js"
		debug: 'www/js/app-debug.js'