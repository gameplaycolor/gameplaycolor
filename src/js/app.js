
(function($) {

  App = {};
  App.Controller = {};

  App.Log = function(message) {
    $("#debug").html(message)
  };

  App.Controller = function () {
      this.init();
  };

  jQuery.extend(App.Controller.prototype, {

    init: function () {
      var self = this;
      $("#screen-console").show();

      self.control = new App.Control('#control-dpad');
      self.gamesScreen = new App.Screens.Games('#screen-games');

      self.a = new App.Controls.Button('#control-a', function() {
        // gb_OnKeyDown_Event(Gameboy.Key.B);
        // gb_OnKeyUp_Event(Gameboy.Key.B);
        gb_Run();
      });

      self.b = new App.Controls.Button('#control-b', function() {
        gb_OnKeyDown_Event(Gameboy.Key.B);
        gb_OnKeyUp_Event(Gameboy.Key.B);
      });

      self.start = new App.Controls.Button('#control-start', function() {
        gb_OnKeyDown_Event(Gameboy.Key.START);
        gb_OnKeyUp_Event(Gameboy.Key.START);
      });

      self.select = new App.Controls.Button('#control-select', function() {
        gb_OnKeyDown_Event(Gameboy.Key.SELECT);
        gb_OnKeyUp_Event(Gameboy.Key.SELECT);
      });

      self.games = new App.Controls.Button('#control-games', function() {
        gb_Pause();
        self.gamesScreen.presentModal();
      });

      gb_Insert_Cartridge("kirby.gb", true);

    }

  });

  // Create the application.
  $(document).ready(function() {
    window.app = new App.Controller();
  });

})(jQuery);
