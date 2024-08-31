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

  App.Settings = function(store, gameBoy, console) {
    this.init(store, gameBoy, console);
  };

  jQuery.extend(
    App.Settings.prototype, {

      init: function(store, gameBoy, console) {
        var self = this;
        self.store = store;
        self.gameBoy = gameBoy;
        self.console = console;
        self.element = $('#screen-settings');
        self.dialog = $('#dialog-settings');

        self.scroll = new App.Controls.Scroll($('#dialog-settings-body'));

        self.element.get(0).addEventListener('touchmove', function(e) {
          e.preventDefault();
        }, false);

        // Speed

        var speeds = [1.0, 1.5, 2.0, 3.0];

        self.speed = new App.Controls.Segmented($('#emulation-speed'), function(index) {
          self.speed.setIndex(index);
          var speed = speeds[index];
          self.gameBoy.setSpeed(speed);
          self.store.setProperty(App.Controller.Domain.SETTINGS, App.Store.Property.SPEED, speed);
        });

        self.store.property(App.Controller.Domain.SETTINGS, App.Store.Property.SPEED, function(speed) {
          if (speed !== undefined) {
            self.gameBoy.setSpeed(speed);
            self.speed.setIndex(speeds.indexOf(speed));
          }
        });

        // Color

        var colors = ["grape", "cherry", "teal", "lime", "yellow"];

        self.color = new App.Controls.Segmented($('#console-color'), function(index) {
          self.color.setIndex(index);
          self.console.setColor(colors[index]);
          self.store.setProperty(App.Controller.Domain.SETTINGS, App.Store.Property.COLOR, colors[index]);
        });

        self.store.property(App.Controller.Domain.SETTINGS, App.Store.Property.COLOR, function(color) {
          if (color !== undefined) {
            self.color.setIndex(colors.indexOf(color));
          } else {
            self.color.setIndex(0);
          }
        });

        // Version

        $('#application-version').text(window.config.version);

        // Done

        self.done = new App.Controls.Button($('#screen-settings-done'), { touchUpInside: function() {
          self.hide();
        }});

      },

      hide: function() {
        var self = this;
        self.element.addClass('hidden');
        setTimeout(function() {
          self.element.css('display', 'none');
            document.getElementsByTagName('body')[0].style.overflow = ''; // Allow scrolling.
        }, 200);
      },

      show: function() {
        var self = this;
        document.getElementsByTagName('body')[0].style.overflow = 'hidden'; // Prevent scrolling.
        self.element.css('display', 'block');
        setTimeout(function() {
          self.element.removeClass('hidden');
        }, 0);

      }

  });

})(jQuery);
