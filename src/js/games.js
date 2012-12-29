
(function($) {

  App.Games = function(gameBoy, library, callback) {
    this.init(gameBoy, library, callback);
  };

  jQuery.extend(
    App.Games.prototype, {

    init: function(gameBoy, library, callback) {
      var self = this;
      self.gameBoy = gameBoy;
      self.library = library;
      self.callback = callback;
      self.element = $('#screen-games');
      self.empty = $('#screen-empty');
      self.title = $('#title-bar-label');
      self.grid = new App.Grid();
      self.items = [];

      self.library.onStateChange(function(state) {
        if (state === App.Library.State.LOADING) {
          self.title.html('Loading...');
        } else if (state === App.Library.State.UNAUTHORIZED) {
          self.title.html('Unauthorized');
        } else if (state === App.Library.State.UPDATING) {
          self.title.html('Updating...');
        } else {
          self.title.html('Games');
          self.grid.reloadData();
        }
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
      // TODO Refactor the way this is set.
      self.callback(identifier);
    },
    
    update: function() {
      var self = this;

      // TODO Show the empty screen more sensibly
      // and also support a loading screen.
      // self.empty.show();
      
      // Update the library.
      self.library.update();
                  
    },

  });

})(jQuery);
