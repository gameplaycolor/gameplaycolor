
(function($) {

  App.Library = function(callback) {
    this.init(callback);
  };

  jQuery.extend(
    App.Library.prototype, {

    init: function(callback) {
      var self = this;
      self.items = new Array();
      self.cache = new Array();
      self.callback = callback;
      
      // Load the library.
      var library = localStorage.getItem('library');
      if (library) {
        self.items = library;
        self.cache = library;
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
        self.callback(data);
      } else {
        downloadFile(file, function(data) {
          self.cache.push(file);
          localStorage.setItem(file.id, data);
          localStorage.setItem('library', self.cache);
          self.callback(data);
        });
      
      }      
    },
    
    update: function(callback) {
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
        callback();
      });
            
    },

  });

})(jQuery);
