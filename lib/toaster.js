(function() {
  var ArrayUtil, Config, Css, FsUtil, Kup, Project, Question, Script, StringUtil, Toaster, coffee, colors, cs, exec, fs, optimist, path, pn;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  require('fs');
  FsUtil = (function() {
    function FsUtil() {}
    FsUtil.snapshots = {};
    FsUtil.find = function(path, pattern, fn) {
      return exec("find " + path + " -name '" + pattern + "'", __bind(function(error, stdout, stderr) {
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
    FsUtil.watch_file = function(path, onchange) {
      path = pn(path);
      if (typeof onchange === "function") {
        onchange({
          type: "file",
          path: path,
          action: "watching"
        });
      }
      return fs.watchFile(path, {
        interval: 250
      }, __bind(function(curr, prev) {
        var ctime, mtime;
        mtime = curr.mtime.valueOf() !== prev.mtime.valueOf();
        ctime = curr.ctime.valueOf() !== prev.ctime.valueOf();
        if (mtime || ctime) {
          return typeof onchange === "function" ? onchange({
            type: "file",
            path: path,
            action: "updated"
          }) : void 0;
        }
      }, this));
    };
    FsUtil.watch_folder = function(path, onchange) {
      path = pn(path);
      if (typeof onchange === "function") {
        onchange({
          type: "folder",
          path: path,
          action: "watching"
        });
      }
      exec("ls " + path, __bind(function(error, stdout, stderr) {
        var item, _i, _len, _ref, _results;
        FsUtil.snapshots[path] = FsUtil.format_ls(path, stdout);
        _ref = FsUtil.snapshots[path];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          _results.push(item.type === "folder" ? FsUtil.watch_folder(item.path, onchange) : FsUtil.watch_file(item.path, onchange));
        }
        return _results;
      }, this));
      return fs.watchFile(path, {
        interval: 250
      }, __bind(function(curr, prev) {
        return exec("ls " + path, __bind(function(error, stdout, stderr) {
          var a, b, diff, info, item, _i, _len;
          a = FsUtil.snapshots[path];
          b = FsUtil.format_ls(path, stdout);
          diff = ArrayUtil.diff(a, b, "path");
          for (_i = 0, _len = diff.length; _i < _len; _i++) {
            item = diff[_i];
            info = item.item;
            info.action = item.action;
            switch (info.action) {
              case "created":
                if (typeof onchange === "function") {
                  onchange(info);
                }
                if (info.type === "file") {
                  FsUtil.watch_file(info.path, onchange);
                } else if (info.type === "folder") {
                  FsUtil.watch_folder(info.path, onchange);
                }
                break;
              case "deleted":
                if (typeof onchange === "function") {
                  onchange(info);
                }
                fs.unwatchFile(item.path);
            }
          }
          return FsUtil.snapshots[path] = FsUtil.format_ls(path, stdout);
        }, this));
      }, this));
    };
    FsUtil.format_ls = function(path, stdout) {
      var index, item, list, stats, _len;
      list = stdout.toString().trim().split("\n");
      for (index = 0, _len = list.length; index < _len; index++) {
        item = list[index];
        if (item === "\n" || item === "") {
          list.splice(index, 1);
        } else {
          stats = fs.lstatSync("" + path + "/" + item);
          list[index] = {
            type: stats.isDirectory() ? "folder" : "file",
            path: "" + path + "/" + item
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
      var i, j, _len;
      for (i = 0, _len = source.length; i < _len; i++) {
        j = source[i];
        if (j === search || j[by_property] === search) {
          return {
            item: j,
            index: i
          };
        }
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
    Config.prototype.create = function() {
      console.log("It seems this project hasn't been toasted yet.");
      return this.ask("Do you wanna toast it? (Y/n)", /.*/, __bind(function(data) {
        var question1, question2, question3;
        if (data !== "" && data.toLowerCase() !== "y") {
          return process.exit();
        } else {
          console.log(". " + 'Wonderful!'.rainbow, "" + 'Let\'s toast this sly little project! :)'.grey.bold);
          console.log(". With this as your basepath: " + this.basepath.cyan);
          console.log(". Please, tell me:");
          question1 = "\tWhat's your app name? (none)";
          question2 = "\tWhere's its src folder? (i.e. src)";
          question3 = "\tWhere do you want your release file?" + "(i.e. release/app.js)";
          return this.ask(question1, /.+/, __bind(function(name) {
            return this.ask(question2, /.+/, __bind(function(src) {
              return this.ask(question3, /.+/, __bind(function(release) {
                this.write(name, src, release);
                return process.exit();
              }, this));
            }, this));
          }, this));
        }
      }, this));
    };
    Config.prototype.write = function(name, src, release) {
      var path, toaster;
      path = pn("" + this.basepath + "/toaster.coffee");
      toaster = this.tpl.replace("%name", name);
      toaster = toaster.replace("%src", src);
      toaster = toaster.replace("%release", release);
      fs.writeFileSync(path, toaster);
      return console.log("" + 'Created'.green.bold + " " + path);
    };
    return Config;
  })();
  Project = (function() {
    __extends(Project, Question);
    function Project(basepath) {
      this.basepath = basepath;
    }
    Project.prototype.create = function(argv) {
      var question1, question2, question3, target;
      target = argv.n ? argv.n : argv["new"];
      if (target === void 0) {
        console.log("You need to inform a target path!".red);
        return console.log("\ttoaster new myawesomeapp".green);
      }
      if (target.substr(0, 1 !== "/")) {
        target = pn("" + this.basepath + "/" + target);
      }
      console.log(". " + 'Wonderful!'.rainbow, "" + 'Let\'s toast something fresh! :)'.grey.bold);
      console.log(". With this as your basepath: " + this.basepath.cyan);
      console.log(". Please, tell me:");
      question1 = "\tWhat's your app name? (none)";
      question2 = "\tWhere's its src folder? (src)";
      question3 = "\tWhere do you want your release file? (release/app.js)";
      return this.ask(question1, /.+/, __bind(function(name) {
        return this.ask(question2, /.*/, __bind(function(src) {
          return this.ask(question3, /.*/, __bind(function(release) {
            var releasedir, releasefile, srcdir;
            srcdir = ("" + target + "/") + (src || "src");
            releasefile = ("" + target + "/") + (release || "release/app.js");
            releasedir = releasefile.split("/").slice(0, -1).join("/");
            fs.mkdirSync(target, 0755);
            console.log("" + 'Created'.green.bold + " " + target);
            fs.mkdirSync(srcdir, 0755);
            console.log("" + 'Created'.green.bold + " " + srcdir);
            fs.mkdirSync(releasedir, 0755);
            console.log("" + 'Created'.green.bold + " " + releasedir);
            name = name.replace(target, "").substr(1);
            srcdir = srcdir.replace(target, "").substr(1);
            releasefile = releasefile.replace(target, "").substr(1);
            new Config(target).write(name, srcdir, releasefile);
            return process.exit();
          }, this));
        }, this));
      }, this));
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
  cs = require("coffee-script");
  Script = (function() {
    function Script(config) {
      this.config = config;
      this.watch = __bind(this.watch, this);
      this.src = this.config.src;
      this.release = this.config.release;
      this.watch();
      this.compile();
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
    Script.prototype.compile = function() {
      return this.collect(__bind(function(files) {
        var contents, file, i, line, linenum, msg, ordered, _i, _len, _len2, _results;
        ordered = this.reorder(files);
        linenum = 1;
        for (i = 0, _len = ordered.length; i < _len; i++) {
          file = ordered[i];
          file.start = linenum;
          file.length = file.raw.split("\n").length;
          file.end = file.start + (file.length - 1);
          linenum = file.end + 1;
        }
        contents = this.merge(ordered);
        try {
          contents = cs.compile(contents);
          fs.writeFileSync(this.release, contents);
          return console.log("" + 'Toasted with love:'.magenta + " " + this.release);
        } catch (err) {
          msg = err.message;
          line = msg.match(/(line\s)([0-9]+)/)[2];
          _results = [];
          for (_i = 0, _len2 = ordered.length; _i < _len2; _i++) {
            file = ordered[_i];
            _results.push(line >= file.start && line <= file.end ? (line = (line - file.start) + 1, msg = msg.replace(/line\s[0-9]+/, "line " + line), msg = StringUtil.ucasef(msg), console.log("ERROR!".bold.red, msg, "\n\t" + file.path.red)) : void 0);
          }
          return _results;
        }
      }, this));
    };
    Script.prototype.collect = function(fn) {
      return FsUtil.find(this.src, "*.coffee", __bind(function(files) {
        var buffer, dependencies, file, item, name, raw, requirements, _i, _j, _len, _len2;
        buffer = [];
        for (_i = 0, _len = files.length; _i < _len; _i++) {
          file = files[_i];
          raw = fs.readFileSync(file, "utf-8");
          dependencies = [];
          if (/(class\s)([\S]+)/g.test(raw)) {
            name = /(class\s)([\S]+)/g.exec(raw)[2];
          }
          if (ArrayUtil.find(buffer, name)) {
            continue;
          }
          if (/(extends\s)([\S]+)/g.test(raw)) {
            dependencies.push(/(extends\s)([\S]+)/g.exec(raw)[2]);
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
            path: file,
            name: name,
            dependencies: dependencies,
            raw: raw
          });
        }
        return fn(buffer);
      }, this));
    };
    Script.prototype.missing = {};
    Script.prototype.reorder = function(classes, cycling) {
      var dependency, found, i, index, initd, klass, _len;
      if (cycling == null) {
        cycling = false;
      }
      if (!cycling) {
        this.missing = {};
      }
      initd = {};
      for (i = 0, _len = classes.length; i < _len; i++) {
        klass = classes[i];
        initd["" + klass.name] = 1;
        if (!klass.dependencies.length) {
          continue;
        }
        index = 0;
        while (index < klass.dependencies.length) {
          dependency = klass.dependencies[index];
          if (initd[dependency]) {
            index++;
            continue;
          }
          found = ArrayUtil.find(classes, dependency, "name");
          if (found != null) {
            if (ArrayUtil.has(found.item.dependencies, klass.name, "name")) {
              klass.dependencies.splice(index, 1);
              console.log("WARNING! ".bold.yellow, "You have a circular loop between classes", "" + dependency.yellow.bold + " and", "" + klass.name.yellow.bold + ".");
              continue;
            } else {
              classes.splice(index, 0, found.item);
              classes.splice(found.index + 1, 1);
              classes = this.reorder(classes, true);
            }
          } else if (!this.missing[dependency]) {
            this.missing[dependency] = 1;
            klass.dependencies.push(dependency);
            klass.dependencies.splice(index, 1);
            console.log("WARNING! ".bold.yellow, "Dependence " + dependency.yellow.bold + " not found", "for class " + klass.name.yellow.bold + ".");
          }
          index++;
        }
      }
      return classes;
    };
    Script.prototype.check_syntax = function(files) {
      var file, _i, _len;
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        try {
          cs.compile(file);
        } catch (err) {
          return {
            path: file,
            err: err
          };
        }
      }
      return false;
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
  fs = require("fs");
  path = require("path");
  pn = path.normalize;
  exec = (require("child_process")).exec;
  coffee = require("coffee-script");
  colors = require('colors');
  optimist = require('optimist');
  exports.run = function() {
    var toaster;
    return toaster = new Toaster;
  };
  Toaster = (function() {
    function Toaster() {
      var argv;
      argv = optimist.usage("" + 'Coffee Toaster'.cyan.bold + "     	\n" + 'Minimalist dependency management system for coffee-script.'.grey + "     	\n" + 'Usage:'.grey.bold + " $0").alias('n', 'new').describe('n', 'Creating a new App');
      this.basepath = path.resolve(".");
      if (argv.argv.n || argv.argv["new"]) {
        new Project(this.basepath).create(argv.argv);
      } else if (argv.argv.h || argv.argv.help) {
        console.log(argv.help());
      } else {
        if (argv.argv.length) {
          this.basepath += "/" + argv.argv._[0];
        }
        this.basepath = this.basepath.replace(/\/[^\/]+\/\.{2}/, "");
        this.init();
      }
    }
    Toaster.prototype.init = function() {
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
          _results.push(new Script(module));
        }
        return _results;
      } else {
        return new Config(this.basepath).create();
      }
    };
    return Toaster;
  })();
}).call(this);
