
Gameboy = {};

Gameboy.Key = {
  START: 65,
  SELECT: 83,
  A: 88,
  B: 90,
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39,
};

document.addEventListener('touchmove', function(e) {
    e.preventDefault();
    // var touch = e.touches[0];
    // alert(touch.pageX + " - " + touch.pageY);
}, false);

$j(document).ready(function() {

  // Work out if we've been installed or not.
  // if (window.navigator.standalone) {
    $j("#screen-console").show();
  // } else {
    // $("#screen-instructions").show();
  // }

});

function gb_Show_Fps() {}

function gb_KeyDown(keycode) {
  var e = { 'which': keycode, 'preventDefault': function() {} };
  gb_OnKeyDown_Event(e);
}

function gb_KeyUp(keycode) {
  var e = { 'which': keycode, 'preventDefault': function() {} };
  gb_OnKeyUp_Event(e);
}