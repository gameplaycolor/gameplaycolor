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

  App.Controls.Scroll = function(element) {
    this.init(element);
  };

  jQuery.extend(
    App.Controls.Scroll.prototype,
    App.Control.prototype, {

    onCreate: function() {
      var self = this;
    },

    onTouchEvent: function(state, position, timestamp) {
      var self = this;

      if (state === App.Control.Touch.START) {
        self.touchStart = position;
        self.scrollLeft = self.element.scrollLeft();
        self.scrollTop = self.element.scrollTop();
        self.touchCount = 1;
      } else if (state === App.Control.Touch.MOVE) {
        if (self.touchCount > 0) {
          self.element.scrollLeft(self.scrollLeft + self.touchStart.x - position.x);
          self.element.scrollTop(self.scrollTop + self.touchStart.y - position.y);
        }
      } else if (state === App.Control.Touch.END) {
        self.touchCount = 0;
      }

    },

  });

})(jQuery);
