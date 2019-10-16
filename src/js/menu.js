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

  App.Menu = function(willShow, didHide) {
    this.init(willShow, didHide);
  };
  
  jQuery.extend(
    App.Menu.prototype, {
      
      init: function(willShow, didHide) {
        var self = this;
        self.onReset = undefined;
        self.onABStartSelect = undefined;
        self.willShow = willShow;
        self.didHide = didHide;
        self.screen = $('#screen-menu');
        self.element = $('#game-menu');
        self.cancel = new App.Controls.Button($('#menu-button-cancel'), { touchUpInside: function() {
          self.hide();
        }});
        self.reset = new App.Controls.Button($('#menu-button-reset'), { touchUpInside: function() {
          if (self.onReset !== undefined) {
            self.onReset();
          }
          self.hide();
        }});
        self.ABStartSelect = new App.Controls.Button($('#menu-button-a-b-start-select'), { touchUpInside: function () {
          if (self.onABStartSelect !== undefined) {
            self.onABStartSelect();
          }
          self.hide();
        }});
        self.saveGameState = new App.Controls.Button($('#menu-button-save-state'), { touchUpInside: function () {
          if (drive.gameStates) {
            var name = gameboy.name
            drive.gameStates[name] = saveState['B64_SRAM_' + name]

            function hideDialog(failed) {
              uploadDialog.addClass('hidden')
              setTimeout(function() {
                uploadDialog.hide()
                if (failed) {
                  alert('An unknown error occurred while uploading the game state')
                }
              }, 150)
            }

            var uploadDialog = $('#upload-progress')
            uploadDialog.show().removeClass('hidden')
            drive.uploadGameStates()
              .then(function() {
                hideDialog()
              })
              .fail(function() {
                hideDialog(true)
              })

          } else {
            alert('Unable to upload game state at this time, relaunch and try again')
          }
        }})

        self.loadGameState = new App.Controls.Button($('#menu-button-load-state'), { touchUpInside: function () {
          if (drive.gameStates) {
            var game = gameboy.name
            var stateData = drive.gameStates[game]
            if (stateData) {
              setValue('B64_SRAM_' + game, stateData)
              saveSRAM()
              if (self.onReset !== undefined) {
                self.onReset()
              }
            } else {
              alert('No game state has been saved for this game')
            }
          } else {
            alert('Unable to retrieve game state at this time, Relaunch and try again')
          }
        }})
      },
      
      hide: function() {
        var self = this;
        self.element.addClass('hidden');
        self.screen.addClass('hidden');
        setTimeout(function() {
          self.element.css('display', 'none');
          self.screen.css('display', 'none');
          document.getElementsByTagName('body')[0].style.overflow = ''; // Allow scrolling.
          if (self.didHide !== undefined) {
            self.didHide();
          }
        }, 200);
      },
      
      show: function() {
        var self = this;
        if (self.willShow !== undefined) {
          self.willShow();
        }
        document.getElementsByTagName('body')[0].style.overflow = 'hidden'; // Prevent scrolling.
        self.screen.css('display', 'block');
        self.element.css('display', 'block');
        setTimeout(function() {
          self.screen.removeClass('hidden');
          self.element.removeClass('hidden');
        }, 0);
        
      }
      
  });

})(jQuery);
