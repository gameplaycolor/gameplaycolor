/* 
 * jsgb.graphics.js v0.02 - Timers functions for JSGB, a GameBoy Emulator
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
 
var gbDIVTicks = 0;         // DIV Ticks Count
var gbLCDTicks = 0;         // ScanLine Counter
var gbTimerTicks = 0;       // Timer Ticks Count
var gbTimerOverflow = 1024; // Timer Max Ticks

function gb_Set_Timer_Freq(f) {
  switch(f) {   // TAC bits 0 and 1
    case 0: gbTimerOverflow=1024; return; // 4.096 KHz
    case 1: gbTimerOverflow=16; return;   // 262.144 Khz
    case 2: gbTimerOverflow=64; return;   // 65.536 KHz
    case 3: gbTimerOverflow=256; return;  // 16.384 KHz
  }  
}          

function gb_Mode0() { // H-Blank 
  if (gbRegSTAT_Mode!=0) {
    gbMemory[_STAT_]&=0xFC; // set STAT bits 1-0 to 0
    gbRegSTAT_Mode=0;
    if (gbRegSTAT_IntMode0) MEMW(_IF_,gbRegIF|2); // if STAT bit 3 -> set IF bit1
  }  
}

function gb_Mode2() { // OAM in use
  if (gbRegSTAT_Mode!=2) {
    gbRegSTAT_Mode=2;
    gbMemory[_STAT_]=(gbMemory[_STAT_]&0xFC)|2;// set STAT bits 1-0 to 2
    if (gbRegSTAT_IntMode2) MEMW(_IF_,gbRegIF|2);// set IF bit 1
  }  
}

function gb_Mode3() { // OAM+VRAM busy
  if (gbRegSTAT_Mode!=3) {
    gbRegSTAT_Mode=3;
    gbMemory[_STAT_]|=3; // set STAT bits 1-0 to 3
    if (gbRegLCDC_DisplayOn) gb_Draw_Scanline();
    else gb_Clear_Scanline();
  }
}

function gb_Mode1() { // V-Blank  
  gbRegSTAT_Mode=1;
  gbMemory[_STAT_]=(gbMemory[_STAT_]&0xFC)|1;
  if (gbRegSTAT_IntMode1) MEMW(_IF_,gbRegIF|2); // set IF flag 1
  MEMW(_IF_,gbRegIF|1); // set IF flag 0 
  if (gbRegLCDC_DisplayOn) gb_Framebuffer_to_LCD(); // Display frame
  else gbLCDCtx.fillRect(0,0,160,144);;
}

function gb_LY_LYC_compare() { // LY - LYC Compare
  if (gbRegLY==gbRegLYC) { // If LY==LCY
    gbMemory[_STAT_]|=0x04; // set STAT bit 2: LY-LYC coincidence flag
    if (gbRegSTAT_IntLYLYC) MEMW(_IF_,gbRegIF|2); // set IF bit 1
  }      
  else {
    gbMemory[_STAT_]&=0xFB; // reset STAT bit 2 (LY!=LYC)
  }  
}

function gb_TIMER_Control() {

  // DIV control
  if ((gbDIVTicks+=gbCPUTicks)>=256) {
    gbDIVTicks-=256;
    gbMemory[_DIV_]=(++gbMemory[_DIV_])&0xFF; // inc DIV
  }    

  // LCD Timing
  gbLCDTicks+=gbCPUTicks; // ScanLineCounter += InstructionCyclesCount
  if (gbLCDTicks>=456){ // when ScanLineCounter overflows -> new scanline        
    gbLCDTicks-=456;
    // I'm comparing LY and LYC before incrementing LY
    // that's because MarioLand and the dot under the coin
    gb_LY_LYC_compare(); 
    if ((++gbRegLY)>=154) gbRegLY-=154; // inc LY (current scanline)
    gbMemory[_LY_]=gbRegLY;
    if (gbRegLY==144) gb_Mode1(); // mode1: 4560 cycles
    else if (gbRegLY==0) {
      gbEndFrame=true;
      gbFPS++;
    }   
  }
  if (gbRegLY<144) { // if not in V-Blank
    if (gbLCDTicks<=204) gb_Mode0(); // mode0: 204 cycles
    else if (gbLCDTicks<=284) gb_Mode2(); // mode2: 80 cycles
    else gb_Mode3(); // mode3: 172 cycles
  }

  // Internal Timer
  if (gbRegTAC_TimerOn) {
    if ((gbTimerTicks+=gbCPUTicks)>=gbTimerOverflow) {
      gbTimerTicks-=gbTimerOverflow;
      if ((++gbMemory[_TIMA_])>=256) {
        gbMemory[_TIMA_]=gbMemory[_TMA_];
        MEMW(_IF_,gbRegIF|4); // set IF bit 2
      }
    }
  }  
}
