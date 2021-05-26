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

  App.TouchListener = function(element, delegate) {
    this.init(element, delegate);
  };

  jQuery.extend(App.TouchListener.prototype, {

    init: function (element, delegate) {
      var self = this;
      self.element = element;
      self.delegate = delegate;
      self.recognizers = [];

      // Used for tracking the current touch interaction.
      // We need to cache the touch position as we don't get valid coordinates in
      // touchend so we map them back to our previous touch to make it easier to
      // write more involved controls.
      self.touch = { x: 0, y: 0 };

      self.element.get(0).addEventListener('touchstart', function(e) {
        self.dispatchEvent(App.Control.Touch.START, e);
      }, false);

      self.element.get(0).addEventListener('mousedown', function(e) {
        self.dispatchEvent(App.Control.Touch.START, e);
      }, false);

      self.element.get(0).addEventListener('touchmove', function(e) {
        self.dispatchEvent(App.Control.Touch.MOVE, e);
      }, false);

      self.element.get(0).addEventListener('mousemove', function(e) {
        self.dispatchEvent(App.Control.Touch.MOVE, e);
      }, false);

      self.element.get(0).addEventListener('touchend', function(e) {
        self.onTouchEvent(App.Control.Touch.END, self.touch, e.timeStamp, e);
      }, false);

      self.element.get(0).addEventListener('mouseup', function(e) {
        self.onTouchEvent(App.Control.Touch.END, self.touch, e.timeStamp, e);
      }, false);

      self.element.get(0).addEventListener('touchcancel', function(e) {
        self.onTouchEvent(App.Control.Touch.END, self.touch, e.timeStamp, e);
      }, false);

    },

    onTouchEvent: function(state, position, timestamp, event) {
      var self = this;
      for (var i=0; i<self.recognizers.length; i++) {
        var recognizer = self.recognizers[i];
        self.recognizers[i].onTouchEvent(state, position, timestamp, event);
      }
      self.delegate.onTouchEvent(state, position, timestamp, event);
    },

    dispatchEvent: function(state, event) {
      var self = this;
      var touchEvent = self.getEvent(event);
      if (touchEvent !== undefined) {
        self.touch = self.convert(touchEvent);
        self.onTouchEvent(state, self.touch, event.timeStamp, event);
      }
    },

    convert: function(event) {
      var self = this;
      var offset = self.element.offset();
      return { 'x': event.pageX - offset.left ,
               'y': event.pageY - offset.top };
    },

    // Queries the touch/mouse event looking for an a suitable event within the
    // target object.  Returns undefined if one cannot be found.
    getEvent: function(event) {
      var self = this;
      if (event.touches) {
        if (event.targetTouches && event.targetTouches.length > 0) {
          return event.targetTouches[0];
        }
      } else {
        return event;
      }
      return undefined;
    },

    addRecognizer: function(recognizer) {
      var self = this;
      self.recognizers.push(recognizer);
    }

  });

})(jQuery);
