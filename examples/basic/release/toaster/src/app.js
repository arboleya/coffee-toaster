var App;
App = (function() {
  function App() {
    console.log("App created!");
    new Red;
    new Black;
    new TopLevel;
    console.log("--------------------------------------------------------------------\n:: Namespaces are also welcome :)\n\t ..and helps you to differ two classes with the same name.\n\t In the lines bellow, two classes named 'Black' are instantiated\n\t independently, through namespaces.\n\t Namespaces are automatically generated based on the folder the\n\t the file are, relative to the src folder.\n--------------------------------------------------------------------");
    new colors.Red;
    new colors.Black;
    new misc.Black;
  }
  return App;
})();
new App;