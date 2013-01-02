
(function($) {

  App.Games = function(device, gameBoy, library, callback) {
    this.init(device, gameBoy, library, callback);
  };

  jQuery.extend(
    App.Games.prototype, {

    init: function(device, gameBoy, library, callback) {
      var self = this;
      self.device = device;
      self.gameBoy = gameBoy;
      self.library = library;
      self.callback = callback;
      self.element = $('#screen-games');
      self.authorize = new App.Controls.Button('#screen-authorize', {
        'touchUp': function() {
          self.library.authorize();
        }
      });
      self.title = $('#title-bar-label');
      self.grid = new App.Grid(device);
      self.items = [];

      self.title.html('Games');

      self.library.onStateChange(function(state) {
        if (state === App.Library.State.LOADING) {
          self.authorize.fadeOut();
        } else if (state === App.Library.State.UNAUTHORIZED) {
          self.authorize.fadeIn();
        } else if (state === App.Library.State.UPDATING) {
          self.authorize.fadeOut();
          // TODO Show some text on the screen if it's empty.
        } else {
          self.authorize.fadeOut();
          // TODO Is this the correct place to do this now?
          self.grid.reloadData();
        }
      });

      self.library.onChange(function() {
        self.grid.reloadData();
      });

      self.grid.dataSource = self.library;
      self.grid.delegate = self;
      self.grid.reloadData();

    },

    didSelectItemForRow: function(index) {
      var self = this;

      // Get the identifier of the ROM to load.
      var identifier = self.library.identifierForIndex(index);

      // Callback to say we're done.
      self.callback(identifier);
    },
    
    update: function() {
      var self = this;

      // TODO Show the empty screen more sensibly
      // and also support a loading screen.
      
      // Update the library.
      self.library.update();
                  
    },

  });

})(jQuery);
