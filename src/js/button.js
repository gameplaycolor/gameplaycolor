
(function($) {

  App.Controls.Button = function(identifier, actions) {
    this.init(identifier);
    this.actions = actions;
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
          self.element.toggleClass("pressed");
          self.touchDown();
          break;
        case App.Control.Touch.MOVE:
          break;
        case App.Control.Touch.END:
          if (position.x >= 0 &&
              position.x < self.width() &&
              position.y >= 0 &&
              position.y < self.height()) {
            self.touchUpInside();
          } else {
            self.touchUpOutside();
          }
          self.touchUp();
          self.element.toggleClass("pressed");
          break;
      }
    },

    action: function(id) {
      var self = this;
      if (id in self.actions) {
        self.actions[id]();
      }
    },

    touchDown: function() {
      var self = this;
      self.action("touchDown");
    },

    touchUp: function() {
      var self = this;
      self.action("touchUp");      
    },

    touchUpInside: function() {
      var self = this;
      self.action("touchUpInside");
    },

    touchUpOutside: function() {
      var self = this;
      self.action("touchUpOutside");
    }

  });

})(jQuery);
