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

  App.GameBoy = function(store, library) {
    this.init(store, library);
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
      gb_Pause();
    },

    run: function() {
      var self = this;
      // Do not attempt to run unless we have been in the running state.
      if (self.state === App.GameBoy.State.RUNNING) {
        gb_Run();
      }
    },

    keyDown: function(keycode) {
      var self = this;
      var e = { 'which': keycode, 'preventDefault': function() {} };
      gb_OnKeyDown_Event(e);
    },

    keyUp: function(keycode) {
      var self = this;
      var e = { 'which': keycode, 'preventDefault': function() {} };
      gb_OnKeyUp_Event(e);
    },

    load: function(identifier) {
      var self = this;

      self.setState(App.GameBoy.State.LOADING);

      // Store the name of the file we're playing.
      window.app.store.setProperty(App.Store.Property.GAME, identifier);

      // Fetch the file.
      var file = self.library.fetch(identifier, function(data) {
        self.insertCartridge(data);
        self.setState(App.GameBoy.State.RUNNING);
      });

    },

    insertCartridge: function(data) {
      var self = this;
      gb_Insert_Cartridge_Data(data, true);
      self.setState(App.GameBoy.State.RUNNING);
    }

  });

})(jQuery);

Gameboy = {};

Gameboy.Key = {
  START: 65,
  SELECT: 83,
  A: 88,
  B: 90,
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39
};

function gb_Show_Fps() {}

function gb_KeyDown(keycode) {
  var e = { 'which': keycode, 'preventDefault': function() {} };
  gb_OnKeyDown_Event(e);
}

function gb_KeyUp(keycode) {
  var e = { 'which': keycode, 'preventDefault': function() {} };
  gb_OnKeyUp_Event(e);
}
