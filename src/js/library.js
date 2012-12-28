
(function($) {

  App.Library = function(callbacks) {
    this.init(callbacks);
  };

  jQuery.extend(
    App.Library.prototype, {

    init: function(callbacks) {
      var self = this;
      self.items = new Array();
      self.cache = new Array();
      self.callbacks = callbacks;
      
      // Load the library.
      var library = localStorage.getItem('library');
      if (library) {
        self.items = jQuery.parseJSON(library);
        self.cache = jQuery.parseJSON(library);
        console.log(self.items);
      }

      self.sort();
      
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

      // Update the files.
      App.Drive.getInstance().files(function(result) {
        if (result) {
          self.items = new Array();
          for (var i=0; i<result.length; i++) {
            var file = result[i];
            if (file.fileExtension === 'gb') {
              self.items.push(file);
            }
          }
          self.sort();
        }
        self.callbacks.onUpdate();
      });
            
    },

  });

})(jQuery);
