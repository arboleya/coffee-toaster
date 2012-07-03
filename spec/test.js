(function() {
  var FsUtil, assert, fs, path, snapshot, spawn, spawn_toaster, vows;

  fs = require("fs");

  spawn = (require('child_process')).spawn;

  snapshot = function(folderpath, buffer) {
    var alias, file, filepath, files, _i, _len, _ref;
    if (buffer == null) {
      buffer = {};
    }
    _ref = (files = fs.readdirSync(folderpath));
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      file = _ref[_i];
      filepath = "" + folderpath + "/" + file;
      alias = filepath.replace("" + folderpath + "/", '');
      try {
        if (fs.lstatSync(filepath).isDirectory()) {
          buffer[alias] = 'folder';
          snapshot(filepath, buffer);
        } else {
          if (!/.gitkeep/.test(alias)) {
            buffer[alias] = fs.readFileSync(filepath).toString();
          }
        }
      } catch (error) {
        throw error;
      }
    }
    return buffer;
  };

  spawn_toaster = function(args, options) {
    return spawn(__dirname + '/../bin/toaster', args, options || {
      cwd: __dirname
    });
  };

  fs = require('fs');

  path = require('path');

  vows = require("vows");

  assert = require("assert");

  FsUtil = (require(__dirname + "/../lib/toaster")).toaster.utils.FsUtil;

  vows.describe('Generators (-n, -i)').addBatch({
    'A new project created': {
      'with default values': {
        topic: function() {
          var folder, toaster,
            _this = this;
          if (path.existsSync((folder = __dirname + "/tmp/new_default_project"))) {
            FsUtil.rmdir_rf(folder);
          }
          toaster = spawn_toaster(['-n', 'tmp/new_default_project']);
          toaster.stdout.on('data', function(data) {
            var question;
            question = data.toString();
            if (question.indexOf("Path to your src folder") >= 0) {
              return toaster.stdin.write('\n');
            } else if (question.indexOf("Path to your release file") >= 0) {
              return toaster.stdin.write('\n');
            } else if (question.indexOf("Starting from your webroot") >= 0) {
              return toaster.stdin.write('\n');
            }
          });
          toaster.stderr.on('data', function(data) {
            console.log(data.toString());
            return _this.callback(null, null);
          });
          toaster.on('exit', function(code) {
            var created, model;
            model = snapshot("" + __dirname + "/templates/new_default_project");
            created = snapshot("" + __dirname + "/tmp/new_default_project");
            return _this.callback(model, created);
          });
          return void 0;
        },
        'should match the default template': function(model, created) {
          var a, alias, b, contents, _results;
          assert.isObject(model);
          assert.isObject(created);
          _results = [];
          for (alias in model) {
            contents = model[alias];
            a = created[alias];
            b = contents;
            _results.push(assert.equal(a, b));
          }
          return _results;
        }
      },
      'with custom values': {
        topic: function() {
          var folder, toaster,
            _this = this;
          if (path.existsSync((folder = __dirname + "/tmp/new_custom_project"))) {
            FsUtil.rmdir_rf(folder);
          }
          toaster = spawn_toaster(['-n', 'tmp/new_custom_project']);
          toaster.stdout.on('data', function(data) {
            var question;
            question = data.toString();
            if (question.indexOf("Path to your src folder") >= 0) {
              return toaster.stdin.write('custom_src');
            } else if (question.indexOf("Path to your release file") >= 0) {
              return toaster.stdin.write('custom_www/custom_js/custom_app.js');
            } else if (question.indexOf("Starting from your webroot") >= 0) {
              return toaster.stdin.write('custom_js');
            }
          });
          toaster.stderr.on('data', function(data) {
            console.log(data.toString());
            return this.callback(null, null);
          });
          toaster.on('exit', function(code) {
            var created, model;
            model = snapshot("" + __dirname + "/templates/new_custom_project");
            created = snapshot("" + __dirname + "/tmp/new_custom_project");
            return _this.callback(model, created);
          });
          return void 0;
        },
        'should match the custom template': function(model, created) {
          var a, alias, b, contents, _results;
          assert.isObject(model);
          assert.isObject(created);
          _results = [];
          for (alias in model) {
            contents = model[alias];
            a = created[alias];
            b = contents;
            _results.push(assert.equal(a, b));
          }
          return _results;
        }
      }
    }
  }).addBatch({
    'A config file created for an existent project': {
      topic: function() {
        var created, folder, template, toaster,
          _this = this;
        template = __dirname + "/templates/existing_project/toaster.coffee";
        folder = __dirname + "/tmp/existing_project/";
        created = "" + folder + "/toaster.coffee";
        if (path.existsSync(folder)) {
          FsUtil.rmdir_rf(folder);
        }
        fs.mkdirSync(folder, "0777");
        toaster = spawn_toaster(['-i', 'tmp/existing_project']);
        toaster.stdout.on('data', function(data) {
          var question;
          question = data.toString();
          if (question.indexOf("Path to your src folder") >= 0) {
            return toaster.stdin.write('src');
          } else if (question.indexOf("Path to your release file") >= 0) {
            return toaster.stdin.write('www/js/app.js');
          } else if (question.indexOf("Starting from your webroot") >= 0) {
            return toaster.stdin.write('js');
          }
        });
        toaster.stderr.on('data', function(data) {
          console.log(data.toString());
          return _this.callback(null, null);
        });
        toaster.on('exit', function(code) {
          var model;
          model = fs.readFileSync(template, "utf-8");
          created = fs.readFileSync(created, "utf-8");
          return _this.callback(model, created);
        });
        return void 0;
      },
      'should match the \'toaster.coffe\' template': function(model, created) {
        return assert.equal(true, true);
      }
    }
  })["export"](module);

  fs = require('fs');

  path = require('path');

  vows = require("vows");

  assert = require("assert");

  FsUtil = (require(__dirname + "/../lib/toaster")).toaster.utils.FsUtil;

  vows.describe('Builder').addBatch({
    'A project builded': {
      'with a syntax error on file "app.js" line 1': {
        topic: 'on file at line 1',
        'should alert against the file "app.js" at line 1': function(msg) {
          console.log("asserting " + msg);
          return assert.equal(msg, "on file at line 1");
        }
      }
    }
  })["export"](module);

}).call(this);
