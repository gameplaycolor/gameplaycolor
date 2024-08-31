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

  App.Controls.Button = function(element, actions, keycode) {
    this.init(element);
    this.setKeyHandler(keycode);
    this.actions = actions;
    self.animate = true;
  };

  App.Controls.Button.State = {
    UP:   0,
    DOWN: 1
  };

  jQuery.extend(
    App.Controls.Button.prototype,
    App.Control.prototype, {

    onCreate: function() {
      var self = this;
      self.touchCount = 0;
      self.state = App.Controls.Button.State.UP;
      self.cancelOnMove = false;
      self.preventDefault = true;
      self.longPressTimeoutIdentifier = undefined;
    },

    setKeyHandler: function(keycode) {
      var self = this;
      if (keycode === undefined) {
        return;
      }
      $(document).keydown(function(event) {
        if (event.which == keycode) {
          self.setPressed(true);
          self.touchDown();
          event.preventDefault();
        }
      });
      $(document).keyup(function(event) {
        if (event.which == keycode) {
          self.touchUpInside();
          self.touchUp();
          self.setPressed(false);
          event.preventDefault();
        }
      });
    },

    setPressed: function(pressed) {
      var self = this;
      if (self.pressed === pressed) {
        return;
      }
      self.pressed = pressed;
      if (self.animate === false) {
        return;
      }
      if (pressed) {
        self.element.addClass("pressed");
      } else {
        self.element.removeClass("pressed");
      }
    },

    onTouchEvent: function(state, position, timestamp, event) {
      var self = this;

      if (self.preventDefault) {
        event.preventDefault();
      }

      switch(state) {
        case App.Control.Touch.START:
          self.touchCount = 1;
          self.setPressed(true);
          self.touchDown();

          // Set the long press timeout.
          if (self.actions.longPress !== undefined) {

            self.longPressTimeoutIdentifier = setTimeout(function() {
              if (self.longPressActive !== false) {
                self.actions.longPress();
                self.longPressTimeoutIdentifier = undefined;
                self.touchCount = 0;
                self.setPressed(false);
              }
            }, 1000);

          }

          break;
        case App.Control.Touch.MOVE:
          if (self.touchCount > 0) {
            if (self.cancelOnMove) {
              self.setPressed(false);
              self.touchCount = 0;
            } else {
              if (position.x >= 0 &&
                  position.x < self.width() &&
                  position.y >= 0 &&
                  position.y < self.height()) {
                self.setPressed(true);
              } else {
                self.setPressed(false);
              }
            }
          }

          // Cancel the long press timeout.
          if (self.longPressTimeoutIdentifier !== undefined) {
            clearTimeout(self.longPressTimeoutIdentifier);
            self.longPressTimeoutIdentifier = undefined;
          }

          break;
        case App.Control.Touch.END:
          if (self.pressed === true) {
            self.touchUpInside();
          } else {
            self.touchUpOutside();
          }
          self.touchUp();
          self.setPressed(false);
          self.touchCount = 0;

          // Cancel the long press timeout.
          if (self.longPressTimeoutIdentifier !== undefined) {
            clearTimeout(self.longPressTimeoutIdentifier);
            self.longPressTimeoutIdentifier = undefined;
          }

          break;
      }
    },

    action: function(id) {
      var self = this;
      if (id in self.actions) {
        self.actions[id]();
      }
    },

    touchDown: function() {
      var self = this;
      self.action("touchDown");
    },

    touchUp: function() {
      var self = this;
      self.action("touchUp");
    },

    touchUpInside: function() {
      var self = this;
      self.action("touchUpInside");
    },

    touchUpOutside: function() {
      var self = this;
      self.action("touchUpOutside");
    },

    setTitle: function(title) {
      var self = this;
      self.element.html(title);
    },

    hide: function() {
      var self = this;
      self.element.hide();
    },

    show: function() {
      var self = this;
      self.element.show();
    }

  });

})(jQuery);
