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

  App.Controls.Switch = function(element, callback) {
    this.init(element);
    this.callback = callback;
    self.selected = 0;
  };

  jQuery.extend(
    App.Controls.Switch.prototype,
    App.Control.prototype, {

    onCreate: function() {
      var self = this;
    },

    setSelected: function(selected) {
      var self = this;
      self.selected = selected;
      if (self.selected === 0) {
        self.element.removeClass("on");
      } else {
        self.element.addClass("on");
      }
    },

    onTouchEvent: function(state, position, timestamp, event) {
      var self = this;
      event.preventDefault();
      if (state == App.Control.Touch.END) {
        if (position.x >= 0 &&
            position.x < self.width() &&
            position.y >= 0 &&
            position.y < self.height()) {
          var selected = self.selected;
          if (selected === 0) {
            selected = 1;
          } else {
            selected = 0;
          }
          self.callback(self, selected);
        }
      }
    },

  });

})(jQuery);
