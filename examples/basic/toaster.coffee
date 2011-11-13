# MODULES
# ------------------------------------------------------------------------------

vendor 'jquery', 'vendors/jquery.js'
vendor '_', 'vendors/_.js'

module 'basic'
	# mandatory config
	src: 'src'
	vendors: ['_', 'jquery']
	release: 'release/app.js'

	# optional config
	bare: false # default = false
	packaging: true # default = false
	exports: false # default = null (disabled)
	minify: false # default = false