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
    }
    
};