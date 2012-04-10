# CoffeeToaster Changelog

## 0.3.8 - 10/04/2012
 * Fixing inheritance
 * "Solving" npm install (weird behaviour)

## 0.3.8 - 10/29/2011
 * Fixing bugs in generators
 * Fixing a bunch of small emergencial bugs

## 0.3.7 - 10/29/2011
 * Simplify config file syntax [feature done [#8](https://github.com/serpentem/coffee-toaster/issues/8)]
 * Adding buid routines [feature done [#9](https://github.com/serpentem/coffee-toaster/issues/9)]
 * Adding support for vendors across modules and build configs [feature done [#10](https://github.com/serpentem/coffee-toaster/issues/10)]

## 0.3.6 - 10/25/2011
 * Critical bugfixes in the reorder routine
 * Optimizing architecture
 * Condensing src scructure

## 0.3.5 - 10/24/2011
 * Avoiding tmp files from being watched [closing issue [#4](http://github.com/serpentem/coffee-toaster/issues/4)]
 * Adding support for ordinary files again (files with no class definitions inside)
 * Now all requirements must to be done based on filepath with slash notation "foldera/folderb/filename"
 * Adding extra base class validation
 * Lots of improvements and bugfixes

## 0.3.0 - 10/16/2011
 * Refactoring entire Script class
 * Support for extends directive have been removed, now all dependencies must be informed through '#<< package.name.ClassName'
 * Support for files without class declarations was (sadly) removed
 * Adding full package support automagically
 * Implementing wild-cards on requirements '#<< package.name.*'

## 0.2.2 - 10/02/2011
 * Starting tests implementation (using Vows BDD)
 * Implementing debug mode (-d --debug). Files are compiled individually plus a boot file (toaster.js)  file that will load everything in the right order.
 * Improving interactive processes to become good guessers
 * Adding support for file requirements based on 'a/b/c/filepath' simultaneously with class requirements based in 'ClassName' notation (both case sensitive)
 * Bumping 'build/coffee-toaster' submodule to use tag 0.2.2 (level up)

## 0.2.1 - 09/22/2011
 * Implementing OptionParser (using Optimist)

## 0.2.0 - 09/18/2011
 * Tag 0.1.2 is now used as submodule in order to self-toast (aka manage dependencies) of new versions of CoffeeToaster itself, starting from now
 * Refactoring everything, classes are now one per file, using dependency directives from CoffeeToaster itself. From now on, things should evolve a little easier.
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