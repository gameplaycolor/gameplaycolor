(function($) {

  App.Console = function() {
    this.init();
  };
  
  App.Console.State = {
    VISIBLE: 0,
    HIDDEN:  1,
  };

  jQuery.extend(
    App.Console.prototype, {
      
      init: function() {
        var self = this;
      
        self.element = $('#screen-console');
        self.state = App.Console.State.VISIBLE;
      
        self.games = new App.Controls.Button('#control-games', { 'touchUpInside': function() {
          self.toggle();
        }});
        
      },
      
      hide: function() {
        var self = this;
        self.state = App.Console.State.HIDDEN;
        self.element.animate({
          top: '-520'
        }, 300, function() {
        });
      },
      
      show: function() {
        var self = this;
        self.state = App.Console.State.VISIBLE;
        self.element.animate({
          top: '0'
        }, 300, function() {
        });
      },
      
      toggle: function() {
        var self = this;
        switch (self.state) {
        case App.Console.State.VISIBLE:
          self.hide();
          break;
        case App.Console.State.HIDDEN:
          self.show();
          break;
        }
      },

  });

})(jQuery);
