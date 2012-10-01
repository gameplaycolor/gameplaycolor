/* 
 * jsgb.debugger.js v0.02 - Memory module for JSGB, a GameBoy Emulator
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
 
var gbMemory = new Array(0x10000);

// special register mirror values and bit states
var gbRegLY = 0;
var gbRegLYC = 0;
var gbRegSCY = 0;
var gbRegSCX = 0;
var gbRegWY = 0;
var gbRegWX = 0;
var gbRegDIV = 0;
var gbRegIF = 0;
var gbRegIE = 0;
var gbRegSTAT_Mode = 0;
var gbRegSTAT_IntLYLYC = false;
var gbRegSTAT_IntMode2 = false;
var gbRegSTAT_IntMode1 = false;
var gbRegSTAT_IntMode0 = false;

var gbRegLCDC_DisplayOn = false;
var gbRegLCDC_WindowYOffs = 0;
var gbRegLCDC_WindowDisplay = false;
var gbRegLCDC_SpriteDisplay = false;
var gbRegLCDC_SpriteSize = false;
var gbRegLCDC_BackgroundYOffs = 0;
var gbRegLCDC_BackgroundXOffs = 0;
var gbRegLCDC_BgAndWinDisplay = false;
var gbRegTAC_TimerOn = false;

// special register addresses
var _P1_   = 0xFF00;
var _SC_   = 0xFF02;
var _DIV_  = 0xFF04;
var _TIMA_ = 0xFF05;
var _TMA_  = 0xFF06;
var _TAC_  = 0xFF07;
var _IF_   = 0xFF0F;
var _LCDC_ = 0xFF40;
var _STAT_ = 0xFF41;
var _SCY_  = 0xFF42;
var _SCX_  = 0xFF43;
var _LY_   = 0xFF44;
var _LYC_  = 0xFF45;
var _DMA_  = 0xFF46;
var _BGP_  = 0xFF47;
var _OBP0_ = 0xFF48;
var _OBP1_ = 0xFF49;
var _WY_   = 0xFF4A;
var _WX_   = 0xFF4B;
var _IE_   = 0xFFFF;

// start addresses
var _ROM0_ = 0x0000;
var _ROM1_ = 0x4000; 
var _VRAM_ = 0x8000; // video RAM
var _BTD0_ = 0x8000; // backgroun tile data 0
var _BTD1_ = 0x8800; // backgroun tile data 1
var _BTM0_ = 0x9800; // background tile map 0
var _BTM1_ = 0x9C00; // background tile map 1
var _RAM1_ = 0xA000; // switchable RAM
var _RAM0_ = 0xC000; // internal RAM
var _ECHO_ = 0xE000; // echo of internal RAM
var _OAM_  = 0xFE00; // object attribute

function gb_Memory_Read_ROM_Only(a) {
  return gbMemory[a];
}

function gb_Memory_Read_MBC1_ROM(a) {
  switch (a>>12) {
    case 0:
    case 1:
    case 2:
    case 3: return gbMemory[a];
    case 4: 
    case 5: 
    case 6: 
    case 7: return gbROM[gbROMBank1offs+a];
    default: return gbMemory[a];
  }  
}

var MEMR = gb_Memory_Read_ROM_Only;

function MEMW(a,v) {
  // Special registers+HRAM
  if (a>=0xFF00) {
    switch(a&0xFF) {
    case 0x00: // FF00 P1 Joypad
      //if(v==3)gbMemory[a]=0xF0; else // Fx->GB/GBP; 3x->SGB
      gb_Read_Joypad(v);
      return;    
    case 0x02: // FF02 SC
      gbMemory[0xFF02]=0;
      return;
    case 0x04: // FF04 DIV  
      gbMemory[0xFF04]=0; // Writing any value sets it to 0.
      return;
    case 0x07: // FF07 TAC - TIMER CONTROL  
      gbMemory[0xFF07]=v;
      gbRegTAC_TimerOn=((v&4)!=0);
      gb_Set_Timer_Freq(v&3);
      return;    
    case 0x0F: // FF0F IF - Interrupt Flags
      gbMemory[0xFF0F]=gbRegIF=(v&31);
      return;    
    case 0x40: // FF40 LCDC      
      var i=((v>>7)!=0);
      if (i!=gbRegLCDC_DisplayOn) {
        // TODO not sure on this
        gbMemory[_LY_]=gbRegLY=gbLCDTicks=0;
        //if (!i) gb_Clear_Framebuffer();
      }  
      gbRegLCDC_DisplayOn=i;
      gbRegLCDC_WindowYOffs=(v&64)?256:0;
      gbRegLCDC_WindowDisplay=(v&32)?true:false;
      gbRegLCDC_BackgroundXOffs=(v&16)?0:256;
      gbRegLCDC_BackgroundYOffs=(v&8)?256:0;
      gbRegLCDC_SpriteSize=(v&4)?16:8;
      gbRegLCDC_SpriteDisplay=(v&2)?true:false;
      gbRegLCDC_BgAndWinDisplay=(v&1)?true:false;
      gbMemory[0xFF40]=v;      
      return;
    case 0x41: // FF41 STAT
      gbRegSTAT_Mode=v&3;
      gbRegSTAT_IntLYLYC=(v&64)?true:false;
      gbRegSTAT_IntMode2=(v&32)?true:false;
      gbRegSTAT_IntMode1=(v&16)?true:false;
      gbRegSTAT_IntMode0=(v&8)?true:false;
      gbMemory[0xFF41]=v;
      return;    
    case 0x42: // FF42 SCY
      gbMemory[0xFF42]=gbRegSCY=v;
      return;    
    case 0x43: // FF43 SCX
      gbMemory[0xFF43]=gbRegSCX=v;
      return;    
    case 0x44: // FF44 LY
      gbMemory[0xFF44]=gbRegLY=0; // Writing any value sets it to 0.
      return;
    case 0x45: // FF45 LYC
      gbMemory[0xFF45]=gbRegLYC=v;
      return;
    case 0x46: // FF46 DMA TRANSFER  
      v=v<<8; // start address of DMA
      a=0xFE00; // OAM addr
      while (a<0xFEA0) gbMemory[a++] = MEMR(v++);
      return;
    case 0x47: // FF47 BGP - Background Palette
      gbMemory[0xFF47]=v;
      gbBackPal[0]=v&3;
      gbBackPal[1]=(v>>2)&3;
      gbBackPal[2]=(v>>4)&3;
      gbBackPal[3]=(v>>6)&3;
      return;
    case 0x48: // FF48 OBP0 - Sprite Palette 0
      gbMemory[0xFF48]=v;
      gbSpritePal[0][0]=v&3;
      gbSpritePal[0][1]=(v>>2)&3;
      gbSpritePal[0][2]=(v>>4)&3;
      gbSpritePal[0][3]=(v>>6)&3;
      return;
    case 0x49: // FF49 OBP1 - Sprite Palette 1
      gbMemory[0xFF49]=v;
      gbSpritePal[1][0]=v&3;
      gbSpritePal[1][1]=(v>>2)&3;
      gbSpritePal[1][2]=(v>>4)&3;
      gbSpritePal[1][3]=(v>>6)&3;
      return;            
    case 0x4A: // FF4A WY
      gbMemory[0xFF4A]=gbRegWY=v;
      return;
    case 0x4B: // FF4B WX
      gbMemory[0xFF4B]=gbRegWX=v;
      return;
    case 0xFF: // FFFF IE - Interrupt Enable
      gbMemory[0xFFFF]=gbRegIE=(v&31);
      return;    
    default: // THE OTHERS
      gbMemory[a]=v;
      return;
    }  
  }
  // writing to ROM?
  else if (a<0x8000) {

    switch (gbCartridgeType) {

    case _ROM_ONLY_:
      return;
       
    case _ROM_MBC1_:
      switch (a>>12) {
      // write to 2000-3FFF: select ROM bank
      case 2:
      case 3: 
        //$('STATUS').innerHTML='Select ROM Bank: '+(v&31);
        gbROMBankSwitch(v&31);
        return;
      // write to 6000-7FFF: select MBC1 mode
      case 6:
      case 7: 
        gbMBC1Mode = v&1;
        return;
      // unhandled cases
      default:
        //$('STATUS').innerHTML='Unhandled MBC1 ROM write:\naddr: '+hex4(a)+' - val: '+hex2(v);
        return;
      }
    default:
      alert('Unknown Memory Bank Controller.\naddr: '+hex4(a)+' - val: '+hex2(v));
      gb_Pause();
      return;   
    }
  }
  // make changes if the new value is different
  else if (gbMemory[a]!=v) {
    // 8000-97FF: Tile data
    if (a<0x9800) {
      gbUpdateTiles=true;
      gbUpdateTilesList[(a-0x8000)>>4]=true;
      gbMemory[a]=v;
    }
    // 9800-9FFF: Tile maps
    else if (a<0xA000) {
      gbUpdateBackground=true;
      gbUpdateBackgroundTileList[a-0x9800]=true;
      gbMemory[a]=v;
    }
    // A000-BFFF: Switchable RAM
    else if (a<0xC000) {
      gbMemory[a]=v;
    }
    // C000-DFFF: Internal RAM
    else if (a<0xE000) {
      gbMemory[a]=v;
      // C000-DDFF: Writes to ECHO
      if (a<0xDE00) gbMemory[a+0x2000]=v;
    }
    // E000-FDFF: ECHO
    else if (a<0xFE00) {
      gbMemory[a]=v;
      gbMemory[a-0x2000]=v;
    }
    else gbMemory[a]=v;
  }  
}

function where_mem(a) { // TODO rewrite this
  if (a<0x4000) return 'ROM0'; else
  if (a<0x8000) return 'ROM1'; else
  if (a<0xA000) return 'VRAM'; else
  if (a<0xC000) return 'RAM1'; else
  if (a<0xE000) return 'RAM0'; else
  if (a<0xFE00) return 'ECHO'; else
  if (a<0xFEA0) return 'OAM&nbsp;'; else
  if (a<0xFF00) return 'I/O&nbsp;'; else
  if (a<0xFF4C) return 'I/O&nbsp;'; else
  if (a<0xFF80) return 'I/O&nbsp;'; else
  if (a<0xFFFF) return 'HRAM'; else
  if (a=0xFFFF) return 'IE&nbsp;&nbsp;'; else
  return '&nbsp;&nbsp;&nbsp;&nbsp;';
}

function gb_Init_Memory() {
  var i=0x100000;
  while (i) {
    gbMemory[--i] = 0;
    gbMemory[--i] = 0;
    gbMemory[--i] = 0;
    gbMemory[--i] = 0;
  }
  MEMW(0xFF00,0xFF); // P1
  MEMW(0xFF04,0xAF); // DIV
  MEMW(0xFF05,0x00); // TIMA
  MEMW(0xFF06,0x00); // TMA
  MEMW(0xFF07,0xF8); // TAC
  MEMW(0xFF0F,0x00); // IF 
  MEMW(0xFF10,0x80); // NR10
  MEMW(0xFF11,0xBF); // NR11
  MEMW(0xFF12,0xF3); // NR12
  MEMW(0xFF14,0xBF); // NR14
  MEMW(0xFF16,0x3F); // NR21
  MEMW(0xFF17,0x00); // NR22
  MEMW(0xFF19,0xBF); // NR24
  MEMW(0xFF1A,0x7F); // NR30
  MEMW(0xFF1B,0xFF); // NR31
  MEMW(0xFF1C,0x9F); // NR32
  MEMW(0xFF1E,0xBF); // NR33
  MEMW(0xFF20,0xFF); // NR41
  MEMW(0xFF21,0x00); // NR42
  MEMW(0xFF22,0x00); // NR43
  MEMW(0xFF23,0xBF); // NR30
  MEMW(0xFF24,0x77); // NR50
  MEMW(0xFF25,0xF3); // NR51
  MEMW(0xFF26,0xF1); // NR52 0xF1->GB; 0xF0->SGB
  MEMW(0xFF40,0x91); // LCDC
  MEMW(0xFF42,0x00); // SCY
  MEMW(0xFF43,0x00); // SCX
  MEMW(0xFF44,0x00); // LY
  MEMW(0xFF45,0x00); // LYC
  MEMW(0xFF47,0xFC); // BGP
  MEMW(0xFF48,0xFF); // OBP0
  MEMW(0xFF49,0xFF); // OBP1
  MEMW(0xFF4A,0x00); // WY
  MEMW(0xFF4B,0x00); // WX
  MEMW(0xFFFF,0x00); // IE
}  

