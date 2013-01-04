/*
 * Copyright (C) 2012-2013 InSeven Limited.
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

  App.Device.Orientation = {
    UNKNOWN:   -1,
    PORTRAIT:  0,
    LANDSCAPE: 1
  };

  App.Device.Dimensions = {

    IPHONE_5_HEIGHT: 444,
    IPHONE_5_WIDTH:  568,

    DEVICE_WIDTH: 320
  };

  jQuery.extend(
    App.Device.prototype, {

    init: function() {
      var self = this;
      self.type = App.Device.Type.UNKNOWN;
      self.retina = (window.devicePixelRatio > 1);
      self.orientationChangeCallbacks = [];

      var width = $(window).width();
      var height = $(window).height();

      // Determine the initial orientation, then observe orientation
      // events (via window size).
      self.orientation = App.Device.Orientation.UNKNOWN;
      self.updateOrientation(false);
      self.observeOrientationChanges();

      var userAgent = navigator.userAgent;
      if (userAgent.indexOf("iPhone") !== -1) {
        self.type = App.Device.Type.IPHONE;
        if (self.retina) {
          self.type = App.Device.Type.IPHONE_4;

          if (self.orientation === App.Device.Orientation.PORTRAIT) {
            if (height >= App.Device.Dimensions.IPHONE_5_HEIGHT) {
              self.type = App.Device.Type.IPHONE_5;
            }
          } else {
            if (width >= App.Device.Dimensions.IPHONE_5_WIDTH) {
              self.type = App.Device.Type.IPHONE_5;
            }
          }
        }
      } else if (userAgent.indexOf("iPad") !== -1) {
        self.type = App.Device.Type.IPAD;
        if (self.retina) {
          self.type = App.Device.Type.IPAD_RETINA;
        }
      }

    },

    type: function() {
      var self = this;
      return self.type;
    },

    onOrientationChange: function(callback) {
      var self = this;
      self.orientationChangeCallbacks.push(callback);
    },

    // Update the orientation.
    // Observes will be notified if notify is true.
    updateOrientation: function(notify) {
      var self = this;

      var width = $(window).width();

      var orientation = self.orientation;
      if (width > App.Device.Dimensions.DEVICE_WIDTH) {
        orientation = App.Device.Orientation.LANDSCAPE;
      } else {
        orientation = App.Device.Orientation.PORTRAIT;
      }
      
      // Only execute the callback if the orientation has actually changed.
      if (orientation != self.orientation) {
        self.orientation = orientation;

        if (notify) {
          for (var i = 0; i < self.orientationChangeCallbacks.length; i++) {
            var callback = self.orientationChangeCallbacks[i];
            callback(self.orientation);
          }
        }
      }

    },

    observeOrientationChanges: function() {
      var self = this;
      $(window).resize(function() {
        self.updateOrientation(true);
      });

    }

  });

})(jQuery);
