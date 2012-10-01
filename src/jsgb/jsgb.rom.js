/* 
 * jsgb.rom.js v0.01 - ROM loader for JSGB, a GameBoy Emulator
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
 
var gbROM = [];
var gbCartridgeType = 0;
var gbBankSwitchCount = 0;

var _ROM_ONLY_ = 0x00;
var _ROM_MBC1_ = 0x01;

var gbMBC1Mode = 0;

var gbROMBank1offs = 0;

var gbCartridgeType = 0;
var gbCartridgeTypes = [];
gbCartridgeTypes[0] = 'ROM only';
gbCartridgeTypes[1] = 'ROM+MBC1';

var gbROMBanks = []; // 1 Bank = 16 KBytes = 256 Kbits
gbROMBanks[0x00] = 2;
gbROMBanks[0x01] = 4;
gbROMBanks[0x02] = 8;
gbROMBanks[0x03] = 16;
gbROMBanks[0x04] = 32;
gbROMBanks[0x05] = 64;
gbROMBanks[0x06] = 128;
gbROMBanks[0x52] = 72;
gbROMBanks[0x53] = 80;
gbROMBanks[0x54] = 96;

var gbRAMBanks = [];
gbRAMBanks[0] = 0;
gbRAMBanks[1] = 1;
gbRAMBanks[2] = 2; // ? docs say 1
gbRAMBanks[3] = 4;
gbRAMBanks[4] = 16;

var gbROMInfo = {};

function gb_ROM_Load(fileName) {
  gbBankSwitchCount = 0;    
  gbROM = [];
  var i = 0;
  var req = new XMLHttpRequest();
  req.open('GET', fileName, false);
  req.overrideMimeType('text/plain; charset=x-user-defined');
  req.send(null);
  if ((req.readyState==4)/*&&(req.status==200)*/) {
    var s=req.responseText;
    i=s.length;
    while (i--) gbROM[i]=s.charCodeAt(i)&0xff;
    i=0x8000;
    while (i--) gbMemory[i]=gbROM[i]; // copy 2 banks into memory
  }
  else {
    alert('Error loading ROM: '+fileName);
  }
  // ROM and RAM banks
  gbROMInfo.ROMBanks = gbROMBanks[gbROM[0x148]];
  gbROMInfo.RAMBanks = gbRAMBanks[gbROM[0x149]];
  // ROM name
  var s = gbROM.slice(0x0134,0x0143);
  gbROMInfo.Name = '';
  for (var i=0; i<16; i++) {
    if (s[i]==0) break;
    gbROMInfo.Name+=String.fromCharCode(s[i]);
  }
  // Cartridge type
  gbROMInfo.CartridgeType = gbCartridgeType = gbROM[0x147];
  // Set MEMR function
  switch (gbROMInfo.CartridgeType) {
  case _ROM_ONLY_:
    MEMR = gb_Memory_Read_ROM_Only;
    break;
  case _ROM_MBC1_:
    MEMR = gb_Memory_Read_MBC1_ROM; 
    gbMBC1Mode = 0;
    break;
  }

}

function gbROMBankSwitch(bank) {
  gbBankSwitchCount++;  
  gbROMBank1offs = (bank==0)?0:(--bank*0x4000); // new ROM Bank 1 address
  /*
  var i = (0x4000>>5)+1; // loops count
  var j = 0x4000-1; // write address
  var k = (bank==0)?((0x4000)-1):((bank*0x4000)-1); // read address
  while (--i) { 
    gbMemory[++j]=gbROM[++k]; gbMemory[++j]=gbROM[++k];
    gbMemory[++j]=gbROM[++k]; gbMemory[++j]=gbROM[++k];
    gbMemory[++j]=gbROM[++k]; gbMemory[++j]=gbROM[++k];
    gbMemory[++j]=gbROM[++k]; gbMemory[++j]=gbROM[++k];
    //8
    gbMemory[++j]=gbROM[++k]; gbMemory[++j]=gbROM[++k];
    gbMemory[++j]=gbROM[++k]; gbMemory[++j]=gbROM[++k];
    gbMemory[++j]=gbROM[++k]; gbMemory[++j]=gbROM[++k];
    gbMemory[++j]=gbROM[++k]; gbMemory[++j]=gbROM[++k];
    //16
    gbMemory[++j]=gbROM[++k]; gbMemory[++j]=gbROM[++k];
    gbMemory[++j]=gbROM[++k]; gbMemory[++j]=gbROM[++k];
    gbMemory[++j]=gbROM[++k]; gbMemory[++j]=gbROM[++k];
    gbMemory[++j]=gbROM[++k]; gbMemory[++j]=gbROM[++k];
    //24
    gbMemory[++j]=gbROM[++k]; gbMemory[++j]=gbROM[++k];
    gbMemory[++j]=gbROM[++k]; gbMemory[++j]=gbROM[++k];
    gbMemory[++j]=gbROM[++k]; gbMemory[++j]=gbROM[++k];
    gbMemory[++j]=gbROM[++k]; gbMemory[++j]=gbROM[++k];
    //32
  }
  */
}


/*
   MBC1 (Memory Bank Controller 1)

     MBC1 has two different maximum memory modes:
     16Mbit ROM/8KByte RAM
     4Mbit ROM/32KByte RAM.

     The MBC1 defaults to 16Mbit ROM/8KByte RAM mode
     on power up.
     
     Writing a value (XXXXXXXS - X = Don't
     care, S = Memory model select) into 6000-7FFF area
     will select the memory model to use. 
     
     S = 0 selects 16/8 mode. -> default
     S = 1 selects 4/32 mode.

     Writing a value (XXXBBBBB - X = Don't cares, B =
     bank select bits) into 2000-3FFF area will select
     an appropriate ROM bank at 4000-7FFF. Values of 0
     and 1 do the same thing and point to ROM bank 1.

     Rom bank 0 is not accessible from 4000-7FFF and can
     only be read from 0000-3FFF.

      If memory model is set to 4/32: [1]
       Writing a value (XXXXXXBB - X = Don't care, B =
       bank select bits) into 4000-5FFF area will select
       an appropriate RAM bank at A000-C000. Before you
       can read or write to a RAM bank you have to enable
       it by writing a XXXX1010 into 0000-1FFF area*.
       
       To disable RAM bank operations write any value but
       XXXX1010 into 0000-1FFF area.
       Disabling a RAM bank probably protects that bank from false writes
       during power down of the GameBoy. (NOTE: Nintendo
       suggests values $0A to enable and $00 to disable
       RAM bank!!)
       
      If memory model is set to 16/8 mode: [0]
       Writing a value (XXXXXXBB - X = Don't care, B =
       bank select bits) into 4000-5FFF area will set the
       two most significant ROM address lines.
       
      * NOTE: The Super Smart Card doesn't require this
      operation because it's RAM bank is ALWAYS enabled.
      Include this operation anyway to allow your code
      to work with both.
*/
