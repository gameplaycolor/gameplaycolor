
(function($) {

  App.GameBoy = function() {
    this.init();
  };

  App.GameBoy.instance = undefined;

  App.GameBoy.getInstance = function() {
    if (App.GameBoy.instance === undefined) {
      App.GameBoy.instance = new App.GameBoy();
    }
    return App.GameBoy.instance;
  };

  jQuery.extend(App.GameBoy.prototype, {
        
    init: function() {
      var self = this;
    },

    pause: function() {
      var self = this;
      gb_Pause();
    },

    run: function() {
      var self = this;
      gb_Run();
    },

  });

})(jQuery);



Gameboy = {};

Gameboy.Key = {
  START: 65,
  SELECT: 83,
  A: 88,
  B: 90,
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39,
};

function gb_Show_Fps() {}

function gb_KeyDown(keycode) {
  var e = { 'which': keycode, 'preventDefault': function() {} };
  gb_OnKeyDown_Event(e);
}

function gb_KeyUp(keycode) {
  var e = { 'which': keycode, 'preventDefault': function() {} };
  gb_OnKeyUp_Event(e);
}
