# Coffee Toaster (current version - 0.2.0)

Minimalist dependency management system for CoffeeScript.

# Features

 * Inheritance support across multiples files for the lazy
  * Just use your extends as you do, dependencies will be resolved automagically.
  * Or add explicit requirements with the simplest possible syntax:
   * #<< ClassName
   * #<< ClassNameA, ClassNameB
 * Scaffolding routines
  * Interactive creation of a very simple skeleton for new projects
  * Interactive creation of new config file for existent projects
 * Circular-dependency validation
  * Helps you prevent some mistakes
 * Live syntax-check
  * Precise live check for compile problems (syntax-only), with file path and line number informations.

# Installation

	npm install -g coffee-toaster

# Usage

## Creating a new App

CoffeeToaster suggests a very simple structure for initial projects, you can customize it as you like.

	toaster -n mynewapp

You will be asked for some things:

1. **name** - The name of your main module.
  * i.e.: mynewapp
1. **src** - The source folder for your main module
  * i.e.: src
1. **release** - The release file for your main module
  * i.e.: release/app.js

Your scructure will be create with a 'toaster.coffee' file inside it.

## Toasting an existing project

Your can toast an existent project like this:

	cd existing-project
	toaster

Or:

	toaster existing-project

The same questions (name, src, release) will be made, answer everything according your project structure.

A 'toaster.coffee' file will be created inside it.

## When the magic happens

To see all CoffeeToaster can do for you, after creating or toasting a new project, enter in the project folder and type 'toaster':

	cd existing-project
	toaster

Or:

	toaster existing-project

# How everything works?

CoffeeToaster will write a file called 'toaster.coffee' in your app main folder.

## Config File (toaster.coffee)

This file contains informations about the modules you have in your app, i.e:

	modules = 
		name: "My Awesome App"
		src: "src"
		release: "release/app.js"


So you when you call 'toaster' inside this directory, every file and folder start being watched.

Every time something changes, CoffeeToaster re-compiles all your application by doing:

 * merges all *.coffee file into a single string buffer
 * split all classes into arrays
 * re-order everything so classes are defined always before they are needed.

Wait! How the hell it know when classes are needed?

## Extends directive

Every time you use 'class A extends B', CoffeeToaster reads the dependency -- "B" in this case -- and put it B before A, automagically.

Of course, there must to be some file with the 'class B' declared inside of it, in your src folder.

## Import directive

The import directive is known by '#<< ClassName' or '#<< ClassNameA, ClassNameB'.

By putting '#<< ClassNameA' in your CoffeeScript file, you're telling CoffeeToaster about a dependency.

Dependencies required in this method will be placed **after** the 'extended' one.

For example, let's assume you have three files:

**a.coffee**

	#<< C
	class A extends B
		constructor:->
			console.log "C created"
			console.log new C

**b.coffee**

	class B
		constructor:-> console.log "B created"

**c.coffee**

	class C
		constructor:-> console.log "C created"

This way, everything will be merged in an order like this:

**buffer**

	class B
		constructor:-> console.log "B created"
	class C
		constructor:-> console.log "C created"
	class A extends B
		constructor:->
			console.log "C created"
			console.log new C

## Output (JavaScript)

The output JavaScript compiled after reordering classes will be something like this:

	(function() {
	  var A, B, C;
	  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
	    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
	    function ctor() { this.constructor = child; }
	    ctor.prototype = parent.prototype;
	    child.prototype = new ctor;
	    child.__super__ = parent.prototype;
	    return child;
	  };
	  B = (function() {
	    function B() {
	      console.log("B created");
	    }
	    return B;
	  })();
	  C = (function() {
	    function C() {
	      console.log("C created");
	    }
	    return C;
	  })();
	  A = (function() {
	    __extends(A, B);
	    function A() {
	      console.log("C created");
	      console.log(new C);
	    }
	    return A;
	  })();
	}).call(this);

As you can see, things are ordered properly, then you can have your application's tree all tied up with a single start point.

# Multiple Modules

You can also specify multiple modules lilke:

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

# Mailing List

A place to talk about it.

https://groups.google.com/group/coffee-toaster