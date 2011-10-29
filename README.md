# Coffee Toaster (current version - 0.3.7)

Minimalist dependency management system for CoffeeScript.

# Features

* Inheritance support across multiples files for the lazy
* Vendors management
* Multi modules support in the same environment
* Micro build routines across all modules
* Namespaces
 * Automagic packaging system that uses folders as namespaces
* Scaffolding routines
 * Interactive creation of a very simple skeleton for new projects and config file for existent projects
* Broken and circular-loop dependency validation
 * Helps you prevent some mistakes with circular dependencies loops and alert you against dependencies not found
* Live syntax-check
 * Precise live syntax-check with file path and line number information
* Debug Mode
 * In order to provide easy debugging when inside the browser, Debug Mode will compile all your files individually into its respectives .js versions and write a smart boot-loader (toaster.js) to load every file in the proper order. Just include this boot-loader in your html file and voilà


# Installation

	npm install -g coffee-toaster

# Usage

## Creating a new App

CoffeeToaster suggests a very simple structure for initial projects, you can customize it as you like.

	toaster -n mynewapp

You will be asked for some things:

1. **name** - The name of your main module.
  * i.e.: mynewapp
1. **src** - The source folder for your main module, it can be relative or absolute.
  * i.e.: src
1. **release** - The release file for your main module, can be relative or absolute.
  * i.e.: release/app.js

Considering all the default values, you'll end up with a structure like this:

	├── /mynewapp
	    ├── /release
	    ├── /src
	    └── toaster.coffee

The toaster.coffee file will have this content:

````ruby
module 'mynewapp'
	src: 'src'
	release: 'release/app.js'
````


## Toasting an existing project

Your can toast an existent project like this:

	cd existing-project
	toaster -i

Or:

	toaster -i existing-project

The same questions (name, src, release) will be made, answer everything according your project structure.

A 'toaster.coffee' file will be created inside it.

## When the magic happens

To see all CoffeeToaster can do for you, after creating or toasting a new project, enter in the project folder and type 'toaster -w':

	cd existing-project
	toaster -w

Or:

	toaster -w existing-project

# Debug Mode

In debug mode (option -d) files will be all compiled individually inside a folder called "toaster" in the same directory you have your release file, aiming to ease the debugging process.

For example, if you have "release/app.js", a folder will be created in "release/toaster" and all your CoffeeScript files will be compiled to Javascript inside it.

Bellow is a directory structure representing this:

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

There's also a 'toaster.js' file inside the 'release/toaster' folder, this Javascript file is responsible to load all your files into the right order.

So in your .html your have two options:

**1)** Include your release file (release/app.js)

````html
	<script src="app.js"></script>
````
 
**2)** Include the toaster boot-loader (release/toaster/toaster.js)

````html
	<script src="toaster/toaster.js"></script>
````


# How everything works?

CoffeeToaster will write a file called 'toaster.coffee' in your app main folder.

## Config File (toaster.coffee)

This file contains informations about the modules you have in your app, i.e:

````ruby
modules = 
	name: "My Awesome App"
	src: "src"
	release: "release/app.js"
````

So when you call 'toaster -w' inside this directory, this config is loaded and every file and folder inside src folder start being watched.

If debug is enabled (option -d), files will also compiled individually for a sane debugging routine, inside the browser.

Every time something changes, CoffeeToaster re-compiles all your application by doing:

 * collects all .coffee files and process everything, adding package declarations to the class definitions, based on the folder they are
 * re-order everything so files and classes are defined always before they are needed

Wait! How the hell it knows when my files or classes are needed?

## Import directive

The import directive is known by:

 * #<< core/views/View
 * #<< utils/*

By putting '#<< package/name/View' in your CoffeeScript file, you're telling CoffeeToaster about a dependency.

Wild cards '#<< utils/*' are also accepted as a handy option.

## Example - Structure

Let's assume you have this structure:

	├── release
	│   ├── app.js
	│   ├── index.html
	├── src
	│   ├── app.coffee
	│   ├── letters
	│   │   ├── a.coffee
	│   │   └── b.coffee
	│   ├── repeating
	│   │   ├── a.coffee
	│   ├── single
	│   │   └── script.coffee
	└── toaster.coffee

## Example - Contents

And every file with the following contents:

 * **path:** letters/a.coffee

````ruby
class A
	constructor:-> console.log "letters/A created!"
````

 * **path:** letters/b.coffee

````ruby
class B
	constructor:-> console.log "letters/B created!"
````

 * **path:** repeating/a.coffee

````ruby
class A
	constructor:-> console.log "repeating/A created!"
````

 * **path:** single/script.coffee

````ruby
console.log "I am a script!"
````

 * **path:** app.coffee

````ruby
#<< letters/*
#<< repeating/a
#<< single/script

class App
	constructor:->
		console.log "App created!"

		new letters.A
		new letters.B
		new repeating.A

new App
````

## Example - Merge Result (still CoffeeScript)

This way, everything will be merged like this:

````ruby
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

pkg( 'letters' ).A = class A
	constructor:-> console.log "letters/A created!"

pkg( 'letters' ).B = class B
	constructor:-> console.log "letters/B created!"

pkg( 'repeating' ).A = class A
	constructor:-> console.log "repeating/A created!"

console.log "I am a simple script!"

class App
	constructor:->
		console.log "App created!"

		new letters.A
		new letters.B
		new repeating.A

new App
````

Toaster will initialize your root namespaces and add a 'pkg' method, to make everything works as intended.

## Example - Output (JavaScript)

The output JavaScript compiled after reordering files and classes will be something like this:

````javascript
(function() {
  var A, App, B, letters, pkg, repeating, single;
  letters = {};
  repeating = {};
  single = {};
  pkg = function(ns) {
    var curr, index, part, parts, _len;
    curr = null;
    parts = [].concat = ns.split(".");
    for (index = 0, _len = parts.length; index < _len; index++) {
      part = parts[index];
      if (curr === null) {
        curr = eval(part);
        continue;
      } else {
        if (curr[part] == null) {
          curr = curr[part] = {};
        } else {
          curr = curr[part];
        }
      }
    }
    return curr;
  };
  pkg('letters').A = A = (function() {
    function A() {
      console.log("letters/A created!");
    }
    return A;
  })();
  pkg('letters').B = B = (function() {
    function B() {
      console.log("letters/B created!");
    }
    return B;
  })();
  pkg('repeating').A = A = (function() {
    function A() {
      console.log("repeating/A created!");
    }
    return A;
  })();
  console.log("I am a simple script!");
  App = (function() {
    function App() {
      console.log("App created!");
      new letters.A;
      new letters.B;
      new repeating.A;
    }
    return App;
  })();
  new App;
}).call(this);
````
As you can see things are ordered properly.

## Example - Log

Executing the above script in the browser I got this log msgs:

	I am a simple script!
	App created!
	letters/A created!
	letters/B created!
	repeating/A created!

# Example - more

You can find another example right into the [examples](http://github.com/serpentem/coffee-toaster/blob/master/examples) folder.

# Multiple Modules

You can also specify multiple modules lilke:

````ruby
module "my-awesome-module"
	src: "src"
	release: "release/module.js"

module "my-super-awesome-module"
	src: "super_src"
	release: "release/super_module.js"
````

# Changelog

Please check the [CHANGELOG.md](http://github.com/serpentem/coffee-toaster/blob/master/build/CHANGELOG.md)

# Mailing List

A place to talk about it.

https://groups.google.com/group/coffee-toaster