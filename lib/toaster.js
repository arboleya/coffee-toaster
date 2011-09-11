(function() {
  var Machine, Toaster, Watcher, coffee, exec, fs, path, pn;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  fs = require("fs");
  path = require("path");
  pn = path.normalize;
  coffee = require("coffee-script");
  exec = (require("child_process")).exec;
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
        contents = this.clean(this.reorder(files, true));
        fs.writeFileSync(module.release, contents);
        return exec("coffee -c " + module.release, __bind(function(error, stdout, stderr) {
          console.log("Toasted with love:\r\n\t" + module.release);
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
    Toaster.prototype.reorder = function(classes, debug) {
      var dependency, i, index, initd, klass, result, _len, _len2, _ref;
      if (debug == null) {
        debug = false;
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
              classes.splice(index, 0, result.item);
              classes.splice(result.index + 1, 1);
              classes = this.reorder(classes);
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
    Machine.prototype.tpl = "modules = \r\n\tname: '%name'\r\n\tsrc: '%src'\r\n\trelease: '%release'";
    Machine.prototype.make = function(basepath, argv) {
      var action, target, _ref;
      this.basepath = basepath;
      _ref = [argv[0] ? argv[0] : void 0, argv[1] ? argv[1] : void 0], action = _ref[0], target = _ref[1];
      if (target === void 0) {
        console.log("You need to inform a target path!");
        return console.log("toaster new myawesomeapp");
      }
      if (target.substr(0, 1) !== "/") {
        target = path.normalize("" + this.basepath + "/" + target);
      }
      console.log(". Wonderful! Let's toast this sly little project! :)");
      console.log(". First, consider this as your basepath: " + target);
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
            fs.mkdirSync("" + target + "/" + srcdir, 0755);
            fs.mkdirSync("" + target + "/" + releasedir, 0755);
            fs.writeFileSync(toaster, contents);
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
          console.log(". Wonderful! Let's toast this sly little project! :)");
          console.log(". First, consider this as your basepath: " + this.basepath);
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
          stdout.write("It should match: " + format + "\n");
          return this.ask(question, format, fn);
        }
      }, this));
    };
    return Machine;
  })();
  Watcher = (function() {
    function Watcher(toaster, module) {
      this.toaster = toaster;
      this.module = module;
      console.log("Watching:");
      this.toaster.findall(this.module.src, false, __bind(function(files) {
        var file, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = files.length; _i < _len; _i++) {
          file = files[_i];
          _results.push(this.watch_file(file));
        }
        return _results;
      }, this));
      this.toaster.findall(this.module.src, true, __bind(function(folders) {
        var folder, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = folders.length; _i < _len; _i++) {
          folder = folders[_i];
          _results.push(this.watch_folder(folder));
        }
        return _results;
      }, this));
    }
    Watcher.prototype.watch_file = function(path) {
      path = pn(path);
      console.log("...file: \t" + path);
      return fs.watchFile(path, {
        interval: 250
      }, __bind(function(curr, prev) {
        var ctime, mtime;
        mtime = curr.mtime.valueOf() !== prev.mtime.valueOf();
        ctime = curr.ctime.valueOf() !== prev.ctime.valueOf();
        if (mtime || ctime) {
          return this.toaster.compile(this.module);
        }
      }, this));
    };
    Watcher.prototype.watch_folder = function(path) {
      path = pn(path);
      console.log("...folder: \t" + path);
      return fs.watchFile(path, {
        interval: 250
      }, __bind(function(curr, prev) {
        return console.log(curr, prev);
      }, this));
    };
    return Watcher;
  })();
}).call(this);
