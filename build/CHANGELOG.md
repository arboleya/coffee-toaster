# Changelog

## 0.6.6 - 12/15/2012
 * Desmistifying conflicts betweeen Toaster and VIM [closing issue [#46](https://github.com/serpentem/coffee-toaster/issues/47)]
 * Making toaster cross-platform (Osx, Linux, Win7) [closing issues [#29](https://github.com/serpentem/coffee-toaster/issues/29) and [#30](https://github.com/serpentem/coffee-toaster/issues/30)]
 * Effectively restarting toaster after `toaster.coffee` file is edited.

## 0.6.5 - 11/27/2012
 * Fixing generators [closing issue [#46](https://github.com/serpentem/coffee-toaster/issues/46)]

## 0.6.4 - 11/18/2012
 * Adding test for initializing existent projects
 * Fixing GROWL icons path

## 0.6.3 - 07/01/2012
 * Fixing example 'package.' again (the zombie bug)
 * Fixing line number evaluation [closing issue [#26](http://github.com/serpentem/coffee-toaster/issues/26)]
 * Fixing 'c' / '--compile' option [closing issue [#27](http://github.com/serpentem/coffee-toaster/issues/27)]
 * Adding first test (finally)

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
