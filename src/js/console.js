/*
 * Copyright (c) 2012-2024 Jason Morley
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

KEYCODE_A = 65;
KEYCODE_S = 83;
KEYCODE_RETURN = 13;
KEYCODE_SHIFT_LEFT = 16;

(function($) {

  App.Console = function(device, gameBoy, store) {
    this.init(device, gameBoy, store);
  };

  App.Console.State = {
    VISIBLE: 0,
    HIDDEN:  1,
  };

  jQuery.extend(
    App.Console.prototype, {

      init: function(device, gameBoy, store) {
        var self = this;

        self.logging = new App.Logging(window.config.logging_level, "console");
        self.device = device;
        self.core = gameBoy;
        self.store = store;
        self.state = App.Console.State.HIDDEN;
        self.element = $('#screen-console');
        self.screen = $('#LCD');
        self.color = "grape";
        self.scrollBlocker = function(event) {
          event.preventDefault();
        };

        self.element.get(0).addEventListener('touchmove', function(e) {
          e.preventDefault();
        }, false);

        // Controls.

        self.pad = new App.Controls.Pad({
          touchDownLeft  : function() { self.core.keyDown(Gameboy.Key.LEFT); },
          touchUpLeft    : function() { self.core.keyUp(Gameboy.Key.LEFT); },
          touchDownRight : function() { self.core.keyDown(Gameboy.Key.RIGHT); },
          touchUpRight   : function() { self.core.keyUp(Gameboy.Key.RIGHT); },
          touchDownUp    : function() { self.core.keyDown(Gameboy.Key.UP); },
          touchUpUp      : function() { self.core.keyUp(Gameboy.Key.UP); },
          touchDownDown  : function() { self.core.keyDown(Gameboy.Key.DOWN); },
          touchUpDown    : function() { self.core.keyUp(Gameboy.Key.DOWN); }
        });
        self.pad.animate = false;

        self.button_a = self.configureButton($('#control-a'), Gameboy.Key.A, KEYCODE_A);
        self.button_b = self.configureButton($('#control-b'), Gameboy.Key.B, KEYCODE_S);
        self.button_start = self.configureButton($('#control-start'), Gameboy.Key.START, KEYCODE_RETURN);
        self.button_select = self.configureButton($('#control-select'), Gameboy.Key.SELECT, KEYCODE_SHIFT_LEFT);

        // Navigation.

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

        self.navigation_back = new App.Controls.Button($('#button-library'), { touchUpInside: function() {
          self.logging.info("Show library");
          self.hide();
        }});
        self.navigation_back.animate = false;

        self.restoreColor();

        self.menu = new App.Menu(function() {
          self.core.pause();
        }, function() {
          self.core.run();
        });

        self.menu.onReset = function() {
          self.core.reset();
        };

        self.menu.onABStartSelect = function() {
          setTimeout(function() {
            self.core.keyDown(Gameboy.Key.A);
            self.core.keyDown(Gameboy.Key.B);
            self.core.keyDown(Gameboy.Key.START);
            self.core.keyDown(Gameboy.Key.SELECT);
            setTimeout(function() {
              self.core.keyUp(Gameboy.Key.A);
              self.core.keyUp(Gameboy.Key.B);
              self.core.keyUp(Gameboy.Key.START);
              self.core.keyUp(Gameboy.Key.SELECT);
            }, 40);
          }, 400);
        };

        self.game = new App.Controls.Button($('#button-game'), { touchUpInside: function() {
          self.logging.info("Show game menu");
          self.menu.show();
        }});
        self.game.animate = false;

        var buttons = {}
        var axes = {}
        var animationFrameIdentifier = 0;

        function handleButton(index, state) {
          let mapping = {
            1: Gameboy.Key.A,
            0: Gameboy.Key.B,
            9: Gameboy.Key.SELECT,
            16: Gameboy.Key.START,
            12: Gameboy.Key.UP,
            13: Gameboy.Key.DOWN,
            14: Gameboy.Key.LEFT,
            15: Gameboy.Key.RIGHT,
          };
          var code = mapping[index];
          if (code === undefined) {
            return;
          }
          if (state) {
            self.core.keyDown(code);
          } else {
            self.core.keyUp(code);
          }
        }

        function handleAxis(index, oldState, newState) {
          let mapping = {
            0: [Gameboy.Key.LEFT, Gameboy.Key.RIGHT],
            1: [Gameboy.Key.UP, Gameboy.Key.DOWN],
          };
          var codes = mapping[index];
          if (codes === undefined) {
            return;
          }
          if (oldState == -1) {
            self.core.keyUp(codes[0]);
          } else if (oldState == 1) {
            self.core.keyUp(codes[1]);
          }
          if (newState == -1) {
            self.core.keyDown(codes[0]);
          } else if (newState == 1) {
            self.core.keyDown(codes[1]);
          }
        }

        function convertAxis(value) {
          if (value <= -0.8) {
            return -1;
          } else if (value >= 0.8) {
            return 1;
          } else {
            return 0;
          }
        }

        function updateHardwareButtons() {
          var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
          for (j in gamepads) {
            var controller = gamepads[j];
            console.log(controller.axes.map(function(axis) { return convertAxis(axis).toString(); }).join(" "));
            for (i in controller.buttons) {
              var button = controller.buttons[i];
              if (buttons[i] !== undefined && buttons[i] != button.pressed) {
                handleButton(i, button.pressed);
              }
              buttons[i] = button.pressed;
            }
            for (i in controller.axes) {
              var axis = controller.axes[i];
              var newState = convertAxis(axis);
              var oldState = (axes[i] !== undefined) ? axes[i] : 0;
              if (oldState != newState) {
                console.log(i);
                console.log(newState);
                handleAxis(i, oldState, newState);
                axes[i] = newState;
              }
            }
            animationFrameIdentifier = requestAnimationFrame(updateHardwareButtons);
          }
        }

        function connected(e) {
          self.controllers[e.gamepad.index] = e.gamepad;
          animationFrameIdentifier = requestAnimationFrame(updateHardwareButtons);
          self.showControls(false);
        }

        function disconnected(e) {
          cancelAnimationFrame(animationFrameIdentifier);
          self.showControls(true);
        }

        // Hardware controllers.
        var haveEvents = 'GamepadEvent' in window;
        self.controllers = {};
        if (haveEvents) {
          window.addEventListener("gamepadconnected", connected);
          window.addEventListener("gamepaddisconnected", disconnected);
        }
      },

      showControls: function(visible) {
        var self = this;
        if (visible) {
          document.getElementById('element-dpad').style.display = "block";
          document.getElementById('element-options').style.display = "block";
          document.getElementById('element-buttons').style.display = "block";
        } else {
          document.getElementById('element-dpad').style.display = "none";
          document.getElementById('element-options').style.display = "none";
          document.getElementById('element-buttons').style.display = "none";
        }
      },

      /**
       * Create a new button.
       *
       * @param element DOM element.
       * @param keyEvent The key event to inject into the emulator core.
       * @param keyCode The browser key code to bind to.
       *
       * @return The newly created button.
       */
      configureButton: function(element, keyEvent, keyCode) {
        var self = this;
        var button = new App.Controls.Button(element, { touchDown : function() {
          self.core.keyDown(keyEvent);
        }, touchUp: function() {
          self.core.keyUp(keyEvent);
        }}, keyCode);
        button.animate = false;
        return button;
      },

      restoreColor: function() {
        var self = this;
        self.store.property(App.Controller.Domain.SETTINGS, App.Store.Property.COLOR, function(color) {
          if (color === undefined) {
            return;
          }
          self.setColor(color);
        });
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

      pause: function() {
        var self = this;
        self.core.pause();
      },

      run: function() {
        var self = this;
        self.core.run();
      },

      clear: function() {
        var self = this;
        self.core.clear();
      },

      hide: function() {
        var self = this;
        if (self.state != App.Console.State.HIDDEN) {

          if (self.navigationBarTimeout !== undefined) {
            clearTimeout(self.navigationBarTimeout);
            self.navigationBarTimeout = undefined;
          }

          self.pause();
          self.state = App.Console.State.HIDDEN;
          setTimeout(function() {
            self.element.addClass("hidden");
            setTimeout(function() {
              document.getElementsByTagName('body')[0].style.overflow = ''; // Allow scrolling.
            }, self.animationDuration());
          }, 10);

        }
      },

      setAnimationEnabled: function(enabled) {
        var self = this;
        if (enabled) {
          self.element.removeClass("disable-animation");
        } else {
          self.element.addClass("disable-animation");
        }
      },

      isAnimationEnabled: function() {
        var self = this;
        return (self.element.hasClass("disable-animation") === false);
      },

      animationDuration: function() {
        var self = this;
        return self.isAnimationEnabled() ? 400 : 10;
      },

      show: function() {
        var self = this;
        return new Promise(function(resolve, reject) {

          if (self.state != App.Console.State.VISIBLE) {
            self.state = App.Console.State.VISIBLE;
            self.element.removeClass("hidden");
            setTimeout(function() {
              self.navigation.addClass('hidden');
              self.run();
              resolve();
            }, self.animationDuration());
            window.addEventListener("scroll", this.scrollBlocker);
            document.getElementsByTagName('body')[0].style.overflow = 'hidden'; // Prevent scrolling.
          } else {
            reject();
          }

        });
      },

  });

})(jQuery);
