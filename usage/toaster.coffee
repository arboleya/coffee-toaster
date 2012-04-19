# => SRC FOLDER
toast 'src'
	# => VENDORS (optional)
	# vendors: ['vendors/x.js', 'vendors/y.js', ... ]

	# => OPTIONS (optional, default values listed)
	# bare: false
	# packaging: true
	# expose: ''
	# minify: false

	# => WEBROOT (optional), RELEASE / DEBUG (required)
	webroot: 'js'
	release: 'www/js/app.js'
	debug: 'www/js/app-debug.js'