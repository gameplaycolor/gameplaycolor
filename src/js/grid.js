
(function($) {

  App.Grid = function () {
    this.init();
  };
  
  App.Grid.MARGIN = 30;
  
  App.Grid.Cell = {
    WIDTH:  120,
    HEIGHT: 120,
  };

  jQuery.extend(App.Grid.prototype, {

    init: function () {
      var self = this;
      self.element = $('#list-games');
      self.count = 0;
      self.rows = 0;
      self.dataSource = {
        'count' : function() { return 0; },
        'titleForIndex': function(index) { return ''; },
        'didSelectItemForRow': function(index) {},
      };
      
      self.updateLayout();
      $(window).resize(function() {
        self.updateLayout();
      });
      
    },
    
    reloadData: function() {
      var self = this;
      
      self.count = 0;
      self.element.html("");
      for (var i=0; i<self.dataSource.count(); i++) {
        var title = self.dataSource.titleForIndex(i);
        self.add(i, title);
      }
    },
    
    updateLayout: function() {
      var self = this;
      
      var rows = Math.floor(self.element.height() / (App.Grid.Cell.HEIGHT + App.Grid.MARGIN));
      // Relayout if required.
      if (rows != self.rows) {
        self.rows = rows;
        self.reloadData();
      }
      
    },
    
    add: function(index, title) {
      var self = this;
      
      var row = self.count % self.rows;
      var col = Math.floor(self.count / self.rows);
      
      var game = $('<div class="game">');
      game.html(title)
      game.css('top', (App.Grid.Cell.HEIGHT + App.Grid.MARGIN) * row);
      game.css('left', (App.Grid.Cell.WIDTH + App.Grid.MARGIN) * col);
      game.css('height', App.Grid.Cell.HEIGHT);
      game.css('width', App.Grid.Cell.WIDTH);
      
      game.click(function() {
        self.dataSource.didSelectItemForRow(index);
      });
      
      self.element.append(game);
      self.count += 1;
      
    },

  });

})(jQuery);
