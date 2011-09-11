(function() {
  var Machine, Toaster, Watcher, coffee, colors, exec, fs, path, pn;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  fs = require("fs");
  path = require("path");
  pn = path.normalize;
  exec = (require("child_process")).exec;
  coffee = require("coffee-script");
  colors = require('colors');
  exports.run = function() {
    var toaster;
    return toaster = new Toaster;
  };
  Toaster = (function() {
    function Toaster() {
      var argv;
      this.basepath = path.resolve(".");
      argv = process.argv.slice(2);
      if (argv.length && argv[0] === "new") {
        new Machine().make(this.basepath, argv);
      } else {
        if (argv.length) {
          this.basepath += "/" + argv[0];
        }
        this.basepath = this.basepath.replace(/\/[^\/]+\/\.{2}/, "");
        this.init();
      }
    }
    Toaster.prototype.init = function() {
      var filepath;
      filepath = pn("" + this.basepath + "/toaster.coffee");
      if (path.existsSync(filepath)) {
        return exec("coffee -p --bare " + filepath, __bind(function(error, stdout, stderr) {
          var module, _i, _len, _ref, _results;
          this.modules = [].concat(eval(stdout));
          _ref = this.modules;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            module = _ref[_i];
            module.src = pn("" + this.basepath + "/" + module.src);
            module.release = pn("" + this.basepath + "/" + module.release);
            _results.push(this.compile(module));
          }
          return _results;
        }, this));
      } else {
        return new Machine().toast(this.basepath);
      }
    };
    Toaster.prototype.compile = function(module) {
      return this.collect(module, __bind(function(files) {
        var contents;
        contents = this.clean(this.reorder(files));
        fs.writeFileSync(module.release, contents);
        return exec("coffee -c " + module.release, __bind(function(error, stdout, stderr) {
          console.log("" + 'Toasted with love:'.magenta + " " + module.release);
          if (!module.watcher) {
            return module.watcher = new Watcher(this, module);
          }
        }, this));
      }, this));
    };
    Toaster.prototype.collect = function(module, fn) {
      return this.findall(module.src, false, __bind(function(files) {
        var buffer, dependencies, file, item, name, raw, requirements, _i, _j, _len, _len2;
        buffer = [];
        for (_i = 0, _len = files.length; _i < _len; _i++) {
          file = files[_i];
          raw = fs.readFileSync(file, "utf-8");
          dependencies = [];
          if (/(class\s)([\S]+)/g.test(raw)) {
            name = /(class\s)([\S]+)/g.exec(raw)[2];
          }
          if (this.find(buffer, name)) {
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
            name: name,
            dependencies: dependencies,
            raw: raw
          });
        }
        return fn(buffer);
      }, this));
    };
    Toaster.prototype.missing = {};
    Toaster.prototype.reorder = function(classes, cycling) {
      var dependency, i, index, initd, klass, result, _len, _len2, _ref;
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
        if (klass.dependencies.length) {
          _ref = klass.dependencies;
          for (index = 0, _len2 = _ref.length; index < _len2; index++) {
            dependency = _ref[index];
            if (!initd[dependency]) {
              result = this.find(classes, dependency);
              if (result != null) {
                classes.splice(index, 0, result.item);
                classes.splice(result.index + 1, 1);
                classes = this.reorder(classes, true);
              } else if (!this.missing[dependency]) {
                this.missing[dependency] = 1;
                klass.dependencies.push(dependency);
                klass.dependencies.splice(index, 1);
                console.log("WARNING ".bold.red, "Dependence " + dependency.bold.cyan + " not found for class " + klass.name.bold.cyan);
              }
            }
          }
        }
      }
      return classes;
    };
    Toaster.prototype.findall = function(path, search_folders, fn) {
      var query;
      query = search_folders ? "-type d" : "-name '*.coffee'";
      return exec("find " + path + " " + query, __bind(function(error, stdout, stderr) {
        var buffer, item, items, _i, _len, _ref;
        buffer = [];
        _ref = items = stdout.trim().split("\n");
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          if (item !== "." && item !== "..") {
            buffer.push(item);
          }
        }
        return fn(buffer);
      }, this));
    };
    Toaster.prototype.find = function(classes, name) {
      var i, j, _len;
      for (i = 0, _len = classes.length; i < _len; i++) {
        j = classes[i];
        if (j.name === name) {
          return {
            item: j,
            index: i
          };
        }
      }
    };
    Toaster.prototype.clean = function(input) {
      var i, klass;
      return ((function() {
        var _len, _results;
        _results = [];
        for (i = 0, _len = input.length; i < _len; i++) {
          klass = input[i];
          _results.push(input[i] = klass.raw);
        }
        return _results;
      })()).join("\r\n");
    };
    return Toaster;
  })();
  Machine = (function() {
    function Machine() {}
    Machine.prototype.tpl = "modules = \r\n\tname: '%name'\r\n\tsrc: '%src'\r\n\trelease: '%release'\r\n";
    Machine.prototype.make = function(basepath, argv) {
      var action, target, _ref;
      this.basepath = basepath;
      _ref = [argv[0] ? argv[0] : void 0, argv[1] ? argv[1] : void 0], action = _ref[0], target = _ref[1];
      if (target === void 0) {
        console.log("You need to inform a target path!".red);
        return console.log("toaster new myawesomeapp".green);
      }
      if (target.substr(0, 1) !== "/") {
        target = path.normalize("" + this.basepath + "/" + target);
      }
      console.log(". " + 'Wonderful!'.rainbow + " " + 'Let\'s toast something fresh! :)'.grey.bold);
      console.log(". First, consider this as your basepath: " + target.cyan);
      console.log(". Now tell me:");
      return this.ask("\tWhat's your app name? (none)", /.+/, __bind(function(name) {
        return this.ask("\tWhere's its src folder? (src)", /.*/, __bind(function(src) {
          return this.ask("\tWhere do you want your release file? (release/app.js)", /.*/, __bind(function(release) {
            var contents, releasedir, releasefile, srcdir, toaster;
            srcdir = src || "src";
            releasefile = release || "release/app.js";
            releasedir = releasefile.split("/").slice(0, 1).join("/");
            toaster = "" + target + "/toaster.coffee";
            contents = this.tpl.replace("%name", name);
            contents = contents.replace("%src", srcdir);
            contents = contents.replace("%release", releasefile);
            fs.mkdirSync(target, 0755);
            console.log("" + 'Created'.green.bold + " " + target);
            fs.mkdirSync("" + target + "/" + srcdir, 0755);
            console.log("" + 'Created'.green.bold + " " + target + "/" + srcdir);
            fs.mkdirSync("" + target + "/" + releasedir, 0755);
            console.log("" + 'Created'.green.bold + " " + target + "/" + releasedir);
            fs.writeFileSync(toaster, contents);
            console.log("" + 'Created'.green.bold + " " + toaster);
            return process.exit();
          }, this));
        }, this));
      }, this));
    };
    Machine.prototype.toast = function(basepath) {
      this.basepath = basepath;
      console.log("It seems this project hasn't been toasted yet.");
      return this.ask("Do you wanna toast it? (Y/n)", /.*/, __bind(function(data) {
        if (data !== "" && data.toLowerCase !== "y") {
          return process.exit();
        } else {
          console.log(". " + 'Wonderful!'.rainbow + " " + 'Let\'s toast this sly little project! :)'.grey.bold);
          console.log(". First, consider this as your basepath: " + this.basepath.cyan);
          console.log(". Now tell me:");
          return this.ask("\tWhat's your app name? (none)", /.+/, __bind(function(name) {
            return this.ask("\tWhere's its src folder? (i.e. src)", /.+/, __bind(function(src) {
              return this.ask("\tWhere do you want your release file? (i.e. release/app.js)", /.+/, __bind(function(release) {
                var toaster;
                path = pn("" + this.basepath + "/toaster.coffee");
                toaster = this.tpl.replace("%name", name);
                toaster = toaster.replace("%src", src);
                toaster = toaster.replace("%release", release);
                fs.writeFileSync(path, toaster);
                console.log("" + 'Created'.green.bold + " " + path);
                return process.exit();
              }, this));
            }, this));
          }, this));
        }
      }, this));
    };
    Machine.prototype.ask = function(question, format, fn) {
      var stdin, stdout;
      stdin = process.stdin;
      stdout = process.stdout;
      stdin.resume();
      stdout.write("" + question + " ");
      return stdin.once('data', __bind(function(data) {
        data = data.toString().trim();
        if (format.test(data)) {
          return fn(data);
        } else {
          stdout.write("\t" + 'Invalid option! It should match:'.red + " " + (format.toString().cyan) + "\n");
          return this.ask(question, format, fn);
        }
      }, this));
    };
    return Machine;
  })();
  Watcher = (function() {
    Watcher.prototype.snapshots = {};
    function Watcher(toaster, module) {
      this.toaster = toaster;
      this.module = module;
      this.watch_folder(module.src);
    }
    Watcher.prototype.watch_file = function(path) {
      path = pn(path);
      console.log("" + 'Watching file:'.cyan + " " + path);
      return fs.watchFile(path, {
        interval: 250
      }, __bind(function(curr, prev) {
        var ctime, mtime;
        mtime = curr.mtime.valueOf() !== prev.mtime.valueOf();
        ctime = curr.ctime.valueOf() !== prev.ctime.valueOf();
        if (mtime || ctime) {
          console.log("" + 'File Changed:'.yellow + " " + path);
          return this.toaster.compile(this.module);
        }
      }, this));
    };
    Watcher.prototype.watch_folder = function(path) {
      path = pn(path);
      console.log("" + 'Watching folder:'.cyan + " " + path);
      exec("ls " + path, __bind(function(error, stdout, stderr) {
        var item, _i, _len, _ref, _results;
        this.snapshots[path] = this.format_ls(path, stdout);
        _ref = this.snapshots[path];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          _results.push(item.type === "folder" ? this.watch_folder(item.path) : this.watch_file(item.path));
        }
        return _results;
      }, this));
      return fs.watchFile(path, {
        interval: 250
      }, __bind(function(curr, prev) {
        return exec("ls " + path, __bind(function(error, stdout, stderr) {
          var diff, item, _i, _len;
          diff = this.diff(this.snapshots[path], this.format_ls(path, stdout));
          if (diff.length) {
            this.toaster.compile(this.module);
          }
          for (_i = 0, _len = diff.length; _i < _len; _i++) {
            item = diff[_i];
            switch (item.action) {
              case "created":
                console.log("" + 'New file created:'.green + " " + item.path);
                this.watch_file(item.path);
                break;
              case "deleted":
                console.log("" + 'File deleted, stop watching:'.red + " " + item.path);
                fs.unwatchFile(item.path);
            }
          }
          return this.snapshots[path] = this.format_ls(path, stdout);
        }, this));
      }, this));
    };
    Watcher.prototype.format_ls = function(path, stdout) {
      var index, item, list, stats, _len;
      list = stdout.toString().trim().split("\n");
      for (index = 0, _len = list.length; index < _len; index++) {
        item = list[index];
        if (item === "\n") {
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
    Watcher.prototype.diff = function(a, b) {
      var diff, item, _i, _j, _len, _len2;
      diff = [];
      for (_i = 0, _len = a.length; _i < _len; _i++) {
        item = a[_i];
        if (!this.has(item, b)) {
          console.log;
          diff.push({
            type: item.type,
            path: item.path,
            action: "deleted"
          });
        }
      }
      for (_j = 0, _len2 = b.length; _j < _len2; _j++) {
        item = b[_j];
        if (!this.has(item, a)) {
          diff.push({
            type: item.type,
            path: item.path,
            action: "created"
          });
        }
      }
      return diff;
    };
    Watcher.prototype.has = function(search, source) {
      var item, _i, _len;
      for (_i = 0, _len = source.length; _i < _len; _i++) {
        item = source[_i];
        if (item.path === search.path) {
          return true;
        }
      }
      return false;
    };
    return Watcher;
  })();
}).call(this);
