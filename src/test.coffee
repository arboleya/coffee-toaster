class X
	constructor:(@name)->
		@test()
	
	test:->
		console.log @name

x = new X( "YEP" )