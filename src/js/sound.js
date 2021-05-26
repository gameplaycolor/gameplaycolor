/*
 * Copyright (c) 2012-2021 InSeven Limited
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

(function($) {

  App.SoundMenu = function(willShow, didHide) {
    this.init(willShow, didHide);
  };

  jQuery.extend(
    App.SoundMenu.prototype, {

      init: function(willShow, didHide) {
        var self = this;
        self.onReset = undefined;
        self.onABStartSelect = undefined;
        self.willShow = willShow;
        self.didHide = didHide;
        self.screen = $('#screen-sound');
        self.element = $('#screen-sound-menu');
        self.cancel = new App.Controls.Button($('#screen-sound-menu-button-cancel'), { touchUpInside: function() {
          self.hide();
        }});
        self.enable = new App.Controls.Button($('#screen-sound-menu-button-enable-sound'), { touchUpInside: function() {
          if (self.enable !== undefined) {
            self.onEnable();
          }
          self.hide();
        }});
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
