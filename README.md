# Coffee Toaster (current version - 0.2.2)

Minimalist dependency management system for CoffeeScript.

# Features

* Inheritance support across multiples files for the lazy
* Automatic packaging system, with folder as namespaces
* Scaffolding routines
 * Interactive creation of a very simple skeleton for new projects and config file for existent projects
* Broken and Circular Loop dependency validation
 * Helps you prevent some mistakes with circular dependencies loops and alert you against dependencies not found
* Live syntax-check
 * Precise live check for compile problems (syntax-only), with file path and line number information
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

The toaster.coffee file will have this content:\

````ruby
modules =
	name: 'mynewapp'
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

To see all CoffeeToaster can do for you, after creating or toasting a new project, enter in the project folder and type 'toaster':

	cd existing-project
	toaster -w

Or:

	toaster -w existing-project

# Debug Mode

In debug mode (option -d) files will be all compiled individually inside a folder called "toaster" in the same directory you have your release file, aiming to ease the debugging process.

For example, if you have "release/app.js", a folder will be created in "/release/toaster" and all your CoffeeScript files will be copileted to Javascript inside "release/toaster/classes/".

Bellow is a directory structure representing this:

	├── /release
	│   ├── app.js
	│   ├── index.html
	│   └── /toaster
	│       ├── /classes
	│       │   ├── /a
	│       │   │   ├── a.js
	│       │   │   └── /b
	│       │   │       └── b.js
	│       │   └── c.js
	│       └── toaster.js
	├── /src
	│   ├── /a
	│   │   ├── a.coffee
	│   │   └── /b
	│   │       └── b.coffee
	│   └── c.coffee
	└── toaster.coffee

There's also a 'toaster.js' file inside the 'release/toaster' folder, this Javascript file is responsible to load all your classes into the right order.

So in your .html your have to options:

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

If debug is enabled (-d option), files will also compiled individually for a sane debugging routine, inside the browser.

Every time something changes, CoffeeToaster re-compiles all your application by doing:

 * collects all .coffee files and process everything, adding package declarations to the class definitions, based on the folder they are
 * re-order everything so classes are defined always before they are needed

Wait! How the hell it know when classes are needed?

## Import directive

The import directive is known by:

 * #<< core.views.View
 * #<< utils.*

By putting '#<< package.name.View' in your CoffeeScript file, you're telling CoffeeToaster about a dependency.

Wild cards '#<< utils.*' are also accepted as a handy option.		

## Example

Let's assume you have four files in this structure (a.coffee, b.coffee and c.coffee):

	├── release
	│   └── app.js
	├── src
	│   ├── just
	│   │   └── another
	│   │       └── one
	│   │           └── c.coffee
	│   ├── some
	│   │   ├── folder
	│   │   │   └── a.coffee
	│   │   └── other
	│   │       └── folder
	│   │           └── b.coffee
	│   └── top.coffee
	└── toaster.coffee

With the following contents:

**some/folder/a.coffee**

````ruby
#<< some.other.folder.B
#<< just.another.one.*

class A extends B
	constructor:->
		console.log "C created"
		console.log new C
		console.log new just.another.one.C
````

**some/other/folder/b.coffee**

````ruby
class B
	constructor:-> console.log "B created"
````

**just/another/one/c.coffee**

````ruby
class C
	constructor:-> console.log "C created"
````

This way, everything will be merged like this:

**buffer**

````ruby
some = {}
just = {}

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
				cur = curr[ part ]
	curr
	
pkg( 'some.other.folder' ).B = class B
	constructor:-> console.log "B created"
pkg( 'just.another.one' ).C = class C
	constructor:-> console.log "C created"
#<< some.other.folder.B
#<< just.another.one.*

pkg( 'some.folder' ).A = class A extends B
	constructor:->
		console.log "A created"
		console.log new C
		console.log new just.another.one.C
		console.log new B
		console.log new just.another.one.B
		console.log new some.other.folder.one.B
class Top
	constructor: -> console.log "Top created!"
````

As you can see toaster will initialize your root namespaces and add a 'pkg' method, to make everything works as intended.

## Output (JavaScript)

The output JavaScript compiled after reordering classes will be something like this:

````javascript
(function() {
  var A, B, C, Top, just, pkg, some;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  some = {};
  just = {};
  pkg = function(ns) {
    var cur, curr, index, part, parts, _len;
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
          cur = curr[part];
        }
      }
    }
    return curr;
  };
  pkg('some.other.folder').B = B = (function() {
    function B() {
      console.log("B created");
    }
    return B;
  })();
  pkg('just.another.one').C = C = (function() {
    function C() {
      console.log("C created");
    }
    return C;
  })();
  pkg('some.folder').A = A = (function() {
    __extends(A, B);
    function A() {
      console.log("A created");
      console.log(new C);
      console.log(new just.another.one.C);
      console.log(new B);
      console.log(new just.another.one.B);
      console.log(new some.other.folder.one.B);
    }
    return A;
  })();
  Top = (function() {
    function Top() {
      console.log("Top created!");
    }
    return Top;
  })();
}).call(this);
````

As you can see, things are ordered properly, then you can have your application's tree all tied up with a single start point.

# Multiple Modules

You can also specify multiple modules lilke:

````ruby
modules = [
	{
		name: "My Awesome App"
		src: "src"
		release: "release/app.js"
	},{
		name: "My Sub Awesome App"
		src: "vendors/mysubapp"
		release: "release/subapp.js"
	}
]
````

# Mailing List

A place to talk about it.

https://groups.google.com/group/coffee-toaster