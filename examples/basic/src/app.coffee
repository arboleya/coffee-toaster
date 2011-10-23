#<< letters/*
#<< repeating/a
#<< repeating/b
#<< single/script
#<< toplevel

class App
	constructor:->
		console.log "App created!"
		
		new A
		new B
		new TopLevel

		console.log """
			--------------------------------------------------------------------
			:: Namespaces are also welcome :)
			\t ..and helps you to differ two classes with the same name.
			\t In the lines bellow, two classes named 'A' and 'B' are
			\t instantiated independently, through namespaces.
			\t Namespaces are automatically generated based on the folder the
			\t the files are, relative to the src folder.
			--------------------------------------------------------------------
		"""

		new letters.A
		new letters.B

		new repeating.A
		new repeating.B
		

new App