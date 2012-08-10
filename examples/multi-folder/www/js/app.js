var app = window.app = {};
var artists = window.artists = {'progressive':{},'triphop':{}};
var genres = window.genres = {};

(function() {

  artists.triphop.Lovage = (function() {

    function Lovage() {
      console.log("\t\tArtist: Lovage created!");
    }

    return Lovage;

  })();

  artists.triphop.MassiveAttack = (function() {

    function MassiveAttack() {
      console.log("\t\tArtist: MassiveAttack created!");
    }

    return MassiveAttack;

  })();

  artists.triphop.Portishead = (function() {

    function Portishead() {
      console.log("\t\tArtist: Portishead created!");
    }

    return Portishead;

  })();

  artists.progressive.KingCrimson = (function() {

    function KingCrimson() {
      console.log("\t\tArtist: KingCrimson created!");
    }

    return KingCrimson;

  })();

  genres.TripHop = (function() {

    function TripHop() {
      console.log("\tGenre: TripHop created!");
      new artists.triphop.MassiveAttack;
      new artists.triphop.Portishead;
      new artists.triphop.Lovage;
    }

    return TripHop;

  })();

  artists.progressive.TheMarsVolta = (function() {

    function TheMarsVolta() {
      console.log("\t\tArtist: TheMarsVolta created!");
    }

    return TheMarsVolta;

  })();

  artists.progressive.Tool = (function() {

    function Tool() {
      console.log("\t\tArtist: Tool created!");
    }

    return Tool;

  })();

  genres.Progressive = (function() {

    function Progressive() {
      console.log("\tGenre: Progressive created!");
      new artists.progressive.KingCrimson;
      new artists.progressive.TheMarsVolta;
      new artists.progressive.Tool;
    }

    return Progressive;

  })();

  app.App = (function() {

    function App() {
      console.log("App created!");
      new genres.Progressive;
      new genres.TripHop;
    }

    return App;

  })();

  new app.App;

}).call(this);
