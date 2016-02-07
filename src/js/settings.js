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

(function($) {

  App.Settings = function(drive) {
    this.init(drive);
  };
  
  jQuery.extend(
    App.Settings.prototype, {
      
      init: function(drive) {
        var self = this;
        self.drive = drive;
        self.element = $('#screen-settings');
        self.done = new App.Controls.Button('#screen-settings-done', { touchUp: function() {
          self.hide();
        }});

        self.touchListener = new App.TouchListener('#screen-settings-dismiss', self);

        self.signOut = new App.Controls.Button('#screen-settings-sign-out', { touchUp: function() {
          // If we present a confirm dialog within the button event handler the final touch up gets lost and we find
          // ourselves in an inconsistent state.
          setTimeout(function() {
            if (confirm("Sign out of Google Drive?")) {
              self.drive.signOut().fail(function(e) {
                alert("Unable to sign out of Google Drive.\n" + e);
              });
            }
          }, 10);
        }});
        self.thanks = new App.Controls.Button('#screen-settings-say-thanks', { touchUp: function() {

          // Code snippit from http://stackoverflow.com/questions/5423332/launch-mobile-safari-from-full-screen-web-app-on-iphone.
          // Ensures we launch Mobile Safari when in standalone mode.
          var $a = $('<a href="https://gameplaycolor.com/thanks/" target="_blank"/>');
          $("body").append($a);
          var a = $a.get(0);
          var mouseEvent = a.ownerDocument.createEvent('MouseEvents');
          mouseEvent.initMouseEvent('click');
          a.dispatchEvent(mouseEvent);
          $a.remove();

        }});
      },

      onTouchEvent: function(state, position, timestamp) {
        var self = this;
        if (state == App.Control.Touch.START) {
          self.hide();
        }
      },
      
      hide: function() {
        var self = this;
        self.element.addClass('hidden');
        setTimeout(function() {
          self.element.css('display', 'none');  
        }, 200);
      },
      
      show: function() {
        var self = this;
        self.element.css('display', 'block');
        setTimeout(function() {
          self.element.removeClass('hidden');
        }, 0);
        
      }
      
  });

})(jQuery);
