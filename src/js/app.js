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

  App = {};

  App.Controller = function(device) {
      this.init(device);
  };

  App.Controller.SAVE = false;
  App.Controller.DEBUG = false;

  jQuery.extend(App.Controller.prototype, {

    init: function (device) {
      var self = this;
      self.device = device;
      self.store = new App.Store('gameboy');
      self.library = new App.Library();
      self.gameBoy = new App.GameBoy(self.store, self.library);

      // Prevent touchmove events.
      document.addEventListener('touchmove', function(e) {
        e.preventDefault();
      }, false);
      
      self.games = new App.Games(self.device, self.gameBoy, self.library, function(identifier) {
        self.console.show();
        self.gameBoy.load(identifier);
      });

      self.console = new App.Console(self.device, self.gameBoy, {
        'willHide': function() {
          self.gameBoy.pause();
          self.games.update();
        },
        'didShow': function() {
          self.gameBoy.run();
        }
      }, self.store);

      // Pre-fetch mouse-over images for the buttons.
      self.prefetch("images/button_press.png");
      self.prefetch("images/button_press_2x.png");
      self.prefetch("images/option_press.png");
      self.prefetch("images/option_press_2x.png");
      self.prefetch("images/done_press.png");
      self.prefetch("images/done_press_2x.png");
      
      self.checkForUpdate();

    },

    prefetch: function(src) {
      var self = this;
      var image = new Image();
      image.src = src;
    },
        
    checkForUpdate: function() {
      var self = this;
      if (window.applicationCache !== undefined && window.applicationCache !== null) {
        window.applicationCache.addEventListener('updateready', function(event) {
          self.checkUpdate(event);
        });
      }
    },

    checkUpdate: function(event) {
      var self = this;
      if (window.applicationCache.status != 4) return;
      $("#update-button").fadeIn();
    },

    updateApplication: function() {
      var self = this;
      window.applicationCache.removeEventListener('updateready', self.updateApplication);
      window.applicationCache.swapCache();
      window.location.reload();
    }

  });

  // Create the application.
  $(document).ready(function() {

    var device = new App.Device();
    window.tracker = new App.Tracker();

    // Do not show the walkthrough if debugging.
    if (App.Controller.DEBUG === true) {
      $("#gameboy").show();
      window.app = new App.Controller(device);
      return;
    }

    // Work out if we've been installed or not.
    if (window.navigator.standalone &&
        device.type === App.Device.Type.IPHONE_5) {
      $("#gameboy").show();
      window.app = new App.Controller(device);
    } else {
      $("#instructions").show();
      if (device.type === App.Device.Type.IPHONE_5) {
        $("#instructions-iphone5").show();
      } else {
        $("#instructions-other").show();
      }
    }

  });

})(jQuery);
