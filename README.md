![Coffee Toaster](http://github.com/serpentem/coffee-toaster/blob/0.5.0/images/toaster.png?raw=true)

Version 0.5.0

CoffeeToaster is a dependency manager and build system for CoffeeScript.

The main purpose is to provide a very comfortable environment to code large<BR>
libraries using such things as class definitions and namespaces, in order to<BR>
to help avoid naming collisions in your architecture.

A smart 'require' powered by wild-cards is also provided, together with a<BR>
powerful build system that concatenates everything and outputs a single<BR>
javascript release file that can be even minified if you like.

The build system was developed to offer vendors support as well as merging<BR>
routines for multiple modules, with specific ordering options. If you are<BR>
adept of the extends directive in CoffeeScript, Toaster will even check if<BR>
you have required base classes for the classes that extends another.

The CLI program informs you about everything that is happening when a new<BR>
file is created, deleted or modified. You can even drag'n'drop a folder with<BR>
lots of CoffeeScript files inside your source folder and everything will be<BR>
handled gracefully.

If you are building for the browser you can use the debug option to compile<BR>
everything individually -- plus, node targeted support is on the way. In <BR>
debug mode you'll be gifted with a boot-loader that will load every file in<BR>
the proper order according your needs.

Keep on reading this README, and please do not hesitate to open a feature<BR>
request or a bug report.<BR>
https://github.com/serpentem/coffee-toaster/issues

In case of any doubts, drop an email at the email group and luckily you'll<BR>
be answered sooner than later.<BR>
https://groups.google.com/group/coffee-toaster

# Features

* Inheritance support across multiples files for the lazy
 * You can require any file whenever your want to.
* Vendors management
* Multiple modules support in the same environment
* Micro build routines across all modules and vendors
* Packaging System & Namespaces
 * Automagic packaging system that uses folders as namespaces, 
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
 and a smart boot-loader (toaster.js) is provided to load every file<BR>
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

1. **name** - The name of your main module.
  * i.e.: mynewapp
1. **src** - The source folder for your main module -- the path can be<BR>
relative or absolute.
  * i.e.: src
1. **release** - The release file for your main module -- the path can be<BR>
relative or absolute.
  * i.e.: release/app.js

Considering all the default values, you'll end up with a structure as such:

	├── /mynewapp
	    ├── /release
	    ├── /src
	    └── toaster.coffee

The toaster.coffee file will have this content:

````ruby
module 'basic'
	# mandatory config
	src: 'src'
	release: 'release/app.js'

	# optional config
	vendors: []
	bare: false # default=false
	packaging: true # default=false
	exports: false # default=false
	minify: false # default=false
````


## Toasting an existing project

Your can toast an existing project as such:

	cd existing-project
	toaster -i

Or:

	toaster -i existing-project

The same information (name, src, release) will be required -- answer<BR>
everything according to your project's structure.

A 'toaster.coffee' file will be created inside it.

## When the magic happens

To see all that CoffeeToaster can do for you, enter the project folder and<BR>
type 'toaster -w' after creating or toasting a new project:

	cd existing-project
	toaster -w

Or:

	toaster -w existing-project

Your release file will be saved according to your needs.

# Debug Mode

In debug mode (option -d) all files will be compiled individually inside a<BR>
folder called "toaster" in the same directory you have your release file,<BR>
aiming to ease the debugging process.

	cd existing-project
	toaster -wd

For example, if you have "release/app.js", a folder will be created in<BR>
"release/toaster" and all your CoffeeScript files will be compiled to<BR>
Javascript within.

Bellow is a representative directory structure:

	├── release
	│   ├── app.js
	│   ├── index.html
	│   └── toaster
	│       ├── src
	│       │   ├── app.js
	│       │   ├── letters
	│       │   │   ├── a.js
	│       │   │   └── b.js
	│       │   ├── repeating
	│       │   │   └── a.js
	│       │   └── single
	│       │       └── script.js
	│       └── toaster.js
	├── src
	│   ├── app.coffee
	│   ├── letters
	│   │   ├── a.coffee
	│   │   └── b.coffee
	│   ├── repeating
	│   │   └── a.coffee
	│   └── single
	│       └── script.coffee
	└── toaster.coffee

There's also a 'toaster.js' file inside the 'release/toaster' folder which<BR>
is responsible to load all your files into the right order.

So in your .html you'll have two options:

**1)** Include your release file (release/app.js)

````html
	<script src="app.js"></script>
````
 
**2)** Include the toaster boot-loader (release/toaster/toaster.js)

