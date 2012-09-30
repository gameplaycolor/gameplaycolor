
(function($) {

  App.Controls.Button = function(identifier, onPress) {
    this.init(identifier);
    this.onPress = onPress;
  };

  App.Controls.Button.State = {
    UP:   0,
    DOWN: 1
  };

  jQuery.extend(
    App.Controls.Button.prototype,
    App.Control.prototype, {

    onCreate: function() {
      var self = this;
      self.state = App.Controls.Button.State.UP;
    },

    onTouchEvent: function(state, position) {
      var self = this;
      App.Log("(" + state + ", " + position.x + ", " + position.y + ")");

      switch(state) {
        case App.Control.Touch.START:
          break;
        case App.Control.Touch.MOVE:
          break;
        case App.Control.Touch.END:
          if (position.x >= 0 &&
              position.x < self.width() &&
              position.y >= 0 &&
              position.y < self.height()) {
            self.onPress();
          }
          break;
      }
    },

    onPress: function() {
      App.Log("Press");
    }

  });

})(jQuery);
