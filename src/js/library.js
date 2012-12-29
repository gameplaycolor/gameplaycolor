
(function($) {

  App.Library = function(callbacks) {
    this.init(callbacks);
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

    init: function(callbacks) {
      var self = this;
      self.state = App.Library.State.UNINITIALIZED;
      self.items = [];
      self.cache = [];
      self.callbacks = callbacks;

      // We use a separate flag to track updates internally as
      // we need to be able to schedule updates in many different states
      // due to the asynchronous nature of the update.
      self.updatePending = false;

      // Handle Google Drive state changes to update our state.
      App.Drive.getInstance().onStateChange(function(state) {
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

    setState: function(state) {
      var self = this;
      if (self.state !== state) {
        self.state = state;
        console.log("Library State: " + self.state);
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
      return file.title.slice(0, -3);
    },
    
    didSelectItemForRow: function(index) {
      var self = this;
      var file = self.items[index];
      
      // Store the name of the file we're playing.
      // TODO This is very much the wrong place to do this.
      window.app.store.setProperty(App.Store.Property.GAME, file.id);
      
      // Only attempt to download the file if it hasn't already been cached.
      var data = localStorage.getItem(file.id);
      if (data) {
        self.callbacks.onLoad(data);
      } else {
        downloadFile(file, function(data) {
          self.cache.push(file);
          localStorage.setItem(file.id, data);
          localStorage.setItem('library', JSON.stringify(self.cache));
          self.callbacks.onLoad(data);
        });
      
      }
    },
    
    update: function() {
      var self = this;
      // Only schedule a new update if we're not already updating.
      if (self.updatePending === false) {
        App.Drive.getInstance().files({
          'onStart': function() {
            self.setState(App.Library.State.UPDATING);
          },
          'onSuccess': function(files) {
            self.updateCallback(files);
          },
          'onError': function(error) {
            // TODO Handle the error.
            console.log("Error: " + error);
            self.setState(App.Library.State.READY);
          }
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
      self.callbacks.onUpdate();
    }

  });

})(jQuery);
