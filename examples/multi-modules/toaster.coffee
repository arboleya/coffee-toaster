# VENDORS
# ------------------------------------------------------------------------------
vendor 'jquery', 'vendors/jquery.js'
vendor '_', 'vendors/_.js'

# MODULE animals
# ------------------------------------------------------------------------------
module 'animals'

	# required config
	src: 'src_animals'
	release: 'release/animals.js'

	# optional config
	vendors: ['jquery', "_"]
	bare: false # default = false
	packaging: true # default = false
	exports: "window" # default = null (disabled)
	minify: false # default = false


# MODULE insects
# ------------------------------------------------------------------------------
module 'insects'
	
	# required config
	src: 'src_insects'
	release: 'release/insects.js'

	# optional config
	vendors: ['_', 'jquery']
	bare: false # default = false
	packaging: true # default = false
	exports: "exports" # default = null (disabled)
	minify: false # default = false


# BUILDS
# ------------------------------------------------------------------------------
build 'animals_first_then_insects'
	modules: ['animals', 'insects']
	release: 'release/animals_insects.js'

build 'insects_first_then_animals'
	modules: ['insects', 'animals']
	release: 'release/insects_animals.js'