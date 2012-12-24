
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
      self.scrolling = false;
      
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
        self.setPage(self.page += 1);
      }
    },
    
    previous: function() {
      var self = this;
      if (self.page > 0) {
        self.setPage(self.page -= 1);
      }
    },

    setPage: function(page) {
      var self = this;
      self.page = page;
      self.content.animate({
        'left': -1 * (self.page * self.pageWidth())
      }, 300, function() {
      });
    },

    pageWidth: function() {
      var self = this;
      return self.width * (App.Grid.Cell.WIDTH + App.Grid.MARGIN)
    },

    onTouchEvent: function(state, position) {
      var self = this;

      // TODO Don't break on multiple touches.

      if (state === App.Control.Touch.START) {

        self.offset = self.content.offset();
        self.touchStart = position;
        self.scrolling = true;

      } else if (state === App.Control.Touch.MOVE) {
        if (self.scrolling) {

          // Updae the position.
          var left = position.x - self.touchStart.x
          self.content.offset({
            'left': self.offset.left + left,
            'top': self.offset.top
          });

        }
      } else if (state === App.Control.Touch.END) {
        if (self.scrolling) {

          // Update the position.
          var left = position.x - self.touchStart.x
          self.content.offset({
            'left': self.offset.left + left,
            'top': self.offset.top
          });

          // Snap to a page.
          var offset = self.content.offset().left - (self.pageWidth() / 2);
          var p = Math.floor(-1 * offset / self.pageWidth());
          self.setPage(p);
          console.log("Page: " + p);

          // Finish scrolling.
          self.scrolling = false;
        }
      }

    },

  });

})(jQuery);
