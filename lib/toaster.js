var __t;

__t = function(ns) {
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

var toaster = exports.toaster = {};

(function() {
  var Toaster, debug, error, exec, fs, growl, icon_error, icon_warn, interval, log, msgs, os, path, process_msgs, queue_msg, start_worker, stop_worker, warn,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  __t('toaster').Toast = (function() {
    var colors, cs, exec, fs, fsu, path;

    fs = require("fs");

    fsu = require("fs-util");

    path = require("path");

    exec = (require("child_process")).exec;

    colors = require('colors');

    cs = require("coffee-script");

    Toast.prototype.builders = null;

    function Toast(toaster) {
      var code, config, config_file, contents, filepath, fix_scope, item, watcher, _i, _len, _ref,
        _this = this;
      this.toaster = toaster;
      this.toast = __bind(this.toast, this);

      this.basepath = this.toaster.basepath;
      this.builders = [];
      if ((config = this.toaster.cli.argv["config"]) != null) {
        if (!(config instanceof Object)) {
          config = JSON.parse(config);
        }
        _ref = [].concat(config);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          this.toast(item);
        }
      } else {
        config_file = this.toaster.cli.argv["config-file"];
        filepath = config_file || path.join(this.basepath, "toaster.coffee");
        if (this.toaster.cli.argv.w) {
          watcher = fsu.watch(filepath);
          watcher.on('change', function(f) {
            var now;
            now = (("" + (new Date)).match(/[0-9]{2}\:[0-9]{2}\:[0-9]{2}/))[0];
            log(("[" + now + "] " + 'Changed'.bold + " " + filepath).cyan);
            watcher.close();
            return _this.toaster.reset();
          });
        }
        if (fs.existsSync(filepath)) {
          contents = fs.readFileSync(filepath, "utf-8");
          try {
            code = cs.compile(contents, {
              bare: 1
            });
          } catch (err) {
            error(err.message + " at 'toaster.coffee' config file.");
          }
          fix_scope = /(^[\s\t]?)(toast)+(\()/mg;
          code = code.replace(fix_scope, "$1this.$2$3");
          eval(code);
        } else {
          error("File not found: ".yellow + (" " + filepath.red + "\n") + "Try running:".yellow + " toaster -i".green + " or type".yellow + (" " + 'toaster -h'.green + " ") + "for more info".yellow);
        }
      }
    }

    Toast.prototype.toast = function(srcpath, params) {
      var alias, builder, config, debug, dir, folder, i, item, v, vpath, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      if (params == null) {
        params = {};
      }
      if (srcpath instanceof Object) {
        params = srcpath;
      } else if ((path.resolve(srcpath)) !== srcpath) {
        folder = path.join(this.basepath, srcpath);
      }
      if (params.release === null) {
        error('Release path not informed in config.');
        return process.exit();
      } else {
        dir = path.dirname(params.release);
        if (!fs.existsSync(path.join(this.basepath, dir))) {
          error("Release folder does not exist:\n\t" + dir.yellow);
          return process.exit();
        }
      }
      if (params.debug) {
        debug = path.join(this.basepath, params.debug);
      } else {
        debug = null;
      }
      config = {
        is_building: false,
        basepath: this.basepath,
        src_folders: [],
        files: [],
        vendors: (_ref = params.vendors) != null ? _ref : [],
        exclude: (_ref1 = params.exclude) != null ? _ref1 : [],
        bare: (_ref2 = params.bare) != null ? _ref2 : false,
        packaging: (_ref3 = params.packaging) != null ? _ref3 : true,
        expose: (_ref4 = params.expose) != null ? _ref4 : null,
        minify: (_ref5 = params.minify) != null ? _ref5 : true,
        httpfolder: (_ref6 = params.httpfolder) != null ? _ref6 : "",
        release: path.join(this.basepath, params.release),
        debug: debug
      };
      _ref7 = config.vendors;
      for (i = _i = 0, _len = _ref7.length; _i < _len; i = ++_i) {
        v = _ref7[i];
        vpath = config.vendors[i] = path.resolve(v);
        if ((path.resolve(vpath)) !== vpath) {
          config.vendors[i] = path.join(this.basepath, v);
        }
      }
      if (!(srcpath instanceof Object)) {
        srcpath = path.resolve(path.join(this.basepath, srcpath));
        config.src_folders.push({
          path: srcpath,
          alias: params.alias || null
        });
      }
      if (params.folders != null) {
        _ref8 = params.folders;
        for (folder in _ref8) {
          alias = _ref8[folder];
          if ((path.resolve(folder)) !== folder) {
            folder = path.join(this.basepath, folder);
          }
          config.src_folders.push({
            path: folder,
            alias: alias
          });
        }
      }
      _ref9 = config.src_folders;
      for (_j = 0, _len1 = _ref9.length; _j < _len1; _j++) {
        item = _ref9[_j];
        if (!fs.existsSync(item.path)) {
          error(("Source folder doens't exist:\n\t" + item.path.red + "\n") + ("Check your " + 'toaster.coffee'.yellow + " and try again.") + "\n\t" + (path.join(this.basepath, "toaster.coffee")).yellow);
          return process.exit();
        }
      }
      builder = new toaster.core.Builder(this.toaster, this.toaster.cli, config);
      return this.builders.push(builder);
    };

    return Toast;

  })();

  __t('toaster.generators').Question = (function() {

    function Question() {}

    Question.prototype.ask = function(question, format, fn) {
      var stdin, stdout,
        _this = this;
      stdin = process.stdin;
      stdout = process.stdout;
      stdout.write("" + question + " ");
      return stdin.once('data', function(data) {
        var msg, rule;
        data = data.toString().trim();
        if (format.test(data)) {
          return fn(data.trim());
        } else {
          msg = "" + 'Invalid entry, it should match:'.red;
          rule = "" + (format.toString().cyan);
          stdout.write("\t" + msg + " " + rule + "\n");
          return _this.ask(question, format, fn);
        }
      }).resume();
    };

    return Question;

  })();

  __t('toaster.utils').ArrayUtil = (function() {

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
      if (a == null) {
        a = [];
      }
      if (b == null) {
        b = [];
      }
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

  __t('toaster.utils').FnUtil = (function() {

    function FnUtil() {}

    FnUtil.proxy = function() {
      var fn, params;
      fn = arguments[0], params = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return function() {
        var inner_params;
        inner_params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return fn.apply(null, params.concat(inner_params));
      };
    };

    return FnUtil;

  })();

  os = require('os');

  growl = os.platform() === 'win32' ? null : require('growl');

  icon_warn = __dirname + '/../images/warning.png';

  icon_error = __dirname + '/../images/error.png';

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
    if (send_to_growl && (growl != null)) {
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
    if (send_to_growl && (growl != null)) {
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

  __t('toaster.utils').StringUtil = (function() {

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

  __t('toaster.core').Script = (function() {
    var ArrayUtil, cs, fs, path;

    fs = require("fs");

    path = require('path');

    cs = require("coffee-script");

    ArrayUtil = toaster.utils.ArrayUtil;

    function Script(builder, folderpath, realpath, alias, opts) {
      this.builder = builder;
      this.folderpath = folderpath;
      this.realpath = realpath;
      this.alias = alias;
      this.opts = opts;
      this.getinfo();
    }

    Script.prototype.getinfo = function(declare_ns) {
      var baseclass, decl, extending, item, klass, name, repl, requirements, rgx, rgx_ext, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _results;
      if (declare_ns == null) {
        declare_ns = true;
      }
      this.raw = fs.readFileSync(this.realpath, "utf-8");
      this.dependencies_collapsed = [];
      this.baseclasses = [];
      this.filepath = this.realpath.replace(this.folderpath, '');
      if (this.alias != null) {
        this.filepath = path.join(path.sep, this.alias, this.filepath);
      }
      this.filename = path.basename(this.filepath);
      this.filefolder = path.dirname(this.filepath);
      this.namespace = "";
      if (this.filepath.indexOf(path.sep) === -1) {
        this.filefolder = "";
      }
      this.namespace = this.filefolder.replace(new RegExp("\\" + path.sep, "g"), ".");
      this.namespace = this.namespace.replace(/^\.?(.*)\.?$/g, "$1");
      rgx = /^(class)+\s+([^\s]+)+(\s(extends)\s+([\w.]+))?/mg;
      rgx_ext = /(^|=\s*)(class)\s(\w+)\s(extends)\s(\\w+)\s*$/gm;
      if (this.raw.match(rgx) != null) {
        if (this.namespace !== "" && this.builder.packaging) {
          _ref = [].concat(this.raw.match(rgx));
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            decl = _ref[_i];
            name = decl.match(/class\s([^\s]+)/);
            name = (name[1].split('.')).pop();
            extending = decl.match(/(\sextends\s[^\s]+$)/m);
            if (extending) {
              extending = extending[0];
            }
            extending || (extending = "");
            repl = "class " + this.namespace + "." + name + extending;
            if (decl !== repl) {
              this.raw = this.raw.replace(decl, repl);
              fs.writeFileSync(this.realpath, this.raw);
            }
          }
          this.classpath = "" + this.namespace + "." + this.classname;
        }
        this.classname = this.raw.match(rgx)[3];
        _ref2 = (_ref1 = this.raw.match(rgx_ext)) != null ? _ref1 : [];
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          klass = _ref2[_j];
          baseclass = klass.match(rgx_ext)[5];
          this.baseclasses.push(baseclass);
        }
      }
      if (/(#<<\s)(.*)/g.test(this.raw)) {
        requirements = this.raw.match(/(#<<\s)(.*)/g);
        _results = [];
        for (_k = 0, _len2 = requirements.length; _k < _len2; _k++) {
          item = requirements[_k];
          item = /(#<<\s)(.*)/.exec(item)[2];
          item = item.replace(/\s/g, "");
          if (path.sep === "\\") {
            item = item.replace(/(\/)/g, "\\");
          }
          _results.push(this.dependencies_collapsed = this.dependencies_collapsed.concat(item));
        }
        return _results;
      }
    };

    Script.prototype.expand_dependencies = function() {
      var dependency, expanded, files, found, index, reg, _i, _j, _len, _len1, _ref;
      files = this.builder.files;
      this.dependencies = [];
      _ref = this.dependencies_collapsed;
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        dependency = _ref[index];
        if ((dependency.substr(0, 1)) === path.sep) {
          dependency = dependency.substr(1);
        }
        if (dependency.substr(-1) !== "*") {
          this.dependencies.push("" + path.sep + dependency + ".coffee");
          continue;
        }
        reg = new RegExp(dependency.replace(/(\/|\\)/g, "\\$1"));
        found = ArrayUtil.find_all(files, reg, "filepath", true, true);
        if (found.length <= 0) {
          warn(("Nothing found inside " + ("'" + dependency).white + "'").yellow);
          continue;
        }
        for (_j = 0, _len1 = found.length; _j < _len1; _j++) {
          expanded = found[_j];
          if (expanded.item.filepath !== this.filepath) {
            this.dependencies.push(expanded.item.filepath);
          }
        }
      }
      return this.dependencies;
    };

    return Script;

  })();

  __t('toaster').Cli = (function() {
    var optimist;

    optimist = require('optimist');

    function Cli() {
      var usage;
      usage = "" + 'CoffeeToaster'.bold + "\n";
      usage += "  Minimalist build system for CoffeeScript\n\n".grey;
      usage += "" + 'Usage:' + "\n";
      usage += "  toaster [" + 'options'.green + "] [" + 'path'.green + "]\n\n";
      usage += "" + 'Examples:' + "\n";
      usage += "  toaster -n myawsomeapp   (" + 'required'.red + ")\n";
      usage += "  toaster -i [myawsomeapp] (" + 'optional'.green + ")\n";
      usage += "  toaster -w [myawsomeapp] (" + 'optional'.green + ")\n";
      usage += "  toaster -wd [myawsomeapp] (" + 'optional'.green + ")";
      this.argv = (this.opts = optimist.usage(usage).alias('n', 'new').describe('n', "Scaffold a very basic new App").alias('i', 'init').describe('i', "Create a config (toaster.coffee) file").alias('w', 'watch').describe('w', "Start watching/compiling your project").alias('c', 'compile').describe('c', "Compile the entire project, without watching it.").alias('d', 'debug').describe('d', 'Debug mode (compile js files individually)').alias('a', 'autorun').describe('a', 'Execute the script in node.js after compilation').alias('j', 'config').string('j').describe('j', "Config file formatted as a json-string.").alias('f', 'config-file').string('f').describe('f', "Path to a different config file.").alias('v', 'version').describe('v', '').alias('h', 'help').describe('h', '')).argv;
    }

    return Cli;

  })();

  __t('toaster.core').Builder = (function() {
    var ArrayUtil, FnUtil, Script, StringUtil, cp, cs, fs, fsu, missing, path, uglify, uglify_parser, _ref;

    fs = require('fs');

    fsu = require('fs-util');

    path = require('path');

    cs = require("coffee-script");

    cp = require("child_process");

    uglify = require("uglify-js").uglify;

    uglify_parser = require("uglify-js").parser;

    Script = toaster.core.Script;

    _ref = toaster.utils, FnUtil = _ref.FnUtil, ArrayUtil = _ref.ArrayUtil, StringUtil = _ref.StringUtil;

    Builder.prototype.watchers = null;

    Builder.prototype._include_tmpl = "document.write('<scri'+'pt src=\"%SRC%\"></scr'+'ipt>')";

    function Builder(toaster, cli, config) {
      this.toaster = toaster;
      this.cli = cli;
      this.config = config;
      this.merge_vendors = __bind(this.merge_vendors, this);

      this.on_fs_change = __bind(this.on_fs_change, this);

      this.build = __bind(this.build, this);

      this.vendors = this.config.vendors;
      this.bare = this.config.bare;
      this.packaging = this.config.packaging;
      this.expose = this.config.expose;
      this.minify = this.config.minify;
      this.exclude = [].concat(this.config.exclude);
      this.httpfolder = this.config.httpfolder;
      this.release = this.config.release;
      this.debug = this.config.debug;
      this.init();
      if (this.cli.argv.w) {
        this.watch();
      }
    }

    Builder.prototype.init = function() {
      var falias, file, folder, fpath, include, item, result, s, _i, _len, _ref1, _results;
      this.files = this.config.files;
      _ref1 = this.config.src_folders;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        folder = _ref1[_i];
        result = fsu.find(folder.path, /.coffee$/m);
        fpath = folder.path;
        falias = folder.alias;
        _results.push((function() {
          var _j, _k, _len1, _len2, _ref2, _results1;
          _results1 = [];
          for (_j = 0, _len1 = result.length; _j < _len1; _j++) {
            file = result[_j];
            include = true;
            _ref2 = this.exclude;
            for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
              item = _ref2[_k];
              include &= !(new RegExp(item).test(file));
            }
            if (include) {
              s = new Script(this, fpath, file, falias, this.cli);
              _results1.push(this.files.push(s));
            } else {
              _results1.push(void 0);
            }
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    Builder.prototype.reset = function() {
      var watcher, _i, _len, _ref1, _results;
      _ref1 = this.watchers;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        watcher = _ref1[_i];
        _results.push(watcher.close());
      }
      return _results;
    };

    Builder.prototype.build = function(header_code, footer_code) {
      var args, ast, contents, f, files, i, include, namespaces, now, tmpl, vendors, _i, _j, _len, _ref1;
      if (header_code == null) {
        header_code = "";
      }
      if (footer_code == null) {
        footer_code = "";
      }
      namespaces = this.build_namespaces();
      vendors = this.merge_vendors();
      contents = [];
      if (vendors !== "") {
        contents.push(vendors);
      }
      if (this.packaging) {
        contents.push(namespaces);
      }
      if (header_code !== "") {
        contents.push(header_code);
      }
      contents.push(this.compile());
      if (header_code !== "") {
        contents.push(footer_code);
      }
      contents = contents.join('\n');
      if (this.minify) {
        ast = uglify_parser.parse(contents);
        ast = uglify.ast_mangle(ast);
        ast = uglify.ast_squeeze(ast);
        contents = uglify.gen_code(ast);
      }
      fs.writeFileSync(this.release, contents);
      now = (("" + (new Date)).match(/[0-9]{2}\:[0-9]{2}\:[0-9]{2}/))[0];
      log(("[" + now + "] " + 'Compiled'.bold + " " + this.release).green);
      if (this.cli.argv.d && (this.debug != null) && !this.cli.argv.a) {
        files = this.compile_for_debug();
        for (i = _i = 0, _len = files.length; _i < _len; i = ++_i) {
          f = files[i];
          include = path.normalize("" + this.httpfolder + "/toaster/" + f);
          if (path.sep === "\\") {
            include = include.replace(/\\/g, "\/");
          }
          tmpl = this._include_tmpl.replace("%SRC%", include);
          files[i] = tmpl;
        }
        contents = [];
        if (vendors !== "") {
          contents.push(vendors);
        }
        if (this.packaging) {
          contents.push(namespaces);
        }
        if (header_code !== "") {
          contents.push(header_code);
        }
        contents.push(files.join("\n"));
        if (header_code !== "") {
          contents.push(footer_code);
        }
        contents = contents.join('\n');
        fs.writeFileSync(this.debug, contents);
        log(("[" + now + "] " + 'Compiled'.bold + " " + this.debug).green);
      }
      if (this.cli.argv.a) {
        args = [];
        if (process.argv.length > 3) {
          for (i = _j = 3, _ref1 = process.argv.length; _j < _ref1; i = _j += 1) {
            args.push(process.argv[i]);
          }
        }
        if (this.child != null) {
          log("Application restarted:".blue);
          this.child.kill('SIGHUP');
        } else {
          log("Application started:".blue);
        }
        if (this.cli.argv.d) {
          return this.child = cp.fork(this.release, args, {
            execArgv: ['--debug-brk']
          });
        } else {
          return this.child = cp.fork(this.release, args);
        }
      }
    };

    Builder.prototype.build_namespaces = function() {
      var buffer, folder, name, scope, t, tree, _i, _len, _ref1;
      tree = {};
      _ref1 = this.config.src_folders;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        folder = _ref1[_i];
        if (folder.alias != null) {
          t = (tree[folder.alias] = {});
        }
        this.build_ns_tree(t || tree, folder.path);
      }
      buffer = "";
      for (name in tree) {
        scope = tree[name];
        buffer += "var " + name + " = ";
        if (this.expose != null) {
          buffer += "" + this.expose + "." + name + " = ";
        }
        buffer += (JSON.stringify(scope, null, '')).replace(/\"/g, "'");
        buffer += ";\n";
      }
      return buffer;
    };

    Builder.prototype.build_ns_tree = function(tree, folderpath) {
      var folder, folders, include, item, _i, _j, _len, _len1, _ref1, _results;
      folders = fsu.ls(folderpath);
      _results = [];
      for (_i = 0, _len = folders.length; _i < _len; _i++) {
        folder = folders[_i];
        include = true;
        _ref1 = this.exclude;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          item = _ref1[_j];
          include &= !(new RegExp(item).test(folder));
        }
        if (include) {
          _results.push(this.build_ns_tree((tree[folder.match(/[^\/\\]+$/m)] = {}), folder));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Builder.prototype.watch = function() {
      var src, temp, vendor, watcher, _i, _j, _len, _len1, _ref1, _ref2, _results;
      this.watchers = [];
      _ref1 = this.config.src_folders;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        src = _ref1[_i];
        this.watchers.push((watcher = fsu.watch(src.path, /.coffee$/m)));
        watcher.on('create', FnUtil.proxy(this.on_fs_change, src, 'create'));
        watcher.on('change', FnUtil.proxy(this.on_fs_change, src, 'change'));
        watcher.on('delete', FnUtil.proxy(this.on_fs_change, src, 'delete'));
      }
      _ref2 = this.vendors;
      _results = [];
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        vendor = _ref2[_j];
        temp = fsu.watch(vendor);
        temp.on('create', FnUtil.proxy(this.on_fs_change, src, 'create'));
        temp.on('change', FnUtil.proxy(this.on_fs_change, src, 'change'));
        _results.push(temp.on('delete', FnUtil.proxy(this.on_fs_change, src, 'delete')));
      }
      return _results;
    };

    Builder.prototype.on_fs_change = function(src, ev, f) {
      var falias, file, fpath, include, item, msg, now, relative_path, s, spath, type, _i, _len, _ref1;
      if (f.type === "dir" && ev === "create") {
        return;
      }
      fpath = f.location;
      spath = src.path;
      if (src.alias != null) {
        falias = path.sep + src.alias;
      } else {
        falias = '';
      }
      include = true;
      _ref1 = this.exclude;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        item = _ref1[_i];
        include &= !(new RegExp(item).test(fpath));
      }
      if (!include) {
        return;
      }
      type = StringUtil.titleize(f.type);
      relative_path = fpath.replace(spath, falias);
      now = (("" + (new Date)).match(/[0-9]{2}\:[0-9]{2}\:[0-9]{2}/))[0];
      switch (ev) {
        case "create":
          if (f.type === "file") {
            s = new Script(this, spath, fpath, falias, this.cli);
            this.files.push(s);
          }
          msg = "" + ('New ' + f.type + ' created').bold;
          log(("[" + now + "] " + msg + " " + f.location).cyan);
          break;
        case "delete":
          file = ArrayUtil.find(this.files, relative_path, "filepath");
          if (file === null) {
            return;
          }
          this.files.splice(file.index, 1);
          msg = "" + (type + ' deleted, stop watching').bold;
          log(("[" + now + "] " + msg + " " + f.location).red);
          break;
        case "change":
          file = ArrayUtil.find(this.files, relative_path, "filepath");
          if (file === null) {
            warn("CHANGED FILE IS APPARENTLY NULL...");
          } else {
            file.item.getinfo();
            msg = "" + (type + ' changed').bold;
            log(("[" + now + "] " + msg + " " + f.location).cyan);
          }
      }
      if (this.toaster.before_build === null || this.toaster.before_build()) {
        return this.build();
      }
    };

    Builder.prototype.compile = function() {
      var file, msg, output, _i, _j, _len, _len1, _ref1, _ref2;
      _ref1 = this.files;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        file = _ref1[_i];
        try {
          cs.compile(file.raw);
        } catch (err) {
          msg = err.message.replace('"', '\\"');
          msg = ("" + msg.white + " at file: ") + ("" + file.filepath).bold.red;
          error(msg);
          return null;
        }
      }
      _ref2 = this.files;
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        file = _ref2[_j];
        file.expand_dependencies();
      }
      this.reorder();
      output = ((function() {
        var _k, _len2, _ref3, _results;
        _ref3 = this.files;
        _results = [];
        for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
          file = _ref3[_k];
          _results.push(file.raw);
        }
        return _results;
      }).call(this)).join("\n");
      return output = cs.compile(output, {
        bare: this.bare
      });
    };

    Builder.prototype.compile_for_debug = function() {
      var absolute_path, file, files, find, folder_path, index, relative_path, release_path, _i, _len, _ref1;
      release_path = path.dirname(this.debug);
      release_path = path.join(release_path, "toaster");
      if (fs.existsSync(release_path)) {
        fsu.rm_rf(release_path);
      }
      fsu.mkdir_p(release_path);
      files = [];
      _ref1 = this.files;
      for (index = _i = 0, _len = _ref1.length; _i < _len; index = ++_i) {
        file = _ref1[index];
        find = "" + this.toaster.basepath + path.sep;
        relative_path = file.filepath.replace(find, "");
        relative_path = relative_path.replace(".coffee", ".js");
        absolute_path = path.resolve(path.join(release_path, relative_path));
        folder_path = path.dirname(absolute_path);
        if (!fs.existsSync(folder_path)) {
          fsu.mkdir_p(folder_path);
        }
        try {
          fs.writeFileSync(absolute_path, cs.compile(file.raw, {
            bare: this.bare
          }));
        } catch (err) {
          continue;
        }
        files.push(relative_path);
      }
      return files;
    };

    missing = {};

    Builder.prototype.reorder = function(cycling) {
      var bc, dependency, dependency_index, file, file_index, filepath, found, i, index, not_found, _i, _j, _len, _len1, _ref1, _ref2, _results;
      if (cycling == null) {
        cycling = false;
      }
      if (cycling === false) {
        this.missing = {};
      }
      _ref1 = this.files;
      _results = [];
      for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
        file = _ref1[i];
        if (!file.dependencies.length && !file.baseclasses.length) {
          continue;
        }
        _ref2 = file.dependencies;
        for (index = _j = 0, _len1 = _ref2.length; _j < _len1; index = ++_j) {
          filepath = _ref2[index];
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
          var _k, _len2, _ref3, _results1;
          _ref3 = file.baseclasses;
          _results1 = [];
          for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
            bc = _ref3[_k];
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
      var buffer, vendor, _i, _len, _ref1;
      buffer = [];
      _ref1 = this.vendors;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        vendor = _ref1[_i];
        if (fs.existsSync(vendor)) {
          buffer.push(fs.readFileSync(vendor, 'utf-8'));
        } else {
          warn("Vendor not found at ".white + vendor.yellow.bold);
        }
      }
      return buffer.join("\n");
    };

    return Builder;

  })();

  __t('toaster.generators').Config = (function(_super) {
    var fs, path;

    __extends(Config, _super);

    path = require("path");

    fs = require("fs");

    Config.prototype.tpl = "# => SRC FOLDER\ntoast '%src%'\n\n  # EXCLUDED FOLDERS (optional)\n  # exclude: ['folder/to/exclude', 'another/folder/to/exclude', ... ]\n\n  # => VENDORS (optional)\n  # vendors: ['vendors/x.js', 'vendors/y.js', ... ]\n\n  # => OPTIONS (optional, default values listed)\n  # bare: false\n  # packaging: true\n  # expose: ''\n  # minify: true\n\n  # => HTTPFOLDER (optional), RELEASE / DEBUG (required)\n  httpfolder: '%httpfolder%'\n  release: '%release%'\n  debug: '%debug%'";

    function Config(basepath) {
      this.basepath = basepath;
      this.write = __bind(this.write, this);

      this.create = __bind(this.create, this);

    }

    Config.prototype.create = function() {
      var q1, q2, q3,
        _this = this;
      q1 = "Path to your src folder? [src] : ";
      q2 = "Path to your release file? [www/js/app.js] : ";
      q3 = "Starting from your webroot '/', what's the folderpath to " + "reach your release file? (i.e. js) (optional) : ";
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
      filepath = path.join(this.basepath, "toaster.coffee");
      rgx = /(\/)?((\w+)(\.*)(\w+$))/;
      parts = rgx.exec(release);
      filename = parts[2];
      if (filename.indexOf(".") > 0) {
        debug = release.replace(rgx, "$1$3-debug$4$5");
      } else {
        debug = "" + release + "-debug";
      }
      buffer = this.tpl.replace("%src%", src.replace(/\\/g, "\/"));
      buffer = buffer.replace("%release%", release.replace(/\\/g, "\/"));
      buffer = buffer.replace("%debug%", debug.replace(/\\/g, "\/"));
      buffer = buffer.replace("%httpfolder%", httpfolder.replace(/\\/g, "\/"));
      if (fs.existsSync(filepath)) {
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

  })(toaster.generators.Question);

  __t('toaster.generators').Project = (function(_super) {
    var FsUtil, fs, fsu, path;

    __extends(Project, _super);

    path = require("path");

    fs = require("fs");

    fsu = require('fs-util');

    FsUtil = toaster.utils.FsUtil;

    function Project(basepath) {
      this.basepath = basepath;
      this.scaffold = __bind(this.scaffold, this);

    }

    Project.prototype.create = function(folderpath, name, src, release) {
      var error_msg, q1, q2, q3,
        _this = this;
      if ((typeof folderpath) !== 'string') {
        error_msg = "You need to inform a target path!\n";
        error_msg += "\ttoaster -n myawesomeapp".green;
        return error(error_msg);
      }
      if ((name != null) && (src != null) && (release != null)) {
        return this.scaffold(folderpath, name, src, release);
      }
      q1 = "Path to your src folder? [src] : ";
      q2 = "Path to your release file? [www/js/app.js] : ";
      q3 = "Starting from your webroot '/', what's the folderpath to " + "reach your release file? (i.e. js) (optional) : ";
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
            _this.scaffold(folderpath, $src, $release, $httpfolder);
            return process.exit();
          });
        });
      });
    };

    Project.prototype.scaffold = function(target, src, release, httpfolder) {
      var config, releasedir, releasefile, srcdir, vendorsdir;
      target = path.resolve(target);
      srcdir = path.join(target, src);
      vendorsdir = path.join(target, "vendors");
      releasefile = path.join(target, release);
      releasedir = path.dirname(releasefile);
      if (fsu.mkdir_p(target)) {
        log("" + 'Created'.green.bold + " " + target);
      }
      if (fsu.mkdir_p(srcdir)) {
        log("" + 'Created'.green.bold + " " + srcdir);
      }
      if (fsu.mkdir_p(vendorsdir)) {
        log("" + 'Created'.green.bold + " " + vendorsdir);
      }
      if (fsu.mkdir_p(releasedir)) {
        log("" + 'Created'.green.bold + " " + releasedir);
      }
      srcdir = srcdir.replace(target, "").substr(1);
      releasefile = releasefile.replace(target, "").substr(1);
      config = new toaster.generators.Config(target);
      return config.write(srcdir, releasefile, httpfolder);
    };

    return Project;

  })(toaster.generators.Question);

  fs = require('fs');

  path = require('path');

  exec = (require("child_process")).exec;

  __t('toaster.misc').InjectNS = (function() {

    function InjectNS(builders) {
      var builder, f, _i, _j, _len, _len1, _ref, _ref1;
      this.builders = builders;
      console.log("Declaring namespaces for files...");
      _ref = this.builders;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        builder = _ref[_i];
        _ref1 = builder.files;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          f = _ref1[_j];
          f.getinfo(true);
          fs.writeFileSync(f.realpath, f.raw);
          f.getinfo(false);
          console.log(f.realpath);
        }
      }
      console.log("...done.");
    }

    return InjectNS;

  })();

  exports.run = function() {
    return new Toaster;
  };

  exports.toaster = toaster;

  exports.Toaster = Toaster = (function() {
    var colors, fsu;

    fs = require("fs");

    fsu = require("fs-util");

    path = require("path");

    exec = (require("child_process")).exec;

    colors = require('colors');

    Toaster.prototype.before_build = null;

    function Toaster(basedir, options, skip_initial_build) {
      var base, config, contents, filepath, flag, k, schema, v, _i, _len, _ref;
      if (options == null) {
        options = null;
      }
      if (skip_initial_build == null) {
        skip_initial_build = false;
      }
      this.basepath = path.resolve(basedir || ".");
      this.cli = new toaster.Cli(options);
      _ref = 'nicwd'.split('');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        flag = _ref[_i];
        if (typeof (base = this.cli.argv[flag]) === 'string') {
          this.basepath = path.resolve(base);
          break;
        }
      }
      if (options != null) {
        for (k in options) {
          v = options[k];
          this.cli.argv[k] = v;
        }
      }
      if (this.cli.argv.v) {
        filepath = path.join(__dirname, "/../package.json");
        contents = fs.readFileSync(filepath, "utf-8");
        schema = JSON.parse(contents);
        return log(schema.version);
      } else if (this.cli.argv.n) {
        new toaster.generators.Project(this.basepath).create(this.cli.argv.n);
      } else if (this.cli.argv.i) {
        new toaster.generators.Config(this.basepath).create();
      } else if (this.cli.argv.ns) {
        this.toast = new toaster.Toast(this);
        new toaster.misc.InjectNS(this.toast.builders);
      } else if ((base = this.cli.argv.w || this.cli.argv.c || this.cli.argv.a)) {
        config = options && options.config ? options.config : null;
        this.toast = new toaster.Toast(this);
        if (!skip_initial_build) {
          this.build();
        }
      } else {
        return log(this.cli.opts.help());
      }
    }

    Toaster.prototype.build = function(header_code, footer_code) {
      var builder, _i, _len, _ref, _results;
      if (header_code == null) {
        header_code = "";
      }
      if (footer_code == null) {
        footer_code = "";
      }
      _ref = this.toast.builders;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        builder = _ref[_i];
        _results.push(builder.build(header_code, footer_code));
      }
      return _results;
    };

    Toaster.prototype.reset = function() {
      var builder, _i, _len, _ref;
      _ref = this.toast.builders;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        builder = _ref[_i];
        builder.reset();
      }
      return exports.run();
    };

    return Toaster;

  })();

}).call(this);
