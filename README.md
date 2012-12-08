![Coffee Toaster](http://github.com/serpentem/coffee-toaster/blob/0.5.0/images/toaster.png?raw=true)

Version 0.6.5

[![Build Status](https://secure.travis-ci.org/serpentem/coffee-toaster.png)](http://travis-ci.org/serpentem/coffee-toaster)

CoffeeToaster is a dependency manager and build system for CoffeeScript.

The main purpose is to provide a very comfortable environment to code large libraries using such things as class definitions and namespaces, in order to to help avoid naming collisions in your architecture.

A smart 'require' powered by wild-cards is also provided, together with a powerful build system that concatenates everything and outputs a single javascript release file that can be even minified if you like.

The build system was developed to offer vendors support, with specific ordering options. If you are adept of the extends directive in CoffeeScript, Toaster will even check if you have required base classes for the classes that extends another.

The CLI program informs you about everything that is happening when a new file is created, deleted or modified. You can even drag'n'drop a folder with lots of CoffeeScript files inside your source folder and everything will be handled gracefully.

If you are building for the browser you can use the debug option to compile everything individually -- plus, node targeted support is on the way. In debug mode you'll be gifted with a boot-loader that will load every file in the proper order according your needs.

I should also mention that it's not some kind of AMD or CJS implementation, as you may be thinking. It's much more like a new point of view based on my specific needs and personal taste, which I didn't come up with a fancy name yet.

Keep on reading this README, and please do not hesitate to open a feature request or a bug report.
> https://github.com/serpentem/coffee-toaster/issues

In case of any doubts, drop an email at the email group and luckily you'll be answered sooner than later.
> https://groups.google.com/group/coffee-toaster

This package was created initially as a base for creating the [Theoricus](https://github.com/serpentem/theoricus) framework (which is in a very alpha stage) and will be evolved as needed.
> https://github.com/serpentem/theoricus

# Features

* Inheritance support across multiples files for the lazy
 * You can require any file whenever your need to
* Vendors management
* Packaging System & Namespaces
 * Automagic packaging system that uses folders as namespaces
* Micro build routines to help you customize and release your peace of code
* Exports aliases
 * Lets you set a top package to list all your modules
* Broken and circular-loop dependencies validation
 * Helps you prevent some mistakes with circular dependencies loops and alerts you against dependencies not found
* Live syntax-check
 * Precise live syntax-check with file path and line number information
* Growl support
 * Warning/Error messages are shown even in growl
* Debug Mode
 * In order to provide an easy debugging routine once inside the browser, all files will be compiled individually into its respectives '.js' versions and a smart boot-loader (your-debug-file.js) is provided to load every file orderly. Just include this boot-loader in your html file and voilà
* Minify support
 * Aiming to be practical, the output can be even minified (using uglify-js)
* Scaffolding routines
 * Interactive creation of a very simple skeleton for new projects and config (toaster.coffee) file for existent projects


# Installation

	npm install -g coffee-toaster

# Usage

## Creating a new App

CoffeeToaster suggests a very simple structure for initial projects, you can customize it as you like.

	toaster -n mynewapp

You will be asked for some things:

1. **source folder** - Relative folderpath to your source folder.
  * i.e.: src
1. **release file** - Relative filepath to your release file.
  * i.e.: www/js/app.js
1. **http folder** - The folderpath to reach your debug file through http, in case it is  not inside your root directory. Imagine that the 'www' is your root folder, so you'd just need to inform 'js' as the http folder.
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

You can also toast an existing project as such:

	cd existing-project
	toaster -i

Or:

	toaster -i existing-project

Some of the same information (src, release and http folder) will be required, answer everything according to your project's structure.

A 'toaster.coffee' file will be created inside of it.

## When the magic happens

To see all that CoffeeToaster can do for you, enter the project folder and type 'toaster -w' after creating or toasting a new project:

	cd existing-project
	toaster -w

Or:

	toaster -w existing-project

Your release file will be saved according your configuration and Toaster will start in watch'n'compile mode. Any changes you make to your src files will trigger the re-compile.

# Debug Mode

In debug mode (option -d) all files will be compiled individually inside a folder called "toaster" in the same directory you've pointed your debug file, aiming to ease the debugging process.

	cd existing-project
	toaster -wd

For example, if you have "release/app-debug.js", a folder will be created in "release/toaster" and all your CoffeeScript files will be compiled to Javascript within.

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

The debug file you've chosen is the boot-loader responsible to load all your files into the right order.

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

You can have a multi-source-folders as well, i.e:

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

An Object of objects containing setup information about the folders, in the format:
	
	'folderpath':'folderalias'

When using multi-folders, you can specify this option to map everything as you need. The hash-key is the path of your folder, and the hash-value is the alias you want to prepend to all files under that.

Pay attention to this specially when using Toaster with the '-j' option.

### Exclude

Let's you excplicity exclude some folders from Toaster search/process mechanism.

### Vendors

You can define vendors such as:

````ruby

	vendors: ['vendors/x.js', 'vendors/y.js', ... ]
````

It's an ordered array of all your vendor's paths. These files must be purely javascript, preferably minified ones -- Toaster will not compile or minify them, only concatenate everything.

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

If you have file 'lovage.coffee' declared inside the "artists/triphop" folder, you can declare it with 'class artists triphop.Lovage', the namespace 'artists.triphop' will be created automatically for holding it.

### Expose

If informed, list all you packages of classes in the given scope. If you use 'window' as your expose scope, your classes will be available also in the window object -- or whatever scope you inform.

````javascript
	
	new window.artists.triphop.Lovage
````

### Minify

If true, minify your release file -- debug files are never minified.

### HTTP Folder

The folder path to reach your debug file through http, in case it is not inside your root directory. Imagine that the 'www' is your root folder, and you have a 'js' folder inside of it with your 'debug.js' file inside of it.

Following this case you'd just need to inform 'js' as your http folder.

So the declarations inside the debug boot loader will follow this location in order to import your scripts in debug mode, prepending your http folder to all file paths.

Your release file will not be affected by this property.

### Release

The file path to your release file.

### Debug

The file path to your debug file.

## Conlusion

So when you call 'toaster -w' in this directory, this config is loaded and every file and folder inside 'src' folder will be watched.

If debug is enabled (option -d), files will be also compiled individually for a sane debugging routine inside the browser, in the same directory you have your debug file.

Every time something changes, CoffeeToaster re-compiles all of your application by:

* collecting all .coffee files and processing everything, adding package declarations to class definitions based on the folder they are located
* re-ordering everything, always defining files and classes before they're needed
* merge all yours vendors in the given order
* declare root namespaces
* merge everything

Hold it! How the hell does it know when my files or classes are needed?

## Import directive

The import directive is known by:

 * #<< app/views/user_view
 * #<< app/utils/*

By putting '#<< app/views/user_view' in your CoffeeScript file, you're telling CoffeeToaster that there's a dependency.

Wild cards '#<< app/utils/*' are also accepted as a handy option.

# Advanced options

You can pass your own config file for toaster instead of the default one 'toaster.coffee', with the '-f' or '--config-file' option:

````javascript

	toaster -wdf mycustomconfig.coffee
````

Or even pass even the whole configuration as a JSON string, with the '-j' or<BR>
'--config' option:

````javascript

	toaster -wdj '{"folders":{"src":""},"expose":"window","release":"app.js","debug":"app-debug.js"}'
````

# Examples

You'll certainly find some useful resources in the examples provided.
Examine it and you'll understand how things works more instinctively.

Install coffee-toaster, clone the usage example and try different config options, always looking for the differences in your javascript release file.

> [Single folder example](https://github.com/serpentem/coffee-toaster/tree/master/examples/single-folder)<BR>
> [Multi folder example](https://github.com/serpentem/coffee-toaster/tree/master/examples/multi-folder)<BR>
> [API example](https://github.com/serpentem/coffee-toaster/tree/master/examples/introspection)<BR>

# API

You can use Toaster through API as well, in case you want to power up your compiling tasks or even build some framework/lib on top of it.

See the API example for further information.
 > [API example](https://github.com/serpentem/coffee-toaster/tree/master/examples/introspection)

````ruby

	Toaster = require("coffee-toaster").Toaster
	
	toasting = new Toaster basedir, options, skip_initial_build
	toasting.build header_code_injection, footer_code_injection
````

# Contributing

## Setting everything up

````bash
	git clone git://github.com/serpentem/coffee-toaster.git && cd coffee-toaster
	git submodule update --init
	npm link
````

## Watch'n'compile mode

Starts watching/compiling using a previuos version of the CoffeeToaster itself.

````bash
	npm start
````

# Issues

Do not hesitate to open a feature request or a bug report.
> https://github.com/serpentem/coffee-toaster/issues

# Mailing List

A place to talk about it, ask anything, get in touch. Luckily you'll be answered sooner than later.
> https://groups.google.com/group/coffee-toaster

NOTE: The list is active and maintained, though the low activity.

# Changelog

> [CHANGELOG.md](https://github.com/serpentem/coffee-toaster/tree/master/CHANGELOG.md)