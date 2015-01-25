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
  App.Controller.DEBUG = true;

  App.Controller.Domain = {
    SETTINGS: "settings",
    THUMBNAILS: "thumbnails",
    GAMES: "games"
  };

  jQuery.extend(App.Controller.prototype, {

    init: function (device) {
      var self = this;
      self.device = device;
      self.library = new App.Library();
      self.gameBoy = new App.GameBoy(self.store, self.library);
      self.store = new App.Store('save-state');

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

      self.checkForUpdate();

    },

    checkForUpdate: function() {
      var self = this;
      if (window.applicationCache !== undefined && window.applicationCache !== null) {
        console.log("Checking for application update (status " + window.applicationCache.status + ")");
        window.applicationCache.addEventListener('updateready', function(event) {
          self.checkUpdate(event);
        });
      }
    },

    checkUpdate: function(event) {
      var self = this;
      console.log("Application update received (status " + window.applicationCache.status + ")");
      if (window.applicationCache.status != 4) return;
      alert("Update available.\nRelaunch the application to update.");
    },

    setValue: function(domain, key, value) {
      var self = this;
      self.store.setProperty(domain, key, value);
    },

    getValue: function(domain, key, callback) {
      var self = this;
      return self.store.property(domain, key, callback);
    },

    deleteValue: function(domain, key) {
      var self = this;
      self.store.deleteProperty(key);
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
