(function() {
  var ArrayUtil, Builder, Cli, Config, FsUtil, Module, Project, Question, Script, StringUtil, Toaster, argv, colors, cs, error, exec, fs, growl, icon_error, icon_warn, interval, log, msgs, optimist, opts, path, pkg, pn, process_msgs, queue_msg, start_worker, stop_worker, toaster, uglify, uglify_parser, warn;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  toaster = {};
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
  pkg('toaster.generators').Question = Question = (function() {
    function Question() {}
    Question.prototype.ask = function(question, format, fn) {
      var stdin, stdout;
      stdin = process.stdin;
      stdout = process.stdout;
      stdin.resume();
      stdout.write("" + question + " ");
      return stdin.once('data', __bind(function(data) {
        var msg, rule;
        data = data.toString().trim();
        if (format.test(data)) {
          return fn(data);
        } else {
          msg = "" + 'Invalid entry, it should match:'.red;
          rule = "" + (format.toString().cyan);
          stdout.write("\t" + msg + " " + rule + "\n");
          return this.ask(question, format, fn);
        }
      }, this));
    };
    return Question;
  })();
  pkg('toaster.utils').ArrayUtil = ArrayUtil = (function() {
    function ArrayUtil() {}
    ArrayUtil.find = function(source, search, by_property) {
      var k, p, v, _i, _len, _len2, _len3;
      if (!by_property) {
        for (k = 0, _len = source.length; k < _len; k++) {
          v = source[k];
          if (v === search) {
            return {
              item: v,
              index: k
            };
          }
        }
      } else {
        by_property = [].concat(by_property);
        for (k = 0, _len2 = source.length; k < _len2; k++) {
          v = source[k];
          for (_i = 0, _len3 = by_property.length; _i < _len3; _i++) {
            p = by_property[_i];
            if (search === v[p]) {
              return {
                item: v,
                index: k
              };
            }
          }
        }
      }
      return null;
    };
    ArrayUtil.find_all = function(source, search, by_property, regexp, unique) {
      var item, k, p, v, _i, _len, _len2, _len3, _output, _unique;
      _output = [];
      _unique = {};
      if (by_property === null) {
        for (k = 0, _len = source.length; k < _len; k++) {
          v = source[k];
          if (regexp) {
            if (search.test(v)) {
              item = {
                item: v,
                index: k
              };
            }
          } else {
            if (search === v) {
              item = {
                item: v,
                index: k
              };
            }
          }
          if (item) {
            _output.push(item);
          }
        }
      } else {
        by_property = [].concat(by_property);
        for (k = 0, _len2 = source.length; k < _len2; k++) {
          v = source[k];
          for (_i = 0, _len3 = by_property.length; _i < _len3; _i++) {
            p = by_property[_i];
            item = null;
            if (regexp) {
              if (search.test(v[p])) {
                if (unique && !_unique[k]) {
                  item = {
                    item: v,
                    index: k
                  };
                } else if (unique === !true) {
                  item = {
                    item: v,
                    index: k
                  };
                }
              }
            } else {
              if (search === v[p]) {
                item = {
                  item: v,
                  index: k
                };
              }
            }
            if (item) {
              _unique[k] = true;
              _output.push(item);
            }
          }
        }
      }
      return _output;
    };
    ArrayUtil.diff = function(a, b, by_property) {
      var diff, item, search, _i, _j, _len, _len2;
      diff = [];
      for (_i = 0, _len = a.length; _i < _len; _i++) {
        item = a[_i];
        search = by_property != null ? item[by_property] : item;
        if (!ArrayUtil.has(b, search, by_property)) {
          diff.push({
            item: item,
            action: "deleted"
          });
        }
      }
      for (_j = 0, _len2 = b.length; _j < _len2; _j++) {
        item = b[_j];
        search = by_property != null ? item[by_property] : item;
        if (!ArrayUtil.has(a, search, by_property)) {
          diff.push({
            item: item,
            action: "created"
          });
        }
      }
      return diff;
    };
    ArrayUtil.has = function(source, search, by_property) {
      return ArrayUtil.find(source, search, by_property) != null;
    };
    ArrayUtil.replace_into = function(src, index, items) {
      items = [].concat(items);
      src.splice(index, 1);
      while (items.length) {
        src.splice(index++, 0, items.shift());
      }
      return src;
    };
    return ArrayUtil;
  })();
  path = require("path");
  fs = require("fs");
  pn = path.normalize;
  exports.FsUtil = pkg('toaster.utils').FsUtil = FsUtil = (function() {
    function FsUtil() {}
    FsUtil.snapshots = {};
    FsUtil.rmdir_rf = function(folderpath, root) {
      var file, files, stats, _i, _len;
      if (root == null) {
        root = true;
      }
      files = fs.readdirSync(folderpath);
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        file = "" + folderpath + "/" + file;
        stats = fs.lstatSync(file);
        if (stats.isDirectory()) {
          FsUtil.rmdir_rf(file, false);
          fs.rmdirSync(file);
        } else {
          fs.unlinkSync(file);
        }
      }
      if (root) {
        return fs.rmdirSync(folderpath);
      }
    };
    FsUtil.mkdir_p = function(folderpath) {
      var folder, folders, index, _len, _results;
      folders = folderpath.split("/");
      _results = [];
      for (index = 0, _len = folders.length; index < _len; index++) {
        folder = folders[index];
        if (folder === "") {
          continue;
        }
        _results.push(!path.existsSync(folder = folders.slice(0, index + 1).join("/")) ? fs.mkdirSync(folder, 0755) : void 0);
      }
      return _results;
    };
    FsUtil.find = function(folderpath, pattern, fn) {
      return exec("find " + folderpath + " -name '" + pattern + "'", __bind(function(error, stdout, stderr) {
        var buffer, item, items, _i, _len, _ref;
        buffer = [];
        _ref = items = stdout.trim().split("\n");
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          if (item !== "." && item !== ".." && item !== "") {
            buffer.push(item);
          }
        }
        return fn(buffer);
      }, this));
    };
    FsUtil.ls_folders = function(basepath, fn) {
      return exec("find -type d", __bind(function(error, stdout, stderr) {
        var buffer, item, items, _i, _len, _ref;
        buffer = [];
        _ref = items = stdout.trim().split("\n");
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          if (item !== "." && item !== ".." && item !== "") {
            buffer.push(item);
          }
        }
        return fn(buffer);
      }, this));
    };
    FsUtil.watched = {};
    FsUtil.watch_file = function(filepath, onchange, dispatch_create) {
      filepath = pn(filepath);
      if (dispatch_create) {
        if (typeof onchange === "function") {
          onchange({
            type: "file",
            path: filepath,
            action: "create"
          });
        }
      }
      if (typeof onchange === "function") {
        onchange({
          type: "file",
          path: filepath,
          action: "watching"
        });
      }
      this.watched[filepath] = true;
      return fs.watchFile(filepath, {
        interval: 250
      }, __bind(function(curr, prev) {
        var ctime, mtime;
        mtime = curr.mtime.valueOf() !== prev.mtime.valueOf();
        ctime = curr.ctime.valueOf() !== prev.ctime.valueOf();
        if (mtime || ctime) {
          return typeof onchange === "function" ? onchange({
            type: "file",
            path: filepath,
            action: "updated"
          }) : void 0;
        }
      }, this));
    };
    FsUtil.watch_folder = function(folderpath, filter_regexp, onchange, dispatch_create) {
      folderpath = pn(folderpath);
      if (typeof onchange === "function") {
        onchange({
          type: "folder",
          path: folderpath,
          action: "watching"
        });
      }
      exec("ls " + folderpath, __bind(function(error, stdout, stderr) {
        var item, _i, _len, _ref, _results;
        FsUtil.snapshots[folderpath] = FsUtil.format_ls(folderpath, stdout);
        _ref = FsUtil.snapshots[folderpath];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          _results.push(item.type === "folder" ? FsUtil.watch_folder(item.path, filter_regexp, onchange) : filter_regexp === null || filter_regexp.test(item.path) ? (dispatch_create ? onchange({
            type: item.type,
            path: item.path,
            action: "created"
          }) : void 0, FsUtil.watch_file(item.path, onchange)) : void 0);
        }
        return _results;
      }, this));
      return fs.watchFile(folderpath, {
        interval: 250
      }, __bind(function(curr, prev) {
        return exec("ls " + folderpath, __bind(function(error, stdout, stderr) {
          var a, b, diff, info, item, snapshot, _i, _len;
          a = FsUtil.snapshots[folderpath];
          b = FsUtil.format_ls(folderpath, stdout);
          diff = ArrayUtil.diff(a, b, "path");
          for (_i = 0, _len = diff.length; _i < _len; _i++) {
            item = diff[_i];
            info = item.item;
            info.action = item.action;
            if (info.action === "created") {
              if (info.type === "file") {
                if (filter_regexp != null) {
                  if (!filter_regexp.test(info.path)) {
                    continue;
                  }
                }
                if (typeof onchange === "function") {
                  onchange(info);
                }
                FsUtil.watch_file(info.path, onchange, true);
              } else if (info.type === "folder") {
                if (typeof onchange === "function") {
                  onchange(info);
                }
                FsUtil.watch_folder(info.path, filter_regexp, onchange, true);
              }
            } else if (info.action === "deleted") {
              if (this.watched[info.path] === true) {
                this.watched[info.path];
                if (typeof onchange === "function") {
                  onchange(info);
                }
                fs.unwatchFile(item.path);
              }
            }
          }
          snapshot = FsUtil.format_ls(folderpath, stdout);
          return FsUtil.snapshots[folderpath] = snapshot;
        }, this));
      }, this));
    };
    FsUtil.format_ls = function(folderpath, stdout) {
      var index, item, list, stats, _len;
      list = stdout.toString().trim().split("\n");
      for (index = 0, _len = list.length; index < _len; index++) {
        item = list[index];
        if (item === "\n" || item === "") {
          list.splice(index, 1);
        } else {
          stats = fs.lstatSync("" + folderpath + "/" + item);
          list[index] = {
            type: stats.isDirectory() ? "folder" : "file",
            path: "" + folderpath + "/" + item
          };
        }
      }
      return list;
    };
    return FsUtil;
  })();
  growl = require('growl');
  icon_warn = '/Users/nybras/Dropbox/Workspace/serpentem/coffee-toaster/images/warning.png';
  icon_error = '/Users/nybras/Dropbox/Workspace/serpentem/coffee-toaster/images/error.png';
  error = function(msg, file, send_to_growl, file) {
    if (send_to_growl == null) {
      send_to_growl = true;
    }
    if (file == null) {
      file = null;
    }
    console.log("ERROR ".bold.red + msg);
    if (send_to_growl) {
      msg = msg.replace(/\[\d{2}m/g, "");
      msg = msg.replace(/(\[\dm)([^\s]+)/ig, "<$2>$3");
      return queue_msg({
        msg: msg,
        opts: {
          title: 'Coffee Toaster',
          image: icon_error
        }
      });
    }
  };
  warn = function(msg, send_to_growl) {
    if (send_to_growl == null) {
      send_to_growl = true;
    }
    console.log("WARNING ".bold.yellow + msg);
    if (send_to_growl) {
      msg = msg.replace(/\[\d{2}m/g, "");
      msg = msg.replace(/(\[\dm)([^\s]+)/ig, "<$2>$3");
      return queue_msg({
        msg: msg,
        opts: {
          title: 'Coffee Toaster',
          image: icon_warn
        }
      });
    }
  };
  log = function(msg, send_to_growl) {
    if (send_to_growl == null) {
      send_to_growl = false;
    }
    return console.log(msg);
  };
  msgs = [];
  interval = null;
  start_worker = function() {
    if (interval == null) {
      interval = setInterval(process_msgs, 150);
      return process_msgs();
    }
  };
  stop_worker = function() {
    if (interval != null) {
      clearInterval(interval);
      return interval = null;
    }
  };
  queue_msg = function(msg) {
    msgs.push(msg);
    return start_worker();
  };
  process_msgs = function() {
    var msg;
    if (msgs.length) {
      msg = msgs.shift();
      return growl.notify(msg.msg, msg.opts);
    } else {
      return stop_worker();
    }
  };
  pkg('toaster.utils').StringUtil = StringUtil = (function() {
    function StringUtil() {}
    StringUtil.titleize = function(str) {
      var index, word, words, _len;
      words = str.match(/[a-z]+/gi);
      for (index = 0, _len = words.length; index < _len; index++) {
        word = words[index];
        words[index] = StringUtil.ucasef(word);
      }
      return words.join(" ");
    };
    StringUtil.ucasef = function(str) {
      var output;
      output = str.substr(0, 1).toUpperCase();
      return output += str.substr(1).toLowerCase();
    };
    return StringUtil;
  })();
  fs = require("fs");
  cs = require("coffee-script");
  pkg('toaster.core').Script = Script = (function() {
    function Script(module, realpath, opts) {
      this.module = module;
      this.realpath = realpath;
      this.opts = opts;
      this.getinfo();
    }
    Script.prototype.getinfo = function() {
      var baseclass, exports, item, klass, repl, requirements, rgx, rgx_ext, _i, _j, _len, _len2, _ref, _ref2, _results;
      this.raw = fs.readFileSync(this.realpath, "utf-8");
      this.dependencies_collapsed = [];
      this.baseclasses = [];
      this.filepath = this.realpath.replace(this.module.src, "").substr(1);
      this.filename = /[\w-]+\.[\w-]+/.exec(this.filepath)[0];
      this.filefolder = this.filepath.replace("/" + this.filename, "") + "/";
      this.namespace = "";
      if (this.filepath.indexOf("/") === -1) {
        this.filefolder = "";
      }
      this.namespace = this.filefolder.replace(/\//g, ".").slice(0, -1);
      rgx = "(^|=\\s*)(class)+\\s+(\\w+)" + "(\\s*$|\\s+(extends)\\s+(\\w+)\\s*$)";
      rgx_ext = "(^|=\\s*)(class)\\s(\\w+)\\s(extends)\\s(\\w+)\\s*$";
      if (this.raw.match(new RegExp(rgx, "m")) != null) {
        if (this.namespace !== "") {
          exports = this.module.exports;
          if (exports !== false) {
            exports = "" + this.module.exports + ".$3 = ";
          } else {
            exports = "";
          }
          if (this.module.packaging) {
            repl = "$1pkg( '" + this.namespace + "' ).$3 = " + exports + " $2 $3";
            if (new RegExp(rgx_ext, "m").test(this.raw)) {
              repl += "$4";
            }
            this.raw = this.raw.replace(new RegExp(rgx, "gm"), repl);
          }
        }
        this.classname = this.raw.match(new RegExp(rgx, "m"))[3];
        if (this.namespace === "") {
          this.classpath = this.classname;
        } else {
          this.classpath = "" + this.namespace + "." + this.classname;
        }
        _ref2 = (_ref = this.raw.match(new RegExp(rgx_ext, "gm"))) != null ? _ref : [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          klass = _ref2[_i];
          baseclass = klass.match(new RegExp(rgx_ext, "m"))[5];
          this.baseclasses.push(baseclass);
        }
      }
      if (/(#<<\s)(.*)/g.test(this.raw)) {
        requirements = this.raw.match(/(#<<\s)(.*)/g);
        _results = [];
        for (_j = 0, _len2 = requirements.length; _j < _len2; _j++) {
          item = requirements[_j];
          item = /(#<<\s)(.*)/.exec(item)[2];
          item = item.replace(/\s/g, "");
          item = [].concat(item.split(","));
          _results.push(this.dependencies_collapsed = this.dependencies_collapsed.concat(item));
        }
        return _results;
      }
    };
    Script.prototype.expand_dependencies = function() {
      var dependency, expanded, files, found, index, reg, _len, _ref, _results;
      files = this.module.files;
      this.dependencies = [];
      _ref = this.dependencies_collapsed;
      _results = [];
      for (index = 0, _len = _ref.length; index < _len; index++) {
        dependency = _ref[index];
        if (dependency.substr(-1) !== "*") {
          this.dependencies.push("" + dependency + ".coffee");
          continue;
        }
        reg = new RegExp(dependency.replace(/(\/)/g, "\\$1"));
        found = ArrayUtil.find_all(files, reg, "filepath", true, true);
        if (found.length <= 0) {
          console.log(("" + 'WARNING!'.bold.yellow + " Nothing found").yellow, "" + 'inside'.yellow + " " + dependency.white);
          continue;
        }
        _results.push((function() {
          var _i, _len2, _results2;
          _results2 = [];
          for (_i = 0, _len2 = found.length; _i < _len2; _i++) {
            expanded = found[_i];
            _results2.push(this.dependencies.push(expanded.item.filepath));
          }
          return _results2;
        }).call(this));
      }
      return _results;
    };
    return Script;
  })();
  optimist = require('optimist');
  pkg('toaster').Cli = Cli = (function() {
    function Cli() {
      var usage;
      usage = "" + 'CoffeeToaster'.bold + "\n";
      usage += "  Minimalist dependency management for CoffeeScript\n\n".grey;
      usage += "" + 'Usage:' + "\n";
      usage += "  toaster [" + 'options'.green + "] [" + 'path'.green + "]\n\n";
      usage += "" + 'Examples:' + "\n";
      usage += "  toaster -n myawsomeapp   (" + 'required'.red + ")\n";
      usage += "  toaster -i [myawsomeapp] (" + 'optional'.green + ")\n";
      usage += "  toaster -w [myawsomeapp] (" + 'optional'.green + ")";
      this.argv = (this.opts = optimist.usage(usage).alias('n', 'new').describe('n', "Scaffold a very basic new App").alias('i', 'init').describe('i', "Create a config (toaster.coffee) file").alias('w', 'watch').describe('w', "Start watching/compiling your project").alias('c', 'compile').boolean('c').describe('c', "Compile the entire project, without watching it.").alias('d', 'debug').boolean('d')["default"]('d', null).describe('d', 'Debug mode (compile js files individually)').alias('b', 'bare').boolean('b')["default"]('b', false).describe('b', 'Compile files with "coffee --bare" (no js wrapper)').alias('p', 'packaging').boolean('p')["default"]('p', false).describe('p', 'Enables/disables the packaging system').alias('m', 'minify').boolean('m')["default"]('m', false).describe('m', 'Minify release code using uglify.').alias('e', 'exports').string('e')["default"]('e', null).describe('e', 'Specify a macro scope to list everything.').alias('v', 'version').describe('v', '').alias('h', 'help').describe('h', '')).argv;
    }
    return Cli;
  })();
  fs = require("fs");
  path = require("path");
  pn = path.normalize;
  exec = (require("child_process")).exec;
  colors = require('colors');
  pkg('toaster').Config = Config = (function() {
    Config.prototype.modules = {};
    Config.prototype.vendors = {};
    Config.prototype.builds = {};
    function Config(basepath) {
      var build, filepath, module, vendor;
      this.basepath = basepath;
      this.build = __bind(this.build, this);
      this.vendor = __bind(this.vendor, this);
      this.module = __bind(this.module, this);
      module = this.module;
      vendor = this.vendor;
      build = this.build;
      filepath = pn("" + this.basepath + "/toaster.coffee");
      if (path.existsSync(filepath)) {
        eval(cs.compile(fs.readFileSync(filepath, "utf-8"), {
          bare: 1
        }));
      } else {
        console.log("ERROR! ".bold.red);
        console.log("\tFile not found: " + filepath.red);
        console.log("\tTry running: " + "toaster -i".green + (" or type " + 'toaster -h'.green + " for more info"));
      }
    }
    Config.prototype.module = function(name, params) {
      params.name = name;
      params.src = pn("" + this.basepath + "/" + params.src);
      params.release = pn("" + this.basepath + "/" + params.release);
      return this.modules[name] = params;
    };
    Config.prototype.vendor = function(name, src) {
      return this.vendors[name] = pn("" + this.basepath + "/" + src);
    };
    Config.prototype.build = function(name, params) {
      var _ref;
      params.name = name;
      params.vendors = (_ref = params.vendors) != null ? _ref : [];
      params.release = pn("" + this.basepath + "/" + params.release);
      return this.builds[name] = params;
    };
    return Config;
  })();
  fs = require('fs');
  path = require('path');
  pkg('toaster.core').Builder = Builder = (function() {
    function Builder(toaster) {
      this.toaster = toaster;
    }
    Builder.prototype.build = function() {
      var build, builds, modules, name, vendors, _results;
      builds = this.toaster.config.builds;
      _results = [];
      for (name in builds) {
        build = builds[name];
        modules = this.merge_modules(build.modules);
        vendors = this.merge_vendors(this.unify_vendors(build.modules));
        _results.push(fs.writeFileSync(build.release, "" + vendors + "\n" + modules));
      }
      return _results;
    };
    Builder.prototype.unify_vendors = function(modules) {
      var module, unique, vendor, _i, _j, _len, _len2, _ref;
      unique = [];
      for (_i = 0, _len = modules.length; _i < _len; _i++) {
        module = modules[_i];
        if ((module = this.toaster.modules[module]) == null) {
          return console.log("MODULE NOT FOUND!");
        }
        _ref = module.vendors;
        for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
          vendor = _ref[_j];
          if (!ArrayUtil.has(unique, vendor)) {
            unique.push(vendor);
          }
        }
      }
      return unique;
    };
    Builder.prototype.merge_vendors = function(vendors) {
      var buffer, vendor, vendor_name, _i, _len;
      buffer = [];
      for (_i = 0, _len = vendors.length; _i < _len; _i++) {
        vendor_name = vendors[_i];
        if ((vendor = this.toaster.config.vendors[vendor_name]) != null) {
          if (path.existsSync(vendor)) {
            buffer.push(fs.readFileSync(vendor, 'utf-8'));
          } else {
            console.log("WARNING!".bold.yellow, "Vendor".white, vendor_name.yellow.bold, "not found at".white, vendor.yellow.bold);
          }
        } else {
          console.log("WARNING!".bold.yellow, "Vendor".yellow, vendor_name.white.bold, "not found for module".yellow, this.name.white.bold);
        }
      }
      return buffer.join("\n");
    };
    Builder.prototype.merge_modules = function(modules) {
      var buffer, module, _i, _len;
      buffer = [];
      for (_i = 0, _len = modules.length; _i < _len; _i++) {
        module = modules[_i];
        if ((module = this.toaster.modules[module]) != null) {
          buffer.push(module.compile());
        } else {
          console.log("MODULE NOT FOUN!");
        }
      }
      return buffer.join("\n");
    };
    return Builder;
  })();
  cs = require("coffee-script");
  uglify = require("uglify-js").uglify;
  uglify_parser = require("uglify-js").parser;
  pkg('toaster.core').Module = Module = (function() {
    var missing;
    Module.prototype.pkg_helper = "pkg = ( ns )->\n	curr = null\n	parts = [].concat = ns.split( \".\" )\n	for part, index in parts\n		if curr == null\n			curr = eval part\n			continue\n		else\n			unless curr[ part ]?\n				curr = curr[ part ] = %exports%{}\n			else\n				curr = curr[ part ]\n	curr\n";
    function Module(toaster, config, opts) {
      var exports, _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
      this.toaster = toaster;
      this.config = config;
      this.opts = opts;
      this.name = this.config.name;
      this.src = this.config.src;
      this.vendors = (_ref = this.config.vendors) != null ? _ref : [];
      this.release = (_ref2 = this.config.release) != null ? _ref2 : null;
      this.bare = (_ref3 = this.opts.argv.bare) != null ? _ref3 : this.config.bare;
      this.exports = (_ref4 = this.config.exports) != null ? _ref4 : this.opts.argv.exports;
      this.packaging = (_ref5 = this.config.packaging) != null ? _ref5 : this.opts.argv.packaging;
      this.minify = (_ref6 = this.config.minify) != null ? _ref6 : this.opts.argv.minify;
      if (this.exports !== false) {
        exports = "" + this.exports + "[part] = ";
      } else {
        exports = "";
      }
      this.pkg_helper = this.pkg_helper.replace("%exports%", exports);
      this.files = [];
      FsUtil.find(this.src, "*.coffee", __bind(function(result) {
        var file, _i, _len;
        for (_i = 0, _len = result.length; _i < _len; _i++) {
          file = result[_i];
          this.files.push(new Script(this, file, this.opts, this.bare));
        }
        this.write();
        if (this.opts.argv.w) {
          return this.watch();
        }
      }, this));
    }
    Module.prototype.watch = function() {
      return FsUtil.watch_folder(this.src, /.coffee$/, __bind(function(info) {
        var file, msg, relative_path, type;
        type = StringUtil.titleize(info.type);
        relative_path = info.path.replace("" + this.src + "/", "");
        switch (info.action) {
          case "created":
            if (info.type === "file") {
              this.files.push(new Script(this, info.path, this.opts));
            }
            msg = "" + ('New ' + info.type + ' created:').bold.green;
            log("" + msg + " " + info.path.green);
            break;
          case "deleted":
            file = ArrayUtil.find(this.files, relative_path, "filepath");
            this.files.splice(file.index, 1);
            msg = "" + (type + ' deleted, stop watching: ').bold.red;
            log("" + msg + " " + info.path.red);
            break;
          case "updated":
            file = ArrayUtil.find(this.files, relative_path, "filepath");
            file.item.getinfo();
            msg = "" + (type + ' changed: ').bold.cyan;
            log("" + msg + " " + info.path.cyan);
            break;
          case "watching":
            msg = "" + ('Watching ' + info.type + ':').bold.cyan;
            log("" + msg + " " + info.path.cyan);
        }
        if (info.action !== "watching") {
          return this.write();
        }
      }, this));
    };
    Module.prototype.compile = function(include_vendors) {
      var ast, compiled, file, msg, namespaces, output, _i, _j, _len, _len2, _ref, _ref2;
      if (include_vendors == null) {
        include_vendors = true;
      }
      try {
        _ref = this.files;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          file = _ref[_i];
          cs.compile(file.raw);
        }
      } catch (err) {
        msg = err.message.replace('"', '\\"');
        msg = ("" + msg.white + " at file: ") + ("" + file.filepath).bold.red;
        error(msg);
        return null;
      }
      _ref2 = this.files;
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        file = _ref2[_j];
        file.expand_dependencies();
      }
      this.reorder();
      output = "";
      if (this.packaging) {
        output = "" + (this.get_root_namespaces()) + "\n" + this.pkg_helper + "\n";
      }
      output += ((function() {
        var _k, _len3, _ref3, _results;
        _ref3 = this.files;
        _results = [];
        for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
          file = _ref3[_k];
          _results.push(file.raw);
        }
        return _results;
      }).call(this)).join("\n");
      namespaces = this.packaging ? this.get_root_namespaces() : "";
      output = output.replace("{root_namespaces}", namespaces);
      compiled = cs.compile(output, {
        bare: this.bare
      });
      if (this.minify) {
        ast = uglify_parser.parse(compiled);
        ast = uglify.ast_mangle(ast);
        ast = uglify.ast_squeeze(ast);
        compiled = uglify.gen_code(ast);
      }
      return compiled;
    };
    Module.prototype.get_root_namespaces = function() {
      var file, k, namespaces_buffer, root_namespaces, v, _i, _len, _ref;
      root_namespaces = {};
      _ref = this.files;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        if (file.filefolder !== "") {
          pkg = file.namespace.split(".").shift();
          if (this.exports !== false) {
            pkg = "" + this.exports + "." + pkg + " = " + pkg;
          }
          root_namespaces[pkg] = "" + pkg + " = {}\n";
        }
      }
      namespaces_buffer = "";
      for (v in root_namespaces) {
        k = root_namespaces[v];
        namespaces_buffer += k;
      }
      return namespaces_buffer;
    };
    Module.prototype.write = function() {
      var contents, file, filepath, folderpath, index, relative, tmpl, toaster_buffer, toaster_src, vendors, _len, _ref;
      if ((contents = this.compile()) == null) {
        return;
      }
      vendors = this.toaster.builder.merge_vendors(this.vendors);
      contents = "" + vendors + "\n" + contents;
      if (/(\/\w+\.\w+$)/gi.test(this.release)) {
        fs.writeFileSync(this.release, contents);
      }
      log("" + '.'.bold.green + " " + this.release);
      if (this.opts.argv.debug) {
        toaster = this.release.split("/").slice(0, -1).join('/') + "/toaster";
        toaster = this.release.replace(/(\/\w+\.\w+$)/gi, "") + "/toaster";
        toaster_src = "" + toaster + "/" + this.name + "/src";
        if (path.existsSync(toaster_src)) {
          FsUtil.rmdir_rf(toaster_src);
        }
        FsUtil.mkdir_p(toaster_src);
        tmpl = "document.write('<scri'+'pt src=\"%SRC%\"></scr'+'ipt>')";
        toaster_buffer = ("" + vendors + "\n" + (this.get_root_namespaces()) + "\n") + ("" + (cs.compile(this.pkg_helper, {
          bare: 1
        })) + "\n\n");
        _ref = this.files;
        for (index = 0, _len = _ref.length; index < _len; index++) {
          file = _ref[index];
          relative = file.filepath;
          relative = relative.replace(".coffee", ".js");
          filepath = "" + toaster_src + "/" + relative;
          folderpath = filepath.split('/').slice(0, -1).join("/");
          if (!path.existsSync(folderpath)) {
            FsUtil.mkdir_p(folderpath);
          }
          relative = "./toaster/" + this.name + "/src/" + relative;
          fs.writeFileSync(filepath, cs.compile(file.raw, {
            bare: 1
          }));
          toaster_buffer += tmpl.replace("%SRC%", relative) + "\n";
        }
        toaster = "" + toaster + "/" + this.name + "/" + this.name + ".js";
        fs.writeFileSync(toaster, toaster_buffer);
      }
      return this.toaster.builder.build();
    };
    missing = {};
    Module.prototype.reorder = function(cycling) {
      var bc, dependency, dependency_index, file, file_index, filepath, found, i, index, not_found, _len, _len2, _ref, _ref2, _results;
      if (cycling == null) {
        cycling = false;
      }
      if (cycling === false) {
        this.missing = {};
      }
      _ref = this.files;
      _results = [];
      for (i = 0, _len = _ref.length; i < _len; i++) {
        file = _ref[i];
        if (!file.dependencies.length && !file.baseclasses.length) {
          continue;
        }
        _ref2 = file.dependencies;
        for (index = 0, _len2 = _ref2.length; index < _len2; index++) {
          filepath = _ref2[index];
          dependency = ArrayUtil.find(this.files, filepath, "filepath");
          if (dependency != null) {
            dependency_index = dependency.index;
          }
          if (dependency_index < i && (dependency != null)) {
            continue;
          }
          if (dependency != null) {
            if (ArrayUtil.has(dependency.item.dependencies, file.filepath)) {
              file.dependencies.splice(index, 1);
              warn("Circular dependency found between ".yellow + filepath.grey.bold + " and ".yellow + file.filepath.grey.bold);
              continue;
            } else {
              this.files.splice(index, 0, dependency.item);
              this.files.splice(dependency.index + 1, 1);
              this.reorder(true);
              break;
            }
          } else if (this.missing[filepath] !== true) {
            this.missing[filepath] = true;
            file.dependencies.push(filepath);
            file.dependencies.splice(index, 1);
            warn(("" + 'Dependency'.yellow + " " + filepath.bold.grey + " ") + ("" + 'not found for file'.yellow + " ") + file.filepath.grey.bold);
          }
        }
        file_index = ArrayUtil.find(this.files, file.filepath, "filepath");
        file_index = file_index.index;
        _results.push((function() {
          var _i, _len3, _ref3, _results2;
          _ref3 = file.baseclasses;
          _results2 = [];
          for (_i = 0, _len3 = _ref3.length; _i < _len3; _i++) {
            bc = _ref3[_i];
            found = ArrayUtil.find(this.files, bc, "classname");
            not_found = (found === null) || (found.index > file_index);
            _results2.push(not_found && !this.missing[bc] ? (this.missing[bc] = true, warn("Base class ".yellow + ("" + bc + " ").bold.grey + "not found for class ".yellow + ("" + file.classname + " ").bold.grey + "in file ".yellow + file.filepath.bold.grey)) : void 0);
          }
          return _results2;
        }).call(this));
      }
      return _results;
    };
    return Module;
  })();
  pkg('toaster.generators').Config = Config = (function() {
    var tpl;
    __extends(Config, Question);
    tpl = "modules =\n\tname: '%name'\n\tsrc: '%src'\n\trelease: '%release'\n";
    function Config(basepath) {
      this.basepath = basepath;
    }
    Config.prototype.create = function(folderpath) {
      var default_name, question1, question2, question3;
      if ((folderpath != null) && folderpath !== true) {
        this.basepath = "" + this.basepath + "/" + folderpath;
      }
      console.log("" + 'Let\'s toast this sly little project! :)'.grey.bold);
      console.log(". With this as your basepath: " + this.basepath.cyan);
      console.log(". Please, tell me:");
      default_name = this.basepath.split("/").pop();
      question1 = "\tWhat's your app name? (" + default_name + ")";
      question2 = "\tWhere's its src folder? (i.e. src)";
      question3 = "\tWhere do you want your release file?" + "(i.e. release/app.js)";
      return this.ask(question1, /.*/, __bind(function(name) {
        return this.ask(question2, /.+/, __bind(function(src) {
          return this.ask(question3, /.+/, __bind(function(release) {
            this.write(name || default_name, src, release);
            return process.exit();
          }, this));
        }, this));
      }, this));
    };
    Config.prototype.write = function(name, src, release) {
      path = pn("" + this.basepath + "/toaster.coffee");
      toaster = this.tpl.replace("%name", name);
      toaster = toaster.replace("%src", src);
      toaster = toaster.replace("%release", release);
      fs.writeFileSync(path, toaster);
      return console.log("" + 'Created'.green.bold + " " + path);
    };
    return Config;
  })();
  exports.Project = pkg('toaster.generators').Project = Project = (function() {
    __extends(Project, Question);
    function Project(basepath) {
      this.basepath = basepath;
    }
    Project.prototype.create = function(folderpath, name, src, release) {
      var default_name, question1, question2, question3, target;
      if (!folderpath || folderpath === true) {
        console.log(("" + 'Error'.bold.red + " You need to inform") + "a target path!");
        return console.log("\ttoaster new myawesomeapp".green);
      }
      if (folderpath.substr(0, 1) !== "/") {
        target = "" + this.basepath + "/" + folderpath;
      } else {
        target = folderpath;
      }
      if ((name != null) && (src != null) && (release != null)) {
        return this.scaffold(target, name, src, release);
      }
      default_name = target.split('/').pop();
      console.log("" + 'Let\'s toast something fresh! :)'.grey.bold);
      console.log(". With this as your basepath: " + target.cyan);
      console.log(". Please tell me:");
      question1 = "\tWhat's your app name? (" + default_name + ")";
      question2 = "\tWhere's its src folder (absolute/relative)? (src)";
      question3 = "\tWhere do you want your release file? (release/app.js)";
      return this.ask(question1, /.*/, __bind(function(name) {
        return this.ask(question2, /.*/, __bind(function(src) {
          return this.ask(question3, /.*/, __bind(function(release) {
            this.scaffold(target, name || default_name, src, release);
            return process.exit();
          }, this));
        }, this));
      }, this));
    };
    Project.prototype.scaffold = function(target, name, src, release) {
      var releasedir, releasefile, srcdir;
      srcdir = ("" + target + "/") + (src || "src");
      releasefile = ("" + target + "/") + (release || "release/app.js");
      releasedir = releasefile.split("/").slice(0, -1).join("/");
      if (path.existsSync(target)) {
        console.log(("" + 'Error'.bold.red + " Folder exists! " + target).red);
        return;
      }
      fs.mkdirSync(target, 0755);
      console.log("" + 'Created'.green.bold + " " + target);
      fs.mkdirSync(srcdir, 0755);
      console.log("" + 'Created'.green.bold + " " + srcdir);
      fs.mkdirSync(releasedir, 0755);
      console.log("" + 'Created'.green.bold + " " + releasedir);
      name = name;
      srcdir = srcdir.replace(target, "").substr(1);
      releasefile = releasefile.replace(target, "").substr(1);
      return new Config(target).write(name, srcdir, releasefile);
    };
    return Project;
  })();
  fs = require("fs");
  path = require("path");
  pn = path.normalize;
  exec = (require("child_process")).exec;
  colors = require('colors');
  opts = null;
  argv = null;
  exports.run = function() {
    return toaster = new Toaster;
  };
  Toaster = (function() {
    Toaster.prototype.modules = {};
    function Toaster() {
      this.cli = new Cli;
      if (this.cli.argv.h) {
        return console.log(this.cli.opts.help());
      }
      this.basepath = path.resolve(".");
      this.config = new toaster.Config(this.basepath);
      if (this.cli.argv.v) {
        path = pn(__dirname + "/../build/VERSION");
        console.log(fs.readFileSync(path, "utf-8"));
      } else if (this.cli.argv.n) {
        new Project(this.basepath).create(this.cli.argv.n);
      } else if (this.cli.argv.i) {
        new toaster.generators.Config(this.basepath).create(argv.i);
      } else {
        this.init_modules();
      }
      this.builder = new Builder(this);
    }
    Toaster.prototype.init_modules = function() {
      var k, v, _ref, _results;
      _ref = this.config.modules;
      _results = [];
      for (k in _ref) {
        v = _ref[k];
        _results.push(this.modules[v.name] = new Module(this, v, this.cli.opts));
      }
      return _results;
    };
    return Toaster;
  })();
}).call(this);
