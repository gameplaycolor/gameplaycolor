/*
 * Copyright (C) 2012-2015 InSeven Limited.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
 
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
