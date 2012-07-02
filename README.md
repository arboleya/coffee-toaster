![Coffee Toaster](http://github.com/serpentem/coffee-toaster/blob/0.5.0/images/toaster.png?raw=true)

Version 0.6.2

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

If true, use all your folders as namespaces to your class definitions.

If you have class 'Lovage' declared inside the "artists/triphop" folder, you<BR>
can access it through 'artists.triphop.Lovage'.

````javascript

	# usual way
	new Lovage
	
	# with packaging=true
	new artists.triphop.Lovage
````

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


# Issues

Do not hesitate to open a feature request or a bug report.<BR>
https://github.com/serpentem/coffee-toaster/issues

# Mailing List

A place to talk about it, ask anything, get in touch. Luckily you'll<BR>
be answered sooner than later.<BR>
https://groups.google.com/group/coffee-toaster

# Changelog
## 0.6.2 - 06/25/2012
 * Fixing last upgrade in self-toasting system
 * Adjusting everything for self-toasting at version 0.6.2

## 0.6.1 - 06/16/2012
 * Adjusting everything for self-toasting at version 0.6.0
 * Fixing example package.json file that was broken npm installation

## 0.6.0 - 06/16/2012
 * Adding 'exclude' property to config file
 * Improving and fixing a bunch of things
 * Completely refactoring fs-util to improve it's usage and avoid memory-leak
 * Organizing single-folder and multi-folder examples
 * Standardizing API for javascript usage
 * Adding 'introspection' example with many javascript uses

## 0.5.5 - 04/19/2012
 * Config file was re-written to be more practical
 * Build routines removed in favor of simplicity
 * Multi-modules option is default now, without configuring anything
 * HTTP Folder property added to 'toaster.coffee' config file
 * Scaffolding routines improved according the design changes

## 0.5.0 - 04/12/2012
 * Packaging system completely revamped
 * Added some beauty to log messages
 * Growl integration implemented
 * Expose / Export aliases - export/expose your definitions to another scope
 * Minify support added
 * On/Off switches for:
  * Bare option to compile CoffeeScript with the 'bare' option
  * Packaging system
  * Minify

## 0.3.8 - 10/29/2011
 * Fixing bugs in generators
 * Fixing a bunch of small emergencial bugs

## 0.3.7 - 10/29/2011
 * Simplify config file syntax [feature done [#8](https://github.com/serpentem/coffee-toaster/issues/8)]
 * Adding buid routines [feature done [#9](https://github.com/serpentem/coffee-toaster/issues/9)]
 * Adding support for vendors across modules and build configs [feature [#10](https://github.com/serpentem/coffee-toaster/issues/10)]

## 0.3.6 - 10/25/2011
 * Critical bugfixes in the reorder routine
 * Optimizing architecture
 * Condensing src scructure

## 0.3.5 - 10/24/2011
 * Avoiding tmp files from being watched [closing issue [#4](http://github.com/serpentem/coffee-toaster/issues/4)]
 * Adding support for ordinary files again (with no class definitions inside)
 * Now all requirements must to be done based on filepath with slash<BR>
notation "foldera/folderb/filename"
 * Adding extra base class validation
 * Lots of improvements and bugfixes

## 0.3.0 - 10/16/2011
 * Refactoring entire Script class
 * Support for extends directive have been removed, now all dependencies<BR>
must be informed through '#<< package.name.ClassName'
 * Support for files without class declarations was (sadly) removed
 * Adding full package support automagically
 * Implementing wild-cards on requirements '#<< package.name.*'

## 0.2.2 - 10/02/2011
 * Starting tests implementation (using Vows BDD)
 * Implementing debug mode (-d --debug). Files are compiled individually<BR>
plus a boot file (toaster.js) file that will load everything in the right order.
 * Improving interactive processes to become good guessers
 * Adding support for file requirements based on 'a/b/c/filepath'<BR>
simultaneously with class requirements based in 'ClassName' notation (both<BR>
are case sensitive)
 * Bumping 'build/coffee-toaster' submodule to use tag 0.2.2 (level up)

## 0.2.1 - 09/22/2011
 * Implementing OptionParser (using Optimist)

## 0.2.0 - 09/18/2011
 * Tag 0.1.2 is now used as submodule in order to self-toast (aka manage<BR>
dependencies) of new versions of CoffeeToaster itself, starting from now
 * Refactoring everything, classes are now one per file, using dependency<BR>
directives from CoffeeToaster itself. From now on, things should evolve<BR>
a little easier.
 * Individualizing CoffeeScript handling
 * Starting plans for CoffeeKup and CoffeeCss support

## 0.1.2 - 09/17/2011
 * Fixing compilation method that was requiring coffee-script to be installed
 * Adding precise error handling
 * Checking circular dependency conflicts [closing issue [#2](http://github.com/serpentem/coffee-toaster/issues/2)]

## 0.1.1 - 09/16/2011
 * Adding basic error handling [closing issue [#1](http://github.com/serpentem/coffee-toaster/issues/1)]

## 0.1.0 - 09/11/2011
 * Scaffolding routine for new projects
 * Scaffolding routine for configuration file (toaster.coffee)
 * Dependency handlers:
  * Extends directive (class A extends B)
  * Include directive (#<< ClassNameA, ClassNameB..)
