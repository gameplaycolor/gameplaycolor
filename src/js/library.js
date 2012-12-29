
(function($) {

  App.Library = function() {
    this.init();
  };

  App.Library.State = {
    UNINITIALIZED: 0,
    LOADING: 1,
    UNAUTHORIZED: 2,
    UPDATING: 3,
    READY: 4
  };

  jQuery.extend(
    App.Library.prototype, {

    init: function() {
      var self = this;
      self.state = App.Library.State.UNINITIALIZED;
      self.items = [];
      self.cache = [];
      self.stateChangeCallbacks = [];
      self.drive = App.Drive.getInstance();

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
        self.cache = jQuery.parseJSON(library);
        console.log(self.items);
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

    sort: function() {
      var self = this;
      self.items.sort(function(a, b) {
        return a['title'].toLowerCase() > b['title'].toLowerCase() ? 1 : -1;
      });
    },
    
    count: function() {
      var self = this;
      return self.items.length;
    },
    
    titleForIndex: function(index) {
      var self = this;
      var file = self.items[index];

      // Very rudimentary mechanism to strip the file extension (Google Drive doesn't
      // guarantee file extensions in the file title).
      var title = file.title;
      if (title.toLowerCase().indexOf(".gb") === (title.length - 3)) {
        return title.slice(0, -3);
      } else {
        return title;
      }
    },

    identifierForIndex: function(index) {
      var self = this;
      var file = self.items[index];
      return file.id;
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
            // Ignore the error.
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

    fetch: function(identifier, callback) {
      var self = this;

      // Only attempt to download the file if it hasn't already been cached.
      var data = localStorage.getItem(identifier);
      if (data) {
        callback(data);
      } else {
        var file = self.fileForIdentifier(identifier);
        downloadFile(file, function(data) {
          self.cache.push(file);
          localStorage.setItem(file.id, data);
          localStorage.setItem('library', JSON.stringify(self.cache));
          callback(data);
        });
      }
    },

    updateCallback: function(files) {
      var self = this;

      // Reset the update flag.
      self.updatePending = false;

      // Update the files.
      self.items = [];
      for (var i=0; i<files.length; i++) {
        var file = files[i];
        if (file.fileExtension === 'gb') {
          self.items.push(file);
        }
      }
      self.sort();

      self.setState(App.Library.State.READY);
    }

  });

})(jQuery);
