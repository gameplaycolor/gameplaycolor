/*
 * Copyright (c) 2012-2024 Jason Morley
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
var saveState = {};

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
  saveState = {};

  var deferred = new jQuery.Deferred();
  window.app.store.propertiesForDomain(saveStateContext, function(properties) {

    for (var key in properties) {
      if (properties.hasOwnProperty(key)) {
        saveState[key] = properties[key];
      }
    }

    deferred.resolve();
  });
  return deferred.promise();
}

function setValue(key, value) {

  // JSON-encode the RTC as this cannot be stored in its default form.
  if (key.substring(0, 4) === "RTC_") {
    value = JSON.stringify(value);
  }

  var previous = saveState[key];
  if (previous !== value) {
    saveState[key] = value;
    window.app.setValue(saveStateContext, key, value);
  }

}

function deleteValue(key) {
  delete saveState[key];
  window.app.deleteValue(saveStateContext, key);
}

function findValue(key) {

  var value = saveState[key];

  // JSON-decode the RTC.
  if (value !== undefined && key.substring(0, 4) === "RTC_") {
    value = JSON.parse(value);
  }

  return value;
}

function startWrapper(identifier, canvas, ROM) {
  var deferred = jQuery.Deferred();
  loadSaveStateContext("game-" + identifier).then(function() {
    try {
      start(canvas, ROM, true);
      deferred.resolve();
    } catch (e) {
      deferred.reject(e);
    }
  });
  return deferred.promise();
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
      self.state = App.GameBoy.State.IDLE;
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

    onStateChange: function(callback) {
      var self = this;
      self.stateChangeCallbacks.push(callback);
    },

    setState: function(state) {
      var self = this;
      if (self.state !== state) {
        self.state = state;

        // Fire the state change callbacks.
        for (var i = 0; i < self.stateChangeCallbacks.length; i++) {
          var callback = self.stateChangeCallbacks[i];
          callback(state);
        }
      }
    },

    pause: function() {
      var self = this;
      pause();
    },

    run: function() {
      var self = this;
      // Do not attempt to run unless we have been in the running state.
      if (self.state === App.GameBoy.State.RUNNING) {
        run();
      }
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
      self.setState(App.GameBoy.State.IDLE);
    },

    reset: function() {
      var self = this;
      return self._insertCartridge(self.identifier, self.data);
    },

    load: function(identifier) {
      var self = this;
      var deferred = $.Deferred();

      var resetStateAndReject = function(e) {
        self.logging.warning("Unable to load game");
        self.setState(App.GameBoy.State.IDLE);
        deferred.reject(e);
      };

      self.library.fetch(identifier).then(function(data) {
        self._insertCartridge(identifier, data).then(function() {
          deferred.resolve();
        }).fail(resetStateAndReject);
      }).fail(resetStateAndReject);

      return deferred.promise();
    },

    _insertCartridge: function(identifier, data) {
      var self = this;
      var deferred = $.Deferred();
      self.identifier = identifier;
      self.data = data;
      startWrapper(identifier, document.getElementById('LCD'), data).then(function() {
        setTimeout(function() {
          if (gameboy) {
            gameboy.setSpeed(self.speed);
          }
          self.setState(App.GameBoy.State.RUNNING);
          deferred.resolve();
        }, 100);
      }).fail(function(e) {
        deferred.reject(e);
      });
      return deferred.promise();
    }

  });

})(jQuery);
