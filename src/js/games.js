
(function($) {

  App.Games = function(gameBoy, callback) {
    this.init(gameBoy, callback);
  };

  jQuery.extend(
    App.Games.prototype, {

    init: function(gameBoy, callback) {
      var self = this;
      self.gameBoy = gameBoy;
      self.callback = callback;
      self.element = $('#screen-games');
      self.empty = $('#screen-empty');
      self.title = $('#title-bar-label');
      self.grid = new App.Grid();
      self.items = [];
      self.library = new App.Library({
        'onUpdate': function() {
          self.grid.reloadData();
          self.empty.hide();
        },
        'onLoad': function(data) {
          self.onLoad(data);
        }
      });

      self.library.onStateChange(function(state) {
        if (state === App.Library.State.LOADING) {
          self.title.html('Loading...');
        } else if (state === App.Library.State.UNAUTHORIZED) {
          self.title.html('Unauthorized');
        } else if (state === App.Library.State.UPDATING) {
          self.title.html('Updating...');
        } else {
          self.title.html('Games');
        }
      });

      self.grid.dataSource = self.library;
      self.grid.reloadData();

    },

    onLoad: function(data) {
      var self = this;
      self.gameBoy.insertCartridge(data);
      self.callback();
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
