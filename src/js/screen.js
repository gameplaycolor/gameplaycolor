
(function($) {

  App.Screens = {};

  App.Screen = function(identifier) {
      this.init(identifier);
  };

  jQuery.extend(
    App.Screen.prototype,
    App.Control.prototype, {

    onTouchEvent: function(state, position) {},

    presentModal: function() {
      var self = this;
      self.element.animate({
          top: '0'
      });
    },

    dismiss: function() {
      var self = this;
      self.element.animate({
        top: self.height()
      });
    }

  });

})(jQuery);
