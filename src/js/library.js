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

  App.Library = function(store, callback) {
    this.init(store, callback);
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
      self.state = App.Library.State.UNINITIALIZED;
      self.items = [];
      self.thumbnails = {};
      self.changeCallbacks = [];
      self.stateChangeCallbacks = [];
      self.drive = App.Drive.getInstance();
      self.store = store;
      self.fetches = {};
      self.callback = callback;

      // We use a separate flag to track updates internally as
      // we need to be able to schedule updates in many different states
      // due to the asynchronous nature of the update.
      self.updatePending = false;

      // Handle Google Drive state changes to update our state.
      self.drive.onStateChange(function(state) {
        if (state === App.Drive.State.UNAUTHORIZED) {
          self.setState(App.Library.State.UNAUTHORIZED);
        } else if (state === App.Drive.State.READY) {
          self.setState(App.Library.State.READY);
        } else {
          self.setState(App.Library.State.LOADING);
        }
      });
      
      // Load the library.
      var library = localStorage.getItem('library');
      if (library) {
        self.items = jQuery.parseJSON(library);
      }

      self.sort();
      
    },

    authorize: function() {
      var self = this;
      self.drive.authorize(false);
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

    // Very rudimentary mechanism to strip the file extension (Google Drive doesn't
    // seem to guarantee file extensions in the file title).
    stripExtension: function(title) {
      var self = this;
      return title.slice(0, title.lastIndexOf("."));
    },

    availableOffline: function(index) {
      var self = this;
      var identifier = self.identifierForIndex(index);
      var data = localStorage.getItem(identifier);
      if (data !== null) {
        return true;
      }
      return false;
    },

    elementForIndex: function(index) {
      var self = this;
      var game = $('<div class="game">');
      var identifier = self.identifierForIndex(index);
      self.store.hasProperty(App.Controller.Domain.GAMES, identifier).then(function(result) {
        if (result) {
          game.addClass('downloaded');
        }
      });
      return game;
    },

    identifierForIndex: function(index) {
      var self = this;
      var file = self.items[index];
      return file.id;
    },

    thumbnailForIndex: function(index, callback) {
      var self = this;
      var identifier = self.identifierForIndex(index);
      self.thumbnailForIdentifier(identifier, callback);
    },

    // Returns the thumbnail for a given identifier.
    // Triggers a fetch from the cache if the thumbnail is not present.
    thumbnailForIdentifier: function(identifier, callback) {
      var self = this;
      if (identifier in self.thumbnails) {
        callback(self.thumbnails[identifier]);
      } else {
        self.store.property(App.Controller.Domain.THUMBNAILS, identifier, function(value) {
          if (value !== undefined) {
            self.thumbnails[identifier] = self.thumbnailDataUrl(value);
            callback(self.thumbnails[identifier]);
          }
        });
      }
    },

    didSelectItemForRow: function(index, element) {
      var self = this;
      var identifier = self.identifierForIndex(index);
      var title = self.titleForIndex(index);
      self.store.hasProperty(App.Controller.Domain.GAMES, identifier).then(function(found) {
        if (found) {
          self.callback(identifier, title);
        } else {
          self.fetch(identifier).then(function(data) {
            console.log("Received identifier '" + identifier + "'");
            element.addClass("downloaded");
          });
        }
      });

    },
    
    update: function() {
      var self = this;
      // Only schedule a new update if we're not already updating.
      if (self.updatePending === false) {
        self.drive.files({
          'onStart': function() {
            self.setState(App.Library.State.UPDATING);
          },
          'onSuccess': function(files) {
            self.updateCallback(files);
          },
          'onError': function(error) {
            self.setState(App.Library.State.READY);
          }
        });
      }
    },

    fileForIdentifier: function(identifier) {
      var self = this;
      for (var i = 0; i < self.items.length; i++) {
        var file = self.items[i];
        if (file.id === identifier) {
          return file;
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

      console.log("Fetching identifier '" + identifier + "'");

      window.app.store.property(App.Controller.Domain.GAMES, identifier, function(data) {
        if (data === undefined) {
          console.log("Fetching '" + identifier + "'");
          var file = self.fileForIdentifier(identifier);
          downloadFile(file, function(data) {
            window.app.store.setProperty(App.Controller.Domain.GAMES, identifier, utilities.btoa(data));
            delete self.fetches[identifier];
            deferred.resolve(data);
          });
        } else {
          console.log("Using cached value for '" + identifier + "'");
          delete self.fetches[identifier];
          deferred.resolve(utilities.atob(data));
        }
      });

      return deferred.promise();
    },

    // Converts a base64 encoded thumbnail image into a suitable URL.
    thumbnailDataUrl: function(data) {
      var self = this;
      return "data:image/" + App.Library.THUMBNAIL_TYPE + ";base64," + data;
    },

    thumbnail: function(index, callback) {
      var self = this;
      var identifier = self.identifierForIndex(index);

      self.store.property(App.Controller.Domain.THUMBNAILS, identifier, function(value) {
        if (value !== undefined) {
          self.thumbnails[identifier] = self.thumbnailDataUrl(value);
          callback(self.thumbnails[identifier]);
        } else {

          file = self.fileForIdentifier(identifier);

          // Some files do not seem to have a valid parents array.
          // If they do not, then there is no reasonable way to hunt for a thumbnail.
          var parents = file.parents[0];
          if (parents === undefined) {
            return;
          }
          
          var parent = file.parents[0].id;
          var title = self.stripExtension(file.title) + "." + App.Library.THUMBNAIL_TYPE;

          console.log("Fetching " + title + " ...");

          self.drive.file(parent, title, {
            'onStart': function() {},
            'onSuccess': function(file) {
              if (file !== undefined) {
                downloadFileBase64(file, function(data) {
                  try {
                    self.store.setProperty(App.Controller.Domain.THUMBNAILS, identifier, data);
                  } catch (e) {
                    console.log("Unable to store thumbnail.");
                  }
                  self.thumbnails[identifier] = self.thumbnailDataUrl(data);
                  callback(self.thumbnails[identifier]);
                });
              } else {
                callback();
              }
            },
            'onError': function(error) {
              callback();
            }
          });
        }
      });

    },

    // Checks to see if there is a cached thumbnail.  If no thumbnail has been cached,
    // one will be fetched from Google Drive if it's available.
    // This implementation caches all thumbnails in memory.  It's possible that this will
    // introduce performance issues, but it doesn't seem worthwhile loading everything lazily
    // at this stage.
    updateThumbnail: function(file, callback) {
      var self = this;

      var identifier = file.id;

      // Some files do not seem to have a valid parents array.
      // If they do not, then there is no reasonable way to hunt for a thumbnail.
      var parents = file.parents[0];
      if (parents === undefined) {
        return;
      }
      
      var parent = file.parents[0].id;
      var title = self.stripExtension(file.title) + "." + App.Library.THUMBNAIL_TYPE;

      // Don't bother re-fetching a thumbnail if we've already cached it.
      if (identifier in self.thumbnails) {
        return;
      }

      // Check the cache.
      self.store.property(App.Controller.Domain.THUMBNAILS, identifier, function(value) {
        if (value !== undefined) {
          self.thumbnails[identifier] = self.thumbnailDataUrl(value);
          callback();
        } else {
          self.drive.file(parent, title, {
            'onStart': function() {},
            'onSuccess': function(file) {
              if (file !== undefined) {
                downloadFileBase64(file, function(data) {
                  self.store.setProperty(App.Controller.Domain.THUMBNAILS, identifier, data);
                  self.thumbnails[identifier] = self.thumbnailDataUrl(data);
                  self.notifyChange();
                });
              }
              callback();
            },
            'onError': function(error) {
              callback();
            }
          });
        }
      });

    },

    updateCallback: function(files) {
      var self = this;
      var i;

      // Create an associative array of identifiers which are currently in the store.
      var deletedIdentifiers = {};
      for (i = 0; i < self.items.length; i++) {
        var identifier = self.items[i].id;
        deletedIdentifiers[identifier] = true;
      }

      // Update the thumbnails.
      for (i = 0; i < files.length; i++) {
        self.updateThumbnail(files[i], function() {});
      }

      // Reset the update flag.
      self.updatePending = false;

      // Update the files.
      self.items = [];
      for (i = 0; i < files.length; i++) {
        var file = files[i];
        if (file.fileExtension === 'gb' ||
            file.fileExtension === 'gbc') {
          // Cache the file.
          self.items.push(file);
          // Remove the item from the list of deleted identifiers.
          delete deletedIdentifiers[file.id];
        }
      }
      self.sort();
      self.save();

      // Clean up the deleted items.
      for (var key in deletedIdentifiers) {
        if (deletedIdentifiers.hasOwnProperty(key)) {
          localStorage.removeItem(key);
          self.store.deleteProperty(key);
        }
      }

      self.setState(App.Library.State.READY);
      self.notifyChange();
    }

  });

})(jQuery);
