/*
 * Copyright (c) 2012-2021 InSeven Limited
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

(function($) {

  App.Store = function(name) {
    this.init(name);
  };

  App.Store.Property = {
    STATE: 0,
    GAME:  1,
    COLOR: 2,
    SPEED: 4,
  };

  jQuery.extend(App.Store.prototype, {
    init: function(name, size) {
      var self = this;
      self.name = name;
      self.database = {};
      self.database.indexedDB = {};
      self.database.indexedDB.db = null;
      self.debug = false;
      self.size = size;
      self.logging = new App.Logging(window.config.logging_level, "store");

      self.indexedDB =
        window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
      window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
    },

    /**
     * Open the storage.
     *
     * true if successful. false otherwise.
     */
    open: function(callback) {
      var self = this;
      try {
        var request = indexedDB.open(self.name, 3);
        request.onsuccess = function(e) {
          self.logging.info(
            "success our DB: " + self.name + " is open and ready for work"
          );
          self.database.indexedDB.db = e.target.result;
          callback(true);
        };

        request.onupgradeneeded = function(e) {
          self.database.indexedDB.db = e.target.result;
          var db = self.database.indexedDB.db;
          self.logging.info(
            "Going to upgrade our DB from version: " +
              e.oldVersion +
              " to " +
              e.newVersion
          );
          try {
            if (
              db.objectStoreNames &&
              db.objectStoreNames.contains("properties")
            ) {
              db.deleteObjectStore("properties");
            }
          } catch (err) {
            self.logging.error("got err in objectStoreNames:" + err);
          }

          var store = self.createTables(db);

          self.logging.info(
            "-- onupgradeneeded store:" + JSON.stringify(store)
          );
        };

        request.onfailure = function(e) {
          self.logging.error("could not open our DB! Err:" + e);
          callback(false, e);
        };

        request.onerror = function(e) {
          self.logging.error(
            "Well... How should I put it? We have some issues with our DB! Err:" +
              e
          );

          callback(false, e);
        };
      } catch (e) {
        if (e == 2) {
          self.logging.error("Invalid database version.");
        } else {
          self.logging.error("Unknown error " + e + ".");
        }
        callback(false);
      }
    },

    getStore: function(storeName, permissions) {
      var self = this;
      var db = self.database.indexedDB.db;
      var trans = db.transaction(storeName, permissions);
      var store = trans.objectStore(storeName);

      return store;
    },

    createTables: function(db) {
      var store = db.createObjectStore("properties", {
        autoIncrement: true
      });

      store.createIndex("key", "key", { unique: false });
      store.createIndex("domain", "domain", { unique: false });
      store.createIndex("value", "value", { unique: false });
      store.createIndex("key, domain", ["key", "domain"], { unique: false });

      return store;
    },

    setProperty: function(domain, key, value) {
      var self = this;
      var store = self.getStore("properties", "readwrite");

      var data = {
        domain: domain,
        key: key,
        value: value
      };

      var request = store.put(data, JSON.stringify({ domain: domain, key: key }));

      request.onsuccess = function(e) {};
      request.onerror = function(e) {
        self.logging.error("Error Adding an item: ", e);
      };
    },

    property: function(domain, key, callback) {
      var self = this;
      self.logging.debug(
        "Reading property '" + key + "' for domain '" + domain + "'"
      );

      var store = self.getStore("properties", "readonly");

      var index = store.index("key, domain");
      var request = index.get([key, domain]);
      request.onsuccess = function(e) {
        if (e.target.result != null && e.target.result !== undefined) {
          self.logging.debug(
            "Found property '" +
              key +
              "' for domain '" +
              domain +
              "' with length " +
              e.target.result.value.length
          );
          callback(e.target.result.value);
        } else {
          self.logging.error(
            "Unable to find property '" + key + "' for domain '" + domain + "'"
          );
          callback(undefined);
        }
      };

      request.onerror = function(e) {
        self.logging.error(
          "Unable to find property '" + key + "' for domain '" + domain + "'"
        );
        callback(undefined);
      };
    },

    deleteProperty: function(domain, key) {
      var self = this;
      var store = self.getStore("properties", "readwrite");

      var request = store["delete"]([key, domain]);

      request.onsuccess = function(e) {};

      request.onerror = function(e) {
        self.logging.error("Error deleting item: ", e);
      };
    },

    hasProperty: function(domain, key) {
      var self = this;
      var deferred = new jQuery.Deferred();
      var store = self.getStore("properties", "readonly");

      var request = store.index("key, domain").get([key, domain]);

      request.onsuccess = function(e) {
        if (e.target.result != null && e.target.result !== undefined) {
          deferred.resolve(true);
        } else {
          deferred.resolve(false);
        }
      };

      request.onerror = function(e) {
        self.logging.error(
          "Checking for property '" +
            key +
            "': Failed with error '" +
            error.message +
            "'"
        );
        deferred.reject(false);
      };

      return deferred.promise();
    },

    propertiesForDomain: function(domain, callback) {
      var properties = {};
      var self = this;
      var store = self.getStore("properties", "readonly");
      store = store.index("domain");
      const keyRangeValue = IDBKeyRange.only(domain);
      var request = store.getAll(keyRangeValue);


      request.onsuccess = function (e) {
        console.log('here');
        for (let i = 0; i < e.target.result.length; i++) {
          properties[e.target.result[i].key] = e.target.result[i].value;
        }

        callback(properties);
      };

      request.onerror = function(e) {
        self.logging.error(
          "Reading properties for domain '" +
            domain +
            "': Failed with error '" +
            error.message +
            "'"
        );
        callback({});
      };
    },

    keys: function(callback) {
      var keys = [];
      var self = this;
      var store = self.getStore("properties", "readonly");

      var index = store.index("key");

      var request = index.openKeyCursor();

      request.onsuccess = function(e) {
        var cursor = e.target.result;
        if (cursor) {
          keys.push(cursor.key);
          cursor["continue"]();
        } else {
          callback(keys);
        }
      };

      request.onerror = function(e) {
        callback(undefined);
      };
    }
  });
})(jQuery);
