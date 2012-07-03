toast 'src'
	minify: false
	expose: 'exports'
	release: 'lib/toaster.js'
	debug: 'lib/toaster-debug.js'

toast 'spec/src'
	minify: false
	packaging: false
	release: "spec/test.js"
	debug: "spec/test-debug.js"