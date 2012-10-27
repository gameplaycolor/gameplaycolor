
(function($) {

  App = {};

  App.Log = function(message) {
    $("#debug").html(message)
  };

  App.Controller = function () {
      this.init();
  };

  jQuery.extend(App.Controller.prototype, {

    init: function () {
      var self = this;
/*       $("#screen-console").show(); */

      self.games = new App.Games();
      self.console = new App.Console({
        'willHide': function() {
          gb_Pause();
          self.games.update();
        },
        'didShow': function() {
          gb_Run();
        }
      });

/*       gb_Insert_Cartridge("kirby.gb", true); */

    }

  });

  // Create the application.
  $(document).ready(function() {
    window.app = new App.Controller();
  });

})(jQuery);
