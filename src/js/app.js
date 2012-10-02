
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
      self.gamesScreen = new App.Screens.Games('#screen-games', {
        'willShow': function() {
          console.log("willShow")
          gb_Pause();
        },
        'didHide': function() {
          console.log("willHide");
          gb_Run();
        }
      });

      self.a = new App.Controls.Button('#control-a', { 'touchDown' : function() {
        gb_KeyDown(Gameboy.Key.A);
      }, 'touchUp': function() {
        gb_KeyUp(Gameboy.Key.A);
      }});

      self.b = new App.Controls.Button('#control-b', { 'touchDown' : function() {
        gb_KeyDown(Gameboy.Key.B);
      }, 'touchUp': function() {
        gb_KeyUp(Gameboy.Key.B);
      }});

      self.start = new App.Controls.Button('#control-start', { 'touchDown' : function() {
        gb_KeyDown(Gameboy.Key.START);
      }, 'touchUp': function() {
        gb_KeyUp(Gameboy.Key.START);
      }});

      self.select = new App.Controls.Button('#control-select', { 'touchDown' : function() {
        gb_KeyDown(Gameboy.Key.SELECT);
      }, 'touchUp': function() {
        gb_KeyUp(Gameboy.Key.SELECT);
      }});

      self.games = new App.Controls.Button('#control-games', { 'touchUpInside': function() {
        self.gamesScreen.presentModal();
      }});

      gb_Insert_Cartridge("kirby.gb", true);

    }

  });

  // Create the application.
  $(document).ready(function() {
    window.app = new App.Controller();
  });

})(jQuery);
