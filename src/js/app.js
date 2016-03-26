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

Promise.prototype.always = function(onAlways) {
  return this.then(onAlways, onAlways);
};
 
(function($) {

  jQuery.fn.selectText = function() {
    var element = this[0], range, selection;
    if (document.body.createTextRange) {
        range = document.body.createTextRange();
        range.moveToElementText(element);
        range.select();
    } else if (window.getSelection) {
        selection = window.getSelection();
        range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
    }
  };

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

      self.logging = new App.Logging(window.config.logging_level, "app");
      self.logging.info("Version: " + window.config.version);
      self.logging.info("Screen size: " + $(window).width() + " x " + $(window).height());
      self.logging.info("User Agent: " + navigator.userAgent);

      self.library = new App.Library(self.store, function(identifier) {
        self.console.clear();
        self.console.show();
        setTimeout(function() {
          self.load(identifier);
        }, 400);
      });
      self.gameBoy = new App.GameBoy(self.store, self.library);
      self.games = new App.Games(self.device, self.gameBoy, self.library);

      self.console = new App.Console(self.device, self.gameBoy, { 'didHide': function() {
        self.games.update();
      }}, self.store);

      self.drive = App.Drive.Instance();
      self.settings = new App.Settings(self.drive, self.store, self.gameBoy, self.console);

      self.settingsButton = new App.Controls.Button($('#button-account'), { touchUpInside: function() {
        self.settings.show();
      }});

      self.consoleButton = new App.Controls.Button($('#button-done'), { touchUp: function() {
        self.logging.info("Show console");
        self.console.show();
      }});

      self.redeem = new App.Controls.Button($('#button-redeem'), { touchUpInside: function() {
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
          self.settingsButton.hide();
          self.consoleButton.hide();
          self.clear();
          self.console.hide();

          if (window.navigator.onLine === true) {
            self.drive.authURL().then(function(url) {
              $("#google-drive-auth").attr("href", url);
              $("#redeem-code").val('');
              $("#screen-account").show();
            }).fail(function() {
              alert("Unable to generate Google authentication URL.");
            });
          }

        } else if (state == App.Drive.State.AUTHORIZED) {

          self.logging.info("Google Drive state authorized.");
          $("#screen-account").hide();
          self.settingsButton.show();
          self.drive.user().then(function(user) {
            $('#account-details').html(user.email);
          });
          self.games.update();

        }
      });
      self.drive.authorize();

      self.checkForUpdate();

      self.restorePrevious().always(function() {
        self.console.setAnimationEnabled(true);
        $('#screen-splash').css("display", "none");
      });

      setInterval(function() {
        autoSave();
      }, 1000);

    },

    /**
     * Restores the previous ROM and game state if one was present.
     *
     * If the ROM was successfully loaded, the returned Promise will resolved; otherwise it will rejected.
     *
     * @return Returns a Promise indicating.
     */
    restorePrevious: function() {
      var self = this;
      return new Promise(function(resolve, reject) {
        self.store.property(App.Controller.Domain.SETTINGS, App.Store.Property.GAME, function(identifier) {
          if (identifier !== undefined) {
            self.load(identifier).then(function() {
              resolve();
            }, function(error) {
              reject(error);
            });
          } else {
            reject();
          }
        });
      });
    },

    load: function(identifier) {
      var self = this;
      return new Promise(function(resolve, reject) {
        var title = self.library.titleForIdentifier(identifier);
        self.gameBoy.load(identifier).then(function() {
          self.store.setProperty(App.Controller.Domain.SETTINGS, App.Store.Property.GAME, identifier);
          self.consoleButton.setTitle(title);
          self.consoleButton.show();
          self.console.show().then(function() {
            resolve();
          }, function(error) {
            reject(error);
          });
        }).fail(function(e) {
          alert("Unable to load ROM\n" + e);
          self.store.deleteProperty(App.Controller.Domain.SETTINGS, App.Store.Property.GAME);
          self.consoleButton.hide();
          reject(e);
        });
      });
    },

    clear: function() {
      var self = this;
      self.console.clear();
      self.store.deleteProperty(App.Controller.Domain.SETTINGS, App.Store.Property.GAME);
    },

    checkForUpdate: function() {
      var self = this;

      if (self.updateCheck !== undefined) {
        return self.updateCheck.promise();
      }

      var deferred = jQuery.Deferred();
      self.updateCheck = deferred;

      deferred.promise().then(function(details) {
        alert("Update available.\nRelaunch the application to update.\n\nVersion " + details.version + "\n\n" + details.details);
      });

      if (window.applicationCache !== undefined && window.applicationCache !== null) {
        self.logging.info("Checking for application update (status " + window.applicationCache.status + ")");
        window.applicationCache.addEventListener('updateready', function(event) {
          self.logging.info("Application update received (status " + window.applicationCache.status + ")");
          if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
            jQuery.get('version.txt', function(version) {
              jQuery.get('release.txt', function(data) {
                deferred.resolve({"version": $.trim(version), "details": data});
              }).fail(function() {
                deferred.reject();
              });              
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
  window.applicationRunning = true;
}

function sendLogs() {
  window.location.href = 'mailto:support@inseven.co.uk?subject=Game Play Color Logs&body=Description:%0A%0APlease describe the issue you are seeing.%0A%0ALogs:%0A%0A' + encodeURIComponent(App.Logging.logs());
}

window.onerror = function(message, url, linenumber) {

  var logging = new App.Logging(window.config.logging_level, "error");
  logging.error(message + " " + message + " " + linenumber);

  var handleError = function() {
    if (confirm('Game Play encountered an error.\nSend crash report?')) {
      window.location.href = 'mailto:crashes@inseven.co.uk?subject=Crash Report: Game Play Color&body=Description:%0A%0APlease describe what you were doing at the time.%0A%0AError:%0A%0A' + encodeURIComponent(message) + '%0A' + encodeURIComponent(url) + '%0A' + encodeURIComponent(linenumber) + '%0A%0ALogs:%0A%0A' + encodeURIComponent(App.Logging.logs());
    }
  };

  if (window.applicationCache.status == window.applicationCache.IDLE &&
      (window.navigator.standalone === true || window.applicationRunning === true)) {
    handleError();
  }

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
