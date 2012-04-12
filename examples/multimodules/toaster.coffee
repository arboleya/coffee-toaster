# ROOT SRC FOLDER
src 'src'

# MODULES
module 'app'
module 'artists'
module 'genres'

# BUILD ROUTINES
build "main"
	modules: ['app', 'artists', 'genres']
	release: 'release/app.js'
	debug: 'release/app-debug.js'