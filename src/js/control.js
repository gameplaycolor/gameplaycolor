
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
      var state = 
      self.identifier = identifier;

      // Used for tracking the current touch interaction.
      // We need to cache the touch position as we don't get valid coordinates in
      // touchend so we map them back to our previous touch to make it easier to
      // write more involved controls.
      self.touch = { x: 0, y: 0 };

      self.element = $(self.identifier);

      document.querySelector(self.identifier).addEventListener('touchstart', function(e) {
        e.preventDefault();
        self.touch = self.convert(e);
        self.onTouchEvent(App.Control.Touch.START, self.touch);
      }, false);

      document.querySelector(self.identifier).addEventListener('mousedown', function(e) {
        e.preventDefault();
        self.touch = self.convert(e);
        self.onTouchEvent(App.Control.Touch.START, self.touch);
      }, false);

      document.querySelector(self.identifier).addEventListener('touchmove', function(e) {
        e.preventDefault();
        self.touch = self.convert(e);
        self.onTouchEvent(App.Control.Touch.MOVE, self.touch);
      }, false);

      document.querySelector(self.identifier).addEventListener('mousemove', function(e) {
        e.preventDefault();
        self.touch = self.convert(e);
        self.onTouchEvent(App.Control.Touch.MOVE, self.touch);
      }, false);

      document.querySelector(self.identifier).addEventListener('touchend', function(e) {
        e.preventDefault();
        self.onTouchEvent(App.Control.Touch.END, self.touch);
      }, false);

      document.querySelector(self.identifier).addEventListener('mouseup', function(e) {
        e.preventDefault();
        self.onTouchEvent(App.Control.Touch.END, self.touch);
      }, false);

      self.onCreate();

    },

    onCreate: function() {
      var self = this;
    },

    convert: function(event) {
      var self = this;      
      var offset = self.element.offset();
      if (event.touches) {
        var touch = event.touches[0];
        return { 'x': touch.pageX - offset.left ,
                 'y': touch.pageY - offset.top };
      }
      return { 'x': event.pageX - offset.left ,
               'y': event.pageY - offset.top };
    },

    width: function() {
      var self = this;
      return self.element.width(); 
    },

    height: function() {
      var self = this;
      return self.element.height();
    },

    onTouchEvent: function(state, position) {
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
