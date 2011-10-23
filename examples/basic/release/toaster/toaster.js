var letters, pkg, repeating, single;
letters = {};
repeating = {};
single = {};
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
document.write('<scri' + 'pt src="./toaster/src/letters/a.js"></scr' + 'ipt>');
document.write('<scri' + 'pt src="./toaster/src/letters/b.js"></scr' + 'ipt>');
document.write('<scri' + 'pt src="./toaster/src/repeating/a.js"></scr' + 'ipt>');
document.write('<scri' + 'pt src="./toaster/src/repeating/b.js"></scr' + 'ipt>');
document.write('<scri' + 'pt src="./toaster/src/single/script.js"></scr' + 'ipt>');
document.write('<scri' + 'pt src="./toaster/src/toplevel.js"></scr' + 'ipt>');
document.write('<scri' + 'pt src="./toaster/src/app.js"></scr' + 'ipt>');