/*
 * Copyright (C) 2012-2016 InSeven Limited.
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

  App.Console.SHAKE_THRESHOLD = 24;
  App.Console.SHAKE_TIMEOUT_MS = 800;

  jQuery.extend(
    App.Console.prototype, {
      
      init: function(device, gameBoy, events, store) {
        var self = this;
        
        self.logging = new App.Logging(window.config.logging_level, "console");
        self.device = device;
        self.gameBoy = gameBoy;
        self.events = events;
        self.store = store;
        self.state = App.Console.State.HIDDEN;
        self.element = $('#screen-console');
        self.displayIdle = $('#LCD-idle');
        self.displayLoading = $('#LCD-loading');
        self.color = "grape";
        self.scrollBlocker = function(event) {
          event.preventDefault();
        };

        window.tracker.track('console');

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

        self.element.get(0).addEventListener('touchmove', function(e) {
          e.preventDefault();
        }, false);

        // D-Pad.
        self.pad = new App.Controls.Pad({
          touchDownLeft  : function() { self.gameBoy.keyDown(Gameboy.Key.LEFT); },
          touchUpLeft    : function() { self.gameBoy.keyUp(Gameboy.Key.LEFT); },
          touchDownRight : function() { self.gameBoy.keyDown(Gameboy.Key.RIGHT); },
          touchUpRight   : function() { self.gameBoy.keyUp(Gameboy.Key.RIGHT); },
          touchDownUp    : function() { self.gameBoy.keyDown(Gameboy.Key.UP); },
          touchUpUp      : function() { self.gameBoy.keyUp(Gameboy.Key.UP); },
          touchDownDown  : function() { self.gameBoy.keyDown(Gameboy.Key.DOWN); },
          touchUpDown    : function() { self.gameBoy.keyUp(Gameboy.Key.DOWN); }
        });

        self.navigationBarTimeout = undefined;
        self.navigation = $('#console-navigation-bar');
        self.screen = new App.Controls.Button($('#element-screen'), { touchUpInside: function() {

          if (self.navigationBarTimeout !== undefined) {

            clearTimeout(self.navigationBarTimeout);
            self.navigationBarTimeout = undefined;
            self.navigation.addClass('hidden');

          } else {

            self.navigation.removeClass('hidden');
            self.navigationBarTimeout = setTimeout(function() {
              self.navigation.addClass('hidden');
              self.navigationBarTimeout = undefined;
            }, 2000);

          }

        }});
        
        // A.
        self.a = new App.Controls.Button($('#control-a'), { touchDown : function() {
          self.gameBoy.keyDown(Gameboy.Key.A);
        }, touchUp: function() {
          self.gameBoy.keyUp(Gameboy.Key.A);
        }}, 65 /* A */);

        // B.
        self.b = new App.Controls.Button($('#control-b'), { touchDown : function() {
          self.gameBoy.keyDown(Gameboy.Key.B);
        }, touchUp: function() {
          self.gameBoy.keyUp(Gameboy.Key.B);
        }}, 83 /* S */);

        // Start.
        self.start = new App.Controls.Button($('#control-start'), { touchDown : function() {
          self.gameBoy.keyDown(Gameboy.Key.START);
        }, touchUp: function() {
          self.gameBoy.keyUp(Gameboy.Key.START);
        }}, 13 /* Return */);

        // Select.
        self.select = new App.Controls.Button($('#control-select'), { touchDown : function() {
          self.gameBoy.keyDown(Gameboy.Key.SELECT);
        }, touchUp: function() {
          self.gameBoy.keyUp(Gameboy.Key.SELECT);
        }}, 16 /* Left Shift */);

        self.back = new App.Controls.Button($('#button-library'), { touchUp: function() {
          self.logging.info("Show games");
          window.tracker.track('games');
          self.hide();
        }});

        self.restoreColor().always(function(color) {
          $('#screen-splash').css("display", "none");
        });

      },

      restoreColor: function() {
        var self = this;
        var deferred = new jQuery.Deferred();
        self.logging.info("Attempting to restore the previous color");
        self.store.property(App.Controller.Domain.SETTINGS, App.Store.Property.COLOR, function(color) {
          if (color === undefined) {
            self.logging.warning("No previous color to load");
            deferred.reject();
            return;
          }
          self.logging.info("Loaded previous color '" + color + "'");
          self.setColor(color);
          deferred.resolve(color);
        });
        return deferred.promise();
      },

      setColor: function(color) {
        var self = this;
        self.logging.info("Set color: " + color);
        if (color == self.color) {
          self.logging.info("Ignoring set to current color: " + color);
          return;
        }
        self.element.addClass(color);
        self.element.removeClass(self.color);
        self.color = color;
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

          if (self.navigationBarTimeout !== undefined) {
            clearTimeout(self.navigationBarTimeout);
            self.navigationBarTimeout = undefined;
          }

          self.event('willHide');
          self.state = App.Console.State.HIDDEN;
          setTimeout(function() {
            self.element.addClass("hidden");
            setTimeout(function() {
              document.getElementsByTagName('body')[0].style.overflow = ''; // Allow scrolling.
              self.event('didHide');
            }, 300);
          }, 10);

        }
      },
      
      show: function() {
        var self = this;
        if (self.state != App.Console.State.VISIBLE) {

          window.tracker.track('console');
          self.event('willShow');
          self.state = App.Console.State.VISIBLE;
          self.element.removeClass("hidden");
          setTimeout(function() {
            self.navigation.addClass('hidden');
            self.event('didShow');
          }, 400);
          window.addEventListener("scroll", this.scrollBlocker);

          document.getElementsByTagName('body')[0].style.overflow = 'hidden'; // Prevent scrolling.

        }
      },
      
  });

})(jQuery);
