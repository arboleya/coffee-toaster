UNDERSCORE = {}
JQUERY = {}
exports.insects = insects = {}

var pkg;
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

document.write('<scri'+'pt src="./toaster/src/insects/bee.js"></scr'+'ipt>')
