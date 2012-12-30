
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
      
      self.games = new App.Games(self.gameBoy, self.library, function(identifier) {
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

    var device = new App.Device();

    // Work out if we've been installed or not.
    if (window.navigator.standalone &&
        device.type === App.Device.Type.IPHONE_5) {
      $("#gameboy").show();
      window.app = new App.Controller();
    } else {
      $("#instructions").show();
      if (device.type === App.Device.Type.IPHONE_5) {
        $("#instructions-iphone5").show();
      } else {
        $("#instructions-other").show();
      }
    }

  });

})(jQuery);
