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

var utilities = {

    encode_utf8: function(s) {
      return unescape(encodeURIComponent(s));
    },

    decode_utf8: function(s) {
      return decodeURIComponent(escape(s));
    },

    btoa: function(input) {
      return btoa(utilities.encode_utf8(input));
    },

    atob: function(input) {
      return utilities.decode_utf8(atob(input));
    },

    arrayToBase64: function(u8Arr) {
      var CHUNK_SIZE = 0x8000;
      var index = 0;
      var length = u8Arr.length;
      var result = '';
      var slice;
      while (index < length) {
        var max = Math.min(index + CHUNK_SIZE, length);
        slice = u8Arr.slice(index, max);
        result += String.fromCharCode.apply(null, slice);
        index += CHUNK_SIZE;
      }
      return btoa(result);
    },

    base64ToArray: function(b64encoded) {
      var u8_2 = new Uint8Array(atob(b64encoded).split("").map(function(c) {
        return c.charCodeAt(0); }));
      return u8_2;
    },

    /**
     * Open a URL in a new window.
     */
    open_new_window: function(url) {
      // Code snippit from http://stackoverflow.com/questions/5423332/launch-mobile-safari-from-full-screen-web-app-on-iphone.
      // Ensures we launch Mobile Safari when in standalone mode.
      var $a = $('<a href="' + url + '" target="_blank"/>');
      $("body").append($a);
      var a = $a.get(0);
      var mouseEvent = a.ownerDocument.createEvent('MouseEvents');
      mouseEvent.initMouseEvent('click');
      a.dispatchEvent(mouseEvent);
      $a.remove();
    },

    dispatch: function(func) {
      setTimeout(func, 10);
    },

};