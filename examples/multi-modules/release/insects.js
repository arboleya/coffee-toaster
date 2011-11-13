UNDERSCORE = {}
JQUERY = {}
(function() {
  var Bee, insects, pkg;
  exports.insects = insects = {};
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
          curr = curr[part] = exports[part] = {};
        } else {
          curr = curr[part];
        }
      }
    }
    return curr;
  };
  pkg('insects').Bee = exports.Bee = Bee = (function() {
    function Bee() {
      console.log("Bee created!");
    }
    return Bee;
  })();
}).call(this);
