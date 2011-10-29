# VENDORS
# ------------------------------------------------------------------------------
vendor 'jquery', 'vendors/jquery.js'
vendor '_', 'vendors/_.js'



# MODULES
# ------------------------------------------------------------------------------
module 'animals'
	src: 'src_animals'
	vendors: ['jquery', "_"]
	release: 'release/animals.js'

module 'insects'
	src: 'src_insects'
	vendors: ['_', 'jquery']
	release: 'release/insects.js'



# # BUILDS
# ------------------------------------------------------------------------------
build 'animals_first_then_insects'
	modules: ['animals', 'insects']
	release: 'release/animals_insects.js'

build 'insects_first_then_animals'
	modules: ['insects', 'animals']
	release: 'release/insects_animals.js'