// UNDERSCORE
// JQUERY
(function() {
  var Bee, insects;
  insects = {};
  void 0;
  pkg('insects').Bee = Bee = (function() {
    function Bee() {
      console.log("Bee created!");
    }
    return Bee;
  })();
}).call(this);

(function() {
  var Horse, animals;
  animals = {};
  void 0;
  pkg('animals').Horse = Horse = (function() {
    function Horse() {
      console.log("Horse created!");
    }
    return Horse;
  })();
}).call(this);
