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

(function($) {

  App.Library = function(store, callback, postInitCallback) {
    this.init(store, callback, postInitCallback);
  };

  App.Library.State = {
    UNINITIALIZED: 0,
    LOADING: 1,
    UNAUTHORIZED: 2,
    UPDATING: 3,
    READY: 4
  };

  App.Library.THUMBNAIL_TYPE = "jpg";

  jQuery.extend(
    App.Library.prototype, {
    init: function(store, callback) {
      var self = this;
      self.store = store;
      self.callback = callback;
      self.state = App.Library.State.UNINITIALIZED;
      self.fetches = {};
      self.changeCallbacks = [];
      self.stateChangeCallbacks = [];

      var library = localStorage.getItem('library');
      if (library) {
        self.items = jQuery.parseJSON(library);
      } else {
        self.items = [];
      }
      self.sort();

      self.logging = new App.Logging(window.config.logging_level, "library");
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

    onChange: function(callback) {
      var self = this;
      self.changeCallbacks.push(callback);
    },

    notifyChange: function() {
      var self = this;
      for (var i = 0; i < self.changeCallbacks.length; i++) {
        var callback = self.changeCallbacks[i];
        callback();
      }
    },

    sort: function() {
      var self = this;
      self.items.sort(function(a, b) {
        return a['title'].toLowerCase() > b['title'].toLowerCase() ? 1 : -1;
      });
    },

    save: function() {
      var self = this;
      localStorage.setItem('library', JSON.stringify(self.items));
    },

    count: function() {
      var self = this;
      return self.items.length;
    },

    titleForIndex: function(index) {
      var self = this;
      var file = self.items[index];
      return self.stripExtension(file.title);
    },

    titleForIdentifier: function(identifier) {
      var self = this;
      var index = self.indexForIdentifier(identifier);
      if (index === undefined) {
        return undefined;
      }
      return self.titleForIndex(index);
    },

    // Very rudimentary mechanism to strip the file extension (Google Drive doesn't
    // seem to guarantee file extensions in the file title).
    stripExtension: function(title) {
      var self = this;
      return title.slice(0, title.lastIndexOf("."));
    },

    elementForIndex: function(index) {
      var self = this;
      var identifier = self.identifierForIndex(index);
      var title = self.titleForIndex(index);

      var element = $(' \
<div class="cartridge-container unavailable"> \
  <div class="cartridge"> \
      <div class="top"></div> \
      <div class="logo"></div> \
      <div class="lines"> \
          <div class="bar left one"></div> \
          <div class="bar left two"></div> \
          <div class="bar left three"></div> \
          <div class="bar left four"></div> \
          <div class="bar right one"></div> \
          <div class="bar right two"></div> \
          <div class="bar right three"></div> \
          <div class="bar right four"></div> \
      </div> \
      <div class="inset"> \
          <div class="label"> \
              <div class="info-title info right"></div> \
              <div class="info left">This Side Out</div> \
              <div class="title-large"></div> \
              <img class="cover" /> \
          </div> \
      </div> \
      <div class="edge left"></div> \
      <div class="edge right"></div> \
      <div class="arrow"></div> \
  </div> \
</div> \
');

      var cartridgeColors = {
        "yellow": "orange",
        "jaune": "orange",
        "amarillo": "orange",
        "red": "red",
        "blue": "blue",
        "gold": "gold",
        "crystal": "crystal",
        "cristal": "crystal",
      }

      var cartridge = $(element.get(0).getElementsByClassName('cartridge')[0]);
      var infoTitleElement = $(element.get(0).getElementsByClassName('info-title')[0]);
      var titleLargeElement = $(element.get(0).getElementsByClassName('title-large')[0]);
      var cover = $(element.get(0).getElementsByClassName('cover')[0]);

      var lowerCaseTitle = title.toLowerCase();
      for (var key in cartridgeColors) {
        if (cartridgeColors.hasOwnProperty(key)) {
          if (lowerCaseTitle.indexOf(key) > -1) {
            cartridge.addClass(cartridgeColors[key]);
          }
        }
      }

      infoTitleElement.html(title);
      titleLargeElement.html(title);

      self.thumbnailForIndex(index, function(thumbnail) {
        if (thumbnail !== undefined) {
          titleLargeElement.hide();
          cover.attr("src", thumbnail);
        }
      });

      self.store.hasProperty(App.Controller.Domain.GAMES, identifier).then(function(result) {
        if (result) {
          element.removeClass('unavailable');
        }
      });

      return element;
    },

    identifierForIndex: function(index) {
      var self = this;
      var file = self.items[index];
      return file.id;
    },

    didSelectItemForRow: function(index, element) {
      var self = this;
      var identifier = self.identifierForIndex(index);
      self.logging.info("Did select item for row " + index + " (" + identifier + ")");
      self.store.hasProperty(App.Controller.Domain.GAMES, identifier).then(function(found) {
        if (found) {
          self.callback(identifier);
        }
      });
    },

    didLongPressItem: function(index, element) {
      var self = this;
      var identifier = self.identifierForIndex(index);
      var title = self.titleForIndex(index);
      if (confirm("Remove '" + title + "' from your device?")) {
        self.store.deleteProperty(App.Controller.Domain.GAMES, identifier)
          .then(self.store.deleteProperty(App.Controller.Domain.THUMBNAILS, identifier))
          .then(function() {
            console.log("Deleting game from store.");
          })
          .always(function() {
            console.log("NOTIFY!!");
            self.items = self.items.filter(function(item) {
              return item.id !== identifier;
            });
            self.save();
            self.notifyChange();
          });

        element.addClass("unavailable");
      }
    },

    fileForIdentifier: function(identifier) {
      var self = this;
      var index = self.indexForIdentifier(identifier);
      if (index === undefined) {
        self.logging.warning("Unable to find file for identifier '" + identifier + "'");
        return undefined;
      }
      return self.items[index];
    },

    indexForIdentifier: function(identifier) {
      var self = this;
      for (var i = 0; i < self.items.length; i++) {
        var file = self.items[i];
        if (file.id === identifier) {
          return i;
        }
      }
      return undefined;
    },

    identifierForBasename: function(basename) {
      var self = this;
      for (var i = 0; i < self.items.length; i++) {
        var file = self.items[i];
        if (utilities.basename(file.title) === basename) {
          return file.id;
        }
      }
      return undefined;
    },

    fetch: function(identifier) {
      var self = this;

      // Check to see if there's an existing fetch.
      if (self.fetches.hasOwnProperty(identifier)) {
        return self.fetches[identifier].promise();
      }

      var deferred = new jQuery.Deferred();
      self.fetches[identifier] = deferred;

      self.logging.info("Loading game with identifier '" + identifier + "'");

      self.store.property(App.Controller.Domain.GAMES, identifier, function(data) {

        // Guard against seemingly corrupt ROMs.
        // It's unclear how this might happen but we need to do something to protect against this behaviour.
        if (data !== undefined && data.length < 100) {
          self.logging.warning("Dropping seemingly corrupt game for identifier '" + identifier + "'");
          self.store.deleteProperty(App.Controller.Domain.GAMES, identifier);
        }

        if (data !== undefined && data.length > 100) {
          self.logging.info("Using locally stored game for '" + identifier + "' with length " + data.length);
          delete self.fetches[identifier];
          deferred.resolve(utilities.atob(data));
          return
        }

        deferred.reject();
      });

      return deferred.promise();
    },

    // Converts a base64 encoded thumbnail image into a suitable URL.
    thumbnailDataUrl: function(data) {
      var self = this;
      if (data.startsWith("data:")) {
        return data;
      } else {
        return "data:image/" + App.Library.THUMBNAIL_TYPE + ";base64," + data;
      }
    },

    thumbnailForIndex: function(index, callback) {
      var self = this;
      var identifier = self.identifierForIndex(index);
      self.store.property(App.Controller.Domain.THUMBNAILS, identifier, function(value) {
        if (value !== undefined) {
          callback(self.thumbnailDataUrl(value));
          return;
        }
        callback();
      });
    },

    addROM: function(filename, arrayBuffer) {
      var self = this;
      console.log("Adding ROM...");
      return self.sha256(arrayBuffer).then(function(identifier) {

        // Data.
        const binaryString = utilities.arrayBufferToBinaryString(arrayBuffer);

        // Add.
        self.items.push({
          id: identifier,
          title: filename,
          fileExtension: utilities.fileExtension(filename),
        });
        self.sort();
        self.save();
        self.notifyChange();

        // Store the ROM.
        return self.store.setProperty(App.Controller.Domain.GAMES, identifier, utilities.btoa(binaryString));
      });
    },

    addThumbnail: function(filename, arrayBuffer) {
      var self = this;
      console.log("Adding thumbnail...");
      const basename = utilities.basename(filename);
      const identifier = self.identifierForBasename(basename);

      if (identifier === undefined) {
        alert("Unable to find ROM named '" + basename + "'.");
        return;
      }

      const base64String = utilities.arrayBufferToBase64(arrayBuffer);
      const url = "data:image/" + utilities.fileExtension(filename) + ";base64," + base64String;

      return self.store.setProperty(App.Controller.Domain.THUMBNAILS, identifier, url);
    },

    sha256: function(arrayBuffer) {
      var deferred = new jQuery.Deferred();
      var foo = crypto.subtle.digest('SHA-256', arrayBuffer).then(function(hashBuffer) {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        let sha = window.btoa(utilities.arrayBufferToBinaryString(hashArray));
        deferred.resolve(sha);
      });
      return deferred.promise();
    },

    // TODO: Utilities?
    readAsArrayBuffer: function(file) {
      const reader = new FileReader();
      var deferred = new jQuery.Deferred();
      reader.onload = function(e) {
        deferred.resolve(e.target.result);
      };
      reader.onerror = function(e) {
        deferred.reject(e);
      };
      reader.readAsArrayBuffer(file);
      return deferred.promise();
    },

    add: function(files) {
      var self = this;

      var roms = files.filter(function(file) {
        var extension = utilities.fileExtension(file.name);
        return extension === 'gb' || extension === 'gbc';
      });

      var thumbnails = files.filter(function(file) {
        var extension = utilities.fileExtension(file.name);
        return extension === 'jpg' || extension === 'jpeg' || extension === 'png' || extension === 'webp';
      });

      var romAdditions = roms.map(function(rom) {
        const name = rom.name;
        return self.readAsArrayBuffer(rom)
          .then(function(arrayBuffer) {
            return self.addROM(name, arrayBuffer);
          });
      });

      jQuery.when.apply(null, romAdditions)
        .then(function() {
          var thumbnailAdditions = thumbnails.map(function(thumbnail) {
            const name = thumbnail.name;
            return self.readAsArrayBuffer(thumbnail)
              .then(function(arrayBuffer) {
                return self.addThumbnail(name, arrayBuffer);
              });
          });
          return jQuery.when.apply(null, thumbnailAdditions);
        })
        .then(function() {
          self.notifyChange();
        });

    },

  });

})(jQuery);
