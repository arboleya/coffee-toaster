
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

var app = {};
var artists = {};
var genres = {};

document.write('<scri'+'pt src="js/toaster/artists/triphop/lovage.js"></scr'+'ipt>')
document.write('<scri'+'pt src="js/toaster/artists/triphop/massiveattack.js"></scr'+'ipt>')
document.write('<scri'+'pt src="js/toaster/artists/triphop/portishead.js"></scr'+'ipt>')
document.write('<scri'+'pt src="js/toaster/artists/progressive/kingcrimson.js"></scr'+'ipt>')
document.write('<scri'+'pt src="js/toaster/genres/triphop.js"></scr'+'ipt>')
document.write('<scri'+'pt src="js/toaster/artists/progressive/themarsvolta.js"></scr'+'ipt>')
document.write('<scri'+'pt src="js/toaster/artists/progressive/tool.js"></scr'+'ipt>')
document.write('<scri'+'pt src="js/toaster/genres/progressive.js"></scr'+'ipt>')
document.write('<scri'+'pt src="js/toaster/app/app.js"></scr'+'ipt>')