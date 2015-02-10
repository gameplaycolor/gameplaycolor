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
      // self.drive.onStateChange(function(state) {
      //   if (state === App.Drive.State.UNAUTHORIZED) {
      //     self.setState(App.Library.State.UNAUTHORIZED);
      //   } else if (state === App.Drive.State.READY) {
      //     self.setState(App.Library.State.READY);
      //   } else {
      //     self.setState(App.Library.State.LOADING);
      //   }
      // });
      
      // Load the library.
      var library = localStorage.getItem('library');
      if (library) {
        self.items = jQuery.parseJSON(library);
      }

      self.sort();
 
      self.drive.checkAuthentication().fail(function() {
        self.drive.signIn();
      });
      
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

      var element = $('<div class="game">');
      element.spinner = false;

      var gameTitle = $('<div class="game-title">');
      gameTitle.html(title);
      element.append(gameTitle);

      var gameImg = $('<img class="game-thumbnail">');
      element.append(gameImg);

      var gameOverlay = $('<div class="game-overlay">');
      element.append(gameOverlay);

      self.store.hasProperty(App.Controller.Domain.GAMES, identifier).then(function(result) {
        if (result) {
          element.addClass('downloaded');
        }
      });

      self.thumbnailForIndex(index, function(thumbnail) {
        if (thumbnail !== undefined) {
          gameImg.attr("src", thumbnail);
          gameTitle.css('display', 'none');
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
      self.store.hasProperty(App.Controller.Domain.GAMES, identifier).then(function(found) {
        if (found) {
          self.callback(identifier);
        } else if (window.navigator.onLine === true) {
          var spinner;
          if (element.spinner === false) {
            var opts = {
              color: '#fff',
              zIndex: 0
            };
            spinner = new Spinner(opts).spin();
            var spinnerElement = spinner.el;
            element.append(spinnerElement);
            element.spinner = true;
          }
          self.fetch(identifier).then(function(data) {
            console.log("Received identifier '" + identifier + "'");
            element.addClass("downloaded");
            if (spinner !== undefined) {
              spinner.stop();
              element.spinner = false;
            }
          });
        }
      });
    },
    
    update: function() {
      var self = this;
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
      var index = self.indexForIdentifier(identifier);
      if (index === undefined) {
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

    fetch: function(identifier) {
      var self = this;

      // Check to see if there's an existing fetch.
      if (self.fetches.hasOwnProperty(identifier)) {
        return self.fetches[identifier].promise();
      }

      var deferred = new jQuery.Deferred();
      self.fetches[identifier] = deferred;

      console.log("Fetching identifier '" + identifier + "'");

      self.store.property(App.Controller.Domain.GAMES, identifier, function(data) {
        if (data === undefined) {
          console.log("Fetching '" + identifier + "'");
          var file = self.fileForIdentifier(identifier);
          downloadFile(file, function(data) {
            self.store.setProperty(App.Controller.Domain.GAMES, identifier, utilities.btoa(data));
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

    thumbnailForIndex: function(index, callback) {
      var self = this;
      var identifier = self.identifierForIndex(index);

      self.store.property(App.Controller.Domain.THUMBNAILS, identifier, function(value) {

        if (value !== undefined) {
          callback(self.thumbnailDataUrl(value));
          return;
        }

        file = self.fileForIdentifier(identifier);
        var parents = file.parents[0];
        if (parents === undefined) {
          return;
        }
        
        var parent = file.parents[0].id;
        var title = self.stripExtension(file.title) + "." + App.Library.THUMBNAIL_TYPE;

        console.log("Fetching " + title + " ...");

        self.drive.file(parent, title, {
          onStart: function() {},
          onSuccess: function(file) {
            if (file !== undefined) {
              downloadFileBase64(file, function(data) {
                try {
                  self.store.setProperty(App.Controller.Domain.THUMBNAILS, identifier, data);
                } catch (e) {
                  console.log("Unable to store thumbnail.");
                }
                callback(self.thumbnailDataUrl(data));
              });
            } else {
              callback();
            }
          },
          onError: function(error) {
            callback();
          }
        });

      });

    },

    updateCallback: function(files) {
      var self = this;
      var i;

      self.updatePending = false;

      var identifiers = {};
      $.each(self.items, function(index, value) {
        identifiers[value.id] = value.title;
      });

      var deleted = identifiers;
      var inserted = {};
      var renamed = {};
      var oldItems = self.items;
      self.items = [];
      for (i = 0; i < files.length; i++) {
        var file = files[i];
        if (file.fileExtension === 'gb' || file.fileExtension === 'gbc') {
          self.items.push(file);
          if (file.id in deleted) {
            if (deleted[file.id] != file.title) {
              renamed[file.id] = file.title;
            }
            delete deleted[file.id];
          } else {
            inserted[file.id] = file.title;
          }
        }
      }
      self.sort();
      self.save();

      var deletedCount = 0;
      $.each(deleted, function(key, value) {
        console.log("Deleting game for " + key);
        self.store.deleteProperty(App.Controller.Domain.GAMES, key);
        console.log("Deleting thumbnail for " + key);
        self.store.deleteProperty(App.Controller.Domain.THUMBNAILS, key);
        deletedCount++;
      });

      var insertedCount = 0;
      $.each(inserted, function(key, value) {
        insertedCount++;
      });

      var renamedCount = 0;
      $.each(renamed, function(key, value) {
        console.log("Deleting thumbnail for " + key);
        self.store.deleteProperty(App.Controller.Domain.THUMBNAILS, key);
        renamedCount++;
      });

      self.setState(App.Library.State.READY);

      if (deletedCount > 0 || insertedCount > 0 || renamedCount > 0) {
        self.notifyChange();
      }

    }

  });

})(jQuery);
