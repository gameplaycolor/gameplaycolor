/*
 * Copyright (C) 2012-2015 InSeven Limited.
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

  App.Controls = {};

  App.Controls.Pad = function(actions) {
    this.init('#dpad-touch-target');
    this.actions = actions;
  };

  App.Controls.Pad.State = {
    DEFAULT:   0,
    UP:        1,
    UPRIGHT:   2,
    RIGHT:     3,
    DOWNRIGHT: 4,
    DOWN:      5,
    DOWNLEFT:  6,
    LEFT:      7,
    UPLEFT:    8
  };

  App.Controls.Pad.DIAGONAL_THRESHOLD = 30;

  jQuery.extend(
    App.Controls.Pad.prototype,
    App.Control.prototype, {

    onCreate: function() {
      var self = this;
      self.pad = $('#dpad');
      self.touches = 0;

      self.up    = false;
      self.down  = false;
      self.left  = false;
      self.right = false;

      $(document).keydown(function(event) {
        var keycode = event.which;
        if (keycode == 37) {
          self.setLeft(true);
          event.preventDefault();
        } else if (keycode == 38) {
          self.setUp(true);
          event.preventDefault();
        } else if (keycode == 39) {
          self.setRight(true);
          event.preventDefault();
        } else if (keycode == 40) {
          self.setDown(true);
          event.preventDefault();
        }
      });
      $(document).keyup(function(event) {
        var keycode = event.which;
        if (keycode == 37) {
          self.setLeft(false);
          event.preventDefault();
        } else if (keycode == 38) {
          self.setUp(false);
          event.preventDefault();
        } else if (keycode == 39) {
          self.setRight(false);
          event.preventDefault();
        } else if (keycode == 40) {
          self.setDown(false);
          event.preventDefault();
        }
      });

    },

    width: function() {
      var self = this;
      return self.element.width();
    },

    height: function() {
      var self = this;
      return self.element.height();
    },

    onTouchEvent: function(state, position, timestamp) {
      var self = this;

      if (state === App.Control.Touch.START) {
        self.touches = 1;
        self.processTouchEvent(state, position, timestamp);
      } else if (state === App.Control.Touch.MOVE) {
        if (self.touches === 1) {
          self.processTouchEvent(state, position, timestamp);
        }
      } else if (state === App.Control.Touch.END) {
        self.setState(App.Control.State.DEFAULT);
        self.touches = 0;
      }

    },

    processTouchEvent: function(state, position, timestamp) {
      var self = this;

      var halfWidth = self.element.width() / 2;
      var halfHeight = self.element.height() / 2;

      // Mapping this into a less than obvious coordinate space because it seemed
      // a good idea at the time.
      var x = (halfWidth - position.x) * -1;
      var y = halfHeight - position.y;

      // Check for the corners (diagonal movement).
      var diagonal = false;
      if ((Math.abs(x) >= (halfWidth - App.Controls.Pad.DIAGONAL_THRESHOLD)) &&
          (Math.abs(y) >= (halfHeight - App.Controls.Pad.DIAGONAL_THRESHOLD))) {
        diagonal = true;
      }

      if (x < 0) {
        // Left half.
        if (y < 0) {
          // Bottom-left quadrant.
          if (diagonal) {
            self.setState(App.Controls.Pad.State.DOWNLEFT);
          } else if (Math.abs(y) < Math.abs(x)) {
            self.setState(App.Controls.Pad.State.LEFT);
          } else {
            self.setState(App.Controls.Pad.State.DOWN);
          }
        } else {
          // Top-left quadrant.
          if (diagonal) {
            self.setState(App.Controls.Pad.State.UPLEFT);
          } else if (Math.abs(y) < Math.abs(x)) {
            self.setState(App.Controls.Pad.State.LEFT);
          } else {
            self.setState(App.Controls.Pad.State.UP);
          }

        }
      } else {
        // Right half.
        if (y < 0) {
          // Bottom-right quadrant.
          if (diagonal) {
            self.setState(App.Controls.Pad.State.DOWNRIGHT);
          } else if (Math.abs(y) < Math.abs(x)) {
            self.setState(App.Controls.Pad.State.RIGHT);
          } else {
            self.setState(App.Controls.Pad.State.DOWN);
          }
        } else {
          // Top-right quadrant.
          if (diagonal) {
            self.setState(App.Controls.Pad.State.UPRIGHT);
          } else if (Math.abs(y) < Math.abs(x)) {
            self.setState(App.Controls.Pad.State.RIGHT);
          } else {
            self.setState(App.Controls.Pad.State.UP);
          }
        }
      }

    },

    setState: function(state) {
      var self = this;
      if (self.state != state) {
        self.state = state;

        switch (self.state) {
          case App.Controls.Pad.State.DEFAULT:
            self.setUp(false);
            self.setDown(false);
            self.setLeft(false);
            self.setRight(false);
            break;
          case App.Controls.Pad.State.UP:
            self.setUp(true);
            self.setDown(false);
            self.setLeft(false);
            self.setRight(false);
            break;
          case App.Controls.Pad.State.UPRIGHT:
            self.setUp(true);
            self.setDown(false);
            self.setLeft(false);
            self.setRight(true);
            break;
          case App.Controls.Pad.State.RIGHT:
            self.setUp(false);
            self.setDown(false);
            self.setLeft(false);
            self.setRight(true);
            break;
          case App.Controls.Pad.State.DOWNRIGHT:
            self.setUp(false);
            self.setDown(true);
            self.setLeft(false);
            self.setRight(true);
            break;
          case App.Controls.Pad.State.DOWN:
            self.setUp(false);
            self.setDown(true);
            self.setLeft(false);
            self.setRight(false);
            break;
          case App.Controls.Pad.State.DOWNLEFT:
            self.setUp(false);
            self.setDown(true);
            self.setLeft(true);
            self.setRight(false);
            break;
          case App.Controls.Pad.State.LEFT:
            self.setUp(false);
            self.setDown(false);
            self.setLeft(true);
            self.setRight(false);
            break;
          case App.Controls.Pad.State.UPLEFT:
            self.setUp(true);
            self.setDown(false);
            self.setLeft(true);
            self.setRight(false);
            break;
        }

      }
    },

    setUp: function(state) {
      var self = this;
      if (self.up !== state) {
        self.up = state;
        if (state) {
          self.action("touchDownUp");
          self.pad.addClass("pressed-up");
        } else {
          self.action("touchUpUp");
          self.pad.removeClass("pressed-up");
        }
      }
    },

    setDown: function(state) {
      var self = this;
      if (self.down !== state) {
        self.down = state;
        if (state) {
          self.action("touchDownDown");
          self.pad.addClass("pressed-down");
        } else {
          self.action("touchUpDown");
          self.pad.removeClass("pressed-down");
        }
      }
    },

    setLeft: function(state) {
      var self = this;
      if (self.left !== state) {
        self.left = state;
        if (state) {
          self.action("touchDownLeft");
          self.pad.addClass("pressed-left");
        } else {
          self.action("touchUpLeft");
          self.pad.removeClass("pressed-left");
        }
      }
    },

    setRight: function(state) {
      var self = this;
      if (self.right !== state) {
        self.right = state;
        if (state) {
          self.action("touchDownRight");
          self.pad.addClass("pressed-right");
        } else {
          self.action("touchUpRight");
          self.pad.removeClass("pressed-right");
        }
      }
    },

    action: function(id) {
      var self = this;
      if (id in self.actions) {
        self.actions[id]();
      }
    }

  });

})(jQuery);
