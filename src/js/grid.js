
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
      self.identifier = '#list-games';
      self.element = $(self.identifier);
      self.content = $('#list-games-content');
      self.count = 0;
      self.rows = 0;
      self.width = 0;
      self.page = 0;
      self.dataSource = {
        'count' : function() { return 0; },
        'titleForIndex': function(index) { return ''; },
        'didSelectItemForRow': function(index) {},
      };
      self.touchListener = new App.TouchListener(self.identifier, self);
      
      self.updateLayout();
      $(window).resize(function() {
        self.updateLayout();
      });
      
    },
    
    reloadData: function() {
      var self = this;
      
      self.count = 0;
      self.content.html("");
      for (var i=0; i<self.dataSource.count(); i++) {
        var title = self.dataSource.titleForIndex(i);
        self.add(i, title);
      }
    },
    
    updateLayout: function() {
      var self = this;
      
      var rows = Math.floor((self.content.height() + App.Grid.MARGIN) / (App.Grid.Cell.HEIGHT + App.Grid.MARGIN));
      var width =  Math.floor((self.element.width() + App.Grid.MARGIN) / (App.Grid.Cell.WIDTH + App.Grid.MARGIN));
      // Relayout if required.
      if ((rows != self.rows) || (width != self.width)) {
        self.rows = rows;
        self.width = width;
        self.page = 0;
        self.content.css('left', 0);
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
      
      self.content.append(game);
      self.count += 1;
      
    },
    
    next: function() {
      var self = this;
      var max = Math.floor(self.count / (self.rows * self.width));
      if (self.page < max) {        
        self.page += 1;
        self.content.animate({
          'left': -1 * (self.page * self.width * (App.Grid.Cell.WIDTH + App.Grid.MARGIN))
        }, 300, function() {
        });
      }
    },
    
    previous: function() {
      var self = this;
      if (self.page > 0) {
        self.page -= 1;
        self.content.animate({
          'left': -1 * (self.page * self.width * (App.Grid.Cell.WIDTH + App.Grid.MARGIN))
        }, 300, function() {
        });
      }
    },

    onTouchEvent: function(state, position) {
      var self = this;
      console.log(position);

      if (state === App.Control.Touch.START) {
      } else if (state === App.Control.Touch.MOVE) {
        self.content.offset({ left:position.x, top: 0});
      } else if (state === App.Control.Touch.END) {

      }

    },

  });

})(jQuery);
