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

        self.handleGameState = new App.Controls.Button($('#menu-button-game-state'), { touchUpInside: function () {
          $('#game-state-settings').show().removeClass('hidden')
          self.hide()
          setTimeout(function () {
            app.console.pause()
          }, 200);
        }})

        function hideGameStateSettings() {
          $('#game-state-settings').addClass('hidden')
          setTimeout(function () {
            $('#game-state-settings').hide()
            app.console.run()
          }, 200);
        }

        var loadDialog = $('#load-progress')
        function hideDialog() {
          loadDialog.addClass('hidden')
          setTimeout(function() {
            loadDialog.hide()
          }, 200)
        }

        self.gameStateOptions = {
          drivePush: new App.Controls.Button($('#drive-state-sync-push'), { touchUpInside: function () {
            if (navigator.onLine) {
              $('#up-or-down').html('Up')
              loadDialog.show().removeClass('hidden')
              drive.uploadGameState()
                .then(function() {
                  hideDialog()
                  hideGameStateSettings()
                })
                .fail(function() {
                  alert('An unknown error occured while trying to upload the game state')
                  hideDialog()
                })
            } else {
              alert('Unable to upload game state because you are not connected to the internet')
            }
          }}),
          drivePull: new App.Controls.Button($('#drive-state-sync-pull'), { touchUpInside: function () {
            if (navigator.onLine) {
              $('#up-or-down').html('Down')
              loadDialog.show().removeClass('hidden')
              drive.downloadGameState()
                .then(function(stateData) {
                  if (stateData) {
                    var game = gameboy.name
                    gameboy.name = 'temp'
                    setValue('B64_SRAM_' + game, stateData)
                    saveSRAM()
                    if (self.onReset !== undefined) {
                      self.onReset()
                    }
                  } else {
                    alert('No state has been saved for this game')
                  }
                  hideDialog()
                  hideGameStateSettings()
                })
                .fail(function() {
                  alert('An unknown error occured while trying to download the game state')
                  hideDialog()
                })
            } else {
              alert('Unable to retrieve game state because you are not connected to the internet')
            }
          }}),
          localUpload: new App.Controls.Button($('#local-state-upload'), { touchUpInside: function () {
            $('#state-file-input').click()
          }}),
          localDownload: new App.Controls.Button($('#local-state-download'), { touchUpInside: function () {
            hideGameStateSettings()

            var dataUrl = 'data:application/octet-stream;base64,' + saveState['B64_SRAM_' + gameboy.name]
            window.open(dataUrl)
          }}),
          cancel: new App.Controls.Button($('#game-state-cancel'), { touchUpInside: function () {
            hideGameStateSettings()
          }})
        }

        $('#state-file-input').on('change', function(e) {
          var file = e.target.files[0]

          var reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = function(ev) {
            var dataUrl = ev.target.result
            var stateData = dataUrl.split(',')[1]

            var game = gameboy.name
            gameboy.name = 'temp'
            setValue('B64_SRAM_' + game, stateData)
            saveSRAM()
            if (self.onReset !== undefined) {
              self.onReset()
            }

            hideGameStateSettings()
          }
        })
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
