
(function($) {

  App.Grid = function () {
    this.init();
  };
  
  App.Grid.ROWS = 3;
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
    },
    
    reloadData: function() {
      var self = this;
      self.element.html("");
      for (var i=0; i<self.dataSource.count(); i++) {
        var title = self.dataSource.titleForIndex(i);
        self.add(i, title);
      }
    },
    
    add: function(index, title) {
      var self = this;
      
      var row = self.count % App.Grid.ROWS;
      var col = Math.floor(self.count / App.Grid.ROWS);
      
      var game = $('<div class="game">');
      game.html(title)
      game.css('top', (App.Grid.Cell.HEIGHT + App.Grid.MARGIN) * row);
      game.css('left', (App.Grid.Cell.WIDTH + App.Grid.MARGIN) * col);
      
      game.click(function() {
        self.dataSource.didSelectItemForRow(index);
      });
      
      // Ugly way around capturing the callback parameter.
      // This might be more elegantly served if we had a javascript
      // element backing each list element.
      // TODO Is this now overkill?
/*
      (function() {
        var m = item;
        game.click(function() {
          downloadFile(m, function(data) {
            gb_Insert_Cartridge_Data(data, true);
            gb_Run();
            $('#screen-console').animate({
              top: '0'
            }, 300, function() {
            });
          });
        });
      })();
*/
      self.element.append(game);
      
      self.count += 1;
      
    },

  });

})(jQuery);
