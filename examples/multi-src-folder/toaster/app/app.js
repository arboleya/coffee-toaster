(function() {

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
