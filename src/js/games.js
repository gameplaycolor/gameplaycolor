
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
      self.grid = new App.Grid();
      self.items = new Array();
      self.library = new App.Library({
        'onUpdate': function() {
          self.grid.reloadData();
          self.empty.hide();
        },
        'onLoad': function(data) {
          gb_Insert_Cartridge_Data(data, true);
          self.callback();
        },
      });
      self.grid.dataSource = self.library;
      
      // Next.
      self.next = new App.Controls.Button('#control-next', {
        'touchUp': function() {
          self.grid.next();
        }
      });
      
      // Previous.
      self.previous = new App.Controls.Button('#control-previous', {
        'touchUp': function() {
          self.grid.previous();
        }
      });
      
    },
    
    update: function() {
      var self = this;
      
      // Update the library.
      self.empty.show();
      self.library.update();
                  
    },

  });

})(jQuery);
