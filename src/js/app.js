
(function($) {

  App = {};
  App.Controller = {};

  App.Log = function(message) {
    $("#debug").html(message)
  };

  App.Controller = function () {
      this.init();
  };

  jQuery.extend(App.Controller.prototype, {

    init: function () {
      var self = this;
/*       $("#screen-console").show(); */

      self.control = new App.Controls.Pad('#control-dpad', {
        'touchDownLeft'  : function() { gb_KeyDown(Gameboy.Key.LEFT); },
        'touchUpLeft'    : function() { gb_KeyUp(Gameboy.Key.LEFT); },
        'touchDownRight' : function() { gb_KeyDown(Gameboy.Key.RIGHT); },
        'touchUpRight'   : function() { gb_KeyUp(Gameboy.Key.RIGHT); },
        'touchDownUp'    : function() { gb_KeyDown(Gameboy.Key.UP); },
        'touchUpUp'      : function() { gb_KeyUp(Gameboy.Key.UP); },
        'touchDownDown'  : function() { gb_KeyDown(Gameboy.Key.DOWN); },
        'touchUpDown'    : function() { gb_KeyUp(Gameboy.Key.DOWN); },
      });

      self.a = new App.Controls.Button('#control-a', { 'touchDown' : function() {
        gb_KeyDown(Gameboy.Key.A);
      }, 'touchUp': function() {
        gb_KeyUp(Gameboy.Key.A);
      }});

      self.b = new App.Controls.Button('#control-b', { 'touchDown' : function() {
        gb_KeyDown(Gameboy.Key.B);
      }, 'touchUp': function() {
        gb_KeyUp(Gameboy.Key.B);
      }});

      self.start = new App.Controls.Button('#control-start', { 'touchDown' : function() {
        gb_KeyDown(Gameboy.Key.START);
      }, 'touchUp': function() {
        gb_KeyUp(Gameboy.Key.START);
      }});

      self.select = new App.Controls.Button('#control-select', { 'touchDown' : function() {
        gb_KeyDown(Gameboy.Key.SELECT);
      }, 'touchUp': function() {
        gb_KeyUp(Gameboy.Key.SELECT);
      }});
      
      self.list = new Array();
      
      self.console = new App.Console();

/*
      self.games = new App.Controls.Button('#control-games', { 'touchUpInside': function() {
        $('#screen-console').animate({
          top: '-520'
        }, 300, function() {
        });
        
        // Populate the file list.
        // TODO We should probably do some sort of 'sync' thing using local storage.
        retrieveAllFiles(function(result) {
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
        });
        
      }});
*/

/*       gb_Insert_Cartridge("kirby.gb", true); */

    }

  });

  // Create the application.
  $(document).ready(function() {
    window.app = new App.Controller();
  });

})(jQuery);
