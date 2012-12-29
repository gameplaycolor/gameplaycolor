
(function($) {

  App.Games = function(callback) {
    this.init(callback);
  };

  jQuery.extend(
    App.Games.prototype, {

    init: function(callback) {
      var self = this;
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
          gb_Insert_Cartridge_Data(data, true);
          self.callback();
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
