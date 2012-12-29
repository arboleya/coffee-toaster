![Coffee Toaster](http://github.com/serpentem/coffee-toaster/blob/0.5.0/images/toaster.png?raw=true)

Minimalist build system for CoffeeScript.
> Version 0.6.10

[![Build Status](https://secure.travis-ci.org/serpentem/coffee-toaster.png)](http://travis-ci.org/serpentem/coffee-toaster)

# Features

* Inheritance support across multiples files for the lazy
* Vendors management
* Automagically packaging system with namespaces
* Micro build routines
* Exports aliases
* Broken and circular-loop dependencies validation
* Live syntax-check
* Growl support
* Debug Mode
* Minify support
* Scaffolding routines

# Issues
Do not hesitate to open a feature request or a bug report.
> https://github.com/serpentem/coffee-toaster/issues

# Mailing List
A place to talk about it, ask anything, get in touch. Luckily you'll be answered
sooner than later.

> https://groups.google.com/group/coffee-toaster

*NOTE: The list is `active` and `maintained`, though the low activity. So don't
be shy.*

# About

Minimalist build system for CoffeeScript, made for those who dare to use class
definitions in CoffeeScript while being able to easily inherit from external
files. The system is powered with import directives that uses wildcards
facilities, exposed scopes, excluded files filter options and a packaging system
that can inject your folders-as-namespaces to all your classes based on where
they are under your src folder.

CoffeeToaster was created initially as a base for creating the
[Theoricus Framework](https://github.com/serpentem/theoricus).


# Docs

 - [Installing](#installing)
 - [Scaffolding](#scaffolding)
   - [Initializing new app](#initializing-new-app)
   - [Initializing config file](#initializing-config-file)
 - [Usage](#usage)
   - [Import directive](#import-directive)
   - [Compile](#compile) `-c`
   - [Watch](#watch) `-w`
   - [Debug](#debug) `-cd`, `-wd`
   - [Autorun](#autorun) `-a`, `-ad`
     - [Representative structure](#representative-structure)
   - [HTML inclusion](#html-inclusion)
   - [Advanced options](#advanced-options)
   - [Conclusion](#conclusion)
     - [Note for VIM Users](#vim-users)
 - [Config file](#config-file)
   - [Config options](#config-options)
     - [`folders`](#config-options-folders)
     - [`exclude`](#config-options-exclude)
     - [`vendors`](#config-options-vendors)
     - [`bare`](#config-options-bare)
     - [`packaging`](#config-options-packaging)
     - [`expose`](#config-options-expose)
     - [`minify`](#config-options-minify)
     - [`httpfolder`](#config-options-httpfolder)
     - [`release`](#config-options-release)
     - [`debug`](#config-options-debug)
 - [Examples](#examples)
 - [API](#api)
 - [Contributing](#contributing)
   - [Setup](#setup)
   - [Building](#building)
   - [Watching](#watching)
   - [Testing](#testing)
 - [CHANGELOG](#changelog)

<a name="installing" />
# Installing
----

`npm install -g coffee-toaster`

<a name="scaffolding" />
# Scaffolding
----

There are two simple `scaffolding` routines bundled with CoffeeToaster for
creating new projects structure from the scratch and also for creating the
config `toaster.coffee` file for existent projects.

<a name="initializing-new-app" />
## Initializing new app

CoffeeToaster suggests a very simple structure for initial projects, you can
customize it as you like.

`toaster -n mynewapp`

You will be asked for some things:

> source folder

Relative folderpath to your source folder, default is `src`.

> release file

Relative filepath to your release file, default is `www/js/app.js`

> http folder

The folderpath to reach your debug file through http, default is an `empty
string`. Imagine that the `www` is your root web folder, and inside of it you
have a `js` dir where you put your debug file. In this case you'd just need to
inform 'js' as the http folder. It tells toaster *how to reach your debug js
file* starting from the `/` on your server.

This property is only for **debug**, your *release* file will not be affected.

### Result

Considering all the default values, you'll end up with a structure as such:

````
myawsomeapp/
├── src
├── vendors
├── www
    └── js
└── toaster.coffee

4 directories, 1 file
````

<a name="initializing-config-file" />
## Initializing config file

You can also initialize an existing project with a config `toaster.coffee` file
such as:

````
cd existing-project
toaster -i
````

Some of the same information (`src`, `release` and `httpfolder`) will be
required, answer everything according to your project's structure and a config
`toaster.coffee` file will be created inside of it.

<a name="usage" />
# Usage
----

Toaster help screen.

````
CoffeeToaster
  Minimalist build system for CoffeeScript

Usage:
  toaster [options] [path]

Examples:
  toaster -n myawsomeapp   (required)
  toaster -i [myawsomeapp] (optional)
  toaster -w [myawsomeapp] (optional)
  toaster -wd [myawsomeapp] (optional)

Options:
  -n, --new          Scaffold a very basic new App                   
  -i, --init         Create a config (toaster.coffee) file           
  -w, --watch        Start watching/compiling your project           
  -c, --compile      Compile the entire project, without watching it.
  -d, --debug        Debug mode (compile js files individually)      
  -a, --autorun      Execute the script in node.js after compilation
  -j, --config       Config file formatted as a json-string.           [string]
  -f, --config-file  Path to a different config file.                  [string]
  -v, --version                                                      
  -h, --help 
````

<a name="import-directive"/>
## Import directive

The import directive is known by:

````coffeescript
#<< app/views/user_view
#<< app/utils/*
````

By putting `#<< app/views/user_view` in your CoffeeScript file, you're telling
CoffeeToaster that there's a dependency. It's like a `require`, except that you
can't save a reference of the imported file to a variable. Instead, this
directives shoud be put in the first lines of your files.

This is how you organically tells Toaster about the specific ordering
options to be considered when all of your files get merged. Files imported this
way will only be gracefully sorted out in your final output javascript so
every file is always **defined** before it's **needed**.

Wild cards `#<< app/utils/*` are also accepted as a handy option.

If you're writing a `class B` that will extends the `class A`, you shoud first
import the `class A` so it will be available for being extended by `class B`.

* src/app/a

````coffeescript
class A
  constructor:->
    console.log 'Will be used as base class.'
````

* src/app/b

````coffeescript
#<< app/a
class B extends A
  constructor:->
    console.log 'Using class A as base class'
````

Think of it as a glue that you use to chain all of your files appropriately.

<a name="compiling"/>
## Compile

Compile your project according your [config file](#config-file).

````bash
cd existing-project
toaster -c
````

<a name="watching"/>
## Watch

Starts Toaster in watching'n'compiling mode:

````bash
cd existing-project
toaster -w
````

Any changes you make to your `src` files will trigger the `compile` action.

<a name="debugging"/>
## Debug

In debug mode option `-d` all files will be compiled individually inside a
folder called `toaster` in the same directory you've pointed your debug file,
aiming to ease the debugging process.

````bash
toaster -wd
toaster -cd
````

For example, if you have `release/app-debug.js`, a folder will be created at
`release/toaster` and all your CoffeeScript files will be compiled to Javascript
within.

<a name="representative-structure"/>
### Representative Structure

Bellow is a representative directory structure after compiling in debug mode.

````
/usage
|-- src
|   `-- app
|       |-- controllers
|       |   `-- users_controller.coffee
|       |-- models
|       |   `-- user_model.coffee
|       `-- views
|           `-- user_view.coffee
|-- www
|   `-- js
|       |-- app-debug.js
|       |-- app.js
|       `-- toaster
|           `-- app
|               |-- controllers
|               |   `-- users_controller.js
|               |-- models
|               |   `-- user_model.js
|               `-- views
|                   `-- user_view.js
`-- toaster.coffee
````

Every CoffeeScript file is compiled individually inside the `www/js/toaster`
directory, so you can debug it sanely.

The debug file `www/js/app-debug.js` is the boot-loader responsible for loading
all these individual compiled JS files into the right order.

<a name="autorun"/>
## Autorun

In autorun mode option `-a` the script is recompiled after each file change and 
it is executed in a node.js child process. It is possible to use autorun in 
combination with debug option `-d` to set the script breakpoint on the first line

````bash
toaster -a
toaster -ad
````
to better debug your application via node.js you can use some tools like 
[node-inspector](https://github.com/dannycoates/node-inspector)

<a name="html-inclusion"/>
## HTML inclusion

So in your `.html` you'll have two options:

> 1) Include your release file.

````html
<script src="js/app.js"></script>
````
 
> 2) Include the toaster boot-loader (your debug mode).

````html
<script src="js/app-debug.js"></script>
````

<a name="advanced-options"/>
## Advanced options

You can pass your own config file for toaster instead of the default one
`toaster.coffee`, with the `-f` or `--config-file` option:

````bash
toaster -wdf config/mycustomconfig.coffee
````

*NOTE: It's important that you always call this from your project base folder,
otherwise the paths of your config can get messy. Remembers also that the paths
in your config file shoud ideally be always relative to your project base
folder.*

Alternativelly, you can even pass the whole configuration as a JSON string, with
the `-j` or `--config` option:

````bash
toaster -wdj '{"folders":{"src":""},"expose":"window","release":"app.js","debug":"app-debug.js"}'
````

*NOTE: The same above.*

<a name="conclusion"/>
## Conlusion

Every time something changes, CoffeeToaster recompiles all of your application
by:

* collecting all .coffee files and processing everything, adding namespace's
declarations to class definitions based on the folder they are located
* reordering everything, always defining files and classes before they're needed
* merge all yours vendors in the given order
* declare root namespaces
* merge everything

<a name="vim-users"/>
### VIM Users

Due to the way VIM handles files, you'll need to disable the creation of `swap`
and `backup` files.

To do it, just put these three lines in your `.vimrc`:

``` vim
" for coffee-toaster
set nobackup       " no backup files
set nowritebackup  " only in case you don't want a backup file while editing
set noswapfile     " no swap files
```

This will guarantee the expected behavior of Toaster and make it play nicely
with VIM without any conflicts. For more info about why it's really needed,
please check this [thread](https://github.com/serpentem/coffee-toaster/issues/47).

<a name="config-file" />
# Config file
----

The `toaster.coffee` is the config file from where Toaster seek all information
about your app, vendores, build options and so on. There are two main usages
you can make of this file:

* **1) Single source folder:**

When all your code is bellow one single source folder your set up the main
`toast` call passing the folder path directly.

````coffeescript
# src folder
toast 'src'

  # excluded items (will be used as a regex)
  exclude: ['folder/to/exclude', 'another/folder', '.DS_Store' ]

  # packaging vendors among the code
  vendors: ['vendors/x.js', 'vendors/y.js' ]

  # gereral options (all is optional, default values listed)
  bare: false
  packaging: true
  expose: '' # can be 'window', 'exports' etc
  minify: false

  # httpfolder (optional), release and debug (both required)
  httpfolder: 'js'
  release: 'www/js/app.js'
  debug: 'www/js/app-debug.js'
````

* **2) Multi source folder:**

When your code is splitted between two or more source folders you can set the
main `toast` call without any path, and inform your folders right bellow it.

````coffeescript
toast
  folders:
    'src/my/app/folder': 'app'
    'src/my/lib/folder': 'lib'
    # ...
````

<a name="config-options" />
## Config options

Let's take a closer look at all properties you can have in your `toaster.coffee`
file and what each one of these is responsible of.

<a name="config-options-folders" />
### `folders`

> Mandatory: `no` <BR/>
> Type: `Object` <BR/>
> Default: `null` <BR/>

In case you have more than one `src` folder, you can set an `object` of
`objects` containing setup information about all your source folders, in the
format `'folderpath':'folderalias'`.

The **hash-key** is the `path` of your folder, and the **hash-value** is the
`alias` you want to prepend to all files under that.

*Pay attention to this specially when using Toaster with the '-j'
[option](#advanced-options).*

To give an example, the equivalent use of this config:

````coffeescript
toast 'src'
  # ...
````

Would be:

````coffeescript
toast
  folders:
    'src': ''
````

**NOTE: Aliases take effect only if the [`packaging`](#config-options-packaging)
is set to `true`.**

Aliases lets you set a virtual top namespace to your source folder, if you have
`src/app/app.coffee` which is a `class App`, you'll usually access it using
`new app.App`.

Now if you set an alias like `'src':'awesome'` the whole structure under your
source folder will be addressed under that `awesome` namespace and you need
to prepend it when accessing your classes, i.e. `new awesome.app.App`.

<a name="config-options-exclude" />
### `exclude`

> Mandatory: `no` <BR/>
> Type: `Array` <BR/>
> Default: `[]` <BR/>

Let's you excplicity exclude some folder, file or file type from Toaster
search/process mechanism. The string you use here will effectively turn into
a RegExp like that:

````coffeescript
new RegExp '.DS_store'
new RegExp '.swp'
new RegExp 'my/folder/to/be/excluded'
````

<a name="config-options-vendors" />
### `vendors`

> Mandatory: `no` <BR/>
> Type: `Array` <BR/>
> Default: `[]` <BR/>

You can define vendors such as:

````coffeescript
  vendors: ['vendors/x.js', 'vendors/y.js', ... ]
````

It's an ordered array of all your vendor's paths. These files must be purely
javascript, preferably minified ones -- Toaster will not compile or minify them,
only concatenate everything.

<a name="config-options-bare" />
### `bare`

> Mandatory: `no` <BR/>
> Type: `Boolean` <BR/>
> Default: `false` <BR/>

If `true`, compile your CoffeeScript files without the top-level function safety
wrapper:

````javascript
  (function() {
    console.log('My peace of code!');
  }).call(this);
````

So you will end up with just `your peace of code`:

````javascript
  console.log('My peace of code!');
````

<a name="config-options-packaging" />
### `packaging`

> Mandatory: `no` <BR/>
> Type: `Boolean` <BR/>
> Default: `false` <BR/>

When packaging is `true`, Toaster will rewrite **all** your `class`
declarations.

If you have a file in `src/app/models/user.coffee` with this contents:

````coffeescript
class User
````

Toaster will rewrite your declaration prepending a `namespace` to it, based on
the folder the class is located, resulting -- in this example -- into this:

````coffeescript
class app.models.User
````

This rewriting process is **saved** directly into your `file`. In case you move
this class to another folder, the prepended `namespace` will be rewrited again,
always following your folder structure.

In other words, your don't need to worry about hardcoded namespaces in your
files, because Toaster will handle all the dirty for you.

<a name="config-options-expose" />
### `expose`

> Mandatory: `no` <BR/>
> Type: `String` <BR/>
> Default: `null` <BR/>

If informed, list all you packages of classes in the given scope. If you use
`window` as your expose scope, your classes will be available also in the window
object -- or whatever scope you inform, suck as `exports` if you're building
for NodeJS.

In the end you'll be able to access your files throught this scope where your
classes was exposed.

````coffeescript
new window.app.models.User
new exports.app.models.User
````

<a name="config-options-minify" />
### `minify`

> Mandatory: `no` <BR/>
> Type: `Boolean` <BR/>
> Default: `true` <BR/>

If `true`, minify your release file using UglifyJS.

Debug files are **never** minified.

<a name="config-options-httpfolder" />
### `httpfolder`

> Mandatory: `no` <BR/>
> Type: `String` <BR/>
> Default: `''` <BR/>

The folder path to reach your debug file through http, in case it is not inside
your root directory. Imagine that the `www` is your root folder and when you
access your webiste the `/` referes to this folder.

Inside this `www` folder you have another folder called `js` where you put all
your compiled js, resulting from a config like this:

````coffeescript
toast 'src'
  # ...
  release: 'www/js/app.js'
  debug: 'www/js/app-debug.js'
````

Following this case you'd just need to inform `js` as your http folder. Toaster
will use it to reach your **debug** files. For that, it will writes the
declarations inside the `debug boot loader` following this location in order to
import your scripts properly when in debug mode, prepending your `httpfolder` to
all file paths:

````javascript
// app-debug.js
document.write('<scri'+'pt src="js/toaster/app.js"></scr'+'ipt>')
````

Without knowing that your JS files is under the `js` folder this path would be
broken.

**NOTE: Your release file will not be affected by this property.**

<a name="config-options-release" />
### `release`

> Mandatory: `yes` <BR/>
> Type: `String` <BR/>
> Default: `null` <BR/>

The file path to your **release** file.

<a name="config-options-debug" />
### `debug`

> Mandatory: `yes` <BR/>
> Type: `String` <BR/>
> Default: `null` <BR/>

The file path to your **debug** file.

<a name="examples"/>
# Examples
----

You'll certainly find some useful resources in the examples provided.
Examine it and you'll understand how things works more instinctively.

Install coffee-toaster, clone the usage example and try different config
options, always looking for the differences in your javascript release file.

> [Single folder example](https://github.com/serpentem/coffee-toaster/tree/master/examples/single-folder)<BR>
> [Multi folder example](https://github.com/serpentem/coffee-toaster/tree/master/examples/multi-folder)<BR>
> [API example](https://github.com/serpentem/coffee-toaster/tree/master/examples/introspection)<BR>

<a name="api"/>
# API
----

You can use Toaster through API as well, in case you want to power up your
compiling tasks or even build some framework/lib on top of it.

See the API example for further information.
> [API example](https://github.com/serpentem/coffee-toaster/tree/master/examples/introspection)

````coffeescript
  Toaster = (require 'coffee-toaster').Toaster
  toasting = new Toaster [basedir], [options], [skip_initial_build]
  toasting.build [header_code_injection], [footer_code_injection]
````

<a name="contributing"/>
# Contributing
----

<a name="setup"/>
## Setting everything up

Environment setup is simple achieved by:

````bash
  git clone git://github.com/serpentem/coffee-toaster.git
  cd coffee-toaster && git submodule update --init
  npm link
````

<a name="building"/>
## Building

Builds the release file inside the `lib` folder.

````bash
  make build
````

<a name="watching"/>
## Watching'n'Compiling

Starts watching/compiling using a previuos version of the CoffeeToaster itself.

````bash
  make watch
````

<a name="testing"/>
## Testing

Run all tests.

````bash
  make test
````

<a name="changelog"/>
# Changelog
----

> [CHANGELOG.md](https://github.com/serpentem/coffee-toaster/tree/master/build/CHANGELOG.md)