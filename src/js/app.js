
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
