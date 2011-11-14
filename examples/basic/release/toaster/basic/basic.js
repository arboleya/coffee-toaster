// UNDERSCORE
// JQUERY
letters = {}
repeating = {}
single = {}

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
        curr = curr[part] = {};
      } else {
        curr = curr[part];
      }
    }
  }
  return curr;
};

document.write('<scri'+'pt src="./toaster/basic/src/letters/a.js"></scr'+'ipt>')
document.write('<scri'+'pt src="./toaster/basic/src/letters/b.js"></scr'+'ipt>')
document.write('<scri'+'pt src="./toaster/basic/src/repeating/a.js"></scr'+'ipt>')
document.write('<scri'+'pt src="./toaster/basic/src/repeating/b.js"></scr'+'ipt>')
document.write('<scri'+'pt src="./toaster/basic/src/single/script.js"></scr'+'ipt>')
document.write('<scri'+'pt src="./toaster/basic/src/toplevel.js"></scr'+'ipt>')
document.write('<scri'+'pt src="./toaster/basic/src/app.js"></scr'+'ipt>')
