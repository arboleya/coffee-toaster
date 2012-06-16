(function() {

  __t('genres').Progressive = (function() {

    Progressive.name = 'Progressive';

    function Progressive() {
      console.log("\tGenre: Progressive created!");
      new artists.progressive.KingCrimson;
      new artists.progressive.TheMarsVolta;
      new artists.progressive.Tool;
    }

    return Progressive;

  })();

}).call(this);
