
(function($) {

  App.Screens.Games = function(identifier) {
      this.init(identifier);
  };

  jQuery.extend(
    App.Screens.Games.prototype,
    App.Screen.prototype, {

    onCreate: function() {
      var self = this;
      self.done = new App.Controls.Button('#control-done', { 'touchUpInside': function() {
        self.dismiss();
      }});
      self.add = new App.Controls.Button('#control-add', { 'touchUpInside': function() {
        var url = prompt("Enter a URL", "");
        $.get(url, function(data) {
          alert('Load was performed.');
        });
      }});

      self.list = new App.Controls.Scroll('#control-games-scroll', '#control-games-list');

    }

  });

})(jQuery);
