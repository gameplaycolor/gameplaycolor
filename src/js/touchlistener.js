
(function($) {

  App.TouchListener = function(identifier, delegate) {
    this.init(identifier, delegate);
  };
  
  jQuery.extend(App.TouchListener.prototype, {

    init: function (identifier, delegate) {
      var self = this;
      self.identifier = identifier;
      self.delegate = delegate;
      self.element = $(self.identifier);

      // Used for tracking the current touch interaction.
      // We need to cache the touch position as we don't get valid coordinates in
      // touchend so we map them back to our previous touch to make it easier to
      // write more involved controls.
      self.touch = { x: 0, y: 0 };

      document.querySelector(self.identifier).addEventListener('touchstart', function(e) {
        e.preventDefault();
        self.touch = self.convert(e);
        self.delegate.onTouchEvent(App.Control.Touch.START, self.touch);
      }, false);

      document.querySelector(self.identifier).addEventListener('mousedown', function(e) {
        e.preventDefault();
        self.touch = self.convert(e);
        self.delegate.onTouchEvent(App.Control.Touch.START, self.touch);
      }, false);

      document.querySelector(self.identifier).addEventListener('touchmove', function(e) {
        e.preventDefault();
        self.touch = self.convert(e);
        self.delegate.onTouchEvent(App.Control.Touch.MOVE, self.touch);
      }, false);

      document.querySelector(self.identifier).addEventListener('mousemove', function(e) {
        e.preventDefault();
        self.touch = self.convert(e);
        self.delegate.onTouchEvent(App.Control.Touch.MOVE, self.touch);
      }, false);

      document.querySelector(self.identifier).addEventListener('touchend', function(e) {
        e.preventDefault();
        self.delegate.onTouchEvent(App.Control.Touch.END, self.touch);
      }, false);

      document.querySelector(self.identifier).addEventListener('mouseup', function(e) {
        e.preventDefault();
        self.delegate.onTouchEvent(App.Control.Touch.END, self.touch);
      }, false);

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
    
  });

})(jQuery);
