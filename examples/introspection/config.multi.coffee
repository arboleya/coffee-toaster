toast

	# => SRC FOLDERS
	folders:
		'src/app': 'app'
		'src/artists': 'artists'
		'src/genres': 'genres'

	# => VENDORS and EXCLUDED folders (optional)
	# vendors: ['vendors/x.js', 'vendors/y.js', ... ]
	# exclude: ['my/folder/to/exclude', 'my/folder/to/exclude']

	# => OPTIONS (optional, default values listed)
	# bare: false
	# packaging: true
	expose: 'window'
	# minify: false

	# => HTTPFOLDER (optional), RELEASE / DEBUG (required)
	httpfolder: 'js'
	release: 'www/js/app.js'
	debug: 'www/js/app-debug.js'