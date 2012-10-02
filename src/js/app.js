
(function($) {

  App = {};
  App.Controller = {};

  App.Log = function(message) {
    $("#debug").html(message)
  };

  App.Controller = function () {
      this.init();
  };

  jQuery.extend(App.Controller.prototype, {

    init: function () {
      var self = this;
      $("#screen-console").show();

      self.control = new App.Control('#control-dpad');
      self.gamesScreen = new App.Screens.Games('#screen-games');

      self.a = new App.Controls.Button('#control-a', { 'touchDown' : function() {
        console.log("a down");
        gb_OnKeyDown_Event(Gameboy.Key.A);
      }, 'touchUp': function() {
        console.log("a up");
        gb_OnKeyUp_Event(Gameboy.Key.A);        
      }});

      self.b = new App.Controls.Button('#control-b', { 'touchDown' : function() {
        console.log("b down");
        gb_OnKeyDown_Event(Gameboy.Key.B);
      }, 'touchUp': function() {
        console.log("b up");
        gb_OnKeyUp_Event(Gameboy.Key.B);        
      }});

      self.start = new App.Controls.Button('#control-start', { 'touchDown' : function() {
        console.log("start down");
        gb_OnKeyDown_Event(Gameboy.Key.START);
      }, 'touchUp': function() {
        console.log("start up");
        gb_OnKeyUp_Event(Gameboy.Key.START);        
      }});

      self.select = new App.Controls.Button('#control-select', { 'touchDown' : function() {
        console.log("select down");
        gb_OnKeyDown_Event(Gameboy.Key.SELECT);
      }, 'touchUp': function() {
        console.log("select up");
        gb_OnKeyUp_Event(Gameboy.Key.SELECT);        
      }});

      self.games = new App.Controls.Button('#control-games', { 'touchUpInside': function() {
        gb_Pause();
        self.gamesScreen.presentModal();
      }});

      gb_Insert_Cartridge("kirby.gb", true);

    }

  });

  // Create the application.
  $(document).ready(function() {
    window.app = new App.Controller();
  });

})(jQuery);
