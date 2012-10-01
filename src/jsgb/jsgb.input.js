/* 
 * jsgb.input.js v0.02 - buttons input module for JSGB, a JS GameBoy Emulator
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
 
var gbPin14=0; // up down left right
var gbPin15=0; // start select a b

function gb_Read_Joypad(v) {
  switch ((v>>4)&3) {
    case 0: gbMemory[_P1_]=gbPin14 & gbPin15; return; // TODO not sure on this
    case 1: gbMemory[_P1_]=gbPin15; return;
    case 2: gbMemory[_P1_]=gbPin14; return;
    case 3: gbMemory[_P1_]=0xFF; return; // TODO not sure on this
  }
}
    
function gb_OnKeyDown_Event(e) {
  //$('DEBUG').innerHTML=document.title=e.which;  
  switch (e.which) {
    // down
    case 40: gbPin14&=0xF7; MEMW(_IF_,gbRegIF|16); e.preventDefault(); return;
    // up
    case 38: gbPin14&=0xFB; MEMW(_IF_,gbRegIF|16); e.preventDefault(); return;
    // left
    case 37: gbPin14&=0xFD; MEMW(_IF_,gbRegIF|16); e.preventDefault(); return;
    // right
    case 39: gbPin14&=0xFE; MEMW(_IF_,gbRegIF|16); e.preventDefault(); return;    
    // start
    case 65: gbPin15&=0xF7; MEMW(_IF_,gbRegIF|16); e.preventDefault(); return;
    // select
    case 83: gbPin15&=0xFB; MEMW(_IF_,gbRegIF|16); e.preventDefault(); return;
    // button B
    case 90: gbPin15&=0xFD; MEMW(_IF_,gbRegIF|16); e.preventDefault(); return;
    // button A
    case 88: gbPin15&=0xFE; MEMW(_IF_,gbRegIF|16); e.preventDefault(); return;
  }
}

function gb_OnKeyUp_Event(e) {
  switch (e.which) {
    // down
    case 40: gbPin14|=8; MEMW(_IF_,gbRegIF|16); e.preventDefault(); return;
    // up
    case 38: gbPin14|=4; MEMW(_IF_,gbRegIF|16); e.preventDefault(); return;
    // left
    case 37: gbPin14|=2; MEMW(_IF_,gbRegIF|16); e.preventDefault(); return;
    // right
    case 39: gbPin14|=1; MEMW(_IF_,gbRegIF|16); e.preventDefault(); return;
    // start
    case 65: gbPin15|=8; MEMW(_IF_,gbRegIF|16); e.preventDefault(); return;
    // select
    case 83: gbPin15|=4; MEMW(_IF_,gbRegIF|16); e.preventDefault(); return;
    // button B
    case 90: gbPin15|=2; MEMW(_IF_,gbRegIF|16); e.preventDefault(); return;
    // button A
    case 88: gbPin15|=1; MEMW(_IF_,gbRegIF|16); e.preventDefault(); return;
  }
}

function gb_Init_Input() {
  document.onkeydown = gb_OnKeyDown_Event;
  document.onkeyup = gb_OnKeyUp_Event;
  gbPin14=0xEF;
  gbPin15=0xDF;
}  

