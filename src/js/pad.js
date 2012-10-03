
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

          var upper = (width*2/3) + 10;
          var lower = (width*1/3) - 10;

          var posX = 0;
          if (position.x > upper) {
            posX = 1;
          } else if (position.x > lower) {
            posX = 0;
          } else {
            posX = -1;
          }

          var posY = 0;
          if (position.y > upper) {
            posY = 1;
          } else if (position.y > lower) {
            posY = 0;
          } else {
            posY = -1;
          }

          if (posX == -1 && posY == -1) {
            self.setState(App.Control.State.UPLEFT);
          } else if (posX == 0 && posY == -1) {
            self.setState(App.Control.State.UP);
          } else if (posX == 1 && posY == -1) {
            self.setState(App.Control.State.UPRIGHT);
          } else if (posX == -1 && posY == 0) {
            self.setState(App.Control.State.LEFT);
          } else if (posX == 0 && posY == 0) {
            self.setState(App.Control.State.DEFAULT);
          } else if (posX == 1 && posY == 0) {
            self.setState(App.Control.State.RIGHT);
          } else if (posX == -1 && posY == 1) {
            self.setState(App.Control.State.DOWNLEFT);
          } else if (posX == 0 && posY == 1) {
            self.setState(App.Control.State.DOWN);
          } else if (posX == 1 && posY == 1) {
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
