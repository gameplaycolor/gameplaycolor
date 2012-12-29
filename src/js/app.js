
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
      self.store = new App.Store();
      self.library = new App.Library();
      self.gameBoy = new App.GameBoy(self.store, self.library);

      // Prevent touchmove events.
      document.addEventListener('touchmove', function(e) {
        e.preventDefault();
      }, false);

      // TODO Don't show the console on anythign but an iPhone.
      $j(document).ready(function() {
        // Work out if we've been installed or not.
        // if (window.navigator.standalone) {
      /*     $j("#screen-console").show(); */
        // } else {
          // $("#screen-instructions").show();
        // }
      });


      self.games = new App.Games(self.gameBoy, self.library, function(identifier) {
        // TODO Is it better if we don't start loading the game until
        // after we've been shown?
        self.console.show();
        self.gameBoy.load(identifier);
      });

      self.console = new App.Console(self.gameBoy, {
        'willHide': function() {
          self.gameBoy.pause();
          self.games.update();
        },
        'didShow': function() {
          self.gameBoy.run();
        }
      }, self.store);
      
      self.checkForUpdate();

    },
        
    checkForUpdate: function() {
      var self = this;
      if (window.applicationCache !== undefined && window.applicationCache !== null) {
        window.applicationCache.addEventListener('updateready', function(event) {
          self.updateApplication(event);
        });
      }
    },

    updateApplication: function(event) {
      var self = this;
      if (window.applicationCache.status != 4) return;
        alert('Update Ready!');
        window.applicationCache.removeEventListener('updateready', self.updateApplication);
        window.applicationCache.swapCache();
        window.location.reload();
    }

  });

  // Create the application.
  $(document).ready(function() {
    window.app = new App.Controller();
  });

})(jQuery);
