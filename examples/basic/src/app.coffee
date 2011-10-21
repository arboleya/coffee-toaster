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
			:: Namespaces are also welcome :)
			\t ..and helps you to differ two classes with the same name.
			\t In the lines bellow, two classes named 'Black' are instantiated
			\t independently, through namespaces.
			\t Namespaces are automatically generated based on the folder the
			\t the file are, relative to the src folder.
			--------------------------------------------------------------------
		"""

		new colors.Red
		new colors.Black
		new misc.Black

new App


