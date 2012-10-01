/* 
 * jsgb.toolbox.js - This is part of JSGB, a JavaScript GameBoy Emulator
 * Copyright (C) 2009 Pedro Ladaria <Sonic1980 at Gmail dot com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * version 2 as published by the Free Software Foundation.
 * The full license is available at http://www.gnu.org/licenses/gpl.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 */
 
var br='<br/'+'>\n';

// Convert an 8 bit number into a JavaScript signed integer
// Z80's negative numbers are in two's complement
function sb(n){return (n>127)?((n&127)-128):n;}

// Left zero fill until length of s = l
function zf(s,l) {while (s.length<l)s='0'+s;return s;}

// Convert decimal to hexadecimal
function hex(n){return (n*1).toString(16).toUpperCase();}
function hex2(n) {return zf(hex(n),2);};
function hex4(n) {return zf(hex(n),4);};

// Convert decimal to binary
function bin(n){return (n*1).toString(2);}

// Insert a space every "l" chars.
// for example: sp('12345678',4) returns '1234 5678'
function sp(s,l){
  var r=[],i=0;
  while (s.length>l) {
    r[i++]=s.substr(0,l);
    s=s.substr(l);
  }
  if (s.length>0) r[i]=s;
  return r.join('&nbsp;');
}

// Get element from id
function $(id){return document.getElementById(id);}

// Get milliseconds from the UNIX epoch
function get_ms(){return new Date().getTime();}

// Random number between a and b
function rand2(a,b) { return a+Math.round(Math.random()*(b-a)); }

// Get object properties
function printObj(o) {
  var s = "" ;
  for (var p in o) s+=p+" = "+o[p]+"\n" ;
  return s ;
}



