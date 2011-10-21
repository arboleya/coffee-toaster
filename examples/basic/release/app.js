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
  pkg('misc').Black = Black = (function() {
    function Black() {
      console.log("misc/Black created!");
    }
    return Black;
  })();
  console.log("----------------------------------------------------------------------------\n:: I am the single/script file, you wont find any class declaration in me!\n\t So I will run as soon as I am processed, without the needing to be\n\t instantiated etc -- and thats why this log message will appear before\n\t the others (in this example).\n----------------------------------------------------------------------------");
  TopLevel = (function() {
    function TopLevel() {
      console.log("TopLevel created!");
    }
    return TopLevel;
  })();
  pkg('colors').Black = Black = (function() {
    function Black() {
      console.log("colors/Black created!");
    }
    return Black;
  })();
  pkg('colors').Red = Red = (function() {
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
      console.log("--------------------------------------------------------------------\n:: Namespaces are also welcome :)\n\t ..and helps you to differ two classes with the same name.\n\t In the lines bellow, two classes named 'Black' are instantiated\n\t independently, through namespaces.\n\t Namespaces are automatically generated based on the folder the\n\t the file are, relative to the src folder.\n--------------------------------------------------------------------");
      new colors.Red;
      new colors.Black;
      new misc.Black;
    }
    return App;
  })();
  new App;
}).call(this);
