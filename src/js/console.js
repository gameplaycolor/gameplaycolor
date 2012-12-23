(function($) {

  App.Console = function(events, store) {
    this.init(events, store);
  };
  
  App.Console.State = {
    VISIBLE: 0,
    HIDDEN:  1,
  };
  
  App.Console.Orientation = {
    PORTRAIT:  0,
    LANDSCAPE: 1,
  };
  
  App.Console.Dimensions = {
  
    SHOW_TOP:            0,
    HIDE_TOP_PORTRAIT:  -504,
    HIDE_TOP_LANDSCAPE: -280,
    
    DEVICE_WIDTH: 320,
    
  };

  jQuery.extend(
    App.Console.prototype, {
      
      init: function(events, store) {
        var self = this;
        
        self.events = events;
        self.store = store;
        self.element = $('#screen-console');
        self.state = App.Console.State.VISIBLE;

        // Update the initial orientation and watch for changes.        
        self.orientationChange(function(orientation) {
          self.updateLayout();
        });

        // D-Pad.        
        self.pad = new App.Controls.Pad('#control-dpad', {
          'touchDownLeft'  : function() { gb_KeyDown(Gameboy.Key.LEFT); },
          'touchUpLeft'    : function() { gb_KeyUp(Gameboy.Key.LEFT); },
          'touchDownRight' : function() { gb_KeyDown(Gameboy.Key.RIGHT); },
          'touchUpRight'   : function() { gb_KeyUp(Gameboy.Key.RIGHT); },
          'touchDownUp'    : function() { gb_KeyDown(Gameboy.Key.UP); },
          'touchUpUp'      : function() { gb_KeyUp(Gameboy.Key.UP); },
          'touchDownDown'  : function() { gb_KeyDown(Gameboy.Key.DOWN); },
          'touchUpDown'    : function() { gb_KeyUp(Gameboy.Key.DOWN); },
        });
        
        // A.
        self.a = new App.Controls.Button('#control-a', { 'touchDown' : function() {
          gb_KeyDown(Gameboy.Key.A);
        }, 'touchUp': function() {
          gb_KeyUp(Gameboy.Key.A);
        }});

        // B.
        self.b = new App.Controls.Button('#control-b', { 'touchDown' : function() {
          gb_KeyDown(Gameboy.Key.B);
        }, 'touchUp': function() {
          gb_KeyUp(Gameboy.Key.B);
        }});

        // Start.
        self.start = new App.Controls.Button('#control-start', { 'touchDown' : function() {
          gb_KeyDown(Gameboy.Key.START);
        }, 'touchUp': function() {
          gb_KeyUp(Gameboy.Key.START);
        }});

        // Select.
        self.select = new App.Controls.Button('#control-select', { 'touchDown' : function() {
          gb_KeyDown(Gameboy.Key.SELECT);
        }, 'touchUp': function() {
          gb_KeyUp(Gameboy.Key.SELECT);
        }});

        // Configure the actions for the game loading screen.
        $('#LCD').click(function() {
          self.hide();
        });

        // Dismiss button.
        self.done = new App.Controls.Button('#button-done', { 'touchUp': function() {
          self.show();
        }});
        
        self.saver = new Worker('js/saver.js');
        self.saver.onmessage = function(message) {
          console.log(message);
        };
        self.load();
        
      },
      
      scheduleSave: function() {
        var self = this;
        setTimeout(function() {
          console.log("Save");
          self.save();
          self.scheduleSave();
          // self.saver.postMessage([gbMemory, gbFrameBuffer, gbTileData, gbBackgroundData]);
        }, 10000);      
      },
      
      save: function() {
        var self = this;
        var state = JSON.stringify({
          gbMemory: gbMemory,
          gbFrameBuffer: gbFrameBuffer,
          gbTileData: gbTileData,
          gbBackgroundData: gbBackgroundData
        });
        self.store.setProperty(App.Store.Property.STATE, state);
      },
      
      load: function() {
        var self = this;
        
        self.store.property(App.Store.Property.GAME, function(filename) {
        
          if (filename !== undefined) {
            var data = localStorage.getItem(filename);
            if (data) {
              gb_Insert_Cartridge_Data(data, true);
              setTimeout(function() {
                self.store.property(App.Store.Property.STATE, function(stateJSON) {
                  if (stateJSON !== undefined) {
                      var state = jQuery.parseJSON(stateJSON);
                      gb_Pause();
                      gbMemory = state.gbMemory;
                      gbFrameBuffer = state.gbFrameBuffer;
                      gbTileData = state.gbTileData;
                      gbBackgroundData = state.gbBackgroundData;
                      gb_Framebuffer_to_LCD();
                      gb_Run();
                      self.scheduleSave();
                    }
                  });
                }, 5000);
              }
            } else {
              self.scheduleSave();
            } 
          });
        
      },
      
      orientationChange: function(callback) {
        var self = this;
        
        // Determine the initial orientation.
        self.orientation = App.Console.Orientation.PORTRAIT;
        if ($(window).width() > App.Console.Dimensions.DEVICE_WIDTH) {
          self.orientation = App.Console.Orientation.LANDSCAPE;
        }
        
        // Orientation events (via window size).
        $(window).resize(function() {
          var width = $(window).width();
          var orientation = self.orientation;
          if (width > App.Console.Dimensions.DEVICE_WIDTH) {
            orientation = App.Console.Orientation.LANDSCAPE;
          } else {
            orientation = App.Console.Orientation.PORTRAIT;
          }
          
          // Only execute the callback if the orientation has actually changed.
          if (orientation != self.orientation) {
            self.orientation = orientation;
            callback(self.orientation);
          }
          
        });

      },
      
      event: function(id) {
        var self = this;
        if (id in self.events) {
          self.events[id]();
        }
      },
      
      hide: function() {
        var self = this;
        
        if (self.state != App.Console.State.HIDDEN) {
        
          self.event('willHide');
        
          // Determine which offset to animate to.
          var top = App.Console.Dimensions.HIDE_TOP_PORTRAIT
          if (self.orientation == App.Console.Orientation.LANDSCAPE) {
            top = App.Console.Dimensions.HIDE_TOP_LANDSCAPE;
          }
          
          self.state = App.Console.State.HIDDEN;
          self.element.animate({
            'top': top
          }, 300, function() {
            self.event('didHide');
          });
          self.done.fadeIn();
          
        }
        
      },
      
      show: function() {
        var self = this;
        
        if (self.state != App.Console.State.VISIBLE) {
        
          self.event('willShow');
        
          self.state = App.Console.State.VISIBLE;
          self.element.animate({
            'top': App.Console.Dimensions.SHOW_TOP
          }, 300, function() {
            self.event('didShow');
          });
          self.done.fadeOut();
        }
      },
      
      // Re-layout the console depending on its state.
      updateLayout: function() {
        var self = this;
        // The layout only needs to be adjusted if we're currently in
        // the hidden state.
        if (self.state == App.Console.State.HIDDEN) {
          if (self.orientation == App.Console.Orientation.PORTRAIT) {
            self.element.css('top', App.Console.Dimensions.HIDE_TOP_PORTRAIT);
          } else {
            self.element.css('top', App.Console.Dimensions.HIDE_TOP_LANDSCAPE);        
          }
        }
      },

  });

})(jQuery);
