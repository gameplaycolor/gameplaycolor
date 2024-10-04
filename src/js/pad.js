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

(function($) {

  App.Controls = {};

  App.Controls.Pad = function(actions) {
    this.init($('#dpad-touch-target'));
    this.actions = actions;
    this.animate = true;
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

    onTouchEvent: function(state, position, timestamp, event) {
      var self = this;
      event.preventDefault();

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

      var x = Math.floor(position.x / (self.element.width() / 3));
      var y = Math.floor(position.y / (self.element.width() / 3));

      switch (y) {
        case 0:
          switch (x) {
            case 0: self.setState(App.Controls.Pad.State.UPLEFT); break;
            case 1: self.setState(App.Controls.Pad.State.UP); break;
            case 2: self.setState(App.Controls.Pad.State.UPRIGHT); break;
          } break;
        case 1:
          switch (x) {
            case 0: self.setState(App.Controls.Pad.State.LEFT); break;
            case 1: self.setState(App.Controls.Pad.State.DEFAULT); break;
            case 2: self.setState(App.Controls.Pad.State.RIGHT); break;
          } break;
        case 2:
          switch (x) {
            case 0: self.setState(App.Controls.Pad.State.DOWNLEFT); break;
            case 1: self.setState(App.Controls.Pad.State.DOWN); break;
            case 2: self.setState(App.Controls.Pad.State.DOWNRIGHT); break;
          } break;
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
        } else {
          self.action("touchUpUp");
        }
        if (self.animate !== true) {
          return;
        }
        if (state) {
          self.pad.addClass("pressed-up");
        } else {
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
        } else {
          self.action("touchUpDown");
        }
        if (self.animate !== true) {
          return;
        }
        if (state) {
          self.pad.addClass("pressed-down");
        } else {
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
        } else {
          self.action("touchUpLeft");
        }
        if (self.animate !== true) {
          return;
        }
        if (state) {
          self.pad.addClass("pressed-left");
        } else {
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
        } else {
          self.action("touchUpRight");
        }
        if (self.animate !== true) {
          return;
        }
        if (state) {
          self.pad.addClass("pressed-right");
        } else {
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
