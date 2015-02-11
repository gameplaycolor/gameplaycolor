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

  App.Device = function() {
    this.init();
  };

  App.Device.Type = {
    UNKNOWN:     0,
    IPHONE:      1,
    IPHONE_4:    2,
    IPHONE_5:    3,
    IPAD:        4,
    IPAD_RETINA: 5
  };

  App.Device.Dimensions = {
    IPHONE_5_HEIGHT: 568,
    DEVICE_WIDTH: 320
  };

  jQuery.extend(
    App.Device.prototype, {

    init: function() {
      var self = this;
      self.type = App.Device.Type.UNKNOWN;
    },

    type: function() {
      var self = this;
      return self.type;
    }

  });

})(jQuery);
