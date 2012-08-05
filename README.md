![Coffee Toaster](http://github.com/serpentem/coffee-toaster/blob/0.5.0/images/toaster.png?raw=true)

Version 0.6.4

[![Build Status](https://secure.travis-ci.org/serpentem/coffee-toaster.png)](http://travis-ci.org/serpentem/coffee-toaster)

CoffeeToaster is a dependency manager and build system for CoffeeScript.

The main purpose is to provide a very comfortable environment to code large<BR>
libraries using such things as class definitions and namespaces, in order to<BR>
to help avoid naming collisions in your architecture.

A smart 'require' powered by wild-cards is also provided, together with a<BR>
powerful build system that concatenates everything and outputs a single<BR>
javascript release file that can be even minified if you like.

The build system was developed to offer vendors support, with specific<BR>
ordering options. If you are adept of the extends directive in CoffeeScript,<BR>
Toaster will even check if you have required base classes for the classes<BR>
that extends another.

The CLI program informs you about everything that is happening when a new<BR>
file is created, deleted or modified. You can even drag'n'drop a folder with<BR>
lots of CoffeeScript files inside your source folder and everything will be<BR>
handled gracefully.

If you are building for the browser you can use the debug option to compile<BR>
everything individually -- plus, node targeted support is on the way. In <BR>
debug mode you'll be gifted with a boot-loader that will load every file in<BR>
the proper order according your needs.

I should also mention that it's not some kind of AMD or CJS implementation,<BR>
as you may be thinking. It's much more like a new point of view based on my<BR>
specific needs and personal taste, which I didn't come up with a fancy name yet.

Keep on reading this README, and please do not hesitate to open a feature<BR>
request or a bug report.<BR>
https://github.com/serpentem/coffee-toaster/issues

In case of any doubts, drop an email at the email group and luckily you'll<BR>
be answered sooner than later.<BR>
https://groups.google.com/group/coffee-toaster

# Features

* Inheritance support across multiples files for the lazy
 * You can require any file whenever your want to
* Vendors management
* Packaging System & Namespaces
 * Automagic packaging system that uses folders as namespaces
* Micro build routines to help you customize and release your peace of code
* Exports aliases
 * Lets you set a top package to list all your modules
* Broken and circular-loop dependencies validation
 * Helps you prevent some mistakes with circular dependencies loops and<BR>
 alerts you against dependencies not found
* Live syntax-check
 * Precise live syntax-check with file path and line number information
* Growl support
 * Warning/Error messages are shown even in growl
* Debug Mode
 * In order to provide an easy debugging routine once inside the browser,<BR>
 all files will be compiled individually into its respectives '.js' versions<BR>
 and a smart boot-loader (your-debug-file.js) is provided to load every file<BR>
 orderly. Just include this boot-loader in your html file and voilà
* Minify support
 * Aiming to be practical, the output can be even minified (using uglify-js)
* Scaffolding routines
 * Interactive creation of a very simple skeleton for new projects and<BR>
 config file for existent projects


# Installation

	npm install -g coffee-toaster

# Usage

## Creating a new App

CoffeeToaster suggests a very simple structure for initial projects, you can<BR>
customize it as you like.

	toaster -n mynewapp

You will be asked for some things:

1. **source folder** - Relative folderpath to your source folder.
  * i.e.: src
1. **release file** - Path to your release file.
  * i.e.: www/js/app.js
1. **http folder** - The folderpath to reach your debug file through http,<BR>
in case it is  not inside your root directory. Imagine that the 'www' is<BR>
your root folder, so you'd just need to inform 'js' as the http folder.
  * i.e.: js

Your release file will not be affected by the 'http folder' property.

Considering all the default values, you'll end up with a structure as such:

	myawsomeapp/
	├── src
	├── vendors
	├── www
	    └── js
	└── toaster.coffee

	4 directories, 1 file

The toaster.coffee file will have this content:

````ruby

	# => SRC FOLDER
	toast 'src'

		# EXCLUDED FOLDERS
		# exclude: ['folder/to/exclude', 'another/folder/to/exclude', ... ]

		# => VENDORS and EXCLUDED FOLDERS (optional)
		# vendors: ['vendors/x.js', 'vendors/y.js', ... ]

		# => OPTIONS (optional, default values listed)
		# bare: false
		# packaging: true
		# expose: ''
		# minify: false

		# => HTTPFOLDER (optional), RELEASE / DEBUG (required)
		httpfolder: 'js'
		release: 'www/js/app.js'
		debug: 'www/js/app-debug.js'
````

## Toasting an existing project

Your can toast an existing project as such:

	cd existing-project
	toaster -i

Or:

	toaster -i existing-project

Some of the same information (src, release and http folder) will be required,<BR>
answer everything according to your project's structure.

A 'toaster.coffee' file will be created inside of it.

## When the magic happens

To see all that CoffeeToaster can do for you, enter the project folder and<BR>
type 'toaster -w' after creating or toasting a new project:

	cd existing-project
	toaster -w

Or:

	toaster -w existing-project

Your release file will be saved according your configuration.

# Debug Mode

In debug mode (option -d) all files will be compiled individually inside a<BR>
folder called "toaster" in the same directory you've pointed your debug file,<BR>
	aiming to ease the debugging process.

	cd existing-project
	toaster -wd

For example, if you have "release/app-debug.js", a folder will be created in<BR>
"release/toaster" and all your CoffeeScript files will be compiled to<BR>
Javascript within.

Bellow is a representative directory structure:

	usage/
	├── vendors
	├── src
	│   ├── app
	│   │   └── app.coffee
	│   ├── artists
	│   │   ├── progressive
	│   │   │   ├── kingcrimson.coffee
	│   │   │   ├── themarsvolta.coffee
	│   │   │   └── tool.coffee
	│   │   └── triphop
	│   │       ├── lovage.coffee
	│   │       ├── massiveattack.coffee
	│   │       └── portishead.coffee
	│   └── genres
	│       ├── progressive.coffee
	│       └── triphop.coffee
	├── www
	│   ├── index.html
	│   └── js
	│       ├── app.js
	│       ├── app-debug.js
	│       └── toaster
	│           ├── app
	│           │   └── app.js
	│           ├── artists
	│           │   ├── progressive
	│           │   │   ├── kingcrimson.js
	│           │   │   ├── themarsvolta.js
	│           │   │   └── tool.js
	│           │   └── triphop
	│           │       ├── lovage.js
	│           │       ├── massiveattack.js
	│           │       └── portishead.js
	│           └── genres
	│               ├── progressive.js
	│               └── triphop.js
	└── toaster.coffee

The debug file you've chosen is the boot-loader responsible to load all your<BR>
files into the right order.

So in your .html you'll have two options:

**1)** Include your release file.

````html
	<script src="js/app.js"></script>
````
 
**2)** Include the toaster boot-loader (your debug mode).

````html
	<script src="js/app-debug.js"></script>
````

# How does everything work?

CoffeeToaster will create a file called 'toaster.coffee' in your app main folder.

## Config File (toaster.coffee)

This file contains information of your app, i.e:

````ruby

	# => SRC FOLDER
	toast 'src'

		# EXCLUDED FOLDERS
		# exclude: ['folder/to/exclude', 'another/folder/to/exclude', ... ]

		# => VENDORS and EXCLUDED FOLDERS (optional)
		# vendors: ['vendors/x.js', 'vendors/y.js', ... ]

		# => OPTIONS (optional, default values listed)
		# bare: false
		# packaging: true
		# expose: ''
		# minify: false

		# => HTTPFOLDER (optional), RELEASE / DEBUG (required)
		httpfolder: 'js'
		release: 'www/js/app.js'
		debug: 'www/js/app-debug.js'
````

You can have a multi src folders as well, i.e:

````ruby

	toast
		# SRC FOLDERS
		folders:
			"src/app": "app"
			"src/theoricus": "theoricus"
		
		# EXCLUDED FOLDERS
		# exclude: ['folder/to/exclude', 'another/folder/to/exclude', ... ]

		# => VENDORS and EXCLUDED FOLDERS (optional)
		# vendors: ['vendors/x.js', 'vendors/y.js', ... ]

		# => OPTIONS (optional, default values listed)
		# bare: false
		# packaging: true
		# expose: ''
		# minify: false

		# => HTTPFOLDER (optional), RELEASE / DEBUG (required)
		httpfolder: 'js'
		release: 'www/js/app.js'
		debug: 'www/js/app-debug.js'
````

### Folders

An array of objects containing setup information about the folders.

When using multi-folders, you can specify this option to map everything as<BR>
you need. The hash-key is the path of your folder, and the hash-value is the<BR>
alias you want to prepend to all files under that.

### Exclude

Let's you excplicity exclude some folders from Toaster search/process mechanism.

### Vendors

You can define vendors such as:

````ruby

	vendors: ['vendors/x.js', 'vendors/y.js', ... ]
````

It's an ordered array of all your vendor's paths. These files must be purely<BR>
javascript, preferably minified ones -- Toaster will not compile or minify<BR>
them, only concatenate everything.

### Bare

If true, compile your CS files without the top-level function safety wrapper:

````javascript

	(function() {
	  # bunch of code
	}).call(this);
````

So you will end up with just 'bunch of code':


````javascript

	# bunch of code
````

### Packaging

If true, builds a hash with all your folders-as-namespaces.

If you have file 'lovage.coffee' declared inside the "artists/triphop"<BR>
folder, you can declare it with 'class artists.triphop.Lovage', the <BR>
namespace 'artists.triphop' will be created automatically for holding it.

### Expose

If informed, list all you packages of classes in the given scope. If you use<BR>
'window' as your expose scope, your classes will be available also in the<BR>
window object -- or whatever scope you inform.

````javascript
	
	new window.artists.triphop.Lovage
````

### Minify

If true, minify your release file -- debug files are never minified.

### HTTP Folder

The folder path to reach your debug file through http, in case it is not<BR>
inside your root directory. Imagine that the 'www' is your root folder, and<BR>
you have a 'js' folder inside of it with your 'debug.js' file inside of it.

Following this case you'd just need to inform 'js' as your http folder.

So the declarations inside the debug boot loader will follow this location<BR>
in order to import your scripts in debug mode, prepending your http folder<BR>
to all file paths.

Your release file will not be affected by this property.

### Release

The file path to your release file.

### Debug

The file path to your debug file.

## Conlusion

So when you call 'toaster -w' in this directory, this config is loaded and<BR>
every file and folder inside 'src' folder will be watched.

If debug is enabled (option -d), files will be also compiled individually<BR>
for a sane debugging routine inside the browser, in the same directory you<BR>
have your debug file.

Every time something changes, CoffeeToaster re-compiles all of your<BR>
application by:

* collecting all .coffee files and processing everything, adding package<BR>
declarations to class definitions based on the folder they are located
* re-ordering everything, always defining files and classes before<BR>
they're needed
* merge all yours vendors in the given order
* declare root namespaces
* merge everything

Hold it! How the hell does it know when my files or classes are needed?

## Import directive

The import directive is known by:

 * #<< app/views/user_view
 * #<< app/utils/*

By putting '#<< app/views/user_view' in your CoffeeScript file, you're<BR>
telling CoffeeToaster that there's a dependency.

Wild cards '#<< app/utils/*' are also accepted as a handy option.

# Advanced options

You can pass your own config file for toaster instead of the default one<BR>
'toaster.coffee', with the '-f' or '--config-file' option:

````javascript

	toaster -wdf mycustomconfig.coffee
````

Or even pass even the whole configuration as a JSON string, with the '-j' or<BR>
'--config' option:

````javascript

	toaster -wdj '{"folders":{"src":""},"expose":"window","release":"app.js","debug":"app-debug.js"}'
````

# Examples

You'll certainly find some useful resources in the examples provided.<BR>
Examine it and you'll understand how things works more instinctively.

Install coffee-toaster, clone the usage example and try different config<BR>
options, always looking for the differences in your javascript release file.

 > [Single folder example](https://github.com/serpentem/coffee-toaster/tree/master/examples/single-folder)<BR>
 > [Multi folder example](https://github.com/serpentem/coffee-toaster/tree/master/examples/multi-folder)<BR>
 > [API example](https://github.com/serpentem/coffee-toaster/tree/master/examples/introspection)<BR>

# API

You can use Toaster through API as well, in case you want to power up your<BR>
compiling tasks or even buid some framework on top of it.

See the API example for further information.
 > [API example](https://github.com/serpentem/coffee-toaster/tree/master/examples/introspection)<BR>

````ruby

	Toaster = require("coffee-toaster").Toaster
	
	toasting = new Toaster basedir, options, skip_initial_build
	toasting.build header_code_injection, footer_code_injection
````

# Note for developers

## Setting everything up

````bash
	git clone git://github.com/serpentem/coffee-toaster.git coffee-toaster
	cd coffee-toaster
	git submodule update --init
	npm link
````

## Testing

````bash
	npm test
````

## Building

````bash
	npm build
````

## Watch/build mode

````bash
	npm watch
````

# Issues

Do not hesitate to open a feature request or a bug report.<BR>
https://github.com/serpentem/coffee-toaster/issues

# Mailing List

A place to talk about it, ask anything, get in touch. Luckily you'll<BR>
be answered sooner than later.<BR>
https://groups.google.com/group/coffee-toaster

# Changelog

> [CHANGELOG.md](https://github.com/serpentem/coffee-toaster/tree/master/CHANGELOG.md)<BR>
