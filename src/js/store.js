
(function($) {

  App.Store = function () {
    this.init();
  };
  
  App.Store.Property = {
    STATE: 0
  };
  
  jQuery.extend(App.Store.prototype, {

    init: function () {
      var self = this;
      self.database = undefined;
      
      try {
  	    if (!window.openDatabase) {
	        alert('Databases are not supported in this browser.');
        } else {
          self.database = openDatabase('gameboy', '1.0', 'Game Boy Database', 100000);
          self.createTables()
  	    }
    	} catch(e) {
  	    if (e == 2) {
	        // Version number mismatch.
	        console.log("Invalid database version.");
  	    } else {
	        console.log("Unknown error "+e+".");
  	    }
    	}
    	
    },
    
    createTables: function() {
      var self = this;
      self.database.transaction(
        function(transaction) {
          transaction.executeSql("CREATE TABLE IF NOT EXISTS\
                                    properties(\
                                      key INTEGER NOT NULL PRIMARY KEY,\
                                      value TEXT NOT NULL\
                                    );");
        }
      );      
    },
    
    setProperty: function(key, value) {
      var self = this;
      self.database.transaction(
        function(transaction) {
          transaction.executeSql("INSERT OR REPLACE INTO properties (key, value) VALUES (" + key + ", '" + value + "')");
        }
      );
    },
    
    property: function(key, callback) {
      var self = this;
      self.database.transaction(function(tx) {
        tx.executeSql(
          "SELECT * FROM properties WHERE key = " + key,
          [],
          function(transaction, results) {
            if (results.rows.length > 0) {
              callback(results.rows.item(0).value);
            }
          },
          function(error) {
            console.log("ERROR");
            console.log(error);
          }
        );
      });  
    }

  });

})(jQuery);
