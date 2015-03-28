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

  App.Logging = function(level, tag) {
    this.init(level, tag);
  };

  App.Logging.Level = {
    CRITICAL: 50,
    ERROR: 40,
    WARNING: 30,
    INFO: 20,
    DEBUG: 10
  };

  jQuery.extend(App.Logging.prototype, {

    init: function(level, tag) {
      var self = this;
      self.level = level;
      self.tag = tag;
    },

    log: function(level, message) {
      var self = this;
      if (level >= self.level) {
        if (self.tag !== undefined) {
          console.log(self.tag + ": " + message);
        } else {
          console.log(message);
        }
      }
    },

    critical: function(message) {
      var self = this;
      self.log(App.Logging.Level.CRITICAL, message);
    },

    error: function(message) {
      var self = this;
      self.log(App.Logging.Level.ERROR, message);
    },

    warning: function(message) {
      var self = this;
      self.log(App.Logging.Level.WARNING, message);
    },

    info: function(message) {
      var self = this;
      self.log(App.Logging.Level.INFO, message);
    },

    debug: function(message) {
      var self = this;
      self.log(App.Logging.Level.DEBUG, message);
    }

  });

 })(jQuery);
