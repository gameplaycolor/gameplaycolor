
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
      self.running = false;
      self.store = new App.Store();
      self.gameBoy = App.GameBoy.getInstance();

      self.games = new App.Games(function() {
        self.running == true;
        self.didLoad();
      });
      self.console = new App.Console({
        'willHide': function() {
          if (self.running == true) {
            self.gameBoy.pause();
          }
          self.games.update();
        },
        'didShow': function() {
          if (self.running == true) {
            self.gameBoy.run();
          }
        }
      }, self.store);
      
      self.checkForUpdate();
      


    },
    
    didLoad: function() {
      var self = this;
      self.console.toggle();
    },
    
    checkForUpdate: function() {
      var self = this;
      if (window.applicationCache != undefined && window.applicationCache != null) {
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
    },

  });

  // Create the application.
  $(document).ready(function() {
    window.app = new App.Controller();
  });

})(jQuery);
