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

var utilities = {

    encode_utf8: function(s) {
      return unescape(encodeURIComponent(s));
    },

    decode_utf8: function(s) {
      return decodeURIComponent(escape(s));
    },

    btoa: function(input) {
      return window.btoa(utilities.encode_utf8(input));
    },

    atob: function(input) {
      return utilities.decode_utf8(window.atob(input));
    },

    arrayBufferToBinaryString: function(buffer) {
      const byteArray = new Uint8Array(buffer);
      let binaryString = '';
      for (let i = 0; i < byteArray.length; i++) {
        binaryString += String.fromCharCode(byteArray[i] & 0xFF);
      }
      return binaryString;
    },

    arrayBufferToBase64: function(buffer) {
      let binary = '';
      const bytes = new Uint8Array(buffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return window.btoa(binary);
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
      return window.btoa(result);
    },

    base64ToArray: function(b64encoded) {
      var u8_2 = new Uint8Array(window.atob(b64encoded).split("").map(function(c) {
        return c.charCodeAt(0); }));
      return u8_2;
    },

    fileExtension: function(filename) {
      const lastDotIndex = filename.lastIndexOf('.');
      if (lastDotIndex !== -1) {
        return filename.slice(lastDotIndex + 1).toLowerCase();
      }
      return '';
    },

    basename: function(filename) {
      const lastDotIndex = filename.lastIndexOf('.');
      if (lastDotIndex !== -1) {
        return filename.slice(0, lastDotIndex);
      }
      return '';
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