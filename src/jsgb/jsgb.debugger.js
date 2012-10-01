/* 
 * jsgb.debugger.js v0.02 - Debugger for JSGB, a GameBoy Emulator
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
 
var gbIsBreakpoint = false;
 
function gb_Dump_All() {
  gb_Dump_CPU();
  gb_Dump_IORegs();
  //asmScroll.dragger.posY*(0xFFFF-dump_asm_h+1)
  asmScroll.dragger.setpos(0,((PC-10<0)?0:(PC-10))/(0xFFFF-dump_asm_h+1));
  gb_Dump_ASM();
  gb_Dump_Mem();
  memScroll.update();
  asmScroll.update();
  //gb_Dump_Background();
  //dump_sp();
  gb_Dump_Cartridge_info();
}

// CPU //

function gb_Dump_CPU() {
  $('RA').innerHTML='A: '+zf(hex(RA),2)+br+sp(zf(bin(RA),8),4);
  $('RB').innerHTML='B: '+zf(hex(RB),2)+br+sp(zf(bin(RB),8),4);
  $('RC').innerHTML='C: '+zf(hex(RC),2)+br+sp(zf(bin(RC),8),4);
  $('RD').innerHTML='D: '+zf(hex(RD),2)+br+sp(zf(bin(RD),8),4);
  $('RE').innerHTML='E: '+zf(hex(RE),2)+br+sp(zf(bin(RE),8),4);
  $('HL').innerHTML='&nbsp;HL: '+zf(hex(HL),4)+br+sp(zf(bin(HL),16),4);
  $('SP').innerHTML='&nbsp;SP: '+zf(hex(SP),4)+br+sp(zf(bin(SP),16),4);
  $('PC').innerHTML='&nbsp;PC: '+zf(hex(PC),4)+br+sp(zf(bin(PC),16),4);
  $('RF').innerHTML='Z:'+(FZ*1)+' N:'+(FN*1)+'<br/'+'>H:'+(FH*1)+' C:'+(FC*1);
}

// SPECIAL REGISTERS //

function gb_Dump_IORegs() {
  $('SPRDUMP').innerHTML=
    'FF00:P1&nbsp; &nbsp;'+sp(zf(bin(gbMemory[0xFF00]),8),4)+br+
    'FF04:DIV&nbsp; '     +gbMemory[0xFF04]+'=0x'+zf(hex(gbMemory[0xFF04]),2)+br+
    'FF05:TIMA '          +gbMemory[0xFF05]+'=0x'+zf(hex(gbMemory[0xFF05]),2)+br+
    'FF06:TMA &nbsp;'     +gbMemory[0xFF06]+'=0x'+zf(hex(gbMemory[0xFF06]),2)+br+
    'FF07:TAC&nbsp; '     +sp(zf(bin(gbMemory[0xFF07]),8),4)+br+
    'FF0F:IF&nbsp; &nbsp;'+sp(zf(bin(gbMemory[0xFF0F]),8),4)+br+
    'FF40:LCDC '          +sp(zf(bin(gbMemory[_LCDC_]),8),4)+br+
    'FF41:STAT '          +sp(zf(bin(gbMemory[0xFF41]),8),4)+br+
    'FF42:SCY&nbsp; '     +gbMemory[0xFF42]+br+
    'FF43:SCX&nbsp; '     +gbMemory[0xFF43]+br+
    'FF44:LY&nbsp; &nbsp;'+gbMemory[0xFF44]+br+
    'FF45:LYC &nbsp;'     +gbMemory[0xFF45]+br+

    'FF46:DMA &nbsp;'     +'0x'+zf(hex(gbMemory[0xFF46]),2)+br+
    'FF47:BGP &nbsp;'     +sp(zf(bin(gbMemory[0xFF47]),8),4)+br+
    'FF48:OBP0&nbsp;'     +sp(zf(bin(gbMemory[0xFF48]),8),4)+br+
    'FF49:OBP1&nbsp;'     +sp(zf(bin(gbMemory[0xFF49]),8),4)+br+

    'FF4A:WY&nbsp; &nbsp;'+gbMemory[0xFF4A]+br+
    'FF4B:WX&nbsp; &nbsp;'+gbMemory[0xFF4B]+br+
    'FFFF:IE&nbsp; &nbsp;'+sp(zf(bin(gbMemory[0xFFFF]),8),4)+br+
    '<hr>'+
    'Emulator vars'+br+
    'IME: '+gbIME+br+
    'CPU Ticks: '+gbCPUTicks+br+
    'DIV Ticks: '+gbDIVTicks+br+
    'LCD Ticks: '+gbLCDTicks+br+
    'Timer Ticks: '+gbTimerTicks+br+
    'Timer Max: '+gbTimerOverflow+br;
}

// MEMORY //

var dump_mem_w=16;
var dump_mem_h=40;
var dump_mem_a=dump_mem_w*dump_mem_h;
function gb_Dump_Mem() {
  var s='';
  var w=dump_mem_w;
  var h=dump_mem_h;
  var c=0;    // char
  var d='';   // display char
  var hx= ''; // hex values string
  var as= ''; // ascii values string
  var of= Math.round(memScroll.dragger.posY*(0xFFFF-(dump_mem_a-w)))&(0xFFFF-w+1);
  for (var j=0;j<h;j++) {
    s+=where_mem(of)+':';
    s+=zf(hex(of),4)+'&nbsp; ';
    hx='';
    as='';
    for (var i=0;i<w;i++) {
      c=MEMR(of+i);
      hx+=zf(hex(c),2)+' ';
      d=String.fromCharCode(c);
      if (c>126) d='.';
      else if (c<32) d='.';
      else if (c==60) d='&lt;';
      else if (c==62) d='&gt;';
      else if (c==32) d='&nbsp;';
      as+=d;
    }  
    s+=hx+' '+as+'&nbsp;';
    s+=br;
    of+=w;
  }
  $('MEMDUMP').innerHTML=s;
}

// DISASSEMBLER + BREAKPOINTS STUFF //

function gb_GoTo_ASM(a) {
  a='0x'+a;
  asmScroll.dragger.setpos(0,((a-10<0)?0:(a-10))/(0xFFFF-dump_asm_h+1));
  gb_Dump_ASM();
}

function gb_Save_Breakpoints_Cookie(ba) {
  var date = new Date(); date.setTime(date.getTime()+(30*24*60*60*1000));
  var expires = "; expires="+date.toGMTString();
  ba=(ba.length>0)?ba.join(','):'';
  //document.title='COOKIE WRITE:'+ba;
  document.cookie = 'JSGB_gbBreakpointsP='+ba+expires+"; path=/";
}

function gb_Load_Breakpoints_Cookie() {
  var n='JSGB_gbBreakpointsP=';
  var ca = document.cookie.split(';');
  for(var i in ca) {
    var c = ca[i];
    while (c.charAt(0)==' ') c=c.substring(1,c.length);
    if (c.indexOf(n)==0) {
      var ba=c.substring(n.length,c.length);
      if(ba=='')return [];
      ba=ba.split(',');
      for(var j in ba) ba[j]*=1;
      gbIsBreakpoint = ba.length>0;
      return ba;
    }  
  }
  return [];
}

var gbBreakpointsList = gb_Load_Breakpoints_Cookie();

function gb_Set_Breakpoint(addr) {
  addr*=1; // convert to integer
  if ((addr>0xFFFF) || (addr<0)) return;
  var i=gbBreakpointsList.indexOf(addr);  
  if (i<0) gbBreakpointsList.push(addr);// Set breakpoint
  else gbBreakpointsList.splice(i,1); // Remove breakpoint
  gb_Save_Breakpoints_Cookie(gbBreakpointsList);
  gbIsBreakpoint = gbBreakpointsList.length>0;
  gb_Dump_ASM();
}

function gb_Clear_All_Breakpoints() {
  gbBreakpointsList=[];
  gb_Save_Breakpoints_Cookie(gbBreakpointsList);
  gbIsBreakpoint = false;
  gb_Dump_ASM();
}

function gb_Show_Function(PC) {
  var s=(MEMR(PC)==0xCB)?OPCB[MEMR(PC+1)]:OP[MEMR(PC)];
  var ident = 0;
  s = s.toString().
        split('\n').join('').split('\t').join('').split(' ').join('').
        split('{').join(' {\n').split('}').join('}\n').split(';').join(';\n');
  s = s.split('\n');
  for (var i=0; i<s.length; i++) {
    if (s[i].indexOf('}')>=0) ident--;
    for (var j=0; j<ident; j++) s[i]='    '+s[i];
    if (s[i].indexOf('{')>=0) ident++;
  }
  s = s.join('\n');
  alert(s);      
}

var dump_asm_h = 40;
function gb_Dump_ASM() {
  var s='';
  var oPC=PC;
  var of=0;
  var id='';
  var st='';
  PC=Math.round(asmScroll.dragger.posY*(0xFFFF-dump_asm_h+1));
  if (PC<=0) PC=0;
  for (var i=0;i<dump_asm_h;i++) {
    id='ASM_'+PC;
    st=(gbBreakpointsList.indexOf(PC)>=0)?' class="BK"':'';
    st+=(oPC==PC)?' style="background:#9F9;"':'';
    s+='<div id="'+id+'"'+st+'>';
    s+='<span onclick="gb_Show_Function('+PC+');" class="CP U CB80">fn</span> ';
    s+='<span onclick="gb_Set_Breakpoint('+PC+');" class="CP C800">';
    s+=zf(hex(PC),4)+': ';
    s+=zf(hex(MEMR(PC)),2)+' = ';
    s+=MN[MEMR(PC)]();    
    s+='</span></div>\n';
    PC++;
  }
//else s+='<div>&nbsp;</div>\n';
  $('ASMDUMP').innerHTML=s;  

  PC=oPC;
}

// BACKGROUND //

function gb_Dump_Background() {
  //gb_Draw_Background();
  $('BG_CANVAS').width=512;  
  $('BG_CANVAS').height=512;  
  var bgctx = $('BG_CANVAS').getContext('2d');
  var img = bgctx.getImageData(0,0,512,512);

  var k = 0;
  var c = 0;
  for (var j=0; j<512; j++) {
    for (var i=0; i<512; i++) {
      c = gbColors[gbBackgroundData[j][i]];
      img.data[k++]=c[0];
      img.data[k++]=c[1];
      img.data[k++]=c[2];
      img.data[k++]=255;
    }
  }
  bgctx.putImageData(img, 0,0);

  var b=0;
  var s='BG/Win info @ LCDC Reg'+br;
  b=(gbMemory[_LCDC_]>>5)&1;
  s+='bit5='+b+'; Window display = '+(b==0?'off':'on')+br;

  b=(gbMemory[_LCDC_]>>4)&1;
  s+='bit4='+b+'; Tile data = '+((b==0)?'0x8800-0x97FF':'0x8000-0x8FFF')+br;

  b=(gbMemory[_LCDC_]>>3)&1;
  s+='bit3='+b+'; Tile map = '+((b==0)?'0x9800-0x9BFF':'0x9C00-0x9FFF')+br;

  b=(gbMemory[_LCDC_]>>0)&1;
  s+='bit0='+b+'; Display = '+((b==0)?'off':'on')+br;
  
  $('BG_INFO').innerHTML=s;
    
}

// CARTRIDGE INFO

function gb_Dump_Cartridge_info() {
  var s = '';
  s+= 'Game name:&nbsp;&nbsp;&nbsp;&nbsp;';
  s+= '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+br;
  s+= gbROMInfo.Name+'<hr>';
  s+= 'Type: '+br+gbCartridgeTypes[gbROMInfo.CartridgeType]+'<hr>';
  
  s+= 'ROM Size: '+br+gbROMInfo.ROMBanks+' banks: ';
  s+= (gbROMInfo.ROMBanks*32)+' Kb'+'<hr>';
  
  s+= 'RAM Size: '+br+gbROMInfo.RAMBanks+' banks: ';
  s+= (gbROMInfo.RAMBanks*32)+' Kb';
  
  $('ROM_INFO').innerHTML = s;
}

// SPRITES //
/*
function dump_sp() {
  var b=0;
  var s='Sprite info @ LCDC Reg'+br;

  b=(gbMemory[_LCDC_]>>2)&1;
  s+='bit2='+b+'; OBJ size='+((b==0)?'8x8':'8x16')+br;

  b=(gbMemory[_LCDC_]>>1)&1;
  s+='bit1='+b+'; OBJ display='+((b==1)?'On':'Off')+br;

  $('SP_INFO').innerHTML=s;
}
*/
// COMMON //