````html
	<script src="toaster/toaster.js"></script>
````


# How does everything work?

CoffeeToaster will create a file called 'toaster.coffee' in your app main folder.

## Config File (toaster.coffee)

This file contains information on the modules you have in your app, i.e:

````ruby
module 'my_awesome_app'

	# mandatory config
	src: 'src'
	release: 'release/app.js'
	
	# optional config
	vendors: []
	bare: false # default=false
	packaging: true # default=false
	exports: false # default=false
	minify: false # default=false
````

So when you call 'toaster -w' in this directory, this config is loaded and<BR>
every file and folder inside 'src' folder will be watched.

If debug is enabled (option -d), files will be also compiled individually<BR>
for a sane debugging routine, inside the browser.

Every time something changes, CoffeeToaster re-compiles all of your<BR>
application by:

* collecting all .coffee files and processing everything, adding package<BR>
declarations to class definitions, based on the folder they are located
* re-ordering everything, always defining files and classes before<BR>
they're needed

Hold it! How the hell does it know when my files or classes are needed?

## Import directive

The import directive is known by:

 * #<< mvc/views/user_view
 * #<< utils/*

By putting '#<< package/name/View' in your CoffeeScript file, you're telling<BR>
CoffeeToaster that there's a dependency.

Wild cards '#<< utils/*' are also accepted as a handy option.

## Vendors

You can define vendors such as:

````ruby
vendor 'jquery', 'vendors/jquery.js'
vendor '_', 'vendors/_.js'
````

Basically you name it and inform where it is, and the file must be purely<BR>
in javascript, preferably minified ones -- Toaster will not compile or<BR>
minify them, only concatenate everything.


## Multi Modules

You can have as many modules as you want such as:

````ruby
module 'foo'
	src: 'foo'
	release: 'release/foo.js'

module 'boo'
	src: 'boo'
	release: 'release/boo.js'
````

In order to concatenate multiple modules, you will need to use build routines.

## Build Routines

Build routines are simple specifications where you tell Toaster how to build<BR>
your library. You can have as many modules and vendors as you want.

````ruby
vendor 'jquery', 'vendors/jquery.js'
vendor '_', 'vendors/_.js'

module 'foo'
	src: 'foo'
	vendors: ['jquery', "_"]
	release: 'release/foo.js'

module 'boo'
	src: 'boo'
	vendors: ['jquery','_']
	release: 'release/boo.js'

build 'foo_first_then_boo'
	modules: ['foo', 'boo']
	release: 'release/animals_insects.js'

build 'boo_first_then_foo'
	modules: ['boo', 'foo']
	release: 'release/insects_animals.js'
````

Note that the array order you choose when informing the modules for your<BR>
build will be preserved.

## Minify Support

To minify you release file all you need to do is turn on the minify<BR>
property in the 'toaster.coffee' file for your desired module.

````ruby
module 'foo'
	src: 'foo'
	release: 'release/foo.js'
	minify: true
````

# Examples

You'll certainly find some useful resources in the two examples provided.<BR>
Examine them and you'll understand how things works more instinctively.

Install coffee-toaster, clone the examples and try different config options<BR>
always looking for the differences in your javascript release file.

## Basic Example

This example uses:

* One single module
* Two vendors

There are files and classes with the same name to show the packaging system.

The packaging system will address every class definition to a namespace,that<BR>
is computed automatically according to the path where your physical file is.

Imagine that you have a class "Foo" inside a "my/path/foo.coffee" file. This<BR>
class will be addressed to the namespace "my.path", so you can instantiate it:

	# usual way
	new Foo
	
	# unique way using the packaging system
	new my.path.Foo

> [Source Code](https://github.com/serpentem/coffee-toaster/tree/master/examples/basic)

## Multi-Modules Example

This example uses:

* Two modules
* Two vendors
* Two build-configs with different merging options to show possibilities

The packaging system is enabled here as well, but you can always turn it off<BR>
to see what happens, try different options and do not forget to check the<BR>
differences in your javascript release file.

> [Source Code](https://github.com/serpentem/coffee-toaster/tree/master/examples/multi-modules)

# Issues

Do not hesitate to open a feature request or a bug report.<BR>
https://github.com/serpentem/coffee-toaster/issues

# Mailing List

A place to talk about it, ask anything, get in touch. Luckily you'll<BR>
be answered sooner than later.<BR>
https://groups.google.com/group/coffee-toaster

# Changelog

## 0.5.0 - ?
 * Log messages revamped
 * Growl integration implemented
 * Export aliases - export your definitions to another scope
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