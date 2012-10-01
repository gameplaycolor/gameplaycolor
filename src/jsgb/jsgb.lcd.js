/* 
 * jsgb.lcd.js v0.02 - LCD controller emulation for JSGB, a JS GameBoy Emulator
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

var gbTileData = []; // tile data arrays
var gbBackgroundData = [];
var gbLCDObj; // LCD Object
var gbLCDCtx; // LCD Context
var gbFrameBuffer = [];
var gbLCDImage; // LCD canvas image
var gbLCDImageData; // LCD canvas image data
//var gbLCDScanline; // LCD canvas scanline 
//var gbScanlineData = []; // Scanline data in GB memory
var gbFPS = 0; // Frames per second counter
var gbEndFrame = false;
var gbCurrentWinLine=0;

var gbUpdateTiles  = false;
var gbUpdateTilesList = [];
var gbUpdateBackground  = false 
var gbUpdateBackgroundTileList = [];
var gbUpdateBackgroundDataList = [];

var gbBackPal   = []; // BGP pallete - initialized in jsgb.memory.js
var gbSpritePal = [[],[]]; // palettes OBP0 and OBP1 - for sprites
var gbColors    = [[0xEF,0xFF,0xDE],[0xAD,0xD7,0x94],
                   [0x52,0x92,0x73],[0x18,0x34,0x42]];

function gb_Update_Tile_Data() {
  var tda = 0;     // tile data addr
  var line = 0;    // line (2 bytes)
  var j = 0;
  // loop tiles and redraw if needed
  for (var i=0;i<384;i++) if (gbUpdateTilesList[i]) { 
    tda=0x8000+i*16;
    for (j=0; j<8; j++) { // loop 8 lines    
      line = gbMemory[tda++];
      line|= gbMemory[tda++] << 8;
      gbTileData[i][j][0] = ((line & 0x8080) + 0x3FFF) >> 14;
      gbTileData[i][j][1] = ((line & 0x4040) + 0x1FFF) >> 13;
      gbTileData[i][j][2] = ((line & 0x2020) + 0x0FFF) >> 12;
      gbTileData[i][j][3] = ((line & 0x1010) + 0x07FF) >> 11;
      gbTileData[i][j][4] = ((line & 0x0808) + 0x03FF) >> 10;
      gbTileData[i][j][5] = ((line & 0x0404) + 0x01FF) >> 9;
      gbTileData[i][j][6] = ((line & 0x0202) + 0x00FF) >> 8;
      gbTileData[i][j][7] = ((line & 0x0101) + 0x007F) >> 7;   
    }
    // mark this tile for update in gb_Update_Background()
    gbUpdateBackgroundDataList[i] = gbUpdateBackground = true;
    gbUpdateTilesList[i] = false;
  }
  gbUpdateTiles=false;
}

function gb_Update_Background() {
/*
  This function draws 4 background buffers in a single array,
  one for every combination of source tile maps and tile data addresses.

  A tile is painted only if tile map or tile data has changed. It knows that
  looking at arrays gbUpdateBackgroundDataList and gbUpdateBackgroundTileList.
  These arrays are updated when writing to VRAM:
  - 8000-97FF: Tile data
  - 9800-9FFF: Tile maps
  
  +----------+----------+
  |          |          |
  |   Map0   |   Map0   |
  |  Tile0   |  Tile1   |
  |          |          |
  +----------+----------+
  |          |          |
  |   Map1   |   Map1   |
  |  Tile0   |  Tile1   |
  |          |          |
  +----------+----------+
  
  Map and Tile addresses can be switched in LCDC register.
  
  Map0  = tile map starting at 0x9800
  Map1  = tile map starting at 0x9C00
  Tile0 = tile data index at 0x8000+i (i=unsigned byte) 
  Tile1 = tile data index at 0x8800+i (i=signed byte)

  Tile0 and Tile1 share 128 indexes:
                 _______________________________
  Tile0 ->      [_______________________________]_______________
  Tile1 ->                      [_______________________________]
  Tile index -> 0···············128·············256·············384
             
  This way the GameBoy can access 384 different tiles using a byte index.             
*/
  var tile0 = 0; // tile index for tiledata at 8000+(unsigned byte)
  var tile1 = 0; // tile index for tiledata at 8800+(signed byte)
  var x  = 0;
  var y  = 0;
  var z  = 0;
  var dy = 0;
  var addr = 0x9800;
  var tileline;
  var backline;
  
  for (var i=0;i<2048;i++) {
    tile0 = gbMemory[addr++];
    tile1 = 256+sb(tile0);
    if (gbUpdateBackgroundTileList[i] || gbUpdateBackgroundDataList[tile0]) {
      dy = 8;
      while (dy--) { 
        z = x;
        tileline=gbTileData[tile0][dy];
        backline=gbBackgroundData[y+dy];
        backline[z++] = tileline[0];
        backline[z++] = tileline[1];
        backline[z++] = tileline[2];
        backline[z++] = tileline[3];
        backline[z++] = tileline[4];
        backline[z++] = tileline[5];
        backline[z++] = tileline[6];
        backline[z++] = tileline[7];        
      }
    }
    if (gbUpdateBackgroundTileList[i] || gbUpdateBackgroundDataList[tile1]) {
      dy = 8;
      while (dy--) { 
        z = 256+x;
        tileline = gbTileData[tile1][dy];
        backline = gbBackgroundData[y+dy];
        backline[z++] = tileline[0];
        backline[z++] = tileline[1];
        backline[z++] = tileline[2];
        backline[z++] = tileline[3];
        backline[z++] = tileline[4];
        backline[z++] = tileline[5];
        backline[z++] = tileline[6];
        backline[z++] = tileline[7];        
      }
    }
    gbUpdateBackgroundTileList[i] = false;
    if ((x+=8)>=256) { x=0; y+=8; }
  }
  for (i=0;i<384;i++) gbUpdateBackgroundDataList[i]=false;
  gbUpdateBackground = false;
}

