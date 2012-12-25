
(function($) {

  App.Grid = function () {
    this.init();
  };
  
  App.Grid.MARGIN = 30;
  
  App.Grid.Cell = {
    WIDTH:  120,
    HEIGHT: 120,
  };

  App.Grid.MOVE_THRESHOLD = 10;
  App.Grid.SCROLL_BIAS = 40;

  jQuery.extend(App.Grid.prototype, {

    init: function () {
      var self = this;
      self.identifier = '#list-games';
      self.element = $(self.identifier);
      self.content = $('#list-games-content');
      self.count = 0;
      self.rows = 0;
      self.width = 0;
      self.pageWidth = 0;
      self.page = 0;
      self.dataSource = {
        'count' : function() { return 0; },
        'titleForIndex': function(index) { return ''; },
        'didSelectItemForRow': function(index) {},
      };
      self.touchListener = new App.TouchListener(self.identifier, self);
      self.touchStart = { x: 0, y: 0};
      self.touchDidMove = false;
      self.touchCount = 0;
      
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
        self.pageWidth = self.width * (App.Grid.Cell.WIDTH + App.Grid.MARGIN);
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
      
      self.content.append(game);
      self.count += 1;
      
    },

    // Convert a position in container coordinates to content coordinates.
    contentPosition: function(position) {
      var self = this;
      var contentPosition = {
        x: position.x + (self.pageWidth * self.page),
        y: position.y
      };
      return contentPosition;
    },

    // Determine with which item a touch position intersects.
    // undefined if the touch does not intersect an item.
    itemForPosition: function(position) {
      var self = this;

      // Work out which item it is.
      var contentPosition = self.contentPosition(position);
      var x = Math.floor(contentPosition.x / (App.Grid.Cell.WIDTH + App.Grid.MARGIN));
      var y = Math.floor(contentPosition.y / (App.Grid.Cell.HEIGHT + App.Grid.MARGIN));

      // TODO Take into account the dead space of the margins.

      var index = (x * self.rows) + y;

      self.dataSource.didSelectItemForRow(index);

    },

    minPage: function() {
      var self = this;
      return 0;
    },

    maxPage: function() {
      var self = this;
      var max = Math.floor(self.count / (self.rows * self.width));
      return max;
    },
    
    next: function() {
      var self = this;
      if (self.page < self.maxPage()) {  
        self.setPage(self.page += 1);
      }
    },
    
    previous: function() {
      var self = this;
      if (self.page > self.minPage()) {
        self.setPage(self.page -= 1);
      }
    },

    // Animate transition to a given page.
    animate: function(page) {
      var self = this;
      self.content.animate({
        'left': -1 * (page * self.pageWidth)
      }, 300, function() {
      });
    },

    setPage: function(page) {
      var self = this;
      self.page = page;
      self.animate(self.page);
    },

    // Returns the distance between two points.
    distance: function(a, b) {
      var self = this;
      var x = a.x - b.x;
      var y = a.y - b.y;
      return Math.sqrt(x*x + y*y);
    },

    // Returns the horizontal distance between two points.
    distanceX: function(a, b) {
      var self = this;
      return b.x - a.x;
    },

    // Returns the vertical distance between two points.
    distanceY: function(a, b) {
      var self = this;
      return b.y - a.y;
    },

    // Returns true if the touch event represents a move from the
    // original touchStart position.
    touchIsMove: function(position) {
      var self = this;
      var distance = Math.abs(self.distanceX(self.touchStart, position));
      return (distance >= App.Grid.MOVE_THRESHOLD);
    },

    onTouchEvent: function(state, position) {
      var self = this;

      // TODO Don't break on multiple touches.

      if (state === App.Control.Touch.START) {

        self.offset = self.content.offset();
        self.touchStart = position;
        self.touchDidMove = false;
        self.touchCount = 1;

      } else if (state === App.Control.Touch.MOVE) {
        if (self.touchCount > 0) {

          // Update the move status.
          self.touchDidMove = self.touchDidMove | self.touchIsMove(position);
          if (self.touchDidMove) {

            // Update the position.
            var left = position.x - self.touchStart.x
            self.content.offset({
              'left': self.offset.left + left,
              'top': self.offset.top
            });

          }

        }
      } else if (state === App.Control.Touch.END) {
        if (self.touchCount > 0) {

          // Update the move status.
          self.touchDidMove = self.touchDidMove | self.touchIsMove(position);

          // Update the position.
          var left = position.x - self.touchStart.x
          self.content.offset({
            'left': self.offset.left + left,
            'top': self.offset.top
          });

          if (self.touchDidMove) {

            // Work out if we are moving forwards or backwards.
            var page = self.page;
            var distance = self.distanceX(self.touchStart, position);
            if (Math.abs(distance) > ((self.pageWidth / 2) - App.Grid.SCROLL_BIAS)) {
              if (distance > 0) {
                page = page - 1;
              } else {
                page = page + 1;
              }
            }

            if (page == self.page ||
                page < self.minPage() ||
                page > self.maxPage()) {
              self.animate(self.page);
            } else {
              self.setPage(page);
            }

            // TODO Support 'flick' gestures.

          } else {

            self.item = self.itemForPosition(position);

          }

          self.touchCount = 0;
        }
      }

    },

  });

})(jQuery);
