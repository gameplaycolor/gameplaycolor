/* 
 * jsgb.interrupts.js v0.02 - Interrupt handling for JSGB, a GameBoy Emulator
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

var gbInterrupts = [];
 
function gb_Int_VBlank() { // IF/IE bit 0
  gbIME=gbHalt=false;
  MEMW(_IF_,gbRegIF&0xFE); // reset IF bit 0
  MEMW(--SP,PC>>8);
  MEMW(--SP,PC&0xFF);
  PC=0x0040;
  gbCPUTicks+=32;
}

function gb_Int_STAT() { // IF/IE bit 1
  gbIME=gbHalt=false;
  MEMW(_IF_,gbRegIF&0xFD); // reset IF bit 1
  MEMW(--SP,PC>>8);
  MEMW(--SP,PC&0xFF);
  PC=0x0048;
  gbCPUTicks+=32;
}

function gb_Int_Timer() { // IF/IE bit 2
  gbIME=gbHalt=false;
  MEMW(_IF_,gbRegIF&0xFB); // reset IF bit 2
  MEMW(--SP,PC>>8);
  MEMW(--SP,PC&0xFF);
  PC=0x0050;
  gbCPUTicks+=32;
}

function gb_Int_Serial() { // IF/IE bit 3
  gbIME=gbHalt=false;
  MEMW(_IF_,gbRegIF&0xF7); // reset IF bit 3
  MEMW(--SP,PC>>8);
  MEMW(--SP,PC&0xFF);
  PC=0x0058;
  gbCPUTicks+=32;
}

function gb_Int_Buttons() { // IF/IE bit 4
  gbIME=gbHalt=false;
  MEMW(_IF_,gbRegIF&0xEF); // reset IF bit 4
  MEMW(--SP,PC>>8);
  MEMW(--SP,PC&0xFF);
  PC=0x0060;
  gbCPUTicks+=32;
}

function gb_Init_Interrupts() {
  gbIME=gbHalt=false;
  for (var i=0; i<32; i++) {
    if (i&1) gbInterrupts[i] = gb_Int_VBlank; else    
    if (i&2) gbInterrupts[i] = gb_Int_STAT; else    
    if (i&4) gbInterrupts[i] = gb_Int_Timer; else    
    if (i&8) gbInterrupts[i] = gb_Int_Serial; else    
    if (i&16)gbInterrupts[i] = gb_Int_Buttons; else
    gbInterrupts[i] = function(){};   
  }
}
