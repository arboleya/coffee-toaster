# CoffeeToaster Changelog

## 0.1.2 - 09/17/2011
 * Fixing compilation method that was requiring coffee-script to be installed.
 * Adding precise error handling
 * Checking circular dependency conflicts (closing issue [#2](http://github.com/serpentem/coffee-toaster/issues/2))

## 0.1.1 - 09/16/2011
 * Adding basic error handling (closing issue [#1](http://github.com/serpentem/coffee-toaster/issues/1))

## 0.1.0 - 09/11/2011
 * Scaffolding routine for new projects
 * Scaffolding routine for configuration file (toaster.coffee)
 * Dependency handlers:
  * Extends directive (class A extends B)
  * Include directive (#<< ClassNameA, ClassNameB..)