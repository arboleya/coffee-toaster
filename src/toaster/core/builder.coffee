#<< toaster/utils/*
#<< toaster/core/script

class Builder

  # requirements
  fs = require 'fs'
  fsu = require 'fs-util'
  path = require 'path'
  cs = require "coffee-script"
  cp = require "child_process"
  uglify = require("uglify-js").uglify
  uglify_parser = require("uglify-js").parser

  Script = toaster.core.Script
  {FnUtil, ArrayUtil, StringUtil} = toaster.utils

  watchers: null
  _include_tmpl: "document.write('<scri'+'pt src=\"%SRC%\"></scr'+'ipt>')"


  constructor:(@toaster, @cli, @config)->
    @vendors = @config.vendors

    @bare = @config.bare
    @packaging = @config.packaging
    @expose = @config.expose
    @minify = @config.minify
    @exclude = [].concat( @config.exclude )

    @httpfolder = @config.httpfolder
    @release = @config.release
    @debug = @config.debug

    @init()
    @watch() if @cli.argv.w

  init:()->
    # initializes buffer array to keep all tracked files
    @files = @config.files
    for folder in @config.src_folders

      # search for all *.coffee files inside src folder
      result = fsu.find folder.path, /.coffee$/m

      # folder path and alias
      fpath = folder.path
      falias = folder.alias

      # collects every files into Script instances
      for file in result

        include = true
        for item in @exclude
          include &= !(new RegExp( item ).test file)

        if include
          s = new Script @, fpath, file, falias, @cli
          @files.push s

  reset:()->
    for watcher in @watchers
      watcher.close()

  build:( header_code = "", footer_code = "" )=>
    # namespaces
    namespaces = @build_namespaces()

    # prepare vendors
    vendors = @merge_vendors()

    # prepare release contents
    contents = []
    contents.push vendors if vendors isnt ""
    contents.push namespaces if @packaging
    contents.push header_code if header_code isnt ""
    contents.push @compile()
    contents.push footer_code if header_code isnt ""
    contents = contents.join '\n'
    
    # uglifying
    if @minify
      ast = uglify_parser.parse contents
      ast = uglify.ast_mangle ast
      ast = uglify.ast_squeeze ast
      contents = uglify.gen_code ast

    # write release file
    fs.writeFileSync @release, contents

    # notify user through cli
    now = ("#{new Date}".match /[0-9]{2}\:[0-9]{2}\:[0-9]{2}/)[0]
    log "[#{now}] #{'Compiled'.bold} #{@release}".green

    # compiling for debug
    if @cli.argv.d && @debug? and not @cli.argv.a
      files = @compile_for_debug()

      # saving boot loader
      for f, i in files
        include = path.normalize "#{@httpfolder}/toaster/#{f}"
        include = include.replace /\\/g, "\/" if path.sep == "\\"
        tmpl = @_include_tmpl.replace "%SRC%", include
        files[i] = tmpl

      # prepare boot loader contents
      contents = []
      contents.push vendors if vendors isnt ""
      contents.push namespaces if @packaging
      contents.push header_code if header_code isnt ""
      contents.push (files.join "\n")
      contents.push footer_code if header_code isnt ""
      contents = contents.join '\n'

      # write boot-loader file
      fs.writeFileSync @debug, contents

      # notify user through cli
      log "[#{now}] #{'Compiled'.bold} #{@debug}".green

    # autorun mode
    if @cli.argv.a

      # getting arguments after the third ( first three are ['node', 'path_to_toaster', '-a'] )
      args = []
      if process.argv.length > 3
        for i in [3...process.argv.length] by 1
          args.push process.argv[i]

      if @child?
        log "Application restarted:".blue
        @child.kill('SIGHUP')
      else
        log "Application started:".blue

      # adding debug arguments
      if @cli.argv.d
        @child = cp.fork @release, args, { execArgv: ['--debug-brk'] }
      else
        @child = cp.fork @release, args

  # Creates a NS holder for all folders
  build_namespaces:()->
    tree = {}
    for folder in @config.src_folders
      t = (tree[folder.alias] = {}) if folder.alias?
      @build_ns_tree t || tree, folder.path

    buffer = ""
    for name, scope of tree
      buffer += "var #{name} = "
      buffer += "#{@expose}.#{name} = " if @expose?
      buffer += (JSON.stringify scope, null, '').replace /\"/g, "'"
      buffer += ";\n"

    return buffer

  # Walk some folderpath and lists all its subfolders
  build_ns_tree:( tree, folderpath )->
    folders = fsu.ls folderpath
    for folder in folders
      include = true
      for item in @exclude
        include &= !(new RegExp( item ).test folder)
      if include
        @build_ns_tree (tree[folder.match /[^\/\\]+$/m] = {}), folder


  watch:()->
    @watchers = []

    # loops through all source folders
    for src in @config.src_folders

      # and watch them entirely
      @watchers.push (watcher = fsu.watch src.path, /.coffee$/m)
      watcher.on 'create', (FnUtil.proxy @on_fs_change, src, 'create')
      watcher.on 'change', (FnUtil.proxy @on_fs_change, src, 'change')
      watcher.on 'delete', (FnUtil.proxy @on_fs_change, src, 'delete')

    # watching vendors for changes
    for vendor in @vendors
      temp = fsu.watch vendor
      temp.on 'create', (FnUtil.proxy @on_fs_change, src, 'create')
      temp.on 'change', (FnUtil.proxy @on_fs_change, src, 'change')
      temp.on 'delete', (FnUtil.proxy @on_fs_change, src, 'delete')

  on_fs_change:(src, ev, f)=>
    # skip all folder creation
    return if f.type == "dir" and ev == "create"

    # folder path and alias
    fpath = f.location
    spath = src.path
    if src.alias?
      falias = (path.sep + src.alias)
    else
      falias = ''

    # check if it's from some excluded folder
    include = true
    for item in @exclude
      include &= !(new RegExp( item ).test fpath)
    return unless include

    # Titleize the type for use in the log messages bellow
    type = StringUtil.titleize f.type

    # relative filepath (with alias, if informed)
    relative_path = fpath.replace spath, falias

    # date for CLI notifications
    now = ("#{new Date}".match /[0-9]{2}\:[0-9]{2}\:[0-9]{2}/)[0]

    # switch over created, deleted, updated and watching
    switch ev

      # when a new file is created
      when "create"

        # initiate file and adds it to the array
        if f.type == "file"
          # toaster/core/script
          s = new Script @, spath, fpath, falias, @cli
          @files.push s

        # cli filepath
        msg = "#{('New ' + f.type + ' created').bold}"
        log "[#{now}] #{msg} #{f.location}".cyan

      # when a file is deleted
      when "delete"

        # removes files from array
        file = ArrayUtil.find @files, relative_path, "filepath"
        return if file is null

        @files.splice file.index, 1

        # cli msg
        msg = "#{(type + ' deleted, stop watching').bold}"
        log "[#{now}] #{msg} #{f.location}".red

      # when a file is updated
      when "change"

        # updates file information
        file = ArrayUtil.find @files, relative_path, "filepath"

        if file is null
          warn "CHANGED FILE IS APPARENTLY NULL..."
        else
          file.item.getinfo()

          # cli msg
          msg = "#{(type + ' changed').bold}"
          log "[#{now}] #{msg} #{f.location}".cyan

    if @toaster.before_build is null or @toaster.before_build()
      # rebuilds modules
      @build()

  compile:()->
    # validating syntax
    for file in @files
      try
        cs.compile file.raw
      # if there's some error
      catch err

        # catches and shows it, and abort the compilation
        msg = err.message.replace '"', '\\"'
        msg = "#{msg.white} at file: " + "#{file.filepath}".bold.red
        error msg
        return null

    # otherwise move ahead, and expands all dependencies wild-cards
    file.expand_dependencies() for file in @files

    # reordering files
    @reorder()

    # merging everything
    output = (file.raw for file in @files).join "\n"

    # compiling
    output = cs.compile output, {bare: @bare}

  compile_for_debug:()->
    release_path = path.dirname @debug
    release_path = path.join release_path, "toaster"

    # cleaning previous/existent structure
    fsu.rm_rf release_path if fs.existsSync release_path

    # creating new structre from scratch
    fsu.mkdir_p release_path

    # initializing empty array of filepaths
    files = []

    # loop through all ordered files
    for file, index in @files

      # computing releative filepath (replacing .coffee by .js)
      find = "#{@toaster.basepath}#{path.sep}"
      relative_path = file.filepath.replace find, ""
      relative_path = relative_path.replace ".coffee", ".js"

      # computing absolute filepath
      absolute_path = path.resolve (path.join release_path, relative_path)

      # extracts its folder path
      folder_path = path.dirname absolute_path

      # create container folder if it doesnt exist yet
      fsu.mkdir_p folder_path if !fs.existsSync folder_path

      # writing file
      try
        fs.writeFileSync absolute_path, cs.compile file.raw, {bare:@bare}
      catch err
        ## dont show nothing because the error was alreary shown
        ## in the compile rotine above
        # 
        # msg = err.message.replace '"', '\\"'
        # msg = "#{msg.white} at file: " + "#{file.filepath}".bold.red
        # error msg
        continue

      # adds to the files buffer
      files.push relative_path

    # returns all filepaths
    return files



  missing = {}
  reorder: (cycling = false) ->
    # log "Module.reorder"

    # if cycling is true or @missing is null, initializes empty array
    # for holding missing dependencies
    # 
    # cycling means the redorder method is being called recursively,
    # no other methods call it with cycling = true
    @missing = {} if cycling is false

    # looping through all files
    for file, i in @files

      # if theres no dependencies, go to next file
      continue if !file.dependencies.length && !file.baseclasses.length
      
      # otherwise loop thourgh all file dependencies
      for filepath, index in file.dependencies

        # search for dependency
        dependency = ArrayUtil.find @files, filepath, "filepath"
        dependency_index = dependency.index if dependency?

        # continue if the dependency was already initialized
        continue if dependency_index < i && dependency?

        # if it's found
        if dependency?

          # if there's some circular dependency loop
          if ArrayUtil.has dependency.item.dependencies, file.filepath

            # remove it from the dependencies
            file.dependencies.splice index, 1

            # then prints a warning msg and continue
            warn "Circular dependency found between ".yellow +
                 filepath.grey.bold + " and ".yellow +
                 file.filepath.grey.bold
            
            continue

          # otherwise if no circular dependency is found, reorder
          # the specific dependency and run reorder recursively
          # until everything is beautiful
          else
            @files.splice index, 0, dependency.item
            @files.splice dependency.index + 1, 1
            @reorder true
            break

        # otherwise if the dependency is not found
        else if @missing[filepath] != true
          
          # then add it to the @missing hash (so it will be ignored
          # until reordering finishes)
          @missing[filepath] = true

          # move it to the end of the dependencies array (avoiding
          # it from being touched again)
          file.dependencies.push filepath
          file.dependencies.splice index, 1

          # ..and finally prints a warning msg
          warn "#{'Dependency'.yellow} #{filepath.bold.grey} " +
             "#{'not found for file'.yellow} " +
             file.filepath.grey.bold

      # validate if all base classes was properly imported
      file_index = ArrayUtil.find @files, file.filepath, "filepath"
      file_index = file_index.index

      for bc in file.baseclasses
        found = ArrayUtil.find @files, bc, "classname"
        not_found = (found == null) || (found.index > file_index)

        if not_found && !@missing[bc]
          @missing[bc] = true
          warn "Base class ".yellow +
             "#{bc} ".bold.grey +
             "not found for class ".yellow +
             "#{file.classname} ".bold.grey +
             "in file ".yellow +
             file.filepath.bold.grey



  merge_vendors:()=>
    buffer = []
    for vendor in @vendors
      if fs.existsSync vendor
        stats = fs.lstatSync vendor
        if stats.isSymbolicLink()
          realPath = fs.readlinkSync vendor
          buffer.push fs.readFileSync realPath, 'utf-8'
        else if stats.isFile()
          buffer.push fs.readFileSync vendor, 'utf-8'
      else
        warn "Vendor not found at ".white + vendor.yellow.bold

    return buffer.join "\n"