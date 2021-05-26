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

  App.Games = function(device, gameBoy, library) {
    this.init(device, gameBoy, library);
  };

  jQuery.extend(
    App.Games.prototype, {

    init: function(device, gameBoy, library) {
      var self = this;
      self.device = device;
      self.gameBoy = gameBoy;
      self.library = library;
      self.element = $('#screen-games');
      self.empty = $('#screen-empty');
      self.loading = $('#screen-loading');
      self.grid = new App.Grid();
      self.items = [];

      self.library.onStateChange(function(state) {
        if (state === App.Library.State.LOADING) {
          self.empty.fadeOut();
          if (self.library.count() < 1) {
            self.loading.fadeIn();
          }
        } else if (state === App.Library.State.UNAUTHORIZED) {
          window.tracker.track('games/unauthorized');
          self.empty.fadeOut();
          self.loading.fadeOut();
        } else if (state === App.Library.State.UPDATING) {
          window.tracker.track('games/update');
          self.empty.fadeOut();
          if (self.library.count() < 1) {
            self.loading.fadeIn();
          }
        } else {
          self.loading.fadeOut();
          if (self.library.count() < 1) {
            self.empty.fadeIn();
          } else {
            self.empty.fadeOut();
          }
        }
      });

      self.library.onChange(function() {
        self.grid.reloadData();
      });

      self.grid.dataSource = self.library;
      self.grid.delegate = self.library;
      self.grid.reloadData();

    },

    update: function() {
      var self = this;
      self.library.update();
    },

  });

})(jQuery);
