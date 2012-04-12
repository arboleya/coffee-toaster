var UNDERSCORE = {};
var JQUERY = {};
var __t;

__t = function(ns, expose) {
  var curr, index, part, parts, _i, _len;
  curr = null;
  parts = [].concat = ns.split(".");
  for (index = _i = 0, _len = parts.length; _i < _len; index = ++_i) {
    part = parts[index];
    if (curr === null) {
      curr = eval(part);
      if (expose != null) {
        expose[part] = curr;
      }
      continue;
    } else {
      if (curr[part] == null) {
        curr = curr[part] = {};
        if (expose != null) {
          expose[part] = curr;
        }
      } else {
        curr = curr[part];
      }
    }
  }
  return curr;
};

var basic = window.basic = {};

(function() {

  __t('basic.letters', window).A = (function() {

    A.name = 'A';

    function A() {
      console.log("letters/A created!");
    }

    return A;

  })();

  __t('basic.letters', window).B = (function() {

    B.name = 'B';

    function B() {
      console.log("letters/B created!");
    }

    return B;

  })();

  __t('basic.repeating', window).A = (function() {

    A.name = 'A';

    function A() {
      console.log("repeating/A created!");
    }

    return A;

  })();

  __t('basic.repeating', window).B = (function() {

    B.name = 'B';

    function B() {
      console.log("repeating/B created!");
    }

    return B;

  })();

  console.log("----------------------------------------------------------------------------\n:: I am the single/script file, you wont find any class declaration in me!\n\t So I will run as soon as I am processed, without the needing to be\n\t instantiated etc -- and thats why this log message will appear before\n\t the others (in this example).\n----------------------------------------------------------------------------");

  __t('basic', window).TopLevel = (function() {

    TopLevel.name = 'TopLevel';

    function TopLevel() {
      console.log("TopLevel created!");
    }

    return TopLevel;

  })();

  __t('basic', window).App = (function() {

    App.name = 'App';

    function App() {
      console.log("App created!");
      new basic.TopLevel;
      console.log("--------------------------------------------------------------------\n:: Namespaces are also welcome :)\n\t ..and helps you to differ two classes with the same name.\n\t In the lines bellow, two classes named 'A' and 'B' are\n\t instantiated independently, through namespaces.\n\t Namespaces are automatically generated based on the folder the\n\t the files are, relative to the src folder.\n--------------------------------------------------------------------");
      new basic.letters.A;
      new basic.letters.B;
      new basic.repeating.A;
      new basic.repeating.B;
    }

    return App;

  })();

  new basic.App;

}).call(this);