var memScroll;
var asmScroll;
var gbDebuggerInitiated = false;

function gb_Init_Debugger() {
  if (!gbDebuggerInitiated) {
    $('DEBUGGER').innerHTML=gbDebuggerControls;
    memScroll = new scrollBar('MEMSCROLL',gb_Dump_Mem);
    asmScroll = new scrollBar('ASMSCROLL',gb_Dump_ASM);
    gbDebuggerInitiated = true;
  }  
}

var gbDebuggerControls =
'<div class="FL MT MR MB">\
<table>\
<thead><tr><th colspan="2" style="min-width:270px;">Assembler</th></tr></thead>\
<tbody><tr><td colspan="2">\
<input class="BTN" type="button" onclick="gb_Clear_All_Breakpoints();" value="Clear all breakpoints"/>\
<input class="BTN" type="button" onclick="gb_GoTo_ASM(prompt(\'Enter address (in hex)\'));" value="Goto..."/>\
<input class="BTN" type="button" onclick="alert(gb_Dump_Caller_Stack());" value="Caller stack..."/>\
</td></tr>\
<tr>\
<td id="ASMDUMP">data</td>\
<td id="ASMSCROLL">s</td>\
</tr>\
</tbody>\
</table>\
</div>\
\
<div class="FL MT MR MB">\
<table>\
<thead><tr><th colspan="2">Memory dump</th></tr></thead>\
<tbody>\
<tr><td colspan="2">\
<input value="ROM0" class="BTN" type="button" onclick="memScroll.dragger.setpos(0,0x0000/(0xFFFF-dump_mem_a));gb_gb_Dump_Mem();"/>\
<input value="ROM1" class="BTN" type="button" onclick="memScroll.dragger.setpos(0,0x4000/(0xFFFF-dump_mem_a));gb_Dump_Mem();"/>\
<input value="VRAM" class="BTN" type="button" onclick="memScroll.dragger.setpos(0,0x8000/(0xFFFF-dump_mem_a));gb_Dump_Mem();"/>\
<input value="OAM" class="BTN" type="button" onclick="memScroll.dragger.setpos(0,0xFE00/(0xFFFF-dump_mem_a));gb_Dump_Mem();"/>\
<input value="PC" class="BTN" type="button" onclick="memScroll.dragger.setpos(0,PC/(0xFFFF-dump_mem_a));gb_Dump_Mem();"/>\
<input value="SP" class="BTN" type="button" onclick="memScroll.dragger.setpos(0,SP/(0xFFFF-dump_mem_a));gb_Dump_Mem();"/>\
<input value="HL" class="BTN" type="button" onclick="memScroll.dragger.setpos(0,HL/(0xFFFF-dump_mem_a));gb_Dump_Mem();"/>\
</td></tr>\
<tr>\
<td id="MEMDUMP">a</td>\
<td id="MEMSCROLL">s</td>\
</tr>\
</tbody>\
</table>\
</div>\
\
<div class="FL">\
<table class="FL MT MR MB C">\
<thead><tr><th colspan="2">CPU Dump</th></tr></thead>\
<tbody>\
<tr><td id="RA">A</td><td id="RF">F</td></tr>\
<tr><td id="RB">B</td><td id="RC">C</td></tr>\
<tr><td id="RD">D</td><td id="RE">E</td></tr>\
<tr><td colspan="2" id="HL">HL</td></tr>\
<tr><td colspan="2" id="SP">SP</td></tr>\
<tr><td colspan="2" id="PC">PC</td></tr>\
</tbody>\
</table>\
\
<table class="MT MR C CLR">\
<thead><tr><th>Cartridge Info</th></tr></thead>\
<tbody>\
<tr><td class="L" id="ROM_INFO">info</td></tr>\
</tbody>\
</table>\
</div>\
\
<div class="FL MT MR MB">\
<table>\
<thead><tr><th>Special regs</th></tr></thead>\
<tbody><tr><td id="SPRDUMP">data</td></tr></tbody>\
</table>\
</div>\
\
<!--\
<div class="FL MR CLR">\
<table class="C FL MR">\
<thead><tr><th>Tile images</th></tr></thead>\
<tbody>\
<tr><td id="TILES">tiles</td></tr>\
</tbody>\
</table>\
\
<table class="FL MR MB">\
<thead><tr><th>Background buffer</th></tr></thead>\
<tbody>\
<tr><td>\
<canvas id="BG_CANVAS" width="512" height="512"></canvas>\
<hr/>\
<span id="BG_INFO"></span>\
<input type="button" value="update" onclick="gb_Dump_Background()"/>\
</td></tr>\
</tbody>\
</table>\
\
\
<table class="FL MR MB">\
<thead><tr><th>Sprites</th></tr></thead>\
<tbody>\
<tr><td>\
<canvas style="background:#C8FFD0;" id="SP_CANVAS" width="160" height="144"></canvas>\
<hr/>\
<span id="SP_INFO"></span>\
</td></tr>\
</tbody>\
</table>\
</div>\
-->\
';
