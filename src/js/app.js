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

      self.store = new App.Store('save-state', 50);
      if (!self.store.open()) {
        alert("Unable to create database.\nPlease accept increased storage size when asked.");
        return;
      }

      self.device = device;

      self.logging = new App.Logging(App.Logging.Level.INFO, "app");
      self.logging.info("Version: 2.1.0");
      self.logging.info("Screen size: " + $(window).width() + " x " + $(window).height());
      self.logging.info("User Agent: " + navigator.userAgent);

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

      self.drive = App.Drive.Instance();

      self.account = new App.Controls.Button('#button-account', { touchUpInside: function() {
        // If we present a confirm dialog within the button event handler the final touch up gets lost and we find
        // ourselves in an inconsistent state.
        setTimeout(function() {
          if (confirm("Sign out of Google Drive?")) {
            self.drive.signOut().fail(function(e) {
              alert("Unable to sign out of Google Drive.\n" + e);
            });
          }
        }, 10);
      }});

      self.redeem = new App.Controls.Button('#button-redeem', { touchUp: function() {
        $("#redeem-code").blur();
        var code = $("#redeem-code").val();
        drive.redeemToken(code).then(function() {
          self.drive.authorize();
        }).fail(function() {
          alert("Unable to sign in.");
        });
      }});

      self.drive.onStateChange(function(state) {
        if (state == App.Drive.State.UNKNOWN) {

          self.logging.info("Google Drive state unknown.");

        } else if (state == App.Drive.State.UNAUTHORIZED) {

          self.logging.info("Google Drive state unauthorized.");
          self.account.hide();

          if (window.navigator.onLine === true) {
            self.drive.authURL().then(function(url) {
              $("#google-drive-auth").attr("href", url);
              $("#screen-account").show();
            }).fail(function() {
              alert("Unable to generate Google authentication URL.");
            });
          }

        } else if (state == App.Drive.State.AUTHORIZED) {

          self.logging.info("Google Drive state authorized.");
          $("#screen-account").hide();
          self.account.show();
          self.drive.user().then(function(user) {
            self.account.setTitle(user.email);
          });

        }
      });
      self.drive.authorize();

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
      self.gameBoy.load(identifier).then(function() {
        self.store.setProperty(App.Controller.Domain.SETTINGS, App.Store.Property.GAME, identifier);
        self.console.setTitle(title);
      }).fail(function(e) {
        alert("Unable to load ROM\n" + e);
        self.store.deleteProperty(App.Controller.Domain.SETTINGS, App.Store.Property.GAME);
        self.console.setTitle("Console");
      });
    },

    checkForUpdate: function() {
      var self = this;

      if (self.updateCheck !== undefined) {
        return self.updateCheck.promise();
      }

      var deferred = jQuery.Deferred();
      self.updateCheck = deferred;

      deferred.promise().then(function(details) {
        alert("Update available.\nRelaunch the application to update.\n\n" + details);
      });

      if (window.applicationCache !== undefined && window.applicationCache !== null) {
        self.logging.info("Checking for application update (status " + window.applicationCache.status + ")");
        window.applicationCache.addEventListener('updateready', function(event) {
          self.logging.info("Application update received (status " + window.applicationCache.status + ")");
          if (window.applicationCache.status == 4) {
            jQuery.get('release.txt', function(data) {
              deferred.resolve(data);
            }).fail(function() {
              deferred.reject();
            });
          } else {
            deferred.reject();
          }
        });
      }

      return deferred.promise();
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

    var iPhone = (navigator.userAgent.indexOf("iPhone OS") !== -1);
    var iPad = (navigator.userAgent.indexOf("iPad") !== -1);
    if ((window.navigator.standalone === true && (iPhone || iPad))) {

      bootstrap();

    } else {

      var drive = App.Drive.Instance();
      var code = drive.getParameters().code;
      if (code !== undefined) {

        console.log("Received authentication token: " + code);
        $("#screen-authorizing").show();
        $("#authorization-code").val(code);

      } else {

        $("#screen-instructions").show();

      }
      
    }
  });

})(jQuery);

function bootstrap() {
  var device = new App.Device();
  window.tracker = new App.Tracker();
  window.app = new App.Controller(device);
}

window.onerror = function(message, url, linenumber) {

  var handleError = function() {
    // Present a dialog asking users if they wish to report other errors.
    if (confirm('Game Play encountered an error.\nSend crash report?')) {
      window.location.href = 'mailto:crashes@inseven.co.uk?subject=Crash Report: Game Play Color&body=Description:%0A%0APlease describe what you were doing at the time.%0A%0AError:%0A%0A' + encodeURIComponent(message) + '%0A' + encodeURIComponent(url) + '%0A' + encodeURIComponent(linenumber) + '%0A%0ALogs:%0A%0A' + encodeURIComponent(App.Logging.logs());
    }
  };

  // Defer error handling if there is an on-going update.
  // N.B. We only show the error if there's new release as we're optimistic enough to assume that the bug has already
  // been fixed in the new release.
  if (window.app !== undefined) {
    window.app.checkForUpdate().fail(handleError);
  } else {
    handleError();
  }

  // Defer to the default handler.
  return false;

};

window.onmessage = function(message) {

  if (message.data === "debug") {
    $("#screen-instructions").hide();
    bootstrap();
  } else if (message.data == "crash") {
    boom();
  }

};
