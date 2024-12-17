const Layer = self.Layer = class Layer {
  static WriteMode = {
    Copy: 0,
  };
  static DoMethodType = {
    Execute: 0,
    chanegeWriteMode: 1.
  };
  constructor(main){
    this.main = main;
    this.parent = null;
    this.writeMode = Layer.WriteMode.Copy;
    this.writeOption = {
      x: 0,
      y: 0,
      alpha: 1,
    };
    this.childsLayer = [];
    this.history = [];
    this.historyPos = -1;
    this.historyMax = -1;
    this.canvas = this.main.window.document.createElement('canvas');
    this.canvas.width = this.main.targetObj.width;
    this.canvas.height = this.main.targetObj.height;
    this.canvasCache = this.main.window.document.createElement('canvas');
    const context = this.canvas.getContext('2d');
    context.fillStyle = "rgba(" + [255, 255, 255, 0] + ")";
    context.fillRect(0,0,this.canvas.width,this.canvas.height);
    this.do_write();
  }
  getW(){
    return this.canvas.width;
  }
  getH(){
    return this.canvas.height;
  }
  resize(w,h){
    const canvas = this.main.window.document.createElement('canvas');
    const canvasCache = this.main.window.document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvasCache.width = w;
    canvasCache.height = h;
    const context = canvas.getContext('2d');
    context.fillStyle = "rgba(" + [255, 255, 255, 0] + ")";
    context.fillRect(0,0,canvas.width,canvas.height);
    const thiscontext = this.canvas.getContext('2d');
    const thisimg = thiscontext.getImageData(0,0,this.canvas.width,this.canvas.width);
    context.putImageData(thisimg,0,0);
    this.canvas = canvas;
    this.canvasCache = canvasCache;
    this.do_write();
  }
  do_write(){
    const context = this.canvas.getContext('2d');
    const contextCache = this.canvasCache.getContext('2d');
    const img = context.getImageData(0,0,h.size.w, h.size.h);
    contextCache.putImageData(img,0,0);
    for(let c of this.childsLayer){
      c.do_write();
    }
    if (this.parent != null){
      if (this.writeMode == Layer.WriteMode.Copy){
        const pcontext = this.parent.canvasCache.getContext('2d');
        pcontext.globalAlpha = this.writeOption.alpha;
        pcontext.drawImage(this.canvasCache,0,0,this.canvasCache.width,this.canvasCache.height,this.writeOption.x,this.writeOption.y);
      }else{
        // TDW
      }
    }
  }
  pre_change(writeMode,writeOption){
    const nowWriteMode = this.writeMode;
    const nowWriteOption = this.writeOption;
    this.writeMode = writeMode;
    this.writeOption = writeOption;
    this.do_write();
    this.writeMode = nowWriteMode;
    this.writeOption = nowWriteOption;
  }
  do_change(writeMode,whileOption){
    if (this.historyMax != 0){
      this.history.push({
        type: Layer.DoMethodType.chanegeWriteMode,
        writeMode: this.writeMode,
        writeOption: this.writeOption,
      });
    }
    while (this.historyPos >= 0 && this.historyPop >= this.history.length - 1){
      this.historyPop();
    }
    this.historyPos = this.history.length - 1;  
    if (this.historyMax >= 0){
      while (this.history.length > this.historyMax){
        this.historyUnshift();
      }
    }
    if (writeMode == null) return;
    this.pre_change(writeMode,whileOption);
    this.writeMode = writeMode;
    this.writeOption = writeOption;
  }
  pre_method(method, opt){
    if (method == null) return null;
    let r = method(this.canvas, opt);
    this.do_write();
    return r;
  }
  do_method(method, opt){
    if (this.historyMax != 0){
      const context = this.canvas.getContext('2d');
      const contextCache = this.canvasCache.getContext('2d');
      this.history.push({
        type: Layer.DoMethodType,
        method,
        opt,
        image: context.getImageData(0,0,this.canvas.width,this.canvas.height),
        size:{
          w: this.canvas.width,
          h: this.canvas.height,
        },
      });
    }
    while (this.historyPos >= 0 && this.historyPop >= this.history.length - 1){
      this.historyPop();
    }
    this.historyPos = this.history.length - 1;
    if (this.historyMax >= 0){
      while (this.history.length > this.historyMax){
        this.historyUnshift();
      }
    }
    if (method == null) return null;
    return pre_method(method, opt);
  }
  setHistoryMax(v){
    this.historyMax = v;
    if (this.historyMax >= 0){
      while (this.history.length > this.historyMax){
        this.historyUnshift();
      }
    }
  }
  historyClear(){
    this.history = [];
    this.historyPos = -1;
  }
  historyDepth(){
    return this.history.length;
  }
  historyCurrent(){
    return this.historyPos;
  }
  historyUnshift(){
    if (this.history.length <= 1){
      this.history = [];
      this.historyPos = -1;
      return;
    }
    if (this.historyPos <= 0){
      return;
    }
    this.history.unshift();
    this.historyPos -= 1;
  }
  historyPop(){
    if (this.history.length <= 1){
      this.history = [];
      this.historyPos = -1;
      return;
    }
    if (this.historyPos >= this.history.length - 1){
      return;
    }
    this.history.pop();
  }
  do_history(h){
    if (h.type == layer.DoMethodType.Execute){
      this.canvas.width = h.size.w;
      this.canvas.height = h.size.h;
      this.canvasCache.width = h.size.w;
      this.canvasCache.height = h.size.h;
      const context = this.canvas.getContext('2d');
      context.putImageData(h.image,0,0);
    }else if (h.type == layer.DoMethodType.DoMethodType){
      this.writeMode = h.writeMode;
      this.writeOption = h.whileOption;
    }else{
    }
    this.do_write();
  }
  historyBack(){
    if (this.history.length < 1){
      return;
    }
    if (this.historyPos == -1){
      this.do_method(null,null);
    }
    this.historyPos -= 1;
    this.do_history(this.history[this.historyPos]);
  }
  historyForward(){
    if (this.history.length < 1){
      return;
    }
    if (this.historyPos >= this.history.length - 1){
      return;
    }
    this.historyPos += 1;
    this.do_history(this.history[this.historyPos]);
  }
}
