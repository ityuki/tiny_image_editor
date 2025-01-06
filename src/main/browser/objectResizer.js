const ObjectResizer = self.ObjectResizer = class ObjectResizer {
  constructor(main,target,parent){
    this.main = main;
    this.target = target;
    this.parent = parent;
    this.body = null;
    this.current = this.main.window.document.createElement("div");
    this.current.style.position = "absolute";
    this.current.style.boxSizing = "border-box";
    this.current.style.cursor = "nwse-resize";
    //this.current.style.backgroundColor = "rgba(0,220,0,1)";
    this.diffRight = 0;
    this.diffBottom = 0;
    this.current.appendChild(this.target);
    this.target.style.position = "absolute";
    this.target.style.left = "0px";
    this.target.style.top = "0px";
    this.parent.addEventListener("resize",(e)=>{
      this.resizeMax();
    });
    this.target.addEventListener("resize",(e)=>{ 
      this.resizeMax();
    });
    this.clickCurrent = false;
    this.startx = 0;
    this.starty = 0;
    this.startw = 0;
    this.starth = 0;
    this.mmoveEvent = (e)=>{
      if (!this.clickCurrent){
        return;
      }
      if (e.touches){
        if (e.touches.length > 1){
          return;
        }
        e = e.touches[0];
      }
      if (e.target !== this.current){
        return;
      }
      if(e.buttons) {
        this.resizeInner(this.startw-this.startx + e.pageX,this.starth-this.starty + e.pageY);
        this.current.setPointerCapture(e.pointerId);
      }
    }
    this.moveEvent = (e)=>{
      if (e.touches){
        if (e.touches.length > 1){
          return;
        }
        e = e.touches[0];
      }
    };
    this.upEvent = (e)=>{
      //this.main.window.removeEventListener("touchmove",this.moveEvent);
      this.main.window.removeEventListener("pointermove",this.mmoveEvent);
      //this.main.window.removeEventListener("touchup",this.upEvent);
      this.main.window.removeEventListener("pointerup",this.upEvent);
      this.clickCurrent = false;
    };
    this.downEvent = (e)=>{
      if (e.touches){
        if (e.touches.length > 1){
          return;
        }
        e = e.touches[0];
      }
      if (e.target !== this.current){
        return;
      }
      this.startx = e.pageX;
      this.starty = e.pageY;
      const trect = this.target.getBoundingClientRect();
      this.startw = trect.width;
      this.starth = trect.height;
      //this.current.addEventListener("touchmove",this.moveEvent);
      this.current.addEventListener("pointermove",this.mmoveEvent);
      //this.current.addEventListener("touchup",this.upEvent);
      this.current.addEventListener("pointerup",this.upEvent);
      this.clickCurrent = true;
      this.current.setPointerCapture(e.pointerId);
    };
    //this.current.addEventListener("touchstart",this.downEvent);
    this.current.addEventListener("pointerdown",this.downEvent);
    this.current.addEventListener('touchstart', e => {
      if (e.target !== this.current){
        return;
      }
      if(e.cancelable){
        e.preventDefault();
      }
    }, {capture: true, passive: false});
    //this.resizeMax();
    this.ismin = false;
  }
  setMin(){
    this.ismin = true;
    this.current.style.width = "0px";
    this.current.style.height = "0px";
  }
  unsetMin(){
    this.ismin = false;
  }
  setBody(body){
    this.body = body;
    this.body.appendChild(this.current);
  }
  setDiff(right,bottom){
    this.diffRight = right;
    this.diffBottom = bottom;
    this.resizeMax();
  }
  getPos(){
    const crect = this.current.getBoundingClientRect();
    return {left:this.current.offsetLeft,top:this.current.offsetTop,width:crect.width,height:crect.height};
  }
  move(x,y){
    if (typeof x === "string"){
      x = parseFloat(x.replace(/px$/,""));
    }
    if (typeof y === "string"){
      y = parseFloat(y.replace(/px$/,""));
    }
    const prect = this.parent.getBoundingClientRect();
    const trect = this.target.getBoundingClientRect();
    let brect = prect;
    if (this.body){
      brect = this.body.getBoundingClientRect();
    }
    let left = x;
    if (left > brect.width - (trect.width+this.diffRight)){
      left = brect.width - (trect.width+this.diffRight);
    }
    if (left < 0){
      left = 0;
    }
    let top = y;
    if (top > brect.height - (trect.height+this.diffBottom)){
      top = brect.height - (trect.height+this.diffBottom);
    }
    if (top < 0){
      top = 0;
    }
    this.current.style.left = left + "px";
    this.current.style.top = top + "px";
    let width = trect.width + this.diffRight;
    if (left + width > brect.width){
      width = brect.width - left;
    }
    if (width < 0){
      width = 0;
    }
    let height = trect.height + this.diffBottom;
    if (top + height > brect.height){
      height = brect.height - top;
    }
    if (height < 0){
      height = 0;
    }
    this.target.style.left = "0px";
    this.target.style.top = "0px";
  }
  resizeInner(w,h){
    this.target.style.width = w + "px";
    this.target.style.height = h + "px";
    this.resizeMax();
  }
  resizeMax(){
    const trect = this.target.getBoundingClientRect();
    this.resize(trect.width+this.diffRight,trect.height+this.diffBottom);
  }
  resize(w,h){
    if (this.ismin){
      return;
    }
    const trect = this.target.getBoundingClientRect();
    if (w > trect.width+this.diffRight){
      w = trect.width+this.diffRight;
    }
    if (w < trect.width){
      w = trect.width;
    }
    if (h > trect.height+this.diffBottom){
      h = trect.height+this.diffBottom;
    }
    if (h < trect.height){
      h = trect.height;
    }
    this.current.style.width = w + "px";
    this.current.style.height = h + "px";
    this.fit();
  }
  fit(){
    if (this.ismin){
      return;
    }
    const crect = this.current.getBoundingClientRect();
    crect.offsetTop = this.current.offsetTop;
    crect.offsetLeft = this.current.offsetLeft;
    let prect = this.parent.getBoundingClientRect();
    const trect = this.target.getBoundingClientRect();
    let brect = prect;
    if (this.body){
      brect = this.body.getBoundingClientRect();
    }
    let cwitdh = crect.width;
    let width = crect.width - this.diffRight;
    if (crect.offsetLeft + width > brect.width - 3){
      width = brect.width - crect.offsetLeft -3;
      cwitdh = width + this.diffRight;
    }
    if (width < 0){
      width = 0;
    }
    let chight = crect.height;
    let height = crect.height - this.diffBottom;
    if (crect.offsetTop + height > brect.height -3){
      height = brect.height - crect.offsetTop -3;
      chight = height + this.diffBottom;
    }
    if (height < 0){
      height = 0;
    }
    if (crect.width != cwitdh || crect.height != chight){
      this.current.style.width = cwitdh + "px";
      this.current.style.height = chight + "px";
    }
    if (trect.width != width || trect.height != height){
      this.target.style.width = width + "px";
      this.target.style.height = height + "px";
    }
    this.target.style.left = "0px";
    this.target.style.top = "0px";
  }
}
