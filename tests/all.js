(function() {
  var APP_FOLDER, APP_PATH, BASEPATH, FsUtil, NAME, Project, RELEASE_FILE, RELEASE_FOLDER, SRC, assert, cs, feature, fs, path, project, vows;
  fs = require('fs');
  path = require('path');
  cs = require('coffee-script');
  vows = require('vows');
  assert = require('assert');
  feature = require('vows-bdd').Feature;
  Project = require("" + __dirname + "/../lib/toaster.js").Project;
  FsUtil = require("" + __dirname + "/../lib/toaster.js").FsUtil;
  BASEPATH = path.resolve(".");
  APP_FOLDER = "myawesomeapp";
  APP_PATH = "" + BASEPATH + "/" + APP_FOLDER;
  NAME = "My Awesome App";
  SRC = "src";
  RELEASE_FOLDER = "release";
  RELEASE_FILE = "" + RELEASE_FOLDER + "/app.js";
  project = null;
  feature('Project Scaffolding', module).scenario('Scaffolding a new project').given("A new Project instance", function() {
    project = new Project(BASEPATH);
    return this.callback();
  }).when('I create a new project from template', function() {
    project.create(APP_FOLDER, NAME, SRC, RELEASE_FILE);
    return this.callback();
  }).then("the project, src and release folders should be created", function() {
    assert.isTrue(path.existsSync(APP_PATH));
    assert.isTrue(path.existsSync("" + APP_PATH + "/" + SRC));
    return assert.isTrue(path.existsSync("" + APP_PATH + "/" + RELEASE_FOLDER));
  }).and("the toaster.coffee must to be created as well", function() {
    return assert.isTrue(path.existsSync("" + APP_PATH + "/toaster.coffee"));
  }).and("need to have the proper content", function() {
    var contents, filepath, module;
    filepath = "" + APP_PATH + "/toaster.coffee";
    contents = cs.compile(fs.readFileSync(filepath, "utf-8"), {
      bare: 1
    });
    module = [].concat(eval(contents)).shift();
    assert.equal(module.name, NAME);
    assert.equal(module.src, SRC);
    return assert.equal(module.release, RELEASE_FILE);
  }).complete(function() {
    return FsUtil.rmdir_rf(APP_PATH);
  }).finish(module);
}).call(this);
