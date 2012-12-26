
(function($) {

  App.GestureRecognizer = function() {
    this.init();
  };

  App.GestureRecognizer.State = {
    IDLE:         0,
    RECOGNIZING:  1,
    RECOGNIZED:   2,
    UNRECOGNIZED: 3
  };

  App.GestureRecognizer.Direction = {
    NONE: 0,
    LEFT: 1,
    RIGHT: 2
  };

  App.GestureRecognizer.THRESHOLD = 0.6;
  
  jQuery.extend(App.GestureRecognizer.prototype, {

    init: function () {
      var self = this;
      self.reset();
    },

    onTouchEvent: function(state, position, timestamp) {
      var self = this;
      // TODO Handle multi-touch.

      if (state === App.Control.Touch.START) {
        // Record the initial touch details.
        self.setState(App.GestureRecognizer.State.RECOGNIZING);
        self.touchStartPosition = position;
        self.touchStartTimestamp = timestamp;
      } else if (state === App.Control.Touch.MOVE) {
        // We don't bother recognizing a simple swipe gesture until the touch up event.
      } else if (state === App.Control.Touch.END) {
        if (self.state === App.GestureRecognizer.State.RECOGNIZING) {
          // Calculate the horizontal distance travelled.
          var distance = self.touchStartPosition.x - position.x;
          var time = timestamp - self.touchStartTimestamp;
          var speed = Math.abs(distance) / time;

          if (speed > App.GestureRecognizer.THRESHOLD) {
            self.setState(App.GestureRecognizer.State.RECOGNIZED);
            if (distance > 0) {
              self.direction = App.GestureRecognizer.Direction.LEFT;
            } else {
              self.direction = App.GestureRecognizer.Direction.RIGHT;
            }

          } else {
            self.setState(App.GestureRecognizer.State.UNRECOGNIZED);
          }
        }
      }

    },

    reset: function() {
      var self = this;
      self.state = App.GestureRecognizer.State.IDLE;
      self.direction = App.GestureRecognizer.Direction.NONE;
      self.touchStartPosition = { x: 0, y: 0 }
      self.touchStartTimestamp = 0;
    },

    // TODO Work out when we need to reset our state.

    setState: function(state) {
      var self = this;
      if (self.state !== state) {
        self.state = state;
      }
    },
    
  });

})(jQuery);
