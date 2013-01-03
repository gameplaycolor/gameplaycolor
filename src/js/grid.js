
(function($) {

  App.Grid = function(device) {
    this.init(device);
  };
  
  App.Grid.Cell = {
    WIDTH:  140,
    HEIGHT: 140,
    MARGIN: 10
  };

  App.Grid.MOVE_THRESHOLD = 10;
  App.Grid.SCROLL_BIAS = 40;

  App.Grid.Margin = {
    Portrait: {
      TOP: 20,
      LEFT: 15,
      RIGHT: 15
    },
    Landscape: {
      TOP: 40,
      LEFT: 64,
      RIGHT: 64
    }
  };

  jQuery.extend(App.Grid.prototype, {

    init: function(device) {
      var self = this;
      self.device = device;
      self.identifier = '#list-games';
      self.element = $(self.identifier);
      self.content = $('#list-games-content');

      self.pageControl = $('#list-games-page-control');
      self.pageItems = [];

      self.count = 0;
      self.rows = 0;
      self.width = 0;
      self.pageWidth = 0;
      self.page = 0;

      self.dataSource = {
        'count' : function() { return 0; },
        'titleForIndex': function(index) { return ''; }
      };

      self.delegate = {
        'didSelectItemForRow': function(index) {}
      };

      self.touchListener = new App.TouchListener(self.identifier, self);
      self.touchStart = { x: 0, y: 0};
      self.touchStartTimestamp = 0;
      self.touchDidMove = false;
      self.touchCount = 0;

      self.gestureRecognizer = new App.GestureRecognizer();
      self.touchListener.addRecognizer(self.gestureRecognizer);
      
      self.updateLayout();
      $(window).resize(function() {
        self.updateLayout();
      });
      
    },

    // Return the margin for the current orientation.
    margin: function() {
      var self = this;
      if (self.device.orientation === App.Device.Orientation.PORTRAIT) {
        return App.Grid.Margin.Portrait;
      } else {
        return App.Grid.Margin.Landscape;
      }
    },
    
    reloadData: function() {
      var self = this;
      
      self.count = 0;
      self.content.html("");
      for (var i=0; i<self.dataSource.count(); i++) {
        var title = self.dataSource.titleForIndex(i);
        var thumbnail = self.dataSource.thumbnailForIndex(i);
        var offline = self.dataSource.availableOffline(i);
        self.add(i, title, thumbnail, offline);
      }

      self.updatePageControl();
      self.updatePageItems();
    },
    
    updateLayout: function() {
      var self = this;

      var cellHeight = App.Grid.Cell.HEIGHT + App.Grid.Cell.MARGIN;
      var cellWidth = App.Grid.Cell.WIDTH + App.Grid.Cell.MARGIN;

      var controlWidth = self.element.width() + App.Grid.Cell.MARGIN;
      var controlHeight = self.element.height() + App.Grid.Cell.MARGIN;
      
      var rows = Math.floor(controlHeight / cellHeight);
      var width =  Math.floor(controlWidth / cellWidth);
      // Relayout if required.
      if ((rows != self.rows) || (width != self.width)) {
        self.rows = rows;
        self.width = width;
        self.pageWidth = (self.width * (App.Grid.Cell.WIDTH + App.Grid.Cell.MARGIN)) + self.margin().LEFT + self.margin().RIGHT;
        self.page = 0;
        self.content.css('left', 0);
        self.reloadData();
      }
      
    },

    updatePageControl: function() {
      var self = this;
      
      self.pageControl.html("");
      self.pageItems = [];

      if (self.count === 0) {
        return;
      }

      for (var i=self.minPage(); i <= self.maxPage(); i++) {
        var item = $('<div class="page">');
        self.pageControl.append(item);
        self.pageItems.push(item);
      }
    },

    updatePageItems: function() {
      var self = this;

      if (self.count === 0) {
        return;
      }

      for (var i = 0; i < self.pageItems.length; i++) {
        var item = self.pageItems[i];
        if (i === self.page) {
          item.addClass("active");
        } else {
          item.removeClass("active");
        }
      }
    },
    
    add: function(index, title, thumbnail, offline) {
      var self = this;
      
      var row = self.count % self.rows;
      var col = Math.floor(self.count / self.rows);

      var itemsPerPage = self.width * self.rows;

      var page = Math.floor(self.count / itemsPerPage);
      
      var game = $('<div class="game">');
      game.css('top', self.margin().TOP + ((App.Grid.Cell.HEIGHT + App.Grid.Cell.MARGIN) * row));
      game.css('left', self.margin().LEFT + ((self.margin().LEFT + self.margin().RIGHT) * page) + ((App.Grid.Cell.WIDTH + App.Grid.Cell.MARGIN) * col));
      game.css('height', App.Grid.Cell.HEIGHT);
      game.css('width', App.Grid.Cell.WIDTH);

      var gameTitle = $('<div class="game-title">');
      gameTitle.html(title);
      game.append(gameTitle);

      if (thumbnail !== undefined) {
        var img = $('<img class="game-thumbnail">');
        img.attr("src", thumbnail);
        game.append(img);
      }

      // Grey out ROMs which are only available online.
      if (window.navigator.onLine === false && offline === false) {
        game.css("opacity", "0.5");
      }
      
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
      var x = Math.floor(contentPosition.x / (App.Grid.Cell.WIDTH + App.Grid.Cell.MARGIN));
      var y = Math.floor((contentPosition.y - self.margin().TOP) / (App.Grid.Cell.HEIGHT + App.Grid.Cell.MARGIN));

      var index = (x * self.rows) + y;
      if (index < self.count) {
        self.delegate.didSelectItemForRow(index);
      }

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
    
    // Animate transition to a given page.
    animate: function(page) {
      var self = this;
      self.content.animate({
        'left': -1 * (page * self.pageWidth)
      }, 300, function() {
        self.updatePageItems();
      });
    },

    setPage: function(page) {
      var self = this;
      if (self.page !== page) {
        self.page = page;
        self.animate(self.page);
      }
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

    updateContentPosition: function(position) {
      var self = this;

      var distance = position.x - self.touchStart.x;

      // Scale the offset if necessary.
      var left = distance;
      if (self.page == self.minPage() &&
          left > 0) {
        left = distance / 2;
      } else if (self.page == self.maxPage() &&
                 left < 0) {
        left = distance / 2;
      }

      // Update the position.
      self.content.offset({
        'left': self.offset.left + left,
        'top': self.offset.top
      });

    },

    onTouchEvent: function(state, position, timestamp) {
      var self = this;

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
            self.updateContentPosition(position);
          }

        }
      } else if (state === App.Control.Touch.END) {
        if (self.touchCount > 0) {

          // Update the move status.
          self.touchDidMove = self.touchDidMove | self.touchIsMove(position);

          if (self.touchDidMove) {
            // Update the position.
            self.updateContentPosition(position);

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

            // If the user has not made a large enough movement to change the page,
            // check to see if we've matched a swipe gesture before giving up and
            // resetting back to the current the page.
            if (page === self.page) {
              if (self.gestureRecognizer.state === App.GestureRecognizer.State.RECOGNIZED) {
                if (self.gestureRecognizer.direction === App.GestureRecognizer.Direction.RIGHT) {
                  page = page - 1;
                } else if (self.gestureRecognizer.direction === App.GestureRecognizer.Direction.LEFT) {
                  page = page + 1;
                }
              }
            }

            // Animate back to the current page or move to the new page.
            if (page === self.page ||
                page < self.minPage() ||
                page > self.maxPage()) {
              self.animate(self.page);
            } else {
              self.setPage(page);
            }

            // Reset the gesture recognizer.
            self.gestureRecognizer.reset();

          } else {

            self.item = self.itemForPosition(position);

          }

          self.touchCount = 0;
        }
      }

    },

  });

})(jQuery);
