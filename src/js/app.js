
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

      self.games = new App.Games(function() {
        self.running == true;
        self.didLoad();
      });
      self.console = new App.Console({
        'willHide': function() {
          if (self.running == true) {
            gb_Pause();
          }
          self.games.update();
        },
        'didShow': function() {
          if (self.running == true) {
            gb_Run();
          }
        }
      });
      
      self.checkForUpdate();
      
      // Load the Google SDK
      if (navigator.onLine) {
        (function(d){
           var js, id = 'google-sdk', ref = d.getElementsByTagName('script')[0];
           if (d.getElementById(id)) {return;}
           js = d.createElement('script'); js.id = id; js.async = true;
           js.src = "https://apis.google.com/js/client.js?onload=handleClientLoad";
           ref.parentNode.insertBefore(js, ref);
         }(document));
      }

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
