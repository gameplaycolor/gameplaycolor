var _gaq = _gaq || [];

(function($) {

  App.Tracker = function() {
    this.init();
  };

  jQuery.extend(
    App.Tracker.prototype, {

    init: function() {
      var self = this;

      if (window.navigator.onLine === true) {

        jQuery.getJSON("settings.json", function(data) {
          _gaq.push(['_setAccount', data.analytics]);
          _gaq.push(['_setDomainName', data.domain]);
          _gaq.push(['_trackPageview']);

          (function() {
            var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
            ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
          })();

        });
      }

    },

    track: function(event) {
      var self = this;
      if (window.navigator.onLine === true) {
        _gaq.push(['_trackPageview', event]);
      }
    }

  });

})(jQuery);
