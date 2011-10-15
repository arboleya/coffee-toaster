(function() {
  var ArrayUtil, Config, Css, FsUtil, Kup, Parser, Project, Question, Script, StringUtil, Toaster, argv, colors, cs, exec, fs, optimist, opts, path, pn;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  path = require("path");
  fs = require("fs");
  pn = path.normalize;
  exports.FsUtil = FsUtil = (function() {
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
    FsUtil.watch_file = function(filepath, onchange) {
      filepath = pn(filepath);
      if (typeof onchange === "function") {
        onchange({
          type: "file",
          path: filepath,
          action: "watching"
        });
      }
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
    FsUtil.watch_folder = function(folderpath, onchange) {
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
          _results.push(item.type === "folder" ? FsUtil.watch_folder(item.path, onchange) : FsUtil.watch_file(item.path, onchange));
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
              if (typeof onchange === "function") {
                onchange(info);
              }
              if (info.type === "file") {
                FsUtil.watch_file(info.path, onchange);
              } else if (info.type === "folder") {
                FsUtil.watch_folder(info.path, onchange);
              }
            } else if (info.action === "deleted") {
              if (typeof onchange === "function") {
                onchange(info);
              }
              fs.unwatchFile(item.path);
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
  ArrayUtil = (function() {
    function ArrayUtil() {}
    ArrayUtil.find = function(source, search, by_property) {
      var k, p, v, _i, _len, _len2, _len3;
      if (by_property === null) {
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
    ArrayUtil.find_all = function(source, search, by_property, regexp) {
      var k, p, v, _i, _len, _len2, _len3, _output;
      _output = [];
      if (by_property === null) {
        for (k = 0, _len = source.length; k < _len; k++) {
          v = source[k];
          if (regexp) {
            if (search.test(v)) {
              _output.push({
                item: v,
                index: k
              });
            }
          } else {
            if (search === v) {
              _output.push({
                item: v,
                index: k
              });
            }
          }
        }
      } else {
        by_property = [].concat(by_property);
        for (k = 0, _len2 = source.length; k < _len2; k++) {
          v = source[k];
          for (_i = 0, _len3 = by_property.length; _i < _len3; _i++) {
            p = by_property[_i];
            if (regexp) {
              if (search.test(v[p])) {
                _output.push({
                  item: v,
                  index: k
                });
              }
            } else {
              if (search === v[p]) {
                _output.push({
                  item: v,
                  index: k
                });
              }
            }
          }
        }
      }
      if (_output.length) {
        return _output;
      } else {
        return null;
      }
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
    return ArrayUtil;
  })();
  StringUtil = (function() {
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
  Question = (function() {
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
  Config = (function() {
    __extends(Config, Question);
    Config.prototype.tpl = "modules =\n\tname: '%name'\n\tsrc: '%src'\n\trelease: '%release'\n";
    function Config(basepath) {
      this.basepath = basepath;
    }
    Config.prototype.create = function(folderpath) {
      var default_name, question1, question2, question3;
      if ((folderpath != null) && folderpath !== true) {
        this.basepath = "" + this.basepath + "/" + folderpath;
      }
      console.log(this.basepath);
      console.log("asdf >>> " + folderpath);
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
      var toaster;
      path = pn("" + this.basepath + "/toaster.coffee");
      toaster = this.tpl.replace("%name", name);
      toaster = toaster.replace("%src", src);
      toaster = toaster.replace("%release", release);
      fs.writeFileSync(path, toaster);
      return console.log("" + 'Created'.green.bold + " " + path);
    };
    return Config;
  })();
  exports.Project = Project = (function() {
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
  Css = (function() {
    function Css() {}
    return Css;
  })();
  Kup = (function() {
    function Kup() {}
    return Kup;
  })();
  fs = require("fs");
  cs = require("coffee-script");
  Script = (function() {
    function Script(config, opts) {
      this.config = config;
      this.opts = opts;
      this.watch = __bind(this.watch, this);
      this.src = this.config.src;
      this.release = this.config.release;
      this.compile(this.opts.argv.w ? this.watch : null);
    }
    Script.prototype.watch = function() {
      return FsUtil.watch_folder(this.src, __bind(function(info) {
        var msg, type;
        type = StringUtil.titleize(info.type);
        switch (info.action) {
          case "created":
            msg = "" + ('New ' + info.type + ' created:').green;
            console.log("" + msg + " " + info.path);
            return this.compile();
          case "deleted":
            msg = "" + (type + ' deleted, stop watching: ').red;
            console.log("" + msg + " " + info.path);
            return this.compile();
          case "updated":
            msg = "" + (type + ' changed').yellow;
            console.log("" + msg + " " + info.path);
            return this.compile();
          case "watching":
            msg = "" + ('Watching ' + info.type).cyan;
            return console.log("" + msg + " " + info.path);
        }
      }, this));
    };
    Script.prototype.compile = function(cb) {
      return this.collect(__bind(function(files) {
        var buffer, classes, contents, file, filepath, folderpath, i, index, line, linenum, msg, ordered, pkg_helper, processed, relative, root_package, tmpl, toaster, _i, _len, _len2, _len3;
        processed = this.process_wild_cards(files);
        ordered = this.reorder(processed);
        linenum = 1;
        for (i = 0, _len = ordered.length; i < _len; i++) {
          file = ordered[i];
          file.start = linenum;
          file.length = file.raw.split("\n").length;
          file.end = file.start + (file.length - 1);
          linenum = file.end + 1;
        }
        root_package = files[0].namespace.split(".").shift();
        pkg_helper = "" + root_package + " = {}\npkg = ( ns )->\n	curr = " + root_package + "\n	parts = [].concat = ns.split( \".\" )\n	for part, index in parts\n		continue if part is \"" + root_package + "\"\n		curr = curr[ part ] = {} unless curr[ part ]?\n	curr\n";
        contents = this.merge(ordered);
        try {
          contents = cs.compile(contents);
          fs.writeFileSync(this.release, contents);
          console.log("" + '.'.green + " " + this.release);
        } catch (err) {
          msg = err.message;
          if (/(line\s)([0-9]+)/g.test(msg)) {
            line = msg.match(/(line\s)([0-9]+)/)[2];
            for (_i = 0, _len2 = ordered.length; _i < _len2; _i++) {
              file = ordered[_i];
              if (line >= file.start && line <= file.end) {
                line = (line - file.start) + 1;
                msg = msg.replace(/line\s[0-9]+/, "line " + line);
                msg = StringUtil.ucasef(msg);
              }
            }
          }
          console.log("ERROR!".bold.red, msg, "\n\t" + file.classpath.red);
        }
        if (this.opts.argv.debug && msg === void 0) {
          toaster = "" + (this.release.split("/").slice(0, -1).join('/')) + "/toaster";
          classes = "" + toaster + "/classes";
          if (path.existsSync(toaster)) {
            FsUtil.rmdir_rf(toaster);
          }
          FsUtil.mkdir_p(classes);
          tmpl = "document.write('<scri'+'pt src=\"%SRC%\"></scr'+'ipt>')";
          buffer = "" + pkg_helper + "\n";
          for (index = 0, _len3 = ordered.length; index < _len3; index++) {
            file = ordered[index];
            relative = file.filepath;
            relative = relative.replace(".coffee", ".js");
            filepath = "" + classes + "/" + relative;
            folderpath = filepath.split('/').slice(0, -1).join("/");
            if (!path.existsSync(folderpath)) {
              FsUtil.mkdir_p(folderpath);
            }
            relative = "./toaster/classes/" + relative;
            fs.writeFileSync(filepath, cs.compile(file.raw, {
              bare: 1
            }));
            buffer += tmpl.replace("%SRC%", relative) + "\n";
          }
          toaster = "" + toaster + "/toaster.js";
          fs.writeFileSync(toaster, cs.compile(buffer, {
            bare: 1
          }));
        }
        return typeof cb === "function" ? cb() : void 0;
      }, this));
    };
    Script.prototype.collect = function(cb) {
      return FsUtil.find(this.src, "*.coffee", __bind(function(files) {
        var buffer, classname, classpath, dependencies, file, filefolder, filename, filepath, item, namespace, raw, repl, requirements, root_namespace, _i, _j, _len, _len2;
        buffer = [];
        for (_i = 0, _len = files.length; _i < _len; _i++) {
          file = files[_i];
          raw = fs.readFileSync(file, "utf-8");
          dependencies = [];
          filepath = file.replace(this.src, "").substr(1);
          filename = /\w+\.\w+/.exec(filepath)[0];
          filefolder = filepath.replace("/" + filename, "");
          if (this.config.root_namespace === !void 0) {
            root_namespace = this.config.root_namespace + ".";
          } else {
            root_namespace = "";
          }
          if (/(class\s)(\S+)/g.test(raw)) {
            namespace = filefolder.replace(/\//g, ".");
            if (this.config.auto_package === true) {
              repl = ("pkg( '" + namespace + "' ).$2 = ") + ("$2 = $1" + root_namespace + namespace + ".$2");
              raw = raw.replace(/(class\s+)(\S+)/g, repl);
            }
            classpath = /(class\s+)(\S+)/g.exec(raw)[2];
            classname = classpath.split(".").pop();
            namespace = classpath.replace("." + classname, "");
          } else {
            console.log(("" + 'WARNING' + ".bold No class found, ").red + ("skiping file: " + file).red);
            continue;
          }
          if (ArrayUtil.find(buffer, classpath, "classpath")) {
            continue;
          }
          if (/(#<<\s)(.*)/g.test(raw)) {
            requirements = raw.match(/(#<<\s)(.*)/g);
            for (_j = 0, _len2 = requirements.length; _j < _len2; _j++) {
              item = requirements[_j];
              item = /(#<<\s)(.*)/.exec(item)[2];
              item = item.replace(/\s/g, "");
              item = [].concat(item.split(","));
              dependencies = dependencies.concat(item);
            }
          }
          buffer.push({
            raw: raw,
            classname: classname,
            namespace: namespace,
            classpath: classpath,
            filepath: filepath,
            filename: filename,
            filefolder: filefolder,
            dependencies: dependencies
          });
        }
        return cb(buffer);
      }, this));
    };
    Script.prototype.process_wild_cards = function(buffer) {
      var dead, dependency, found, index, k, klass, props, reg, v, _dead_indexes, _dependencies, _i, _j, _len, _len2, _len3, _len4, _ref;
      for (_i = 0, _len = buffer.length; _i < _len; _i++) {
        klass = buffer[_i];
        _dependencies = [];
        _dead_indexes = [];
        _ref = klass.dependencies;
        for (index = 0, _len2 = _ref.length; index < _len2; index++) {
          dependency = _ref[index];
          if (dependency.substr(-1) === "*") {
            _dead_indexes.push(index);
            reg = new RegExp(dependency);
            props = ["classname", "classpath"];
            found = ArrayUtil.find_all(buffer, reg, props, true);
            for (k = 0, _len3 = found.length; k < _len3; k++) {
              v = found[k];
              found[k] = found[k].item.classpath;
            }
            _dependencies = _dependencies.concat(found);
          }
        }
        _dead_indexes = _dead_indexes.sort().reverse();
        for (_j = 0, _len4 = _dead_indexes.length; _j < _len4; _j++) {
          dead = _dead_indexes[_j];
          klass.dependencies.splice(dead, 1);
        }
        klass.dependencies = klass.dependencies.concat(_dependencies);
      }
      return buffer;
    };
    Script.prototype.reorder = function(classes, cycling) {
      var dependency, found, i, index, initd, klass, props, _len, _len2, _ref;
      if (cycling == null) {
        cycling = false;
      }
      if (cycling === true || this.missing === void 0) {
        this.missing = {};
      }
      initd = [];
      for (i = 0, _len = classes.length; i < _len; i++) {
        klass = classes[i];
        initd.push(klass);
        if (klass.dependencies.length === 0) {
          continue;
        }
        _ref = klass.dependencies;
        for (index = 0, _len2 = _ref.length; index < _len2; index++) {
          dependency = _ref[index];
          props = ["classname", "classpath"];
          if (ArrayUtil.find(initd, dependency, props)) {
            continue;
          }
          found = ArrayUtil.find(classes, dependency, props);
          if (found != null) {
            if (ArrayUtil.has(found.item.dependencies, klass.classpath, props)) {
              klass.dependencies.splice(index, 1);
              console.log("WARNING! ".bold.yellow, "You have a circular dependcy loop between classes", "" + dependency.yellow.bold + " and", "" + klass.classpath.yellow.bold + ".");
              continue;
            } else {
              classes.splice(index, 0, found.item);
              classes.splice(found.index + 1, 1);
              classes = this.reorder(classes, true);
            }
          } else if (!this.missing[dependency]) {
            this.missing[dependency] = true;
            klass.dependencies.push(dependency);
            klass.dependencies.splice(index, 1);
            console.log("WARNING! ".bold.yellow, "Dependence " + dependency.yellow.bold + " not found", "for class " + klass.classpath.yellow.bold + ".");
          }
        }
      }
      return classes;
    };
    Script.prototype.merge = function(input) {
      var klass;
      return ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = input.length; _i < _len; _i++) {
          klass = input[_i];
          _results.push(klass.raw);
        }
        return _results;
      })()).join("\n");
    };
    return Script;
  })();
  optimist = require('optimist');
  Parser = (function() {
    function Parser() {
      var adendo, usage;
      usage = "" + 'CoffeeToaster'.bold + "\n";
      usage += "  Minimalist dependency management for CoffeeScript\n\n".grey;
      usage += "" + 'Usage:' + "\n";
      usage += "  toaster [" + 'options'.green + "] [" + 'path'.green + "]\n\n";
      usage += "" + 'Examples:' + "\n";
      usage += "  toaster -n myawsomeapp   (" + 'required'.red + ")\n";
      usage += "  toaster -i [myawsomeapp] (" + 'optional'.green + ")\n";
      usage += "  toaster -w [myawsomeapp] (" + 'optional'.green + ")";
      adendo = "";
      this.argv = (this.opts = optimist.usage(usage).alias('n', 'new').describe('n', "Scaffold a very basic new App, " + adendo).alias('i', 'init').describe('i', "Create a config (toaster.coffee) file, " + adendo).alias('w', 'watch').describe('w', "Start watching/compiling your project, " + adendo).alias('c', 'compile').boolean('c').describe('c', "Compile the entire project, without watching it.").alias('d', 'debug').boolean('d')["default"]('d', false).describe('d', 'Debug mode (compile js files individually)').alias('v', 'version').describe('v', '').alias('h', 'help').describe('h', '')).argv;
    }
    return Parser;
  })();
  fs = require("fs");
  path = require("path");
  pn = path.normalize;
  exec = (require("child_process")).exec;
  colors = require('colors');
  opts = null;
  argv = null;
  exports.run = function() {
    var toaster;
    return toaster = new Toaster;
  };
  Toaster = (function() {
    function Toaster() {
      var _ref;
      this.parser = new Parser;
      _ref = [this.parser.opts, this.parser.argv], opts = _ref[0], argv = _ref[1];
      if (argv.h) {
        console.log(opts.help());
        return;
      }
      this.basepath = path.resolve(".");
      if (argv.v) {
        path = pn(__dirname + "/../build/VERSION");
        console.log(fs.readFileSync(path, "utf-8"));
      } else if (argv.n) {
        new Project(this.basepath).create(argv.n);
      } else if (argv.i) {
        new Config(this.basepath).create(argv.i);
      } else if (argv.c || argv.w) {
        this.compile_and_watch();
      } else {
        console.log(opts.help());
      }
    }
    Toaster.prototype.compile_and_watch = function() {
      var contents, filepath, module, modules, _i, _len, _results;
      filepath = pn("" + this.basepath + "/toaster.coffee");
      if (path.existsSync(filepath)) {
        contents = cs.compile(fs.readFileSync(filepath, "utf-8"), {
          bare: 1
        });
        modules = [].concat(eval(contents));
        _results = [];
        for (_i = 0, _len = modules.length; _i < _len; _i++) {
          module = modules[_i];
          module.src = pn("" + this.basepath + "/" + module.src);
          module.release = pn("" + this.basepath + "/" + module.release);
          _results.push(new Script(module, opts));
        }
        return _results;
      } else {
        console.log("ERROR! ".bold.red);
        console.log("\tFile not found: " + filepath.red);
        return console.log("\tTry running: " + "toaster -i".green + (" or type " + 'toaster -h'.green + " for more info"));
      }
    };
    return Toaster;
  })();
}).call(this);
