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

  App.Controls.Switch = function(element, callback) {
    this.init(element);
    this.callback = callback;
    self.selected = 0;
  };

  jQuery.extend(
    App.Controls.Switch.prototype,
    App.Control.prototype, {

    onCreate: function() {
      var self = this;
    },

    setSelected: function(selected) {
      var self = this;
      self.selected = selected;
      if (self.selected === 0) {
        self.element.removeClass("on");
      } else {
        self.element.addClass("on");
      }
    },

    onTouchEvent: function(state, position, timestamp, event) {
      var self = this;
      event.preventDefault();
      if (state == App.Control.Touch.END) {
        if (position.x >= 0 &&
            position.x < self.width() &&
            position.y >= 0 &&
            position.y < self.height()) {
          var selected = self.selected;
          if (selected === 0) {
            selected = 1;
          } else {
            selected = 0;
          }
          self.callback(self, selected);
        }
      }
    },

  });

})(jQuery);
