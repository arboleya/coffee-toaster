# MODULES
module 'animals'
	src: 'src_animals'
	release: 'release/animals.js'

module 'insects'
	src: 'src_insects'
	release: 'release/insects.js'

# BUILDS
build 'animals_first'
	modules: ['animals', 'insects']
	release: 'release/animals_insects.js'

build 'insects_first'
	modules: ['insects', 'animals']
	release: 'release/insects_animals.js'