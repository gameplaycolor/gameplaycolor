
(function($) {

  App.Controls.Scroll = function(identifier, content) {
    this.init(identifier);
    this.setContent(content);
  };

  jQuery.extend(
    App.Controls.Scroll.prototype,
    App.Control.prototype, {

    onCreate: function() {
      var self = this;
      self.state = App.Controls.Button.State.UP;
      self.offset = 0;
    },

    setContent: function(content) {
      var self = this;
      self.content = $(content);
    },

    onTouchEvent: function(state, position) {
      var self = this;

      switch(state) {
        case App.Control.Touch.START:
          self.start = position.y;
          break;
        case App.Control.Touch.MOVE:
          self.content.css('top', self.offset - (self.start - position.y));
          break;
        case App.Control.Touch.END:
          self.offset = self.offset - (self.start - position.y);
          self.content.css('top', self.offset);
          break;
      }

    }

  });

})(jQuery);
