var __t;

__t = function(ns) {
  var curr, index, part, parts, _i, _len;
  curr = null;
  parts = [].concat = ns.split(".");
  for (index = _i = 0, _len = parts.length; _i < _len; index = ++_i) {
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

var toaster = exports.toaster = {};

(function() {
  var Toaster, debug, error, growl, icon_error, icon_warn, interval, log, msgs, process_msgs, queue_msg, start_worker, stop_worker, warn,
    __slice = [].slice,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  __t('toaster.generators').Question = (function() {

    function Question() {}

    Question.prototype.ask = function(question, format, fn) {
      var stdin, stdout,
        _this = this;
      stdin = process.stdin;
      stdout = process.stdout;
      stdout.write("" + question + " ");
      return stdin.once('data', function(data) {
        var msg, rule;
        data = data.toString().trim();
        if (format.test(data)) {
          return fn(data.trim());
        } else {
          msg = "" + 'Invalid entry, it should match:'.red;
          rule = "" + (format.toString().cyan);
          stdout.write("\t" + msg + " " + rule + "\n");
          return _this.ask(question, format, fn);
        }
      }).resume();
    };

    return Question;

  })();

  __t('toaster.utils').ArrayUtil = (function() {

    function ArrayUtil() {}

    ArrayUtil.find = function(source, search, by_property) {
      var k, p, v, _i, _j, _k, _len, _len1, _len2;
      if (!by_property) {
        for (k = _i = 0, _len = source.length; _i < _len; k = ++_i) {
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
        for (k = _j = 0, _len1 = source.length; _j < _len1; k = ++_j) {
          v = source[k];
          for (_k = 0, _len2 = by_property.length; _k < _len2; _k++) {
            p = by_property[_k];
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
      var item, k, p, v, _i, _j, _k, _len, _len1, _len2, _output, _unique;
      _output = [];
      _unique = {};
      if (by_property === null) {
        for (k = _i = 0, _len = source.length; _i < _len; k = ++_i) {
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
        for (k = _j = 0, _len1 = source.length; _j < _len1; k = ++_j) {
          v = source[k];
          for (_k = 0, _len2 = by_property.length; _k < _len2; _k++) {
            p = by_property[_k];
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
      var diff, item, search, _i, _j, _len, _len1;
      if (a == null) {
        a = [];
      }
      if (b == null) {
        b = [];
      }
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
      for (_j = 0, _len1 = b.length; _j < _len1; _j++) {
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

  __t('toaster.utils').FnUtil = (function() {

    function FnUtil() {}

    FnUtil.proxy = function() {
      var fn, params;
      fn = arguments[0], params = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return function() {
        var inner_params;
        inner_params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return fn.apply(null, params.concat(inner_params));
      };
    };

    return FnUtil;

  })();

  __t('toaster.utils').FsUtil = (function() {
    var ArrayUtil, FnUtil, fs, path, pn;

    function FsUtil() {}

    path = require("path");

    fs = require("fs");

    pn = (require("path")).normalize;

    FnUtil = toaster.utils.FnUtil;

    ArrayUtil = toaster.utils.ArrayUtil;

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
      var exists, folder, folders, index, _i, _len;
      if ((folderpath.slice(-1)) === "/") {
        folderpath = folderpath.slice(0, -1);
      }
      folders = folderpath.split("/");
      for (index = _i = 0, _len = folders.length; _i < _len; index = ++_i) {
        folder = folders[index];
        if ((folder = folders.slice(0, index + 1).join("/")) === "") {
          continue;
        }
        exists = path.existsSync(folder);
        if (exists && index === folders.length - 1) {
          throw new Error(error("Folder exists: " + folder.red));
          return false;
        } else if (!exists) {
          fs.mkdirSync(folder, '0755');
        }
      }
      return true;
    };

    FsUtil.cp_dir = function(from, to) {
      var dir, file_from, file_to, files, _i, _len, _ref, _results;
      if ((from.slice(-1)) === "/") {
        from = from.slice(0, -1);
      }
      if ((to.slice(-1)) === "/") {
        to = to.slice(0, -1);
      }
      _ref = (files = this.find(from, /.*/, false));
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file_from = _ref[_i];
        file_to = file_from.replace(from, to);
        dir = ((file_to.split('/')).slice(0, -1)).join('/');
        if (!path.existsSync(dir)) {
          this.mkdir_p(dir);
        }
        _results.push(fs.writeFileSync(file_to, fs.readFileSync(file_from, "utf-8")));
      }
      return _results;
    };

    FsUtil.find = function(folderpath, pattern, include_dirs) {
      var file, filepath, files, found, found_under, _i, _len;
      if (include_dirs == null) {
        include_dirs = false;
      }
      found = [];
      files = fs.readdirSync(folderpath);
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        filepath = pn("" + folderpath + "/" + file);
        if (fs.lstatSync(filepath).isDirectory()) {
          if (include_dirs && filepath.match(pattern)) {
            found = found.concat(filepath);
          }
          found_under = FsUtil.find(filepath, pattern, include_dirs);
          found = found.concat(found_under);
        } else {
          if (filepath.match(pattern)) {
            found.push(filepath);
          }
        }
      }
      return found;
    };

    FsUtil.ls_folders = function(folderpath) {
      var file, filepath, files, found, _i, _len;
      found = [];
      files = fs.readdirSync(folderpath);
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        filepath = "" + folderpath + "/" + file;
        if (fs.lstatSync(filepath).isDirectory()) {
          found.push(filepath);
        }
      }
      return found;
    };

    FsUtil.take_snapshot = function(folderpath) {
      var file, filepath, files, found, type, _i, _len;
      found = [];
      files = fs.readdirSync(folderpath);
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        filepath = "" + folderpath + "/" + file;
        if (fs.lstatSync(filepath).isDirectory()) {
          type = "folder";
        } else {
          type = "file";
        }
        found.push({
          type: type,
          path: filepath
        });
      }
      return found;
    };

    FsUtil.watch_file = function(filepath, onchange, dispatch_create) {
      var _this = this;
      filepath = pn(filepath);
      FsUtil.unwatch_file(filepath);
      if (dispatch_create) {
        if (typeof onchange === "function") {
          onchange({
            type: "file",
            path: filepath,
            action: "created"
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
      return fs.watchFile(filepath, {
        interval: 250
      }, function(curr, prev) {
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
      });
    };

    FsUtil.unwatch_file = function(filepath, onchange) {
      FsUtil.watched[filepath] = false;
      return fs.unwatchFile(filepath);
    };

    FsUtil.snapshots = {};

    FsUtil.watchers = {};

    FsUtil.watched = {};

    FsUtil.watch_folder = function(folderpath, filter_regexp, onchange, dispatch_create) {
      var item, on_folder_change, watchers, _i, _len, _ref;
      if (FsUtil.watchers[folderpath]) {
        watchers = FsUtil.watchers[folderpath];
      } else {
        watchers = FsUtil.watchers[folderpath] = [];
      }
      folderpath = pn(folderpath);
      if (typeof onchange === "function") {
        onchange({
          type: "folder",
          path: folderpath,
          action: "watching"
        });
      }
      FsUtil.snapshots[folderpath] = FsUtil.take_snapshot(folderpath);
      _ref = FsUtil.snapshots[folderpath];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        if (item.type === "folder") {
          if (dispatch_create) {
            onchange({
              type: item.type,
              path: item.path,
              action: "created"
            });
          }
          FsUtil.watch_folder(item.path, filter_regexp, onchange, dispatch_create);
        } else if (filter_regexp === null || filter_regexp.test(item.path)) {
          if (dispatch_create) {
            onchange({
              type: item.type,
              path: item.path,
              action: "created"
            });
          }
          FsUtil.watch_file(item.path, onchange);
        }
      }
      watchers.push({
        folderpath: folderpath,
        filter: filter_regexp,
        onchange: onchange,
        dispatch_create: dispatch_create
      });
      if (!FsUtil.watched[folderpath]) {
        FsUtil.watched[folderpath] = true;
        on_folder_change = FnUtil.proxy(FsUtil._on_folder_change, folderpath);
        fs.unwatchFile(folderpath);
        return fs.watchFile(folderpath, {
          interval: 250
        }, on_folder_change);
      }
    };

    FsUtil._on_folder_change = function(folderpath, curr, prev) {
      var a, b, diff, info, item, watcher, watchers, _i, _j, _k, _len, _len1, _len2, _results;
      if (!path.existsSync(folderpath)) {
        return;
      }
      a = FsUtil.snapshots[folderpath];
      b = FsUtil.snapshots[folderpath] = FsUtil.take_snapshot(folderpath);
      diff = ArrayUtil.diff(a, b, "path");
      if (!diff.length) {
        return;
      }
      watchers = FsUtil.watchers[folderpath];
      _results = [];
      for (_i = 0, _len = diff.length; _i < _len; _i++) {
        item = diff[_i];
        info = item.item;
        info.action = item.action;
        if (info.action === "created") {
          if (info.type === "file") {
            _results.push((function() {
              var _j, _len1, _results1;
              _results1 = [];
              for (_j = 0, _len1 = watchers.length; _j < _len1; _j++) {
                watcher = watchers[_j];
                if (watcher.filter.test(info.path)) {
                  if (typeof watcher.onchange === "function") {
                    watcher.onchange(info);
                  }
                  _results1.push(FsUtil.watch_file(info.path, watcher.onchange));
                } else {
                  _results1.push(void 0);
                }
              }
              return _results1;
            })());
          } else if (info.type === "folder") {
            _results.push((function() {
              var _j, _len1, _results1;
              _results1 = [];
              for (_j = 0, _len1 = watchers.length; _j < _len1; _j++) {
                watcher = watchers[_j];
                if (typeof watcher.onchange === "function") {
                  watcher.onchange(info);
                }
                _results1.push(FsUtil.watch_folder(info.path, watcher.filter, watcher.onchange, true));
              }
              return _results1;
            })());
          } else {
            _results.push(void 0);
          }
        } else if (info.action === "deleted") {
          if (info.type === "file") {
            for (_j = 0, _len1 = watchers.length; _j < _len1; _j++) {
              watcher = watchers[_j];
              if (watcher.filter.test(info.path)) {
                if (typeof watcher.onchange === "function") {
                  watcher.onchange(info);
                }
              }
            }
            fs.unwatchFile(info.path);
            _results.push(FsUtil.watched[info.path] = false);
          } else if (info.type === "folder") {
            for (_k = 0, _len2 = watchers.length; _k < _len2; _k++) {
              watcher = watchers[_k];
              if (typeof watcher.onchange === "function") {
                watcher.onchange(info);
              }
            }
            _results.push(FsUtil.unwatch_folder(info.path));
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    FsUtil.unwatch_folder = function(folderpath, onchange) {
      var exists, item, list, watcher_path, _ref, _ref1, _results;
      _ref = FsUtil.watchers;
      for (watcher_path in _ref) {
        list = _ref[watcher_path];
        if (new RegExp("^" + folderpath).test(watcher_path)) {
          FsUtil.watchers[watcher_path] = null;
        }
      }
      _ref1 = FsUtil.watched;
      _results = [];
      for (item in _ref1) {
        exists = _ref1[item];
        if (exists && new RegExp("^" + folderpath).test(item)) {
          FsUtil.watched[item] = false;
          _results.push(fs.unwatchFile(item));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return FsUtil;

  }).call(this);

  growl = require('growl');

  icon_warn = __dirname + '/../images/warning.png';

  icon_error = __dirname + '/../images/error.png';

  log = function(msg, send_to_growl) {
    if (send_to_growl == null) {
      send_to_growl = false;
    }
    console.log(msg);
    return msg;
  };

  debug = function(msg, send_to_growl) {
    if (send_to_growl == null) {
      send_to_growl = false;
    }
    msg = log("" + msg.magenta);
    return msg;
  };

  error = function(msg, send_to_growl, file) {
    if (send_to_growl == null) {
      send_to_growl = true;
    }
    if (file == null) {
      file = null;
    }
    msg = log("ERROR ".bold.red + msg);
    if (send_to_growl) {
      msg = msg.replace(/\[\d{2}m/g, "");
      msg = msg.replace(/(\[\dm)([^\s]+)/ig, "<$2>$3");
      queue_msg({
        msg: msg,
        opts: {
          title: 'Coffee Toaster',
          image: icon_error
        }
      });
    }
    return msg;
  };

  warn = function(msg, send_to_growl) {
    if (send_to_growl == null) {
      send_to_growl = true;
    }
    msg = log("WARNING ".bold.yellow + msg);
    if (send_to_growl) {
      msg = msg.replace(/\[\d{2}m/g, "");
      msg = msg.replace(/(\[\dm)([^\s]+)/ig, "<$2>$3");
      queue_msg({
        msg: msg,
        opts: {
          title: 'Coffee Toaster',
          image: icon_warn
        }
      });
    }
    return msg;
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

  __t('toaster.utils').StringUtil = (function() {

    function StringUtil() {}

    StringUtil.titleize = function(str) {
      var index, word, words, _i, _len;
      words = str.match(/[a-z]+/gi);
      for (index = _i = 0, _len = words.length; _i < _len; index = ++_i) {
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

  __t('toaster.core').Script = (function() {
    var ArrayUtil, cs, fs, path, pn;

    fs = require("fs");

    path = require('path');

    pn = path.normalize;

    cs = require("coffee-script");

    ArrayUtil = toaster.utils.ArrayUtil;

    function Script(builder, folderpath, realpath, alias, opts) {
      this.builder = builder;
      this.folderpath = folderpath;
      this.realpath = realpath;
      this.alias = alias;
      this.opts = opts;
      this.getinfo();
    }

    Script.prototype.getinfo = function() {
      var baseclass, item, klass, repl, requirements, rgx, rgx_ext, _i, _j, _len, _len1, _ref, _ref1, _results;
      this.raw = fs.readFileSync(this.realpath, "utf-8");
      this.dependencies_collapsed = [];
      this.baseclasses = [];
      this.filepath = this.realpath.replace(this.folderpath, "").substr(1);
      if (this.alias != null) {
        this.filepath = pn("" + this.alias + "/" + this.filepath);
      }
      this.filename = /[\w-]+\.[\w-]+/.exec(this.filepath)[0];
      this.filefolder = this.filepath.replace("/" + this.filename, "") + "/";
      this.namespace = "";
      if (this.filepath.indexOf("/") === -1) {
        this.filefolder = "";
      }
      this.namespace = this.filefolder.replace(/\//g, ".").slice(0, -1);
      rgx = /^(\s*)(class)+\s(\w+)(\s+(extends)\s+([\w.]+))?/gm;
      rgx_ext = /(^|=\s*)(class)\s(\w+)\s(extends)\s(\\w+)\s*$/gm;
      if (this.raw.match(rgx) != null) {
        this.classpath = this.classname;
        if (this.namespace !== "" && this.builder.packaging) {
          repl = "$1$2 __t('" + this.namespace + "').$3$4";
          this.raw = this.raw.replace(rgx, repl);
          this.classpath = "" + this.namespace + "." + this.classname;
        }
        this.classname = this.raw.match(rgx)[3];
        _ref1 = (_ref = this.raw.match(rgx_ext)) != null ? _ref : [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          klass = _ref1[_i];
          baseclass = klass.match(rgx_ext)[5];
          this.baseclasses.push(baseclass);
        }
      }
      if (/(#<<\s)(.*)/g.test(this.raw)) {
        requirements = this.raw.match(/(#<<\s)(.*)/g);
        _results = [];
        for (_j = 0, _len1 = requirements.length; _j < _len1; _j++) {
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
      var dependency, expanded, files, found, index, reg, _i, _j, _len, _len1, _ref;
      files = this.builder.files;
      this.dependencies = [];
      _ref = this.dependencies_collapsed;
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        dependency = _ref[index];
        if (dependency.substr(-1) !== "*") {
          this.dependencies.push("" + dependency + ".coffee");
          continue;
        }
        reg = new RegExp(dependency.replace(/(\/)/g, "\\$1"));
        found = ArrayUtil.find_all(files, reg, "filepath", true, true);
        if (found.length <= 0) {
          warn(("Nothing found inside " + ("'" + dependency).white + "'").yellow);
          continue;
        }
        for (_j = 0, _len1 = found.length; _j < _len1; _j++) {
          expanded = found[_j];
          if (expanded.item.filepath !== this.filepath) {
            this.dependencies.push(expanded.item.filepath);
          }
        }
      }
      return this.dependencies;
    };

    return Script;

  })();

  __t('toaster').Cli = (function() {
    var optimist;

    optimist = require('optimist');

    function Cli() {
      var usage;
      usage = "" + 'CoffeeToaster'.bold + "\n";
      usage += "  Minimalist build system for CoffeeScript\n\n".grey;
      usage += "" + 'Usage:' + "\n";
      usage += "  toaster [" + 'options'.green + "] [" + 'path'.green + "]\n\n";
      usage += "" + 'Examples:' + "\n";
      usage += "  toaster -n myawsomeapp   (" + 'required'.red + ")\n";
      usage += "  toaster -i [myawsomeapp] (" + 'optional'.green + ")\n";
      usage += "  toaster -w [myawsomeapp] (" + 'optional'.green + ")";
      this.argv = (this.opts = optimist.usage(usage).alias('n', 'new').describe('n', "Scaffold a very basic new App").alias('i', 'init').describe('i', "Create a config (toaster.coffee) file").alias('w', 'watch').string('w').describe('w', "Start watching/compiling your project").alias('c', 'compile').string('c').describe('c', "Compile the entire project, without watching it.").alias('d', 'debug').boolean('d')["default"]('d', false).describe('d', 'Debug mode (compile js files individually)').alias('j', 'config').string('j').describe('j', "Config file formatted as a json-string.").alias('f', 'config-file').string('f').describe('f', "Path to a different config file.").alias('v', 'version').describe('v', '').alias('h', 'help').describe('h', '')).argv;
    }

    return Cli;

  })();

  __t('toaster.core').Builder = (function() {
    var ArrayUtil, FnUtil, FsUtil, Script, StringUtil, cs, fs, missing, path, uglify, uglify_parser;

    fs = require('fs');

    path = require('path');

    cs = require("coffee-script");

    uglify = require("uglify-js").uglify;

    uglify_parser = require("uglify-js").parser;

    Script = toaster.core.Script;

    FnUtil = toaster.utils.FnUtil;

    FsUtil = toaster.utils.FsUtil;

    ArrayUtil = toaster.utils.ArrayUtil;

    StringUtil = toaster.utils.StringUtil;

    Builder.prototype._toaster_helper = "__t = ( ns )->\n	curr = null\n	parts = [].concat = ns.split \".\"\n	for part, index in parts\n		if curr == null\n			curr = eval part\n			continue\n		else\n			unless curr[ part ]?\n				curr = curr[ part ] = {}\n			else\n				curr = curr[ part ]\n	curr";

    Builder.prototype._include_tmpl = "document.write('<scri'+'pt src=\"%SRC%\"></scr'+'ipt>')";

    function Builder(toaster, cli, config) {
      this.toaster = toaster;
      this.cli = cli;
      this.config = config;
      this.merge_vendors = __bind(this.merge_vendors, this);

      this.build_namespaces_declaration = __bind(this.build_namespaces_declaration, this);

      this.build = __bind(this.build, this);

      this.vendors = this.config.vendors;
      this.bare = this.config.bare;
      this.packaging = this.config.packaging;
      this.expose = this.config.expose;
      this.minify = this.config.minify;
      this.exclude = [].concat(this.config.exclude);
      this.httpfolder = this.config.httpfolder;
      this.release = this.config.release;
      this.debug = this.config.debug;
      this.init();
      if (this.cli.argv.w) {
        this.watch();
      }
    }

    Builder.prototype.init = function() {
      var falias, file, folder, fpath, include, item, result, s, _i, _len, _ref, _results;
      this.files = this.config.files;
      _ref = this.config.src_folders;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        folder = _ref[_i];
        result = FsUtil.find(folder.path, /.coffee/);
        fpath = folder.path;
        falias = folder.alias;
        _results.push((function() {
          var _j, _k, _len1, _len2, _ref1, _results1;
          _results1 = [];
          for (_j = 0, _len1 = result.length; _j < _len1; _j++) {
            file = result[_j];
            include = true;
            _ref1 = this.exclude;
            for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
              item = _ref1[_k];
              include &= !(new RegExp(item).test(file));
            }
            if (include) {
              s = new Script(this, fpath, file, falias, this.cli);
              _results1.push(this.files.push(s));
            } else {
              _results1.push(void 0);
            }
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    Builder.prototype.build = function(header_code, footer_code) {
      var ast, contents, f, files, helper, i, include, namespaces, now, tmpl, vendors, _i, _len;
      if (header_code == null) {
        header_code = "";
      }
      if (footer_code == null) {
        footer_code = "";
      }
      namespaces = this.build_namespaces();
      if (this.packaging) {
        helper = cs.compile(this._toaster_helper, {
          bare: true
        });
      } else {
        helper = "";
      }
      vendors = this.merge_vendors();
      contents = [];
      if (vendors !== "") {
        contents.push(vendors);
      }
      if (this.packaging) {
        contents.push(helper);
      }
      if (this.packaging) {
        contents.push(namespaces);
      }
      if (header_code !== "") {
        contents.push(header_code);
      }
      contents.push(this.compile());
      if (header_code !== "") {
        contents.push(footer_code);
      }
      contents = contents.join('\n');
      if (this.minify) {
        ast = uglify_parser.parse(contents);
        ast = uglify.ast_mangle(ast);
        ast = uglify.ast_squeeze(ast);
        contents = uglify.gen_code(ast);
      }
      fs.writeFileSync(this.release, contents);
      now = new Date();
      now = "" + (now.getHours()) + ":" + (now.getMinutes()) + ":" + (now.getSeconds());
      log(("" + 'Compiled'.bold + " " + this.release + " @ " + now).green);
      if (this.cli.argv.d && (this.debug != null)) {
        files = this.compile_for_debug();
        for (i = _i = 0, _len = files.length; _i < _len; i = ++_i) {
          f = files[i];
          include = "" + this.httpfolder + "/toaster/" + f;
          tmpl = this._include_tmpl.replace("%SRC%", include);
          files[i] = tmpl;
        }
        contents = [];
        if (vendors !== "") {
          contents.push(vendors);
        }
        if (this.packaging) {
          contents.push(helper);
        }
        if (this.packaging) {
          contents.push(namespaces);
        }
        if (header_code !== "") {
          contents.push(header_code);
        }
        contents.push(files.join("\n"));
        if (header_code !== "") {
          contents.push(footer_code);
        }
        contents = contents.join('\n');
        fs.writeFileSync(this.debug, contents);
        now = new Date();
        now = "" + (now.getHours()) + ":" + (now.getMinutes()) + ":" + (now.getSeconds());
        return log(("" + 'Compiled'.bold + " " + this.debug + " @ " + now).green);
      }
    };

    Builder.prototype.build_namespaces = function(after_build_namespaces) {
      var folder, name, namespaces, subfolder, subfolders, _i, _j, _len, _len1, _ref;
      namespaces = "";
      _ref = this.config.src_folders;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        folder = _ref[_i];
        if (folder.alias != null) {
          namespaces += this.build_namespaces_declaration(folder.alias);
        } else {
          subfolders = FsUtil.ls_folders(folder.path);
          for (_j = 0, _len1 = subfolders.length; _j < _len1; _j++) {
            subfolder = subfolders[_j];
            name = subfolder.match(/[^\/]+$/m);
            namespaces += this.build_namespaces_declaration(name);
          }
        }
      }
      return namespaces;
    };

    Builder.prototype.build_namespaces_declaration = function(name) {
      var declaration;
      declaration = "";
      if (this.packaging) {
        declaration += "var " + name + " = ";
      }
      if (this.expose != null) {
        declaration += "" + this.expose + "." + name + " = ";
      }
      if (declaration.length) {
        declaration += "{};\n";
      }
      return declaration;
    };

    Builder.prototype.watch = function() {
      var src, _i, _len, _ref, _results,
        _this = this;
      _ref = this.config.src_folders;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        src = _ref[_i];
        _results.push(FsUtil.watch_folder(src.path, /.coffee$/, FnUtil.proxy(function(src, info) {
          var falias, file, fpath, ipath, msg, relative_path, s, type;
          if (info.action === "watching") {
            return;
          }
          if (info.type === "folder" && info.action === "created") {
            return;
          }
          ipath = info.path;
          fpath = src.path;
          falias = src.alias || "";
          type = StringUtil.titleize(info.type);
          relative_path = info.path.replace("" + fpath + "/", "" + falias + "/");
          if (relative_path.substr(0, 1) === "/") {
            relative_path = relative_path.substr(1);
          }
          switch (info.action) {
            case "created":
              if (info.type === "file") {
                s = new Script(_this, fpath, ipath, falias, _this.cli);
                _this.files.push(s);
              }
              msg = "" + ('New ' + info.type + ' created').bold.cyan;
              log("" + msg + " " + info.path.green);
              break;
            case "deleted":
              file = ArrayUtil.find(_this.files, relative_path, "filepath");
              if (file === null) {
                return;
              }
              _this.files.splice(file.index, 1);
              msg = "" + (type + ' deleted, stop watching').bold.red;
              log("" + msg + " " + info.path.red);
              break;
            case "updated":
              file = ArrayUtil.find(_this.files, relative_path, "filepath");
              file.item.getinfo();
              msg = "" + (type + ' changed').bold.cyan;
              log("" + msg + " " + info.path.cyan);
          }
          _this.build();
          return typeof after_watch === "function" ? after_watch() : void 0;
        }, src)));
      }
      return _results;
    };

    Builder.prototype.compile = function() {
      var file, msg, output, _i, _j, _len, _len1, _ref, _ref1;
      _ref = this.files;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        try {
          cs.compile(file.raw);
        } catch (err) {
          msg = err.message.replace('"', '\\"');
          msg = ("" + msg.white + " at file: ") + ("" + file.filepath).bold.red;
          error(msg);
          return null;
        }
      }
      _ref1 = this.files;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        file = _ref1[_j];
        file.expand_dependencies();
      }
      this.reorder();
      output = ((function() {
        var _k, _len2, _ref2, _results;
        _ref2 = this.files;
        _results = [];
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          file = _ref2[_k];
          _results.push(file.raw);
        }
        return _results;
      }).call(this)).join("\n");
      return output = cs.compile(output, {
        bare: this.bare
      });
    };

    Builder.prototype.compile_for_debug = function() {
      var absolute_path, file, files, folder_path, index, relative_path, release_path, _i, _len, _ref;
      release_path = this.release.split("/").slice(0, -1).join("/");
      release_path += "/toaster";
      if (path.existsSync(release_path)) {
        FsUtil.rmdir_rf(release_path);
      }
      FsUtil.mkdir_p(release_path);
      files = [];
      _ref = this.files;
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        file = _ref[index];
        relative_path = file.filepath.replace(".coffee", ".js");
        absolute_path = "" + release_path + "/" + relative_path;
        folder_path = absolute_path.split('/').slice(0, -1).join("/");
        if (!path.existsSync(folder_path)) {
          FsUtil.mkdir_p(folder_path);
        }
        try {
          fs.writeFileSync(absolute_path, cs.compile(file.raw, {
            bare: this.bare
          }));
        } catch (err) {
          continue;
        }
        files.push(relative_path);
      }
      return files;
    };

    missing = {};

    Builder.prototype.reorder = function(cycling) {
      var bc, dependency, dependency_index, file, file_index, filepath, found, i, index, not_found, _i, _j, _len, _len1, _ref, _ref1, _results;
      if (cycling == null) {
        cycling = false;
      }
      if (cycling === false) {
        this.missing = {};
      }
      _ref = this.files;
      _results = [];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        file = _ref[i];
        if (!file.dependencies.length && !file.baseclasses.length) {
          continue;
        }
        _ref1 = file.dependencies;
        for (index = _j = 0, _len1 = _ref1.length; _j < _len1; index = ++_j) {
          filepath = _ref1[index];
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
          var _k, _len2, _ref2, _results1;
          _ref2 = file.baseclasses;
          _results1 = [];
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            bc = _ref2[_k];
            found = ArrayUtil.find(this.files, bc, "classname");
            not_found = (found === null) || (found.index > file_index);
            if (not_found && !this.missing[bc]) {
              this.missing[bc] = true;
              _results1.push(warn("Base class ".yellow + ("" + bc + " ").bold.grey + "not found for class ".yellow + ("" + file.classname + " ").bold.grey + "in file ".yellow + file.filepath.bold.grey));
            } else {
              _results1.push(void 0);
            }
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    Builder.prototype.merge_vendors = function() {
      var buffer, vendor, _i, _len, _ref;
      buffer = [];
      _ref = this.vendors;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        vendor = _ref[_i];
        if (path.existsSync(vendor)) {
          buffer.push(fs.readFileSync(vendor, 'utf-8'));
        } else {
          warn("Vendor not found at ".white + vendor.yellow.bold);
        }
      }
      return buffer.join("\n");
    };

    return Builder;

  })();

  __t('toaster.generators').Config = (function(_super) {
    var fs, path, pn;

    __extends(Config, _super);

    path = require("path");

    pn = path.normalize;

    fs = require("fs");

    Config.prototype.tpl = "# => SRC FOLDER\ntoast '%src%'\n\n	# EXCLUDED FOLDERS (optional)\n	# exclude: ['folder/to/exclude', 'another/folder/to/exclude', ... ]\n\n	# => VENDORS (optional)\n	# vendors: ['vendors/x.js', 'vendors/y.js', ... ]\n\n	# => OPTIONS (optional, default values listed)\n	# bare: false\n	# packaging: true\n	# expose: ''\n	# minify: true\n\n	# => HTTPFOLDER (optional), RELEASE / DEBUG (required)\n	httpfolder: '%httpfolder%'\n	release: '%release%'\n	debug: '%debug%'";

    function Config(basepath) {
      this.basepath = basepath;
      this.write = __bind(this.write, this);

      this.create = __bind(this.create, this);

    }

    Config.prototype.create = function(folderpath) {
      var q1, q2, q3,
        _this = this;
      if ((folderpath != null) && folderpath !== true) {
        this.basepath = "" + this.basepath + "/" + folderpath;
      }
      q1 = "Path to your src folder? [src] : ";
      q2 = "Path to your release file? [www/js/app.js] : ";
      q3 = "Starting from your webroot '/', what's the folderpath to " + "reach your release file? (i.e. js) (optional) : ";
      return this.ask(q1.magenta, /.+/, function(src) {
        return _this.ask(q2.magenta, /.+/, function(release) {
          return _this.ask(q3.cyan, /.*/, function(httpfolder) {
            return _this.write(src, release, httpfolder);
          });
        });
      });
    };

    Config.prototype.write = function(src, release, httpfolder) {
      var buffer, filename, filepath, parts, question, rgx,
        _this = this;
      filepath = pn("" + this.basepath + "/toaster.coffee");
      rgx = /(\/)?((\w+)(\.*)(\w+$))/;
      parts = rgx.exec(release);
      filename = parts[2];
      if (filename.indexOf(".") > 0) {
        debug = release.replace(rgx, "$1$3-debug$4$5");
      } else {
        debug = "" + release + "-debug";
      }
      buffer = this.tpl.replace("%src%", src);
      buffer = buffer.replace("%release%", release);
      buffer = buffer.replace("%debug%", debug);
      buffer = buffer.replace("%httpfolder%", httpfolder);
      if (path.existsSync(filepath)) {
        question = "\tDo you want to overwrite the file: " + filepath.yellow;
        question += " ? [y/N] : ".white;
        return this.ask(question, /.*?/, function(overwrite) {
          if (overwrite.match(/y/i)) {
            _this.save(filepath, buffer);
            return process.exit();
          }
        });
      } else {
        this.save(filepath, buffer);
        return process.exit();
      }
    };

    Config.prototype.save = function(filepath, contents) {
      fs.writeFileSync(filepath, contents);
      log("" + 'Created'.green.bold + " " + filepath);
      return process.exit();
    };

    return Config;

  })(toaster.generators.Question);

  __t('toaster.generators').Project = (function(_super) {
    var FsUtil, fs, path, pn;

    __extends(Project, _super);

    path = require("path");

    pn = path.normalize;

    fs = require("fs");

    FsUtil = toaster.utils.FsUtil;

    function Project(basepath) {
      this.basepath = basepath;
      this.scaffold = __bind(this.scaffold, this);

    }

    Project.prototype.create = function(folderpath, name, src, release) {
      var q1, q2, q3, target,
        _this = this;
      if (!folderpath || folderpath === true) {
        return error("You need to inform a target path!\n" + "\ttoaster -n myawesomeapp".green);
      }
      if (folderpath.substr(0, 1) !== "/") {
        target = "" + this.basepath + "/" + folderpath;
      } else {
        target = folderpath;
      }
      if ((name != null) && (src != null) && (release != null)) {
        return this.scaffold(target, name, src, release);
      }
      q1 = "Path to your src folder? [src] : ";
      q2 = "Path to your release file? [www/js/app.js] : ";
      q3 = "Starting from your webroot '/', what's the folderpath to " + "reach your release file? (i.e. js) (optional) : ";
      return this.ask(q1.magenta, /.*/, function(src) {
        if (src == null) {
          src = null;
        }
        return _this.ask(q2.magenta, /.*/, function(release) {
          if (release == null) {
            release = null;
          }
          return _this.ask(q3.cyan, /.*/, function(httpfolder) {
            var $httpfolder, $release, $src;
            if (httpfolder == null) {
              httpfolder = null;
            }
            $src = src || "src";
            $release = release || "www/js/app.js";
            if (src === '' && release === '' && httpfolder === '') {
              $httpfolder = 'js';
            } else {
              $httpfolder = httpfolder || "";
            }
            _this.scaffold(target, $src, $release, $httpfolder);
            return process.exit();
          });
        });
      });
    };

    Project.prototype.scaffold = function(target, src, release, httpfolder) {
      var releasedir, releasefile, srcdir, vendorsdir;
      srcdir = pn("" + target + "/" + src);
      vendorsdir = pn("" + target + "/vendors");
      releasefile = pn("" + target + "/" + release);
      releasedir = releasefile.split("/").slice(0, -1).join("/");
      if (FsUtil.mkdir_p(target)) {
        log("" + 'Created'.green.bold + " " + target);
      }
      if (FsUtil.mkdir_p(srcdir)) {
        log("" + 'Created'.green.bold + " " + srcdir);
      }
      if (FsUtil.mkdir_p(vendorsdir)) {
        log("" + 'Created'.green.bold + " " + vendorsdir);
      }
      if (FsUtil.mkdir_p(releasedir)) {
        log("" + 'Created'.green.bold + " " + releasedir);
      }
      srcdir = srcdir.replace(target, "").substr(1);
      releasefile = releasefile.replace(target, "").substr(1);
      return new toaster.generators.Config(target).write(srcdir, releasefile, httpfolder);
    };

    return Project;

  })(toaster.generators.Question);

  __t('toaster').Toast = (function() {
    var colors, cs, exec, fs, path, pn;

    fs = require("fs");

    path = require("path");

    pn = path.normalize;

    exec = (require("child_process")).exec;

    colors = require('colors');

    cs = require("coffee-script");

    Toast.prototype.builders = [];

    function Toast(toaster) {
      var code, config, config_file, contents, filepath, fix_scope, item, _i, _len, _ref;
      this.toaster = toaster;
      this.toast = __bind(this.toast, this);

      this.basepath = this.toaster.basepath;
      if ((config = this.toaster.cli.argv["config"]) != null) {
        if (!(config instanceof Object)) {
          config = JSON.parse(config);
        }
        _ref = [].concat(config);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          this.toast(item);
        }
      } else {
        config_file = this.toaster.cli.argv["config-file"];
        filepath = config_file || pn("" + this.basepath + "/toaster.coffee");
        if (path.existsSync(filepath)) {
          contents = fs.readFileSync(filepath, "utf-8");
          fix_scope = /(^[\s\t]?)(toast)+(\()/mg;
          code = cs.compile(contents, {
            bare: 1
          });
          code = code.replace(fix_scope, "$1this.$2$3");
          eval(code);
        } else {
          error("File not found: ".yellow + (" " + filepath.red + "\n") + "Try running:".yellow + " toaster -i".green + " or type".yellow + (" " + 'toaster -h'.green + " ") + "for more info".yellow);
        }
      }
    }

    Toast.prototype.toast = function(srcpath, params) {
      var alias, config, folder, i, item, v, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      if (params == null) {
        params = {};
      }
      if (srcpath instanceof Object) {
        params = srcpath;
      } else if (srcpath.substr(0, 1) !== "/") {
        srcpath = "" + this.toaster.basepath + "/" + srcpath;
      }
      debug = params.debug ? pn("" + this.basepath + "/" + params.debug) : null;
      config = {
        is_building: false,
        basepath: this.basepath,
        src_folders: [],
        files: [],
        vendors: (_ref = params.vendors) != null ? _ref : [],
        exclude: (_ref1 = params.exclude) != null ? _ref1 : [],
        bare: (_ref2 = params.bare) != null ? _ref2 : false,
        packaging: (_ref3 = params.packaging) != null ? _ref3 : true,
        expose: (_ref4 = params.expose) != null ? _ref4 : null,
        minify: (_ref5 = params.minify) != null ? _ref5 : true,
        httpfolder: (_ref6 = params.httpfolder) != null ? _ref6 : "",
        release: pn("" + this.basepath + "/" + params.release),
        debug: debug
      };
      _ref7 = config.vendors;
      for (i = _i = 0, _len = _ref7.length; _i < _len; i = ++_i) {
        v = _ref7[i];
        config.vendors[i] = pn("" + this.basepath + "/" + v);
      }
      console.log(config.vendors);
      if (!(srcpath instanceof Object)) {
        config.src_folders.push({
          path: srcpath,
          alias: params.alias || null
        });
      }
      if (params.folders != null) {
        _ref8 = params.folders;
        for (folder in _ref8) {
          alias = _ref8[folder];
          if (folder.substr(0, 1 === !"/")) {
            folder = pn("" + this.basepath + "/" + folder + "/");
          }
          config.src_folders.push({
            path: folder,
            alias: alias
          });
        }
      }
      _ref9 = config.src_folders;
      for (_j = 0, _len1 = _ref9.length; _j < _len1; _j++) {
        item = _ref9[_j];
        if (!path.existsSync(item.path)) {
          error(("Source folder doens't exist:\n\t" + item.path.red + "\n") + ("Check your " + 'toaster.coffee'.yellow + " and try again.") + "\n\t" + pn("" + this.basepath + "/toaster.coffee").yellow);
          return process.exit();
        }
      }
      return this.builders.push(new toaster.core.Builder(this.toaster, this.toaster.cli, config));
    };

    return Toast;

  })();

  exports.run = function() {
    return new Toaster;
  };

  exports.toaster = toaster;

  exports.Toaster = Toaster = (function() {
    var colors, exec, fs, path, pn;

    fs = require("fs");

    path = require("path");

    pn = path.normalize;

    exec = (require("child_process")).exec;

    colors = require('colors');

    function Toaster(basedir, options, skip_initial_build) {
      var base, config, contents, filepath, k, schema, v;
      if (options == null) {
        options = null;
      }
      if (skip_initial_build == null) {
        skip_initial_build = false;
      }
      this.basepath = basedir || path.resolve(".");
      this.cli = new toaster.Cli(options);
      if (options != null) {
        for (k in options) {
          v = options[k];
          this.cli.argv[k] = v;
        }
      }
      if (this.cli.argv.v) {
        filepath = pn(__dirname + "/../package.json");
        contents = fs.readFileSync(filepath, "utf-8");
        schema = JSON.parse(contents);
        return log(schema.version);
      } else if (this.cli.argv.n) {
        new toaster.generators.Project(this.basepath).create(this.cli.argv.n);
      } else if (this.cli.argv.i) {
        new toaster.generators.Config(this.basepath).create(this.cli.argv.i);
      } else if ((base = this.cli.argv.w || this.cli.argv.c)) {
        if (base !== true) {
          if (base[0] === "/") {
            this.basepath = base;
          } else {
            this.basepath = pn("" + this.basepath + "/" + base);
          }
        }
        config = options && options.config ? options.config : null;
        this.toast = new toaster.Toast(this);
        if (!skip_initial_build) {
          this.build();
        }
      } else {
        return log(this.cli.opts.help());
      }
    }

    Toaster.prototype.build = function(header_code, footer_code) {
      var builder, _i, _len, _ref, _results;
      if (header_code == null) {
        header_code = "";
      }
      if (footer_code == null) {
        footer_code = "";
      }
      _ref = this.toast.builders;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        builder = _ref[_i];
        _results.push(builder.build(header_code, footer_code));
      }
      return _results;
    };

    return Toaster;

  })();

}).call(this);
