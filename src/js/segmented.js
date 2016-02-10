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

  App.Controls.Segmented = function(element, callback) {
    this.init(element);
    this.callback = callback;
    self.index = 0;
  };

  jQuery.extend(
    App.Controls.Segmented.prototype,
    App.Control.prototype, {

    onCreate: function() {
      var self = this;
      self.buttons = $.map(self.element.children(), function(child, index) {
        return new App.Controls.Button($(child), { touchUpInside: function() {
          self.callback(index);
        }});
      });
    },

    setIndex: function(index) {
      var self = this;
      if (self.index != index) {
        self.index = index;
        self.element.children().each(function(i, child) {
          if (i == index) {
            $(child).addClass("selected");
          } else {
            $(child).removeClass("selected");
          }
        });
      }
    },

  });

})(jQuery);
