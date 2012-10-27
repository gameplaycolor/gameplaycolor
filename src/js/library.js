
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
        self.items = library;
        self.cache = library;
        self.callbacks.onUpdate();
      }
      
    },
    
    count: function() {
      var self = this;
      return self.items.length;
    },
    
    titleForIndex: function(index) {
      var self = this;
      var file = self.items[index];
      return file.title;
    },
    
    didSelectItemForRow: function(index) {
      var self = this;
      var file = self.items[index];
      
      // Only attempt to download the file if it hasn't already been cached.
      var data = localStorage.getItem(file.id);
      if (data) {
        self.callbacks.onLoad(data);
      } else {
        downloadFile(file, function(data) {
          self.cache.push(file);
          localStorage.setItem(file.id, data);
          localStorage.setItem('library', self.cache);
          self.callbacks.onLoad(data);
        });
      
      }      
    },
    
    update: function() {
      var self = this;
      
      // Update the files.
      retrieveAllFiles(function(result) {
        self.items = new Array();
        for (var i=0; i<result.length; i++) {
          var file = result[i];
          if (file.fileExtension == 'gb') {
            self.items.push(file);
          }
        }
        self.callbacks.onUpdate();
      });
            
    },

  });

})(jQuery);
