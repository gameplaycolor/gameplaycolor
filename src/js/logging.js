/*
 * Copyright (c) 2012-2024 Jason Morley
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

  App.Logging.messages = [];

  App.Logging.globalLevel = App.Logging.Level.INFO;

  App.Logging.logs = function() {
    return App.Logging.messages.join("\n");
  };

  jQuery.extend(App.Logging.prototype, {

    init: function(level, tag) {
      var self = this;
      self.level = level;
      self.tag = tag;
    },

    log: function(level, message) {
      var self = this;

      var output = message;
      if (self.tag !== undefined) {
        output = self.tag + ": " + message;
      }
      var date = new Date();
      output = "[" + date.toISOString() + "] [" + level + "] " + output;

      if (level >= self.level) {
        console.log(output);
      }

      if (level >= App.Logging.globalLevel) {
        App.Logging.messages.push(output);
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
