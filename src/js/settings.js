/*
 * Copyright (C) 2012-2016 InSeven Limited.
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

  App.Settings = function(drive, store, gameBoy) {
    this.init(drive, store, gameBoy);
  };
  
  jQuery.extend(
    App.Settings.prototype, {
      
      init: function(drive, store, gameBoy) {
        var self = this;
        self.drive = drive;
        self.store = store;
        self.gameBoy = gameBoy;
        self.element = $('#screen-settings');
        self.dialog = $('#dialog-settings');
        self.done = new App.Controls.Button($('#screen-settings-done'), { touchUpInside: function() {
          self.hide();
        }});
        self.scroll = new App.Controls.Scroll($('#dialog-settings-body'));

        self.element.get(0).addEventListener('touchmove', function(e) {
          e.preventDefault();
        }, false);

        $('#application-version').text(window.config.version);

        self.touchListener = new App.TouchListener($('#screen-settings-dismiss'), self);

        self.signOut = new App.Controls.Button($('#screen-settings-sign-out'), { touchUpInside: function() {
          utilities.dispatch(function() {
            if (confirm("Sign out of Google Drive?")) {
              self.drive.signOut().fail(function(e) {
                alert("Unable to sign out of Google Drive.\n" + e);
              });
            }
          });
        }});

        self.sound = new App.Controls.Switch($('#switch'), function(target, selected) {
          target.setSelected(selected);
          self.store.setProperty(App.Controller.Domain.SETTINGS, App.Store.Property.SOUND, selected);
          self.gameBoy.setSoundEnabled(selected !== 0);
        });

        self.store.property(App.Controller.Domain.SETTINGS, App.Store.Property.SOUND, function(sound) {
          if (sound !== undefined) {
            self.sound.setSelected(sound);
            self.gameBoy.setSoundEnabled(sound !== 0);
          } else {
            self.sound.setSelected(1);
            self.gameBoy.setSoundEnabled(true);
          }
        });

        self.thanks = new App.Controls.Button($('#screen-settings-say-thanks'), { touchUpInside: function() {
          utilities.open_new_window("https://gameplaycolor.com/thanks/");
        }});

        var indexToSpeed = function(index) {
          if (index == 0) {
            return 1.0;
          } else if (index == 1) {
            return 1.5;
          } else if (index == 2) {
            return 2.0;
          }
          return 1.0;
        };

        var speedToIndex = function (speed) {
          if (speed == 1.0) {
            return 0;
          } else if (speed == 1.5) {
            return 1;
          } else if (speed == 2.0) {
            return 2;
          }
          return 0;
        }

        self.speed = new App.Controls.Segmented($('#emulation-speed'), function(index) {
          self.speed.setIndex(index);
          var speed = indexToSpeed(index);
          self.gameBoy.setSpeed(speed);
          self.store.setProperty(App.Controller.Domain.SETTINGS, App.Store.Property.SPEED, speed);
        });

        self.store.property(App.Controller.Domain.SETTINGS, App.Store.Property.SPEED, function(speed) {
          if (speed !== undefined) {
            self.gameBoy.setSpeed(speed);
            self.speed.setIndex(speedToIndex(speed));
          }
        });

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
