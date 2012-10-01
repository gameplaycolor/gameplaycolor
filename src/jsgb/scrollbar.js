/* 
 * scrollbar.js v0.1 - A simple scrollbar for JavaScript
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
 * ____________________________________________________________________________
 *
 * Note: this doesn't works in MSIE.
 *
 * CSS Styles used by scrollBar Object:
 * .SCROLLBAR 
 * .SCROLLBAR > .BACKGROUND
 * .SCROLLBAR > .BACKGROUND > .DRAG
 */
 
function dragMachine(dragid,onchange) {
  var d=this;
//d.startX=0;
  d.startY=0;
//d.objX=0;
  d.objY=0;
//d.oldX=0;
  d.oldY=0;
  d.obj=$(dragid);
  d.maxY=0;
  d.minY=0;
//d.posX=0;  
  d.posY=0; // position (0~1)
  d.onchange=onchange;

  d.drag=function(event) {
  //d.startX=event.clientX+window.scrollX;
    d.startY=event.clientY+window.scrollY;
    document.addEventListener("mousemove", d.dragging, true);
    document.addEventListener("mouseup", d.drop, true);
    d.objX=parseInt(d.obj.style.left);
    d.objY=parseInt(d.obj.style.top );
  //obj.style.zIndex++;
    event.preventDefault();
  };

  d.dragging=function(event) {
    var nowX, nowY;
  //nowX=event.clientX+window.scrollX;
    nowY=event.clientY+window.scrollY;
  //var X=d.objX+nowX-d.startX;
    var Y=d.objY+nowY-d.startY;
  //if (X>d.maxX) X=d.maxX; if (X<d.minX) X=d.minX;
    if (Y>d.maxY) Y=d.maxY; if (Y<d.minY) Y=d.minY;
    d.posY=(Y/d.maxY);
  //d.obj.style.left=X+"px";
    d.obj.style.top=Y+"px";
    event.preventDefault();
    if ((d.oldY!=Y)/* ||(d.oldX!=X) */) {
      onchange();
      d.oldY=Y;
    //d.oldX=X;
    }  
  }
  
  d.setpos=function(x,y) {
  //d.posX=x;
    if (y>1.0) y=1.0; else if (y<0.0) y=0.0;
    d.posY=y;
  //d.obj.style.left=Math.round(d.posX*d.maxX)+'px';
    d.obj.style.top=Math.round(d.posY*d.maxY)+'px';
  }

  d.drop=function(event) {
    document.removeEventListener("mousemove", d.dragging, true);
    document.removeEventListener("mouseup", d.drop, true);
  };
  
}

function scrollBar(parent,onchange) {
  var scb=this;
  scb.parentid=parent;
  scb.startX=0,
  scb.startY=0
  scb.backid=parent+"_BG"; // background id
  scb.dragid=parent+"_DG"; // drag thing id
  scb.dragger = null;
  
  scb.update=function(){
    $(scb.backid).style.height=$(scb.parentid).clientHeight+'px';
    scb.dragger.maxY=$(scb.parentid).clientHeight-$(scb.dragid).clientHeight-4;
    $(scb.dragid).style.top=Math.round(scb.dragger.maxY*scb.dragger.posY)+'px';
  };    

  (scb.create=function(){
    $(scb.parentid).className='SCROLLBAR';
    $(scb.parentid).innerHTML=
      '<div id="'+scb.backid+'" class="BACKGROUND">'+
      '<div id="'+scb.dragid+'" class="DRAG"></div></div>';
    scb.dragger = new dragMachine(scb.dragid,onchange);
    $(scb.dragid).addEventListener("mousedown", scb.dragger.drag, true);
  })(); 
}

