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

  App.Settings = function(drive, store, gameBoy, console) {
    this.init(drive, store, gameBoy, console);
  };
  
  jQuery.extend(
    App.Settings.prototype, {
      
      init: function(drive, store, gameBoy, console) {
        var self = this;
        self.drive = drive;
        self.store = store;
        self.gameBoy = gameBoy;
        self.console = console;
        self.element = $('#screen-settings');
        self.dialog = $('#dialog-settings');

        self.scroll = new App.Controls.Scroll($('#dialog-settings-body'));

        self.element.get(0).addEventListener('touchmove', function(e) {
          e.preventDefault();
        }, false);

        // Sound

        self.sound = new App.Controls.Switch($('#switch'), function(target, selected) {
          target.setSelected(selected);
          self.store.setProperty(App.Controller.Domain.SETTINGS, App.Store.Property.SOUND, selected);
          self.gameBoy.setSoundEnabled(selected !== 0);
        });

        var setSoundEnabled = function(enabled) {
          if (enabled === true) {
            var audio = document.getElementById('silent');
            audio.addEventListener('ended', function() {
              self.gameBoy.setSoundEnabled(true);
            });
            audio.play();
          } else {
            self.gameBoy.setSoundEnabled(false);
          }
        }

        self.store.property(App.Controller.Domain.SETTINGS, App.Store.Property.SOUND, function(sound) {
          if (sound !== undefined) {
            self.sound.setSelected(sound);
            setSoundEnabled(sound !== 0);
          } else {
            self.sound.setSelected(1);
            setSoundEnabled(true);
          }
        });

        // Speed

        var speeds = [1.0, 1.5, 2.0, 3.0];

        self.speed = new App.Controls.Segmented($('#emulation-speed'), function(index) {
          self.speed.setIndex(index);
          var speed = speeds[index];
          self.gameBoy.setSpeed(speed);
          self.store.setProperty(App.Controller.Domain.SETTINGS, App.Store.Property.SPEED, speed);
        });

        self.store.property(App.Controller.Domain.SETTINGS, App.Store.Property.SPEED, function(speed) {
          if (speed !== undefined) {
            self.gameBoy.setSpeed(speed);
            self.speed.setIndex(speeds.indexOf(speed));
          }
        });

        // Color

        var colors = ["grape", "cherry", "teal", "lime", "yellow"];

        self.color = new App.Controls.Segmented($('#console-color'), function(index) {
          self.color.setIndex(index);
          self.console.setColor(colors[index]);
          self.store.setProperty(App.Controller.Domain.SETTINGS, App.Store.Property.COLOR, colors[index]);
        });

        self.store.property(App.Controller.Domain.SETTINGS, App.Store.Property.COLOR, function(color) {
          if (color !== undefined) {
            self.color.setIndex(colors.indexOf(color));
          } else {
            self.color.setIndex(0);
          }
        });

        // Version

        $('#application-version').text(window.config.version);

        // Sign out

        self.signOut = new App.Controls.Button($('#screen-settings-sign-out'), { touchUpInside: function() {
          utilities.dispatch(function() {
            if (confirm("Sign out of Google Drive?")) {
              self.drive.signOut().fail(function(e) {
                alert("Unable to sign out of Google Drive.\n" + e);
              });
              self.hide();
            }
          });
        }});

        // Thanks

        self.thanks = new App.Controls.Button($('#screen-settings-say-thanks'), { touchUpInside: function() {
          utilities.open_new_window("https://gameplaycolor.com/thanks/");
        }});

        // Done

        self.done = new App.Controls.Button($('#screen-settings-done'), { touchUpInside: function() {
          self.hide();
        }});

      },
      
      hide: function() {
        var self = this;
        self.element.addClass('hidden');
        setTimeout(function() {
          self.element.css('display', 'none');
            document.getElementsByTagName('body')[0].style.overflow = ''; // Allow scrolling.
        }, 200);
      },
      
      show: function() {
        var self = this;
        document.getElementsByTagName('body')[0].style.overflow = 'hidden'; // Prevent scrolling.
        self.element.css('display', 'block');
        setTimeout(function() {
          self.element.removeClass('hidden');
        }, 0);
        
      }
      
  });

})(jQuery);
