var App;
App = (function() {
  function App() {
    console.log("App created!");
    new Red;
    new Black;
    new TopLevel;
    console.log(">>> namespaces are also welcome :)");
    new colors.Red;
    new colors.Black;
    new misc.Black;
  }
  return App;
})();
new App;