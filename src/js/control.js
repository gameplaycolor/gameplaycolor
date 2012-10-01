
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

    },

    convert: function(event) {
      var self = this;      
      if (event.touches) {
        var touch = event.touches[0];
      }
      var offset = self.element.offset();
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

      var width = self.element.height();
      var height = self.element.width();

      switch(state) {
        case App.Control.Touch.START:
        case App.Control.Touch.MOVE:

          var posX = 0;
          if (position.x > (width*2/3)) {
            posX = 1;
          } else if (position.x > (width*1/3)) {
            posX = 0;
          } else {
            posX = -1;
          }

          var posY = 0;
          if (position.y > (height*2/3)) {
            posY = 1;
          } else if (position.y > (height*1/3)) {
            posY = 0;
          } else {
            posY = -1;
          }

          App.Log("(" + posX + ", " + posY + ")");

          if (posX == -1 && posY == -1) {
            App.Log("Up Left")
            self.setState(App.Control.State.UPLEFT);
          } else if (posX == 0 && posY == -1) {
            App.Log("Up")
            self.setState(App.Control.State.UP);
          } else if (posX == 1 && posY == -1) {
            App.Log("Up Right")
            self.setState(App.Control.State.UPRIGHT);
          } else if (posX == -1 && posY == 0) {
            App.Log("Left")
            self.setState(App.Control.State.LEFT);
          } else if (posX == 0 && posY == 0) {
            App.Log("Default")
            self.setState(App.Control.State.DEFAULT);
          } else if (posX == 1 && posY == 0) {
            App.Log("Right")
            self.setState(App.Control.State.RIGHT);
          } else if (posX == -1 && posY == 1) {
            App.Log("Down Left")
            self.setState(App.Control.State.DOWNLEFT);
          } else if (posX == 0 && posY == 1) {
            App.Log("Down")
            self.setState(App.Control.State.DOWN);
          } else if (posX == 1 && posY == 1) {
            App.Log("Down Right")
            self.setState(App.Control.State.DOWNRIGHT);
          }

          break;
        case App.Control.Touch.END:
          self.setState(App.Control.State.DEFAULT);
          break;
      }
    },

    setState: function(state) {
      var self = this;
      if (self.state != state) {
        self.state = state;

        switch (self.state) {
          case App.Control.State.DEFAULT:
            $(self.identifier).attr("class", "sprite-pad-default");
            break;
          case App.Control.State.UP:
            $(self.identifier).attr("class", "sprite-pad-up");
            break;
          case App.Control.State.UPRIGHT:
            $(self.identifier).attr("class", "sprite-pad-upright");
            break;
          case App.Control.State.RIGHT:
            $(self.identifier).attr("class", "sprite-pad-right");
            break;
          case App.Control.State.DOWNRIGHT:
            $(self.identifier).attr("class", "sprite-pad-downright");
            break;
          case App.Control.State.DOWN:
            $(self.identifier).attr("class", "sprite-pad-down");
            break;
          case App.Control.State.DOWNLEFT:
            $(self.identifier).attr("class", "sprite-pad-downleft");
            break;
          case App.Control.State.LEFT:
            $(self.identifier).attr("class", "sprite-pad-left");
            break;
          case App.Control.State.UPLEFT:
            $(self.identifier).attr("class", "sprite-pad-upleft");
            break;
        }

      }
    }

  });

})(jQuery);
