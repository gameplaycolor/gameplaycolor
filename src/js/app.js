/*
 * Copyright (c) 2012-2021 InSeven Limited
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
      self.device = device;

      self.store = new App.Store("save-state", 50);
      var storeInitCallback = self.storeInitCallback.bind(self);
      self.store.open(storeInitCallback);
    },

    storeInitCallback: function(opened, error) {
      var self = this;
      if (opened) {
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
        self.console = new App.Console(self.device, self.gameBoy, self.store);
        self.settings = new App.Settings(self.store, self.gameBoy, self.console);

        self.settingsButton = new App.Controls.Button($("#button-account"), {
          touchUpInside: function() {
            self.settings.show();
          }
        });

        self.consoleButton = new App.Controls.Button($("#button-done"), {
          touchUp: function() {
            self.logging.info("Show console");
            self.console.show();
          }
        });

        self.settingsButton.show();

        self.checkForUpdate();

        // Ensure sound is enabled on a user interaction.

        self.soundMenu = new App.SoundMenu(function() {
            self.gameBoy.pause();
          }, function() {
            self.gameBoy.run();
        });

        self.gameBoy.setSoundEnabled(false);
        self.soundMenu.onEnable = function() {
          self.gameBoy.setSoundEnabled(true);
        };

        // Restore settings.
        self.restorePrevious().always(function() {
          self.console.setAnimationEnabled(true);
          self.soundMenu.show();
        });

        setInterval(function() {
          autoSave();
        }, 1000);

      } else {
        alert(
          "Unable to create database.\nPlease accept increased storage size when asked.",
          error
        );
        return;
      }
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
    bootstrap();
    console.log("Working...")
  });

})(jQuery);

function bootstrap() {
  var device = new App.Device();
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

  if (message.data == "crash") {
    boom();
  }

};
