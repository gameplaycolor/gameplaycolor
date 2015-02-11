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

  App.Controls.Button = function(identifier, actions, keycode) {
    this.init(identifier);
    this.setKeyHandler(keycode);
    this.actions = actions;
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
      self.state = App.Controls.Button.State.UP;
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
      if (pressed) {
        self.element.addClass("pressed");
      } else {
        self.element.removeClass("pressed");
      }
      self.pressed = pressed;
    },

    onTouchEvent: function(state, position, timestamp) {
      var self = this;

      switch(state) {
        case App.Control.Touch.START:
          self.setPressed(true);
          self.touchDown();
          break;
        case App.Control.Touch.MOVE:
          break;
        case App.Control.Touch.END:
          if (position.x >= 0 &&
              position.x < self.width() &&
              position.y >= 0 &&
              position.y < self.height()) {
            self.touchUpInside();
          } else {
            self.touchUpOutside();
          }
          self.touchUp();
          self.setPressed(false);
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

  });

})(jQuery);
