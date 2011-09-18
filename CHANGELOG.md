# CoffeeToaster Changelog

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