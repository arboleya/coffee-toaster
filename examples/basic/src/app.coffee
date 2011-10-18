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

		console.log """
			--------------------------------------------------------------------
			:: namespaces are also welcome :)
			\t and helps you differ between two classes with the same name.
			\t in the lines bellow, two classes named 'Black' are instantiated
			\t independently, through namespaces usage.
			--------------------------------------------------------------------
		"""
		new colors.Red
		new colors.Black
		new misc.Black

new App