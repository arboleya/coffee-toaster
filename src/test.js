(function() {
  var X, x;
  X = (function() {
    function X(name) {
      this.name = name;
      this.test();
    }
    X.prototype.test = function() {
      return console.log(this.name);
    };
    return X;
  })();
  x = new X("YEP");
}).call(this);
