
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
      self.thumbnails = {};
      self.cache = [];
      self.changeCallbacks = [];
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

    thumbnailForIndex: function(index) {
      var self = this;
      var identifier = self.identifierForIndex(index);
      return self.thumbnailForIdentifier(identifier);
    },

    thumbnailForIdentifier: function(identifier) {
      var self = this;
      return self.thumbnails[identifier];
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

      // Update the thumbnails.
      self.thumbnails = {};
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var identifier = file.id;
        var parent = file.parents[0].id;
        var title = self.stripExtension(file.title) + ".jpg";
        console.log(parent + " " + title);

        self.drive.file(parent, title, {
          'onStart': function() {},
          'onSuccess': function(id) { return function(file) {
            if (file !== undefined) {
              self.thumbnails[id] = file.webContentLink;
              self.notifyChange();

              // TODO Cache the thumbnails.
              // var img = document.createElement('img');
              // img.src = 'data:image/gif;base64,R0lGODlhEAAOALMAAOazToeHh0tLS/7LZv/0jvb29t/f3//Ub//ge8WSLf/rhf/3kdbW1mxsbP//mf///yH5BAAAAAAALAAAAAAQAA4AAARe8L1Ekyky67QZ1hLnjM5UUde0ECwLJoExKcppV0aCcGCmTIHEIUEqjgaORCMxIC6e0CcguWw6aFjsVMkkIr7g77ZKPJjPZqIyd7sJAgVGoEGv2xsBxqNgYPj/gAwXEQA7';
              // img.src = file.webContentLink;
              // img.width = '100';
              // img.height = '100';
              // document.body.appendChild(img);
              // console.log(file);
              // downloadFile(file, function(data) {
              //   console.log(data);
              // });
              // window.btoa(xxx); ?
            }
          }}(identifier),
          'onError': function(error) {}
        });

      }

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
