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

Gameboy = {};

Gameboy.Key = {
  START: 7,
  SELECT: 6,
  A: 4,
  B: 5,
  UP: 2,
  DOWN: 3,
  LEFT: 1,
  RIGHT: 0
};

var gbologger = new App.Logging(window.config.logging_level, "gbo");
var saveStateContext;
var saveStateCache = {};

function cout(message, level) {
  var l = App.Logging.Level.INFO;
  if (level === 0) {
    l = App.Logging.Level.DEBUG;
  } else if (level === 1) {
    l = App.Logging.Level.INFO;
  } else if (level === 2) {
    l = App.Logging.Level.WARNING;
  } else {
    l = App.Logging.Level.ERROR;
  }
  gbologger.log(l, message);
}

function loadSaveStateContext(context) {

  saveStateContext = context;
  saveStateCache = {};

  var deferred = new jQuery.Deferred();
  window.app.store.propertiesForDomain(saveStateContext, function(properties) {

    for (var key in properties) {
      if (properties.hasOwnProperty(key)) {
        saveStateCache[key] = properties[key];
      }
    }

    deferred.resolve();
  });
  return deferred.promise();
}

function setValue(key, value) {

  // JSON-encode some fields.
  if (key.startsWith("RTC") || key.startsWith("FREEZE")) {
    value = JSON.stringify(value);
  }

  var previous = saveStateCache[key];
  if (previous !== value) {
    saveStateCache[key] = value;
    window.app.setValue(saveStateContext, key, value);
  }

}

function deleteValue(key) {
  delete saveStateCache[key];
  window.app.deleteValue(saveStateContext, key);
}

function findValue(key) {

  var value = saveStateCache[key];

  // JSON-decode some fields.
  if (value !== undefined && (key.startsWith("RTC") || key.startsWith("FREEZE"))) {
    value = JSON.parse(value);
  }

  return value;
}

(function($) {

  App.GameBoy = function(store, library) {
    this.init(store, library);
  };

  App.GameBoy.Settings = {
    ENABLE_SOUND:           0, // (defaults to true)
    ENABLE_GBC_BIOS:        1, // Boot with boot rom first (defaults to true)
    DISABLE_COLORS:         2, // Priority to game boy mode (defaults to false)
    VOLUME_LEVEL:           3, // Volume (defaults to 1)
    ENABLE_COLORIZATION:    4, // Colorize the game boy mode (defaults to true)
    TYPED_ARRAYS_DISALLOW:  5, // Disallow typed arrays (defaults to false)
    EMULATOR_LOOP_INTERVAL: 6, // Interval for the emulator loop (defaults to 4)
    AUDIO_BUFFER_MIN_SPAN:  7, // (defaults to 15)
    AUDIO_BUFFER_MAX_SPAN:  8, // (defaults to 30)
    ROM_ONLY_OVERRIDE:      9, // Override to allow for MBC1 instead of ROM only (defaults to false)
    MBC_ENABLE_OVERRIDE:    10, // Override MBC RAM disabling and always allow reading and writing to the banks (defaults to false)
    GB_BOOT_ROM_UTILIZED:   11, // Use the GameBoy boot ROM instead of the GameBoy Color boot ROM (defaults to false)
    SOFTWARE_RESIZING:      12, // Scale the canvas in JS, or let the browser scale the canvas (defaults to false)
    RESIZE_SMOOTHING:       13 // Use image smoothing based scaling (defaults to true)
  };

  App.GameBoy.State = {
    IDLE: 0,
    LOADING: 1,
    RUNNING: 2,
    ERROR: 3
  };

  jQuery.extend(App.GameBoy.prototype, {
        
    init: function(store, library) {
      var self = this;
      self.store = store;
      self.library = library;
      self.stateChangeCallbacks = [];
      self.logging = new App.Logging(window.config.logging_level, "gameboy");
      self.speed = 1;

      settings[App.GameBoy.Settings.ENABLE_SOUND] = true;
      settings[App.GameBoy.Settings.ENABLE_COLORIZATION] = false;
      settings[App.GameBoy.Settings.SOFTWARE_RESIZING] = false;
      settings[App.GameBoy.Settings.RESIZE_SMOOTHING] = false;
      settings[App.GameBoy.Settings.EMULATOR_LOOP_INTERVAL] = 12;

    },

    setSoundEnabled: function(enabled) {
      var self = this;
      if (enabled === true) {
        settings[App.GameBoy.Settings.ENABLE_SOUND] = true;
        if (gameboy) {
          gameboy.initSound();
        }
      } else {
        settings[App.GameBoy.Settings.ENABLE_SOUND] = false;
        if (gameboy) {
          gameboy.stopSound();
        }
      }
    },

    setSpeed: function(speed) {
      var self = this;
      self.speed = speed;
      if (gameboy) {
        gameboy.setSpeed(speed);
      }
    },

    pause: function() {
      var self = this;
      pause();
    },

    run: function() {
      var self = this;
      run();
    },

    save: function(callback) {
      var self = this;
      saveState("FREEZE");
      if (callback !== undefined) {
        callback(self.title, base64(generateBlob("SRAM", findValue("FREEZE"))));
      }
    },

    restore: function() {
      var self = this;
      openState("FREEZE", document.getElementById('LCD'));
    },

    keyDown: function(keycode) {
      var self = this;
      GameBoyJoyPadEvent(keycode, true);
    },

    keyUp: function(keycode) {
      var self = this;
      GameBoyJoyPadEvent(keycode, false);
    },

    clear: function() {
      var self = this;
      clearLastEmulation();
      self.data = undefined;
    },

    reset: function() {
      var self = this;
      return self._insertCartridge(self.identifier, self.data);
    },

    load: function(identifier) {
      var self = this;
      var deferred = $.Deferred();

      var reject = function(e) {
        self.logging.warning("Unable to load game");
        deferred.reject(e);
      };

      self.library.fetch(identifier).then(function(data) {
        self._insertCartridge(identifier, data).then(function() {
          deferred.resolve();
        }).fail(reject);
      }).fail(reject);

      return deferred.promise();
    },

    _insertCartridge: function(identifier, data) {
      var self = this;
      var deferred = $.Deferred();
      self.identifier = identifier;
      self.title = self.library.titleForIdentifier(identifier);
      self.data = data;

      loadSaveStateContext("game-" + identifier).then(function() {
        if (findValue("FREEZE")) {
          self.restore();
          deferred.resolve();
        } else {
          try {
            start(document.getElementById('LCD'), data, true);
            setTimeout(function() {
              if (gameboy) {
                gameboy.setSpeed(self.speed);
              }
              deferred.resolve();
            }, 100);
          } catch (e) {
            deferred.reject(e);
          }
        }
      });

      return deferred.promise();
    }

  });

})(jQuery);
