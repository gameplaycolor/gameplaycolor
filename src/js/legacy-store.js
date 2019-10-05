/*
 * Copyright (C) 2012-2016 InSeven Limited.
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
  App.LegacyStore = function(name) {
    this.init(name);
  };

  App.LegacyStore.Property = {
    STATE: 0,
    GAME: 1,
    COLOR: 2,
    SPEED: 4
  };

  jQuery.extend(App.LegacyStore.prototype, {
    init: function(name, size) {
      var self = this;
      self.name = name;
      self.database = undefined;
      self.debug = false;
      self.size = size;
      self.logging = new App.Logging(window.config.logging_level, "store");
    },

    /**
     * Open the storage.
     *
     * true if successful. false otherwise.
     */
    open: function() {
      var self = this;
      try {
        if (!window.openDatabase) {
          alert("Databases are not supported in this browser.");
          return false;
        }

        self.database = openDatabase(
          self.name,
          "1.0",
          self.name,
          self.size * 1024 * 1024
        );
        if (self.database === undefined) {
          self.logging.error("Unable to create database");
          return false;
        }

        self.createTables();
        return true;
      } catch (e) {
        if (e == 2) {
          self.logging.error("Invalid database version.");
        } else {
          self.logging.error("Unknown error " + e + ".");
        }
        return false;
      }
    },

    /**
     * Perform a transaction on the database using the common error handler.
     */
    transaction: function(callback, description) {
      var self = this;
      self.database.transaction(callback, function(error) {
        self.logging.error(
          description +
            ": Failed to access storage named '" +
            self.name +
            "' with error  '" +
            error.message +
            "' (" +
            error.code +
            ")"
        );
      });
    },

    createTables: function() {
      var self = this;
      self.transaction(function(transaction) {
        transaction.executeSql(
          "CREATE TABLE IF NOT EXISTS " +
            "properties ( " +
            "id INTEGER PRIMARY KEY," +
            "domain TEXT NOT NULL," +
            "key TEXT NOT NULL," +
            "value BLOB NOT NULL" +
            ")"
        );
      }, "Creating database tables");
    },

    setProperty: function(domain, key, value) {
      var self = this;
      self.logging.debug(
        "Setting property '" + key + "' for domain '" + domain + "'"
      );
      self.transaction(function(transaction) {
        transaction.executeSql(
          "DELETE FROM properties WHERE domain = ? AND key = ?",
          [domain, key]
        );
        transaction.executeSql(
          "INSERT OR REPLACE INTO properties (domain, key, value) VALUES (?, ?, ?)",
          [domain, key, value]
        );
      }, "Setting property '" + key + "'");
    },

    property: function(domain, key, callback) {
      var self = this;
      self.logging.debug(
        "Reading property '" + key + "' for domain '" + domain + "'"
      );
      self.transaction(function(transaction) {
        transaction.executeSql(
          "SELECT * FROM properties WHERE domain = ? AND key = ?",
          [domain, key],
          function(transaction, results) {
            if (results.rows.length > 0) {
              self.logging.debug(
                "Found property '" +
                  key +
                  "' for domain '" +
                  domain +
                  "' with length " +
                  results.rows.item(0).value.length
              );
              callback(results.rows.item(0).value);
            } else {
              self.logging.error(
                "Unable to find property '" +
                  key +
                  "' for domain '" +
                  domain +
                  "'"
              );
              callback(undefined);
            }
          },
          function(transaction, error) {
            self.logging.error(
              "Reading property '" +
                key +
                "': Failed with error '" +
                error.message +
                "'"
            );
            callback(undefined);
          }
        );
      }, "Reading property '" + key + "'");
    },

    deleteProperty: function(domain, key) {
      var self = this;
      self.transaction(function(transaction) {
        transaction.executeSql(
          "DELETE FROM properties WHERE domain = ? AND key = ?",
          [domain, key]
        );
      }, "Deleting property '" + key + "'");
    },

    hasProperty: function(domain, key) {
      var self = this;
      var deferred = new jQuery.Deferred();
      self.transaction(function(transaction) {
        transaction.executeSql(
          "SELECT EXISTS(SELECT 1 FROM properties WHERE domain = ? AND key = ? LIMIT 1) AS found",
          [domain, key],
          function(transaction, results) {
            deferred.resolve(results.rows.item(0).found);
          },
          function(transaction, error) {
            self.logging.error(
              "Checking for property '" +
                key +
                "': Failed with error '" +
                error.message +
                "'"
            );
            deferred.reject(error);
          }
        );
      });
      return deferred.promise();
    },

    propertiesForDomain: function(domain, callback) {
      var self = this;
      self.transaction(function(transaction) {
        transaction.executeSql(
          "SELECT * FROM properties WHERE domain = ?",
          [domain],
          function(transaction, results) {
            var properties = {};
            for (var i = 0; i < results.rows.length; i++) {
              var item = results.rows.item(i);
              properties[item.key] = item.value;
            }
            callback(properties);
          },
          function(error) {
            self.logging.error(
              "Reading properties for domain '" +
                domain +
                "': Failed with error '" +
                error.message +
                "'"
            );
            callback({});
          }
        );
      }, "Reading properties for domain '" + domain + "'");
    },

    keys: function(callback) {
      var self = this;
      self.transaction(function(transation) {
        transation.executeSql(
          "SELECT key FROM properties",
          [],
          function(transaction, results) {
            var rows = [];
            for (var i = 0; i < results.rows.length; i++) {
              rows.push(results.rows.item(i).key);
            }
            callback(rows);
          },
          function(transaction, error) {
            callback(undefined);
          }
        );
      });
    }
  });
})(jQuery);
