var App;
App = (function() {
  function App() {
    console.log("App created!");
    new Red;
    new Black;
    new TopLevel;
    console.log("--------------------------------------------------------------------\n:: namespaces are also welcome :)\n\t and helps you differ between two classes with the same name.\n\t in the lines bellow, two classes named 'Black' are instantiated\n\t independently, through namespaces usage.\n--------------------------------------------------------------------");
    new colors.Red;
    new colors.Black;
    new misc.Black;
  }
  return App;
})();
new App;