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

  App.Controls.Scroll = function(element) {
    this.init(element);
  };

  jQuery.extend(
    App.Controls.Scroll.prototype,
    App.Control.prototype, {

    onCreate: function() {
      var self = this;
    },

    onTouchEvent: function(state, position, timestamp) {
      var self = this;
      
      if (state === App.Control.Touch.START) {
        self.touchStart = position;
        self.scrollLeft = self.element.scrollLeft();
        self.scrollTop = self.element.scrollTop();
        self.touchCount = 1;
      } else if (state === App.Control.Touch.MOVE) {
        if (self.touchCount > 0) {
          self.element.scrollLeft(self.scrollLeft + self.touchStart.x - position.x);
          self.element.scrollTop(self.scrollTop + self.touchStart.y - position.y);
        }
      } else if (state === App.Control.Touch.END) {
        self.touchCount = 0;
      }

    },

  });

})(jQuery);
