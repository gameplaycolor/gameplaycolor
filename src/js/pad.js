
(function($) {

  App.Controls = {};

  App.Controls.Pad = function(identifier, actions) {
    this.init(identifier);
    this.actions = actions;
  };

  App.Controls.Pad.State = {
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

  jQuery.extend(
    App.Controls.Pad.prototype,
    App.Control.prototype, {

    onCreate: function() {
      var self = this;

      self.up    = false;
      self.down  = false;
      self.left  = false;
      self.right = false;
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
          case App.Controls.Pad.State.DEFAULT:
            self.setUp(false);
            self.setDown(false);
            self.setLeft(false);
            self.setRight(false);
            $(self.identifier).attr("class", "sprite-pad-default");
            break;
          case App.Controls.Pad.State.UP:
            self.setUp(true);
            self.setDown(false);
            self.setLeft(false);
            self.setRight(false);
            $(self.identifier).attr("class", "sprite-pad-up");
            break;
          case App.Controls.Pad.State.UPRIGHT:
            self.setUp(true);
            self.setDown(false);
            self.setLeft(false);
            self.setRight(true);
            $(self.identifier).attr("class", "sprite-pad-upright");
            break;
          case App.Controls.Pad.State.RIGHT:
            self.setUp(false);
            self.setDown(false);
            self.setLeft(false);
            self.setRight(true);
            $(self.identifier).attr("class", "sprite-pad-right");
            break;
          case App.Controls.Pad.State.DOWNRIGHT:
            self.setUp(false);
            self.setDown(true);
            self.setLeft(false);
            self.setRight(true);
            $(self.identifier).attr("class", "sprite-pad-downright");
            break;
          case App.Controls.Pad.State.DOWN:
            self.setUp(false);
            self.setDown(true);
            self.setLeft(false);
            self.setRight(false);
            $(self.identifier).attr("class", "sprite-pad-down");
            break;
          case App.Controls.Pad.State.DOWNLEFT:
            self.setUp(false);
            self.setDown(true);
            self.setLeft(true);
            self.setRight(false);
            $(self.identifier).attr("class", "sprite-pad-downleft");
            break;
          case App.Controls.Pad.State.LEFT:
            self.setUp(false);
            self.setDown(false);
            self.setLeft(true);
            self.setRight(false);
            $(self.identifier).attr("class", "sprite-pad-left");
            break;
          case App.Controls.Pad.State.UPLEFT:
            self.setUp(true);
            self.setDown(false);
            self.setLeft(true);
            self.setRight(false);
            $(self.identifier).attr("class", "sprite-pad-upleft");
            break;
        }

      }
    },

    setUp: function(state) {
      var self = this;
      if (self.up !== state) {
        self.up = state;
        if (state) {
          self.action("touchDownUp");
        } else {
          self.action("touchUpUp");
        }
      }
    },

    setDown: function(state) {
      var self = this;
      if (self.down !== state) {
        self.down = state;
        if (state) {
          self.action("touchDownDown");
        } else {
          self.action("touchUpDown");
        }
      }
    },

    setLeft: function(state) {
      var self = this;
      if (self.left !== state) {
        self.left = state;
        if (state) {
          self.action("touchDownLeft");
        } else {
          self.action("touchUpLeft");
        }
      }
    },

    setRight: function(state) {
      var self = this;
      if (self.right !== state) {
        self.right = state;
        if (state) {
          self.action("touchDownRight");
        } else {
          self.action("touchUpRight");
        }
      }
    },

    action: function(id) {
      var self = this;
      if (id in self.actions) {
        self.actions[id]();
      }
    }

  });

})(jQuery);
