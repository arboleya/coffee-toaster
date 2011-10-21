(function() {
  var A, App, B, TopLevel, letters, pkg, repeating, single;
  repeating = {};
  single = {};
  letters = {};
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
  pkg('repeating').A = A = (function() {
    function A() {
      console.log("repeating/A created!");
    }
    return A;
  })();
  pkg('repeating').B = B = (function() {
    function B() {
      console.log("repeating/B created!");
    }
    return B;
  })();
  console.log("----------------------------------------------------------------------------\n:: I am the single/script file, you wont find any class declaration in me!\n\t So I will run as soon as I am processed, without the needing to be\n\t instantiated etc -- and thats why this log message will appear before\n\t the others (in this example).\n----------------------------------------------------------------------------");
  TopLevel = (function() {
    function TopLevel() {
      console.log("TopLevel created!");
    }
    return TopLevel;
  })();
  pkg('letters').A = A = (function() {
    function A() {
      console.log("letters/A created!");
    }
    return A;
  })();
  pkg('letters').B = B = (function() {
    function B() {
      console.log("letters/B created!");
    }
    return B;
  })();
  App = (function() {
    function App() {
      console.log("App created!");
      new A;
      new B;
      new TopLevel;
      console.log("--------------------------------------------------------------------\n:: Namespaces are also welcome :)\n\t ..and helps you to differ two classes with the same name.\n\t In the lines bellow, two classes named 'A' and 'B' are\n\t instantiated independently, through namespaces.\n\t Namespaces are automatically generated based on the folder the\n\t the files are, relative to the src folder.\n--------------------------------------------------------------------");
      new letters.A;
      new letters.B;
      new repeating.A;
      new repeating.B;
    }
    return App;
  })();
  new App;
}).call(this);
