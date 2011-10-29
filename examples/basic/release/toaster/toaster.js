// UNDERSCORE
// JQUERY
letters = {}
repeating = {}
single = {}

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

document.write('<scri'+'pt src="./toaster/src/letters/a.js"></scr'+'ipt>')
document.write('<scri'+'pt src="./toaster/src/letters/b.js"></scr'+'ipt>')
document.write('<scri'+'pt src="./toaster/src/repeating/a.js"></scr'+'ipt>')
document.write('<scri'+'pt src="./toaster/src/repeating/b.js"></scr'+'ipt>')
document.write('<scri'+'pt src="./toaster/src/single/script.js"></scr'+'ipt>')
document.write('<scri'+'pt src="./toaster/src/toplevel.js"></scr'+'ipt>')
document.write('<scri'+'pt src="./toaster/src/app.js"></scr'+'ipt>')
