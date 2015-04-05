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

      self.store = new App.Store('save-state');
      if (!self.store.open()) {
        alert("Unable to create database.\nPlease accept increased storage size when asked.");
        return;
      }

      self.device = device;
      self.logging = new App.Logging(App.Logging.Level.WARNING, "app");
      self.library = new App.Library(self.store, function(identifier) {
        self.gameBoy.clear();
        self.console.show();
        setTimeout(function() {
          self.load(identifier);
        }, 400);
      });
      self.gameBoy = new App.GameBoy(self.store, self.library);

      document.addEventListener('touchmove', function(e) {
        e.preventDefault();
      }, false);
      
      self.games = new App.Games(self.device, self.gameBoy, self.library);

      self.console = new App.Console(self.device, self.gameBoy, {
        'willHide': function() {
          self.gameBoy.pause();
        },
        'didHide': function() {
          self.games.update();
        },
        'didShow': function() {
          self.gameBoy.run();
        }
      }, self.store);

      self.checkForUpdate();

      self.loadPreviousGame();

      setInterval(function() {
        autoSave();
      }, 1000);

    },

    loadPreviousGame: function() {
      var self = this;
      self.store.property(App.Controller.Domain.SETTINGS, App.Store.Property.GAME, function(identifier) {
        if (identifier === undefined) {
          return;
        }
        self.load(identifier);
      });
    },

    load: function(identifier) {
      var self = this;
      var title = self.library.titleForIdentifier(identifier);
      self.store.setProperty(App.Controller.Domain.SETTINGS, App.Store.Property.GAME, identifier);
      self.console.setTitle(title);
      self.gameBoy.load(identifier);
    },

    checkForUpdate: function() {
      var self = this;
      if (window.applicationCache !== undefined && window.applicationCache !== null) {
        self.logging.info("Checking for application update (status " + window.applicationCache.status + ")");
        window.applicationCache.addEventListener('updateready', function(event) {
          self.logging.info("Application update received (status " + window.applicationCache.status + ")");
          if (window.applicationCache.status != 4) return;
          alert("Update available.\nRelaunch the application to update.");
        });
      }
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

  $(document).ready(function() {

    var debug = false;
    var iPhone = (navigator.userAgent.indexOf("iPhone OS") !== -1);
    var iPad = (navigator.userAgent.indexOf("iPad") !== -1);
    if ((window.navigator.standalone === true && (iPhone || iPad)) || debug) {
      var device = new App.Device();
      window.tracker = new App.Tracker();
      window.app = new App.Controller(device);
    } else {
      $("#screen-instructions").show();
    }

  });

})(jQuery);

window.onerror = function(message, url, linenumber) {
  if (confirm('Game Play encountered an error.\nSend crash report?')) {
    window.location.href = 'mailto:crashes@inseven.co.uk?subject=Crash Report: Game Play Color&body=Description:%0A%0APlease describe what you were doing at the time.%0A%0AError:%0A%0A' + encodeURIComponent(message) + '%0A' + encodeURIComponent(url) + '%0A' + encodeURIComponent(linenumber);
  }
  return true;
};
