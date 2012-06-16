
var __t;

__t = function(ns) {
  var curr, index, part, parts, _i, _len;
  curr = null;
  parts = [].concat = ns.split(".");
  for (index = _i = 0, _len = parts.length; _i < _len; index = ++_i) {
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

var app = window.app = {};
var artists = window.artists = {};
var genres = window.genres = {};


(function() {

  __t('artists.triphop').Lovage = (function() {

    Lovage.name = 'Lovage';

    function Lovage() {
      console.log("\t\tArtist: Lovage created!");
    }

    return Lovage;

  })();

  __t('artists.triphop').MassiveAttack = (function() {

    MassiveAttack.name = 'MassiveAttack';

    function MassiveAttack() {
      console.log("\t\tArtist: MassiveAttack created!");
    }

    return MassiveAttack;

  })();

  __t('artists.triphop').Portishead = (function() {

    Portishead.name = 'Portishead';

    function Portishead() {
      console.log("\t\tArtist: Portishead created!");
    }

    return Portishead;

  })();

  __t('artists.progressive').KingCrimson = (function() {

    KingCrimson.name = 'KingCrimson';

    function KingCrimson() {
      console.log("\t\tArtist: KingCrimson created!");
    }

    return KingCrimson;

  })();

  __t('genres').TripHop = (function() {

    TripHop.name = 'TripHop';

    function TripHop() {
      console.log("\tGenre: TripHop created!");
      new artists.triphop.MassiveAttack;
      new artists.triphop.Portishead;
      new artists.triphop.Lovage;
    }

    return TripHop;

  })();

  __t('artists.progressive').TheMarsVolta = (function() {

    TheMarsVolta.name = 'TheMarsVolta';

    function TheMarsVolta() {
      console.log("\t\tArtist: TheMarsVolta created!");
    }

    return TheMarsVolta;

  })();

  __t('artists.progressive').Tool = (function() {

    Tool.name = 'Tool';

    function Tool() {
      console.log("\t\tArtist: Tool created!");
    }

    return Tool;

  })();

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

  __t('app').App = (function() {

    App.name = 'App';

    function App() {
      console.log("App created!");
      new genres.Progressive;
      new genres.TripHop;
    }

    return App;

  })();

  new app.App;

}).call(this);

