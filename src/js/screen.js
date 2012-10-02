
(function($) {

  App.Screens = {};

  App.Screen = function(identifier, events) {
    this.init(identifier);
    this.events = events;
  };

  jQuery.extend(
    App.Screen.prototype,
    App.Control.prototype, {

    onCreate: function() {
      var self = this;
      self.events = {};
    },

    onTouchEvent: function(state, position) {},

    presentModal: function() {
      var self = this;
      self.willShow();
      self.element.css('top', self.height());
      self.element.show();
      self.element.animate({
          top: '0'
      }, 300, function() {
        self.didShow();
      });
    },

    dismiss: function() {
      var self = this;
      self.willHide();
      self.element.animate({
        top: self.height()
      }, 300, function() {
        self.element.hide();
        self.didHide();
      });
    },

    event: function(id) {
      var self = this;
      if (id in self.events) {
        self.events[id]();
      }
    },

    willShow: function() {
      var self = this;
      self.event("willShow");
    },

    didShow: function() {
      var self = this;
      self.event("didShow");
    },

    willHide: function() {
      var self = this;
      self.event("willHide");
    },

    didHide: function() {
      var self = this;
      self.event("didHide");
    }

  });

})(jQuery);
