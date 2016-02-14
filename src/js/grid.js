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

  App.Grid = function() {
    this.init();
  };
  
  App.Grid.Cell = {
    WIDTH:  150,
    HEIGHT: 150,
    MARGIN: 20
  };

  App.Grid.Margin = {
    TOP: 46,
    LEFT: 20,
    BOTTOM: 100,
    RIGHT: 20,
  };

  jQuery.extend(App.Grid.prototype, {

    init: function() {
      var self = this;
      self.element = $('#list-games');
      self.items = [];
      self.rows = 0;

      self.dataSource = {
        'count' : function() { return 0; },
        'titleForIndex': function(index) { return ''; }
      };

      self.delegate = {
        didSelectItemForRow: function(index, element) {},
        didLongPressItem: function(index, element) {}
      };
      
      $(window).resize(function() {
        self.reloadData();
      });
      
    },
    
    reloadData: function() {
      var self = this;
      
      self.items = [];
      self.element.html("");

      for (var i = 0; i < self.dataSource.count(); i++) {
        self.add(i);
      }

    },
    
    containerWidth: function() {
      var self = this;
      return self.element.width();
    },

    containerHeight: function() {
      var self = this;
      return self.element.height();
    },
    
    add: function(index) {
      var self = this;
      
      var columns = Math.floor((self.containerWidth() - App.Grid.Margin.LEFT - App.Grid.Margin.RIGHT + App.Grid.Cell.MARGIN) / (App.Grid.Cell.WIDTH + App.Grid.Cell.MARGIN));
      var rows = Math.floor((self.containerHeight() - App.Grid.Margin.TOP - App.Grid.Margin.BOTTOM + App.Grid.Cell.MARGIN) / (App.Grid.Cell.HEIGHT + App.Grid.Cell.MARGIN));

      var row = Math.floor(self.items.length / columns);
      var col = self.items.length % columns;

      var contentWidth = ((App.Grid.Cell.MARGIN + App.Grid.Cell.WIDTH) * columns) - App.Grid.Cell.MARGIN;
      var offsetLeft = Math.floor((self.containerWidth() - contentWidth) / 2);

      var y = App.Grid.Margin.TOP + ((App.Grid.Cell.HEIGHT + App.Grid.Cell.MARGIN) * row);
      var x = offsetLeft + ((App.Grid.Cell.WIDTH + App.Grid.Cell.MARGIN) * col);

      var element = self.dataSource.elementForIndex(index);
      element.css('top', y);
      element.css('left', x);
      element.css('height', App.Grid.Cell.HEIGHT);
      element.css('width', App.Grid.Cell.WIDTH);

      var index = self.items.length;
      var longPressActive = false;
      var button = new App.Controls.Button(element, {
        longPress: function() {
          self.delegate.didLongPressItem(index, element);
        },
        touchUpInside: function() {
          self.delegate.didSelectItemForRow(index , element);
        },
      });
      button.cancelOnMove = true;
      button.preventDefault = false;
      self.items.push({
        'x1': x,
        'y1': y,
        'x2': x + App.Grid.Cell.WIDTH,
        'y2': y + App.Grid.Cell.HEIGHT,
        'element': element,
        'button': button,
      });

      self.element.append(element);
      self.element.css('height', y + App.Grid.Cell.HEIGHT + App.Grid.Cell.MARGIN);
      
    },

    elementForIndex: function(index) {
      var self = this;
      var details = self.items[index];
      return details.element;
    },

  });

})(jQuery);
