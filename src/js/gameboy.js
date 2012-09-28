document.addEventListener('touchmove', function(e) {
    e.preventDefault();
    // var touch = e.touches[0];
    // alert(touch.pageX + " - " + touch.pageY);
}, false);

$(document).ready(function() {

  // Work out if we've been installed or not.
  // if (window.navigator.standalone) {
    $("#screen-console").show();
  // } else {
    // $("#screen-instructions").show();
  // }

});


