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
      self.grid = new App.Grid(device);
      self.items = [];

      self.library.onStateChange(function(state) {
        if (state === App.Library.State.LOADING) {
          self.empty.fadeOut();
          self.authorize.fadeOut();
          if (self.library.count() < 1) {
            self.loading.fadeIn();
          }
        } else if (state === App.Library.State.UNAUTHORIZED) {
          window.tracker.track('games/unauthorized');
          self.empty.fadeOut();
          self.loading.fadeOut();
          self.authorize.fadeIn();
        } else if (state === App.Library.State.UPDATING) {
          window.tracker.track('games/update');
          self.empty.fadeOut();
          self.authorize.fadeOut();
          if (self.library.count() < 1) {
            self.loading.fadeIn();
          }
        } else {
          self.loading.fadeOut();
          self.authorize.fadeOut();
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
