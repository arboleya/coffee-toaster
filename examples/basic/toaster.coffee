# MODULES
# ------------------------------------------------------------------------------

vendor 'jquery', 'vendors/jquery.js'
vendor '_', 'vendors/_.js'

module 'basic'
	# mandatory config
	src: 'src'
	release: 'release/app.js'

	# optional config
	vendors: ['_', 'jquery']
	bare: false # default = false
	package: true # default = false
	expose: null # default = null (disabled)
	minify: false # default = false