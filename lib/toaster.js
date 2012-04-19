(function() {
  var ArrayUtil, Builder, Cli, Config, FsUtil, Project, Question, Script, StringUtil, Toast, Toaster, debug, error, growl, icon_error, icon_warn, interval, log, msgs, pkg, process_msgs, queue_msg, start_worker, stop_worker, toaster, warn,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  toaster = {};

  pkg = function(ns) {
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

  pkg('toaster.generators').Question = Question = (function() {

    Question.name = 'Question';

    function Question() {}

    Question.prototype.ask = function(question, format, fn) {
      var stdin, stdout,
        _this = this;
      stdin = process.stdin;
      stdout = process.stdout;
      stdin.resume();
      stdout.write("" + question + " ");
      return stdin.once('data', function(data) {
        var msg, rule;
        data = data.toString().trim();
        if (format.test(data)) {
          return fn(data);
        } else {
          msg = "" + 'Invalid entry, it should match:'.red;
          rule = "" + (format.toString().cyan);
          stdout.write("\t" + msg + " " + rule + "\n");
          return _this.ask(question, format, fn);
        }
      });
    };

    return Question;

  })();

  pkg('toaster.utils').ArrayUtil = ArrayUtil = (function() {

    ArrayUtil.name = 'ArrayUtil';

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

  pkg('toaster.utils').FsUtil = FsUtil = (function() {
    var exec, fs, path, pn;

    FsUtil.name = 'FsUtil';

    function FsUtil() {}

    path = require("path");

    fs = require("fs");

    pn = (require("path")).normalize;

    exec = (require("child_process")).exec;

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
      var exists, folder, folders, index, _i, _len;
      folders = folderpath.split("/");
      for (index = _i = 0, _len = folders.length; _i < _len; index = ++_i) {
        folder = folders[index];
        folder = folders.slice(0, index + 1).join("/");
        if (folder === "") {
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

    FsUtil.find = function(folderpath, pattern, fn) {
      var _this = this;
      return exec("find " + folderpath + " -name '" + pattern + "'", function(error, stdout, stderr) {
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
      });
    };

    FsUtil.ls_folders = function(basepath, fn) {
      var _this = this;
      if (basepath.slice(-1 === "/")) {
        basepath = basepath.slice(0, -1);
      }
      return exec("find " + basepath + " -maxdepth 1 -type d", function(error, stdout, stderr) {
        var buffer, item, items, _i, _len, _ref;
        buffer = [];
        _ref = items = stdout.trim().split("\n");
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          if (item !== basepath) {
            buffer.push(item);
          }
        }
        return fn(buffer);
      });
    };

    FsUtil.watched = {};

    FsUtil.watch_file = function(filepath, onchange, dispatch_create) {
      var _this = this;
      filepath = pn(filepath);
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
      this.watched[filepath] = true;
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

    FsUtil.watch_folder = function(folderpath, filter_regexp, onchange, dispatch_create) {
      var _this = this;
      folderpath = pn(folderpath);
      if (typeof onchange === "function") {
        onchange({
          type: "folder",
          path: folderpath,
          action: "watching"
        });
      }
      exec("ls " + folderpath, function(error, stdout, stderr) {
        var item, _i, _len, _ref, _results;
        FsUtil.snapshots[folderpath] = FsUtil.format_ls(folderpath, stdout);
        _ref = FsUtil.snapshots[folderpath];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          if (item.type === "folder") {
            _results.push(FsUtil.watch_folder(item.path, filter_regexp, onchange));
          } else {
            if (filter_regexp === null || filter_regexp.test(item.path)) {
              if (dispatch_create) {
                onchange({
                  type: item.type,
                  path: item.path,
                  action: "created"
                });
              }
              _results.push(FsUtil.watch_file(item.path, onchange));
            } else {
              _results.push(void 0);
            }
          }
        }
        return _results;
      });
      return fs.watchFile(folderpath, {
        interval: 250
      }, function(curr, prev) {
        return exec("ls " + folderpath, function(error, stdout, stderr) {
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
                FsUtil.watch_file(info.path, onchange);
              } else if (info.type === "folder") {
                if (typeof onchange === "function") {
                  onchange(info);
                }
                FsUtil.watch_folder(info.path, filter_regexp, onchange, true);
              }
            } else if (info.action === "deleted") {
              if (_this.watched[info.path] === true) {
                _this.watched[info.path];
                if (typeof onchange === "function") {
                  onchange(info);
                }
                fs.unwatchFile(item.path);
              }
            }
          }
          snapshot = FsUtil.format_ls(folderpath, stdout);
          return FsUtil.snapshots[folderpath] = snapshot;
        });
      });
    };

    FsUtil.format_ls = function(folderpath, stdout) {
      var index, item, list, stats, _i, _len;
      list = stdout.toString().trim().split("\n");
      for (index = _i = 0, _len = list.length; _i < _len; index = ++_i) {
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

  pkg('toaster.utils').StringUtil = StringUtil = (function() {

    StringUtil.name = 'StringUtil';

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

  pkg('toaster').Cli = Cli = (function() {
    var optimist;

    Cli.name = 'Cli';

    optimist = require('optimist');

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
      this.argv = (this.opts = optimist.usage(usage).alias('n', 'new').describe('n', "Scaffold a very basic new App").alias('i', 'init').describe('i', "Create a config (toaster.coffee) file").alias('w', 'watch').describe('w', "Start watching/compiling your project").alias('c', 'compile').boolean('c').describe('c', "Compile the entire project, without watching it.").alias('d', 'debug').boolean('d')["default"]('d', false).describe('d', 'Debug mode (compile js files individually)').alias('b', 'bare').boolean('b')["default"]('b', false).describe('b', 'Compile files with "coffee --bare" (no js wrapper)').alias('e', 'expose').string('e')["default"]('e', null).describe('e', 'Specify a macro scope to expose everything (CJS exports).').alias('p', 'package').boolean('p')["default"]('p', false).describe('p', 'Enables/disables the packaging system').alias('m', 'minify').boolean('m')["default"]('m', false).describe('m', 'Minify release code using uglify.').alias('v', 'version').describe('v', '').alias('h', 'help').describe('h', '')).argv;
    }

    return Cli;

  })();

  pkg('toaster.core').Builder = Builder = (function() {
    var cs, fs, missing, path, uglify, uglify_parser;

    Builder.name = 'Builder';

    fs = require('fs');

    path = require('path');

    cs = require("coffee-script");

    uglify = require("uglify-js").uglify;

    uglify_parser = require("uglify-js").parser;

    Builder.prototype.toaster_helper = "__t = ( ns, expose )->\n	curr = null\n	parts = [].concat = ns.split \".\"\n	for part, index in parts\n		if curr == null\n			curr = eval part\n			expose[part] = curr if expose?\n			continue\n		else\n			unless curr[ part ]?\n				curr = curr[ part ] = {}\n				expose[part] = curr if expose?\n			else\n				curr = curr[ part ]\n	curr\n";

    Builder.prototype.include_tmpl = "document.write('<scri'+'pt src=\"%SRC%\"></scr'+'ipt>')";

    function Builder(toaster, config, opts) {
      var _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
      this.toaster = toaster;
      this.config = config;
      this.opts = opts;
      this.merge_vendors = __bind(this.merge_vendors, this);

      this.build = __bind(this.build, this);

      this.src = this.config.src;
      this.vendors = (_ref = this.config.vendors) != null ? _ref : [];
      this.bare = (_ref1 = this.config.bare) != null ? _ref1 : this.opts.argv.bare;
      this.packaging = (_ref2 = this.config.packaging) != null ? _ref2 : this.opts.argv.packaging;
      this.expose = (_ref3 = this.config.expose) != null ? _ref3 : this.opts.argv.expose;
      this.minify = (_ref4 = this.config.minify) != null ? _ref4 : this.opts.argv.minify;
      this.webroot = (_ref5 = this.config.webroot) != null ? _ref5 : '';
      this.release = this.config.release;
      this.debug = this.config.debug;
      this.init();
    }

    Builder.prototype.init = function() {
      var _this = this;
      this.files = [];
      return FsUtil.find(this.src, "*.coffee", function(result) {
        var file, _i, _len;
        for (_i = 0, _len = result.length; _i < _len; _i++) {
          file = result[_i];
          _this.files.push(new Script(_this, file, _this.opts, _this.bare));
        }
        return _this.build(function() {
          if (_this.opts.argv.w) {
            return _this.watch();
          }
        });
      });
    };

    Builder.prototype.build = function(fn) {
      var _this = this;
      return FsUtil.ls_folders(this.src, function(folders) {
        var contents, declaration, f, files, folder, helper, i, include, namespaces, tmpl, vendors, _i, _j, _len, _len1;
        namespaces = "";
        for (_i = 0, _len = folders.length; _i < _len; _i++) {
          folder = folders[_i];
          folder = folder.match(/([^\/]+)$/mg);
          declaration = "";
          if (_this.packaging) {
            declaration += "var " + folder + " = ";
          }
          if (_this.expose != null) {
            declaration += "" + _this.expose + "." + _this.folder + " = ";
          }
          if (declaration.length) {
            declaration += "{};";
          }
          namespaces += "" + declaration + "\n";
        }
        helper = cs.compile(_this.toaster_helper, {
          bare: true
        });
        vendors = _this.merge_vendors();
        contents = [vendors, helper, namespaces, _this.compile()];
        fs.writeFileSync(_this.release, contents.join("\n"));
        log("" + '+'.bold.green + " " + _this.release);
        if (_this.opts.argv.d) {
          files = _this.compile_for_debug();
          if (_this.opts.argv.d) {
            for (i = _j = 0, _len1 = files.length; _j < _len1; i = ++_j) {
              f = files[i];
              include = "" + _this.webroot + "/toaster/" + f;
              tmpl = _this.include_tmpl.replace("%SRC%", include);
              files[i] = tmpl;
            }
            contents = [vendors, helper, namespaces, files.join("\n")];
            fs.writeFileSync(_this.debug, contents.join("\n"));
          }
        }
        return typeof fn === "function" ? fn() : void 0;
      });
    };

    Builder.prototype.watch = function() {
      var _this = this;
      return FsUtil.watch_folder(this.src, /.coffee$/, function(info) {
        var file, msg, relative_path, type;
        type = StringUtil.titleize(info.type);
        relative_path = info.path.replace(_this.src, "");
        switch (info.action) {
          case "created":
            if (info.type === "file") {
              _this.files.push(new Script(_this, info.path, _this.opts));
            }
            msg = "" + ('New ' + info.type + ' created:').bold.green;
            log("" + msg + " " + info.path.green);
            break;
          case "deleted":
            file = ArrayUtil.find(_this.files, relative_path, "filepath");
            _this.files.splice(file.index, 1);
            msg = "" + (type + ' deleted, stop watching: ').bold.red;
            log("" + msg + " " + info.path.red);
            break;
          case "updated":
            file = ArrayUtil.find(_this.files, relative_path, "filepath");
            file.item.getinfo();
            msg = "" + (type + ' changed: ').bold.cyan;
            log("" + msg + " " + info.path.cyan);
            break;
          case "watching":
            msg = "" + ('Watching ' + info.type + ':').bold.cyan;
            log("" + msg + " " + info.path.cyan);
        }
        if (info.action !== "watching") {
          return _this.build();
        }
      });
    };

    Builder.prototype.compile = function() {
      var ast, compiled, file, msg, output, _i, _j, _len, _len1, _ref, _ref1;
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
        fs.writeFileSync(absolute_path, cs.compile(file.raw, {
          bare: 0
        }));
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

  pkg('toaster.core').Script = Script = (function() {
    var cs, fs;

    Script.name = 'Script';

    fs = require("fs");

    cs = require("coffee-script");

    function Script(module, realpath, opts) {
      this.module = module;
      this.realpath = realpath;
      this.opts = opts;
      this.getinfo();
    }

    Script.prototype.getinfo = function() {
      var baseclass, item, klass, repl, requirements, rgx, rgx_ext, _i, _j, _len, _len1, _ref, _ref1, _results;
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
      rgx = /^\s*(class)+\s(\w+)(\s+(extends)\s+([\w.]+))?/gm;
      rgx_ext = /(^|=\s*)(class)\s(\w+)\s(extends)\s(\\w+)\s*$/gm;
      if (this.raw.match(rgx) != null) {
        if (this.namespace !== "") {
          if (this.module.packaging && !(this.module.expose != null)) {
            repl = "$1 __t('" + this.namespace + "').$2$3";
          } else if (this.module.packaging && (this.module.expose != null)) {
            repl = "$1 __t('" + this.namespace + "', " + this.module.expose + ").$2$3";
          } else if (!this.module.packaging && (this.module.expose != null)) {
            repl = "$1 " + this.module.expose + ".$2$3";
          }
          if (repl != null) {
            this.raw = this.raw.replace(rgx, repl);
          }
        }
        this.classname = this.raw.match(rgx)[3];
        if (this.namespace === "") {
          this.classpath = this.classname;
        } else {
          this.classpath = "" + this.namespace + "." + this.classname;
        }
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
      var dependency, expanded, files, found, index, reg, _i, _len, _ref, _results;
      files = this.module.files;
      this.dependencies = [];
      _ref = this.dependencies_collapsed;
      _results = [];
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
        _results.push((function() {
          var _j, _len1, _results1;
          _results1 = [];
          for (_j = 0, _len1 = found.length; _j < _len1; _j++) {
            expanded = found[_j];
            _results1.push(this.dependencies.push(expanded.item.filepath));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    return Script;

  })();

  pkg('toaster.generators').Config = Config = (function(_super) {
    var fs, path, pn;

    __extends(Config, _super);

    Config.name = 'Config';

    path = require("path");

    pn = path.normalize;

    fs = require("fs");

    Config.prototype.tpl = "# => SRC FOLDER\ntoast '%src%'\n	# => VENDORS (optional)\n	# vendors: ['vendors/x.js', 'vendors/y.js', ... ]\n\n	# => OPTIONS (optional, default values listed)\n	# bare: false\n	# packaging: true\n	# expose: ''\n	# minify: false\n\n	# => HTTPFOLDER (optional), RELEASE / DEBUG (required)\n	httpfolder: '%httpfolder%'\n	release: '%release%'\n	debug: '%debug%'";

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
      log("" + 'Let\'s toast this sly little project! :)'.grey.bold);
      log(". With this as your basepath: " + this.basepath.cyan);
      log(". Please, tell me:");
      q1 = "\tWhere's your src folder? (i.e. src): ";
      q2 = "\tWhere do you want your release file? (i.e. www/js/app.js) : ";
      q3 = "\tStarting from your webroot '/', what's the folderpath to " + "reach your release file? (i.e. js) (optional) : ";
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

  })(Question);

  pkg('toaster.generators').Project = Project = (function(_super) {
    var fs, path, pn;

    __extends(Project, _super);

    Project.name = 'Project';

    path = require("path");

    pn = path.normalize;

    fs = require("fs");

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
      log("" + 'Let\'s toast something fresh! :)'.grey.bold);
      log(". With this as your basepath: " + target.cyan);
      log(". Please tell me:");
      q1 = "\tWhere do you want your src folder? [src] : ";
      q2 = "\tWhere do you want your release file? [www/js/app.js] : ";
      q3 = "\tStarting from your webroot '/', what's the folderpath to " + "reach your release file? (i.e. javascript) (optional) : ";
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
      return new Config(target).write(srcdir, releasefile, httpfolder);
    };

    return Project;

  })(Question);

  pkg('toaster').Toast = Toast = (function() {
    var colors, cs, exec, fs, path, pn;

    Toast.name = 'Toast';

    fs = require("fs");

    path = require("path");

    pn = path.normalize;

    exec = (require("child_process")).exec;

    colors = require('colors');

    cs = require("coffee-script");

    function Toast(toaster) {
      var code, filepath, fix_scope;
      this.toaster = toaster;
      this.toast = __bind(this.toast, this);

      this.basepath = this.toaster.basepath;
      filepath = pn("" + this.basepath + "/toaster.coffee");
      if (path.existsSync(filepath)) {
        fix_scope = /(^[\s\t]?)(toast)+(\()/mg;
        code = cs.compile(fs.readFileSync(filepath, "utf-8"), {
          bare: 1
        });
        code = code.replace(fix_scope, "$1this.$2$3");
        eval(code);
      } else {
        error("File not found: ".yelllow + (" " + filepath.red + "\n") + "Try running:".yellow + " toaster -i".green + " or type".yellow + (" " + 'toaster -h'.green + " ") + "for more info".yellow);
      }
    }

    Toast.prototype.toast = function(srcpath, params) {
      var _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
      if (params == null) {
        params = {};
      }
      if (this.src != null) {
        warn(("Can't define " + 'two src folders'.bold + ", pls ").yellow + ("link (" + 'ln -s'.white + ') what you need.'.yellow).yellow);
        return;
      }
      this.src = pn("" + this.basepath + "/" + srcpath + "/");
      if (!path.existsSync(this.src)) {
        error(("Source folder doens't exist:\n\t" + this.root_src.red + "\n") + ("Check your " + 'toaster.coffee'.yellow + " and try again.") + "\n\t" + pn("" + this.basepath + "/toaster.coffee").yellow);
        return process.exit();
      }
      this.vendors = (_ref = params.vendors) != null ? _ref : [];
      this.bare = (_ref1 = params.bare) != null ? _ref1 : false;
      this.packaging = (_ref2 = params.packaging) != null ? _ref2 : true;
      this.expose = ((_ref3 = params.expose === void 0) != null ? _ref3 : null) ? void 0 : params.expose;
      this.minify = (_ref4 = params.minify) != null ? _ref4 : false;
      this.webroot = (_ref5 = params.webroot) != null ? _ref5 : "";
      this.release = pn("" + this.basepath + "/" + params.release);
      return this.debug = pn("" + this.basepath + "/" + params.debug);
    };

    return Toast;

  })();

  exports.run = function() {
    return toaster = new Toaster;
  };

  Toaster = (function() {
    var colors, exec, fs, path, pn;

    Toaster.name = 'Toaster';

    fs = require("fs");

    path = require("path");

    pn = path.normalize;

    exec = (require("child_process")).exec;

    colors = require('colors');

    Toaster.prototype.modules = {};

    function Toaster() {
      var contents, filepath, schema;
      this.basepath = path.resolve(".");
      this.cli = new Cli;
      if (this.cli.argv.v) {
        filepath = pn(__dirname + "/../package.json");
        contents = fs.readFileSync(filepath, "utf-8");
        schema = JSON.parse(contents);
        return log(schema.version);
      } else if (this.cli.argv.n) {
        new Project(this.basepath).create(this.cli.argv.n);
      } else if (this.cli.argv.i) {
        new toaster.generators.Config(this.basepath).create(this.cli.argv.i);
      } else if (this.cli.argv.w) {
        this.config = new toaster.Toast(this);
        this.builder = new Builder(this, this.config, this.cli);
        return;
      } else {
        return log(this.cli.opts.help());
      }
    }

    return Toaster;

  })();

}).call(this);
