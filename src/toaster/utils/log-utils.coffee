# requirements
growl = require 'growl'

# ICONS 
icon_warn = '/Users/nybras/Dropbox/Workspace/serpentem/coffee-toaster/images/warning.png'
icon_error = '/Users/nybras/Dropbox/Workspace/serpentem/coffee-toaster/images/error.png'



# LOGGING METHODS
log = ( msg, send_to_growl = false ) ->
	console.log msg

debug = ( msg, send_to_growl = false ) ->
	console.log "#{msg.magenta}"


error = ( msg, file, send_to_growl = true, file = null ) ->
	console.log "ERROR ".bold.red + msg

	if send_to_growl

		# remove all colors
		msg = msg.replace /\[\d{2}m/g, ""

		# replaces all styles with _%string-here%_
		msg = msg.replace /(\[\dm)([^\s]+)/ig, "<$2>$3"

		# queue for growl
		queue_msg
			msg: msg
			opts:
				title: 'Coffee Toaster'
				image: icon_error

warn = ( msg, send_to_growl = true ) ->
	console.log "WARNING ".bold.yellow + msg

	if send_to_growl

		# remove all colors
		msg = msg.replace /\[\d{2}m/g, ""

		# replaces all styles with _%string-here%_
		msg = msg.replace /(\[\dm)([^\s]+)/ig, "<$2>$3"

		# queue for growl
		queue_msg
			msg: msg
			opts:
				title: 'Coffee Toaster'
				image: icon_warn



# GROWL QUEUE PRO

msgs = []
interval = null

start_worker = () ->
	unless interval?
		interval = setInterval process_msgs, 150
		process_msgs()

stop_worker = () ->
	if interval?
		clearInterval interval
		interval = null



queue_msg = (msg) ->
	msgs.push msg
	start_worker()

process_msgs = () ->
	if msgs.length
		msg = msgs.shift()
		growl.notify msg.msg, msg.opts
	else
		stop_worker()