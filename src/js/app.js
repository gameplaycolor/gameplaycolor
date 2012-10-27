
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

      self.games = new App.Games(function() {
        self.didLoad();
      });
      self.console = new App.Console({
        'willHide': function() {
          gb_Pause();
          self.games.update();
        },
        'didShow': function() {
          gb_Run();
        }
      });

    },
    
    didLoad: function() {
      var self = this;
      self.console.toggle();
    },

  });

  // Create the application.
  $(document).ready(function() {
    window.app = new App.Controller();
  });

})(jQuery);
