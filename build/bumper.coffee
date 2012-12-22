fs = require 'fs'
path = require 'path'

filepath = path.join __dirname, "../package.json"
json = JSON.parse (fs.readFileSync filepath, "utf-8")
version = json.version

[major,minor,patch] = version.split '.'

switch process.argv[2]
	when '--major'
		major++
		minor = 0
		patch = 0
		break
	when '--minor'
		minor++
		patch = 0
		break
	when '--patch'
		patch++
		break
	when '--version'
		console.log version
		process.exit()

new_version = "#{major}.#{minor}.#{patch}"
console.log "Updating version to #{new_version} in files:"

# updating README
filepath = path.join __dirname, "../README.md"
contents = fs.readFileSync filepath, 'utf-8'
search = />\sVersion\s[0-9]+.[0-9]+.[0-9]+/
replace = '> Version ' + new_version
fs.writeFileSync filepath, (contents.replace search, replace)
console.log '• README.md'

# updating package.json
filepath = path.join __dirname, "../package.json"
contents = fs.readFileSync filepath, 'utf-8'
search = /"version":\s"[0-9]+.[0-9]+.[0-9]+"/
replace = "\"version\": \"#{new_version}\""
fs.writeFileSync filepath, (contents.replace search, replace)
console.log '• package.json'