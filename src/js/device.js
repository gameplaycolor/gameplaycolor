
(function($) {

  App.Device = function() {
    this.init();
  };

  App.Device.Type = {
    UNKNOWN:     0,
    IPHONE:      1,
    IPHONE_4:    2,
    IPHONE_5:    3,
    IPAD:        4,
    IPAD_RETINA: 5
  };

  App.Device.Orientation = {
    PORTRAIT:  0,
    LANDSCAPE: 1
  };

  App.Device.Dimensions = {
    IPHONE_5_HEIGHT: 444,
    IPHONE_5_WIDTH:  568
  };

  jQuery.extend(
    App.Device.prototype, {

    init: function() {
      var self = this;
      self.type = App.Device.Type.UNKNOWN;
      self.retina = (window.devicePixelRatio > 1);

      var width = $(window).width();
      var height = $(window).height();

      if (height > width) {
        self.orientation = App.Device.Orientation.PORTRAIT;
      } else {
        self.orientation = App.Device.Orientation.LANDSCAPE;
      }

      var userAgent = navigator.userAgent;
      if (userAgent.indexOf("iPhone") !== -1) {
        self.type = App.Device.Type.IPHONE;
        if (self.retina) {
          self.type = App.Device.Type.IPHONE_4;

          if (self.orientation === App.Device.Orientation.PORTRAIT) {
            if (height >= App.Device.Dimensions.IPHONE_5_HEIGHT) {
              self.type = App.Device.Type.IPHONE_5;
            }
          } else {
            if (width >= App.Device.Dimensions.IPHONE_5_WIDTH) {
              self.type = App.Device.Type.IPHONE_5;
            }
          }
        }
      } else if (userAgent.indexOf("iPad") !== -1) {
        self.type = App.Device.Type.IPAD;
        if (self.retina) {
          self.type = App.Device.Type.IPAD_RETINA;
        }
      }

    },

    type: function() {
      var self = this;
      return self.type;
    }

  });

})(jQuery);
