#<< basic/letters/*
#<< basic/repeating/a
#<< basic/repeating/b
#<< basic/single/script
#<< basic/toplevel

class App
	constructor:->
		console.log "App created!"
		
		new basic.TopLevel

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

		new basic.letters.A
		new basic.letters.B

		new basic.repeating.A
		new basic.repeating.B

new basic.App