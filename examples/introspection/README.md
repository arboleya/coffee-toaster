# Instrospection

Check out the [compile.coffee](https://github.com/serpentem/coffee-toaster/blob/master/examples/introspection/compile.coffee) file for different usages.

## Requiring

````ruby

	Toaster = require( "coffee-toaster" ).Toaster
````

## Custom config files:

````ruby

	# PASSSING CONFIG FILE (same as the single-folder example)
	new Toaster __dirname, {w:true, d:true, "config-file": "config.single.coffee"}
````

Or:

````ruby

	# PASSSING CONFIG FILE (same as the multi-folder example)
	new Toaster __dirname, {w:true, d:true, "config-file": "config.multi.coffee"}
````

## Using JS object:

````ruby

	# PASSING OBJECT (single)
	new Toaster __dirname,
		w:true
		d:true
		config:
			# => SRC FOLDERS AND VENDORS
			folders: 'src': ''
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
````

````ruby

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
````


Execute it to test it.