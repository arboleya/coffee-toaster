#<< colors/*
#<< misc/black
#<< single/script
#<< toplevel

class App
	constructor:->
		console.log "App created!"
		
		new Red
		new Black
		new TopLevel

		console.log ">>> namespaces are also welcome :)"
		
		new colors.Red
		new colors.Black
		new misc.Black

new App