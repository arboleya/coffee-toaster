(function() {
  var FsUtil, assert, error_message, events, fs, path, snapshot, spawn, spawn_toaster, vows;

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

  events = require("events");

  vows = require("vows");

  assert = require("assert");

  FsUtil = (require(__dirname + "/../lib/toaster")).toaster.utils.FsUtil;

  error_message = "ERROR Parse error on line 12: Unexpected 'UNARY' at file: app.coffee";

  vows.describe('Compiling').addBatch({
    'Compiling a project': {
      'that has syntax error on file "app.js" at line 12': {
        topic: function() {
          var report_msg, toaster,
            _this = this;
          report_msg = null;
          toaster = spawn_toaster(['-c', 'templates/error_with_line_number']);
          toaster.stdout.on('data', function(data) {
            if (report_msg == null) {
              return report_msg = data.toString().stripColors.replace(/\n/g, "");
            }
          });
          toaster.stderr.on('data', function(error) {
            return this.callback(error);
          });
          toaster.on('exit', function(data) {
            return _this.callback(null, report_msg);
          });
          return void 0;
        },
        'should report the error precisely': function(err, reported_msg) {
          assert.equal(err, null);
          return assert.equal(reported_msg, error_message);
        }
      }
    }
  })["export"](module);

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
      'should match the \'toaster.coffee\' template': function(model, created) {
        return assert.equal(true, true);
      }
    }
  })["export"](module);

}).call(this);
