(function($) {

  App.Console = function() {
    this.init();
  };
  
  App.Console.State = {
    VISIBLE: 0,
    HIDDEN:  1,
  };
  
  App.Console.Orientation = {
    PORTRAIT:  0,
    LANDSCAPE: 1,
  };

  jQuery.extend(
    App.Console.prototype, {
      
      init: function() {
        var self = this;
      
        self.element = $('#screen-console');
        self.state = App.Console.State.VISIBLE;

        // Update the initial orientation and watch for changes.        
        self.orientationChange(function(orientation) {
          console.log("Orientation changed: " + orientation);
        });

        // Configure the game button.
        self.games = new App.Controls.Button('#control-games', { 'touchUpInside': function() {
          self.toggle();
        }});
        $('#LCD').click(function() {
          self.toggle();        
        });
        
      },
      
      orientationChange: function(callback) {
        var self = this;
        
        // Determine the initial orientation.
        self.orientation = App.Console.Orientation.PORTRAIT;
        if ($(window).width() > 320) {
          self.orientation = App.Console.Orientation.LANDSCAPE;
        }
        
        // Orientation events (via window size).
        $(window).resize(function() {
          var width = $(window).width();
          var orientation = self.orientation;
          if (width > 320) {
            orientation = App.Console.Orientation.LANDSCAPE;
          } else {
            orientation = App.Console.Orientation.PORTRAIT;
          }
          
          // Only execute the callback if the orientation has actually changed.
          if (orientation != self.orientation) {
            self.orientation = orientation;
            callback(self.orientation);
          }
          
        });

      },
      
      hide: function() {
        var self = this;
        self.state = App.Console.State.HIDDEN;
        self.element.animate({
          top: '-520'
        }, 300, function() {
        });
      },
      
      show: function() {
        var self = this;
        self.state = App.Console.State.VISIBLE;
        self.element.animate({
          top: '0'
        }, 300, function() {
        });
      },
      
      toggle: function() {
        var self = this;
        switch (self.state) {
        case App.Console.State.VISIBLE:
          self.hide();
          break;
        case App.Console.State.HIDDEN:
          self.show();
          break;
        }
      },

  });

})(jQuery);
