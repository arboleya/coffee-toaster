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
        this.base;
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
      var contents;
      contents = this.clean(this.reorder(this.collect(module.src)));
      fs.writeFileSync(module.release, contents);
      exec("coffee -c " + module.release, __bind(function(error, stdout, stderr) {
        console.log("Toasted with love:\r\n\t" + module.release);
        if (!module.watcher) {
          return module.watcher = new Watcher(this, module);
        }
      }, this));
      return true;
    };
    Toaster.prototype.collect = function(path, buffer) {
      var ext, file, filepath, name, raw, _i, _len, _ref;
      if (buffer == null) {
        buffer = [];
      }
      _ref = fs.readdirSync(path);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        filepath = pn("" + path + "/" + file);
        if (fs.statSync(filepath).isDirectory()) {
          this.collect(filepath, buffer);
        } else if (filepath.substr(-6 === "coffee")) {
          raw = fs.readFileSync(filepath, "utf-8");
          name = /(class\s)([\S]+)/g.exec(raw)[2];
          if (/(extends\s)([\S]+)/g.test(raw)) {
            ext = /(extends\s)([\S]+)/g.exec(raw)[2];
          }
          if (!this.find(buffer, name)) {
            buffer.push({
              name: name,
              ext: ext,
              raw: raw
            });
          }
        }
      }
      return buffer;
    };
    Toaster.prototype.reorder = function(classes) {
      var i, initd, klass, result, _len;
      initd = {};
      for (i = 0, _len = classes.length; i < _len; i++) {
        klass = classes[i];
        initd["" + klass.name] = 1;
        if (klass.ext) {
          if (!initd["" + klass.ext]) {
            result = this.find(classes, klass.ext);
            classes.splice(i, 0, result.item);
            classes.splice(result.index + 1, 1);
            classes = this.reorder(classes);
          }
        }
      }
      return classes;
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
  Watcher = (function() {
    function Watcher(toaster, module) {
      this.toaster = toaster;
      this.module = module;
      console.log("Watching:");
      exec("find " + this.module.src + " -name '*.coffee'", __bind(function(error, stdout, stderr) {
        var file, filepath, files, _i, _len, _ref;
        _ref = files = stdout.trim().split("\n");
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          file = _ref[_i];
          filepath = pn(file);
          console.log("... \t" + filepath);
          fs.watchFile(filepath, {
            interval: 250
          }, __bind(function(curr, prev) {
            var ctime, mtime;
            mtime = curr.mtime.valueOf() !== prev.mtime.valueOf();
            ctime = curr.ctime.valueOf() !== prev.ctime.valueOf();
            if (mtime || ctime) {
              return this.toaster.compile(this.module);
            }
          }, this));
        }
        return console.log("--------------------------------------------------");
      }, this));
    }
    return Watcher;
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
            return this.ask("\tWhere's its src folder? (i.e. src)", /.*/, __bind(function(src) {
              return this.ask("\tWhere do you want your release file? (i.e. release/app.js)", /.*/, __bind(function(release) {
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
}).call(this);