function gb_Framebuffer_to_LCD() {
  var x = 92160; // 144*160*4
  var y = 0;
  var i = 23040; // 144*160
  while (i) {
    y = gbColors[gbFrameBuffer[--i]];
    gbLCDImageData[x-=2] = y[2]; // b
    gbLCDImageData[--x ] = y[1]; // g
    gbLCDImageData[--x ] = y[0]; // r
    y = gbColors[gbFrameBuffer[--i]];
    gbLCDImageData[x-=2] = y[2]; // b
    gbLCDImageData[--x ] = y[1]; // g
    gbLCDImageData[--x ] = y[0]; // r
    y = gbColors[gbFrameBuffer[--i]];
    gbLCDImageData[x-=2] = y[2]; // b
    gbLCDImageData[--x ] = y[1]; // g
    gbLCDImageData[--x ] = y[0]; // r
    y = gbColors[gbFrameBuffer[--i]];
    gbLCDImageData[x-=2] = y[2]; // b
    gbLCDImageData[--x ] = y[1]; // g
    gbLCDImageData[--x ] = y[0]; // r
  }
  gbLCDCtx.putImageData(gbLCDImage, 0,0);
}

function gb_Clear_Scanline() {
  var offset = gbRegLY*160; // framebuffer's offset
  var i = 160+offset;
  while (offset<i) {
    gbFrameBuffer[--i] = 0; gbFrameBuffer[--i] = 0;
    gbFrameBuffer[--i] = 0; gbFrameBuffer[--i] = 0;
    gbFrameBuffer[--i] = 0; gbFrameBuffer[--i] = 0;
    gbFrameBuffer[--i] = 0; gbFrameBuffer[--i] = 0;
  }
}

function gb_Clear_Framebuffer() {
  var i = 23040; // 144*160
  while (i) {
    gbFrameBuffer[--i] = 0; gbFrameBuffer[--i] = 0;
    gbFrameBuffer[--i] = 0; gbFrameBuffer[--i] = 0;
    gbFrameBuffer[--i] = 0; gbFrameBuffer[--i] = 0;
    gbFrameBuffer[--i] = 0; gbFrameBuffer[--i] = 0;
  }
}

