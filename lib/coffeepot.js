(function() {
  var CoffeeInit, CoffeePot, CoffeeWatcher, coffee, exec, fs, path, sys;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  fs = require("fs");
  sys = require("sys");
  path = require("path");
  coffee = require("coffee-script");
  exec = (require("child_process")).exec;
  exports.run = function() {
    var coffeepot;
    return coffeepot = new CoffeePot;
  };
  CoffeePot = (function() {
    function CoffeePot() {
      var a;
      this.basepath = path.resolve(".");
      a = process.argv;
      if (a.length > 3) {
        switch (a[2]) {
          case "new":
            exec("mkdir " + a[3], __bind(function(err, stdout, stderr) {
              return this.init();
            }, this));
            break;
          default:
            console.log("You need to inform a folder! (coffee new myapp)");
        }
      } else if (a.length > 2) {
        if (a[2].substr(0, 1) === "/") {
          this.basepath = a[2];
        } else {
          this.basepath += "/" + a[2];
        }
        this.init();
      }
    }
    CoffeePot.prototype.init = function() {
      var toaster;
      console.log(this.basepath);
      toaster = "" + this.basepath + "/toaster.coffee";
      if (path.existsSync(toaster)) {
        return exec("coffee -p --bare " + toaster, __bind(function(error, stdout, stderr) {
          var module, _i, _len, _ref, _results;
          this.modules = [].concat(eval(stdout));
          _ref = this.modules;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            module = _ref[_i];
            module.basepath = this.basepath;
            _results.push(this.compile(module));
          }
          return _results;
        }, this));
      } else {
        console.log("You haven't toasted this project yet, lets do it:");
        console.log("\t1: What's you source folder, relative to this path?");
        return console.log("\t\t " + this.basepath);
      }
    };
    CoffeePot.prototype.compile = function(module) {
      var filepath, folderpath;
      filepath = path.normalize("" + this.basepath + "/" + module.release);
      folderpath = filepath.split("/").slice(0, -1).join("/");
      fs.writeFileSync(filepath, this.clean(this.reorder(this.collect(module))));
      return exec("coffee -c " + filepath, __bind(function(err, stdout, stderr) {
        console.log("Compiled with cheese!\r\n\t" + filepath);
        if (!module.watcher) {
          return module.watcher = new CoffeeWatcher(this, module);
        }
      }, this));
    };
    CoffeePot.prototype.collect = function(path, buffer) {
      var ext, file, filepath, name, raw, _i, _len, _ref;
      if (buffer == null) {
        buffer = [];
      }
      path = path.src || path;
      _ref = fs.readdirSync(path);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        filepath = "" + path + "/" + file;
        if (fs.statSync(filepath).isDirectory()) {
          this.collect(filepath, buffer);
        } else if (filepath.substr(-6) === "coffee") {
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
    CoffeePot.prototype.reorder = function(classes) {
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
    CoffeePot.prototype.find = function(classes, name) {
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
    CoffeePot.prototype.clean = function(input) {
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
    return CoffeePot;
  })();
  CoffeeWatcher = (function() {
    function CoffeeWatcher(toaster, module) {
      var src;
      this.toaster = toaster;
      this.module = module;
      console.log("Listening to...");
      src = path.normalize("" + this.module.basepath + "/" + this.module.src);
      exec("find " + src + " -name '*.coffee'", __bind(function(error, stdout, stderr) {
        var file, filepath, files, _i, _len, _ref;
        _ref = files = stdout.trim().split("\n");
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          file = _ref[_i];
          filepath = path.normalize(file);
          console.log("... " + filepath);
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
    return CoffeeWatcher;
  })();
  CoffeeInit = (function() {
    function CoffeeInit() {}
    return CoffeeInit;
  })();
}).call(this);
