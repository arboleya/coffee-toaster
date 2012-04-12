(function() {

  __t('basic', window).App = (function() {

    App.name = 'App';

    function App() {
      console.log("App created!");
      new basic.TopLevel;
      console.log("--------------------------------------------------------------------\n:: Namespaces are also welcome :)\n\t ..and helps you to differ two classes with the same name.\n\t In the lines bellow, two classes named 'A' and 'B' are\n\t instantiated independently, through namespaces.\n\t Namespaces are automatically generated based on the folder the\n\t the files are, relative to the src folder.\n--------------------------------------------------------------------");
      new basic.letters.A;
      new basic.letters.B;
      new basic.repeating.A;
      new basic.repeating.B;
    }

    return App;

  })();

  new basic.App;

}).call(this);
