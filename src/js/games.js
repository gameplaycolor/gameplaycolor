
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
      self.empty = $('#screen-empty');
      self.loading = $('#screen-loading');
      self.authorize = new App.Controls.Button('#screen-authorize', {
        'touchUp': function() {
          window.tracker.track('games/authorize');
          self.library.authorize();
        }
      });
      self.title = $('#title-bar-label');
      self.grid = new App.Grid(device);
      self.items = [];

      self.title.html('Games');

      self.library.onStateChange(function(state) {
        if (state === App.Library.State.LOADING) {
          self.empty.fadeOut();
          self.authorize.fadeOut();
          if (self.library.count() < 1) {
            self.loading.fadeIn();
          } 
        } else if (state === App.Library.State.UNAUTHORIZED) {
          window.tracker.track('games/unauthorized');
          self.empty.fadeOut();
          self.loading.fadeOut();
          self.authorize.fadeIn();
        } else if (state === App.Library.State.UPDATING) {
          window.tracker.track('games/update');
          self.empty.fadeOut();
          self.authorize.fadeOut();
          if (self.library.count() < 1) {
            self.loading.fadeIn();
          } 
        } else {
          self.loading.fadeOut();
          self.authorize.fadeOut();
          if (self.library.count() < 1) {
            self.empty.fadeIn();
          } else {
            self.empty.fadeOut();
          }
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

      window.tracker.track('load-rom');

      // Get the identifier of the ROM to load.
      var identifier = self.library.identifierForIndex(index);

      // Callback to say we're done.
      self.callback(identifier);
    },
    
    update: function() {
      var self = this;
      self.library.update();
    },

  });

})(jQuery);
