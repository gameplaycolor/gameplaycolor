
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
      
      self.grid.dataSource = {
        'count' : function() {
           return self.items.length;
         },
        'titleForIndex': function(index) {
          return self.items[index].title;
        },
        'didSelectItemForRow': function(index) {
          // TODO This needs to be more elegant.
          // Do we want a progress indicator for this?
          downloadFile(self.items[index], function(data) {
            gb_Insert_Cartridge_Data(data, true);
            gb_Run();
            // TODO This should be shown using the correct API.
            $('#screen-console').animate({
              top: '0'
            }, 300, function() {
            });
          });
        },
      };
      
    },
    
    update: function() {
      var self = this;
      self.empty.show();
      
      // Update the files.
      retrieveAllFiles(function(result) {
        self.items = new Array();
        self.empty.hide();
        for (var i=0; i<result.length; i++) {
          self.items.push(result[i]);
        }
        self.grid.reloadData();
      });
            
    },
/*
        var list = $('#list-games')
        
        var count = 0;
        var row = 0;
        var column = 0;
        
        var ROWS = 3;
        var WIDTH  = 120;
        var HEIGHT = 120;
        var MARGIN = 30;
        
        for (var i=0; i<result.length; i++) {

          row = count % ROWS;
          col = Math.floor(count / ROWS);
          
          var game = $('<div class="game">');
          game.html(result[i].title)
          game.css('top', (HEIGHT + MARGIN) * row);
          game.css('left', (WIDTH + MARGIN) * col);
          
          // Ugly way around capturing the callback parameter.
          // This might be more elegantly served if we had a javascript
          // element backing each list element.
          (function() {
            var m = result[i];
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
          list.append(game);

          count += 1;
        }
        
*/

  });

})(jQuery);
