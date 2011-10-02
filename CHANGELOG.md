# CoffeeToaster Changelog

## 0.2.2 - ?
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