/*
 * Copyright (C) 2012-2013 InSeven Limited.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

(function($) {

  App.Console = function(device, gameBoy, events, store) {
    this.init(device, gameBoy, events, store);
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
    HIDE_TOP_LANDSCAPE: -256,
    
    DEVICE_WIDTH: 320,

    TITLEBAR_HEIGHT: 42
    
  };

  jQuery.extend(
    App.Console.prototype, {
      
      init: function(device, gameBoy, events, store) {
        var self = this;
        
        self.device = device;
        self.gameBoy = gameBoy;
        self.events = events;
        self.store = store;
        self.state = App.Console.State.VISIBLE;
        self.element = $('#screen-console');
        self.titleBar = $('#title-bar');
        self.displayIdle = $('#LCD-idle');
        self.displayLoading = $('#LCD-loading');

        window.tracker.track('console');

        // Update the initial orientation and watch for changes.
        self.updateLayout();
        self.device.onOrientationChange(function(orientation) {
          self.updateLayout();
        });

        self.gameBoy.onStateChange(function(state) {
          if (state === App.GameBoy.State.IDLE) {
            self.displayIdle.show();
            self.displayLoading.hide();
          } else if (state === App.GameBoy.State.LOADING) {
            self.displayLoading.show();
            self.displayIdle.hide();
          } else if (state === App.GameBoy.State.RUNNING) {
            self.displayLoading.hide();
            self.displayIdle.hide();
          } else if (state === App.GameBoy.State.ERROR) {
          }
        });

        // D-Pad.
        self.pad = new App.Controls.Pad('#control-dpad', {
          'touchDownLeft'  : function() { self.gameBoy.keyDown(Gameboy.Key.LEFT); },
          'touchUpLeft'    : function() { self.gameBoy.keyUp(Gameboy.Key.LEFT); },
          'touchDownRight' : function() { self.gameBoy.keyDown(Gameboy.Key.RIGHT); },
          'touchUpRight'   : function() { self.gameBoy.keyUp(Gameboy.Key.RIGHT); },
          'touchDownUp'    : function() { self.gameBoy.keyDown(Gameboy.Key.UP); },
          'touchUpUp'      : function() { self.gameBoy.keyUp(Gameboy.Key.UP); },
          'touchDownDown'  : function() { self.gameBoy.keyDown(Gameboy.Key.DOWN); },
          'touchUpDown'    : function() { self.gameBoy.keyUp(Gameboy.Key.DOWN); }
        });
        
        // A.
        self.a = new App.Controls.Button('#control-a', { 'touchDown' : function() {
          self.gameBoy.keyDown(Gameboy.Key.A);
        }, 'touchUp': function() {
          self.gameBoy.keyUp(Gameboy.Key.A);
        }});

        // B.
        self.b = new App.Controls.Button('#control-b', { 'touchDown' : function() {
          self.gameBoy.keyDown(Gameboy.Key.B);
        }, 'touchUp': function() {
          self.gameBoy.keyUp(Gameboy.Key.B);
        }});

        // Start.
        self.start = new App.Controls.Button('#control-start', { 'touchDown' : function() {
          self.gameBoy.keyDown(Gameboy.Key.START);
        }, 'touchUp': function() {
          self.gameBoy.keyUp(Gameboy.Key.START);
        }});

        // Select.
        self.select = new App.Controls.Button('#control-select', { 'touchDown' : function() {
          self.gameBoy.keyDown(Gameboy.Key.SELECT);
        }, 'touchUp': function() {
          self.gameBoy.keyUp(Gameboy.Key.SELECT);
        }});

        // Tapping the screen shows the game picker.
        self.screen = new App.Controls.Button('#display', { 'touchUp': function() {
          window.tracker.track('games');
          self.hide();
        }});

        // Dismiss button.
        self.done = new App.Controls.Button('#button-done', { 'touchUp': function() {
          self.show();
        }});

        self.load();
        
      },
      
      scheduleSave: function() {
        var self = this;
        if (App.Controller.SAVE === true) {
          setTimeout(function() {
            console.log("Save");
            self.save();
            self.scheduleSave();
          }, 10000);
        }
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
              self.gameBoy.insertCartridge(data);
              setTimeout(function() {
                self.store.property(App.Store.Property.STATE, function(stateJSON) {
                  if (stateJSON !== undefined) {
                      var state = jQuery.parseJSON(stateJSON);
                      self.gameBoy.pause();
                      gbMemory = state.gbMemory;
                      gbFrameBuffer = state.gbFrameBuffer;
                      gbTileData = state.gbTileData;
                      gbBackgroundData = state.gbBackgroundData;
                      gb_Framebuffer_to_LCD();
                      self.gameBoy.run();
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
          var top = App.Console.Dimensions.HIDE_TOP_PORTRAIT;
          if (self.device.orientation == App.Console.Orientation.LANDSCAPE) {
            top = App.Console.Dimensions.TITLEBAR_HEIGHT - $(window).height();
          }

          
          self.state = App.Console.State.HIDDEN;
          self.element.animate({
            'top': top
          }, 300, function() {
            self.event('didHide');
          });
          self.titleBar.fadeIn();
          
        }
        
      },
      
      show: function() {
        var self = this;
        
        if (self.state != App.Console.State.VISIBLE) {

          window.tracker.track('console');
        
          self.event('willShow');
        
          self.state = App.Console.State.VISIBLE;
          self.element.animate({
            'top': App.Console.Dimensions.SHOW_TOP
          }, 300, function() {
            self.event('didShow');
          });
          self.titleBar.fadeOut();
        }
      },
      
      // Re-layout the console depending on its state.
      updateLayout: function() {
        var self = this;
        // The layout only needs to be adjusted if we're currently in
        // the hidden state.
        if (self.state == App.Console.State.HIDDEN) {
          if (self.device.orientation == App.Console.Orientation.PORTRAIT) {
            self.element.css('top', App.Console.Dimensions.HIDE_TOP_PORTRAIT);
          } else {
            self.element.css('top', App.Console.Dimensions.HIDE_TOP_LANDSCAPE);
          }
        }
      },

  });

})(jQuery);
