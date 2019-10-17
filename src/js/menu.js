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

        var loadDialog = $('#load-progress')
        function hideDialog(upOrDown, failed) {
          loadDialog.addClass('hidden')
          setTimeout(function() {
            loadDialog.hide()
            if (failed) {
              alert('An unknown error occurred while ' + upOrDown + 'loading the game state')
            }
          }, 150)
        }
        self.saveGameState = new App.Controls.Button($('#menu-button-save-state'), { touchUpInside: function () {
          self.hide()
          if (navigator.onLine) {
            $('#up-or-down').html('Up')
            loadDialog.show().removeClass('hidden')
            drive.uploadGameState()
              .then(function() {
                hideDialog()
              })
              .fail(function() {
                alert('An unknown error occured while trying to upload the game state')
                hideDialog('up', true)
              })
          } else {
            alert('Unable to upload game state because you are not connected to the internet')
          }
        }})
        self.loadGameState = new App.Controls.Button($('#menu-button-load-state'), { touchUpInside: function () {
          self.hide()
          if (navigator.onLine) {
            $('#up-or-down').html('Down')
            loadDialog.show().removeClass('hidden')
            drive.downloadGameState()
              .then(function(stateData) {
                if (stateData) {
                  setValue('B64_SRAM_' + gameboy.name, stateData)
                  saveSRAM()
                  if (self.onReset !== undefined) {
                    self.onReset()
                  }
                } else {
                  alert('No state has been saved for this game')
                }
                hideDialog()
              })
              .fail(function() {
                alert('An unknown error occured while trying to download the game state')
                hideDialog('up', true)
              })
          } else {
            alert('Unable to retrieve game state because you are not connected to the internet')
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
