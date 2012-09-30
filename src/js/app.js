
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
        App.Log("Button A")
      });

      self.b = new App.Controls.Button('#control-b', function() {
        App.Log("Button B");
      });

      self.start = new App.Controls.Button('#control-start', function() {
        App.Log("Start");
      });

      self.select = new App.Controls.Button('#control-select', function() {
        App.Log("Select");
      });

      self.games = new App.Controls.Button('#control-games', function() {
        self.gamesScreen.presentModal();
      });

    }

  });

  // Create the application.
  $(document).ready(function() {
    window.app = new App.Controller();
  });

})(jQuery);