function gb_Draw_Scanline() {
  var i = 0;
  var j = 0;
  var k = 0;
  var x = 0;
  var y = 0;
  var offset = gbRegLY*160; // framebuffer's offset
  var line;

  if (gbRegLY==0) {
    gbCurrentWinLine=0;
    if (gbUpdateTiles) gb_Update_Tile_Data();
    if (gbUpdateBackground) gb_Update_Background();
  }
  
  // Draw Background
  if (gbRegLCDC_BgAndWinDisplay) {
    // copy background line
    y = gbRegLCDC_BackgroundYOffs+((gbRegSCY+gbRegLY)%256);
    x = 160+offset;
    i = 160;
    line = gbBackgroundData[y];
    // copy background line to framebuffer
    while (x>offset) { // loop unrolling
      gbFrameBuffer[--x] = gbBackPal[line[gbRegLCDC_BackgroundXOffs+((--i+gbRegSCX)%256)]];
      gbFrameBuffer[--x] = gbBackPal[line[gbRegLCDC_BackgroundXOffs+((--i+gbRegSCX)%256)]];
      gbFrameBuffer[--x] = gbBackPal[line[gbRegLCDC_BackgroundXOffs+((--i+gbRegSCX)%256)]];
      gbFrameBuffer[--x] = gbBackPal[line[gbRegLCDC_BackgroundXOffs+((--i+gbRegSCX)%256)]];
      gbFrameBuffer[--x] = gbBackPal[line[gbRegLCDC_BackgroundXOffs+((--i+gbRegSCX)%256)]];
      gbFrameBuffer[--x] = gbBackPal[line[gbRegLCDC_BackgroundXOffs+((--i+gbRegSCX)%256)]];
      gbFrameBuffer[--x] = gbBackPal[line[gbRegLCDC_BackgroundXOffs+((--i+gbRegSCX)%256)]];
      gbFrameBuffer[--x] = gbBackPal[line[gbRegLCDC_BackgroundXOffs+((--i+gbRegSCX)%256)]];
    }

    // Draw Window - TODO this could be buggy
    if (gbRegLCDC_WindowDisplay) if ((gbRegWY<=gbRegLY) && (gbRegWX<167)) {
      y = gbRegLCDC_WindowYOffs+gbCurrentWinLine;
      i = gbRegWX-7+offset;
      j = (i<0)?-i:0;
      line = gbBackgroundData[y];
      // copy window line to framebuffer
      for (x=j; x<167-gbRegWX; x++) {
        gbFrameBuffer[x+i] = gbBackPal[line[gbRegLCDC_BackgroundXOffs+x]];
      }
      gbCurrentWinLine++;
    }
  }  
  
  // Draw Sprites
  if (gbRegLCDC_SpriteDisplay) {
    var addr  = _OAM_;
    var tile  = 0; 
    var flags = 0; 
    var count = 0; // max 10 sprites per scanline
    var pixel = 0;
    var flip  = 0;
    var hide  = 0; // sprite priority 1=behind background
    var pal;
    j=40;
    while (j--) { // loop 40 sprites (160 bytes)
      y=gbMemory[addr++]-16;
      // check Y pos
      if ((gbRegLY>=y) && (gbRegLY<(y+gbRegLCDC_SpriteSize))) {
        // TODO handle Y flipped sprites with size = 16
        x=gbMemory[addr++]-8;
        // check X pos
        if ((x>-8) && (x<160)) {
          count++;
          tile  = gbMemory[addr++];
          flags = gbMemory[addr++];
          hide  = (flags>>7)&1;
          flip  = (flags>>5)&3;
          pal   = gbSpritePal[(flags>>4)&1];
          if (gbRegLCDC_SpriteSize==16) {
            tile&=0xFE;
            if (gbRegLY>=(y+8)) { // if it's the 2nd half of the sprite
              y+=8;
              if (flip<2) tile++; // not flip Y
            }
            else if (flip>1) tile++; // flip Y
          }  
          i=8;
          k=x+offset;
          switch (flip) {
          case 0: // no flip
            line=gbTileData[tile][gbRegLY-y]; // sprite line            
            while (i--) {
              if (pixel=line[i]) { // if not transparent
                if ((x+i)<0) break;
                if (!(hide && gbFrameBuffer[k+i]))
                  gbFrameBuffer[k+i]=pal[pixel];
              }  
            } 
            break;
          case 1: // flip X
            line=gbTileData[tile][gbRegLY-y]; // sprite line            
            while (i--) {
              if (pixel=line[7-i]) {
                if ((x+i)<0) break;
                if (!(hide && gbFrameBuffer[k+i]))
                  gbFrameBuffer[k+i]=pal[pixel];
              }  
            } 
            break;
          case 2: // flip Y
            line=gbTileData[tile][7-(gbRegLY-y)]; // sprite line            
            while (i--) {
              if (pixel=line[i]) {
                if ((x+i)<0) break;
                if (!(hide && gbFrameBuffer[k+i]))
                  gbFrameBuffer[k+i]=pal[pixel];
              }  
            } 
            break;
          case 3: // flip XY
            line=gbTileData[tile][7-(gbRegLY-y)]; // sprite line            
            while (i--) {
              if (pixel=line[7-i]) {
                if ((x+i)<0) break;
                if (!(hide && gbFrameBuffer[k+i]))
                  gbFrameBuffer[k+i]=pal[pixel];
              }  
            } 
            break;
          }
        } else addr+=2; // x fail
      } else addr+=3; // y fail
      if (count>=10) break;
    }
  }
}

function gb_Init_LCD() {
  gbScanlineCycles = 0;
  // init LCD Screen variables
  gbLCDObj=$('LCD');
  gbLCDCtx=gbLCDObj.getContext('2d');
  gbLCDCtx.width=160;
  gbLCDCtx.height=144;
  gbLCDCtx.fillStyle='rgb('+gbColors[0][0]+','+gbColors[0][1]+','+gbColors[0][2]+')';
  gbLCDCtx.fillRect(0,0,160,144);
  // get LCD scanline canvas data
  gbLCDImage = gbLCDCtx.getImageData(0,0,160,144);
  gbLCDImageData = gbLCDImage.data;
  // update tiles info
  gbUpdateTiles = false;
  for (var i=0; i<384; i++) {
    gbUpdateTilesList[i]=false;   
    gbUpdateBackgroundDataList[i]=false;
  }  
  // update bg info
  gbUpdateBackground = false;
  for (var i=0; i<2048; i++) {
    gbUpdateBackgroundTileList[i] = false;
  }
  // create Background lines
  for (var j=0; j<512; j++) {
    gbBackgroundData[j] = [];
    for (var i=0; i<512; i++) gbBackgroundData[j][i] = 0;
  }  
  // create Tiles
  for (var i=0; i<384; i++) {
    gbTileData[i] = []; 
    // create Tile lines
    for (var j=0; j<8; j++) {
      gbTileData[i][j] = [];
      for (var k=0; k<8; k++) gbTileData[i][j][k] = 0;
    }
  }
  // fill frame buffer
  gb_Clear_Framebuffer();
}

