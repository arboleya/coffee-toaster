// UNDERSCORE
// JQUERY
insects = {}

pkg = ( ns )->
	curr = null
	parts = [].concat = ns.split( "." )
	for part, index in parts
		if curr == null
			curr = eval part
			continue
		else
			unless curr[ part ]?
				curr = curr[ part ] = {}
			else
				curr = curr[ part ]
	curr

document.write('<scri'+'pt src="./toaster/src/insects/bee.js"></scr'+'ipt>')
