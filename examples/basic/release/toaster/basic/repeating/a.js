(function() {

  __t('basic.repeating', window).A = (function() {

    A.name = 'A';

    function A() {
      console.log("repeating/A created!");
    }

    return A;

  })();

}).call(this);
