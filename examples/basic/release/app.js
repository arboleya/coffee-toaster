(function() {
  var App, Black, Red, TopLevel, colors, misc, pkg, single;
  misc = {};
  single = {};
  colors = {};
  pkg = function(ns) {
    var curr, index, part, parts, _len;
    curr = null;
    parts = [].concat = ns.split(".");
    for (index = 0, _len = parts.length; index < _len; index++) {
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
  Black = (function() {
    function Black() {
      console.log("misc/Black created!");
    }
    return Black;
  })();
  console.log("I am the single/script file, you wont find class here!");
  TopLevel = (function() {
    function TopLevel() {
      console.log("TopLevel created!");
    }
    return TopLevel;
  })();
  Black = (function() {
    function Black() {
      console.log("colors/Black created!");
    }
    return Black;
  })();
  Red = (function() {
    function Red() {
      console.log("colors/Red created!");
    }
    return Red;
  })();
  App = (function() {
    function App() {
      console.log("App created!");
      new Red;
      new Black;
      new TopLevel;
      console.log(">>> namespaces are also welcome :)");
      new colors.Red;
      new colors.Black;
      new misc.Black;
    }
    return App;
  })();
  new App;
}).call(this);
