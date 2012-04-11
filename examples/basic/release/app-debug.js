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

document.write('<scri'+'pt src="./toaster/basic/letters/a.js"></scr'+'ipt>')
document.write('<scri'+'pt src="./toaster/basic/letters/b.js"></scr'+'ipt>')
document.write('<scri'+'pt src="./toaster/basic/repeating/a.js"></scr'+'ipt>')
document.write('<scri'+'pt src="./toaster/basic/repeating/b.js"></scr'+'ipt>')
document.write('<scri'+'pt src="./toaster/basic/single/script.js"></scr'+'ipt>')
document.write('<scri'+'pt src="./toaster/basic/toplevel.js"></scr'+'ipt>')
document.write('<scri'+'pt src="./toaster/basic/app.js"></scr'+'ipt>')