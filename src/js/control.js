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

  App.Controls = {};

  App.Control = function(identifier) {
    this.init(identifier);
  };

  App.Control.Touch = {
    START: 0,
    MOVE:  1,
    END:   2
  };

  App.Control.State = {
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

  jQuery.extend(App.Control.prototype, {

    init: function(element) {
      var self = this;
      self.element = element;
      self.touchListener = new App.TouchListener(element, self);
      self.onCreate();
    },

    onCreate: function() {
      var self = this;
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
    },

    fadeIn: function() {
      var self = this;
      self.element.fadeIn();
    },

    fadeOut: function() {
      var self = this;
      self.element.fadeOut();
    },

  });

})(jQuery);
