
(function($) {

  App.Games = function() {
    this.init();
  };

  jQuery.extend(
    App.Games.prototype, {

    init: function() {
      var self = this;
      self.element = $('#screen-games');
      self.empty = $('#screen-empty');
      self.grid = new App.Grid();
      self.items = new Array();
      self.library = new App.Library();
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
      self.library.update(function() {
        self.grid.reloadData();
        self.empty.hide();
      });
                  
    },

  });

})(jQuery);
