
(function($) {

  App.Controls = {};

  App.Control = function(identifier) {
    this.init(identifier);
  };

  App.Control.Touch = {
    START: 0,
    MOVE:  1,
    END:   2
  };

  App.Control.State = {
    DEFAULT:   0,
    UP:        1,
    UPRIGHT:   2,
    RIGHT:     3,
    DOWNRIGHT: 4,
    DOWN:      5,
    DOWNLEFT:  6,
    LEFT:      7,
    UPLEFT:    8
  };

  jQuery.extend(App.Control.prototype, {

    init: function(identifier) {
      var self = this;
      self.identifier = identifier;
      self.element = $(self.identifier);
      self.touchListener = new App.TouchListener(self.identifier, self);
      self.onCreate();
    },

    onCreate: function() {
      var self = this;
    },

    width: function() {
      var self = this;
      return self.element.width(); 
    },

    height: function() {
      var self = this;
      return self.element.height();
    },

    onTouchEvent: function(state, position, timestamp) {
      var self = this;
    },

    fadeIn: function() {
      var self = this;
      self.element.fadeIn();
    },

    fadeOut: function() {
      var self = this;
      self.element.fadeOut();
    },

  });

})(jQuery);
