const Layer = self.Layer = class Layer {
  static WriteMode = {
    Copy: 0,
  };
  static DoMethodType = {
    Execute: 0,
    ChanegeWriteMode: 1,
    Resize: 2,
    FileLoad: 3,
  };
  static OverlapType = {
    SourceOver:"source-over",
    SourceIn:"source-in",
    SourceOut:"source-out",
    SourceAtop:"source-atop",
    DestinationOver:"destination-over",
    DestinationIn:"destination-in",
    DestinationOut:"destination-out",
    DestinationAtop:"destination-atop",
    Lighter:"lighter",
    Copy:"copy",
    Xor:"xor",
    Multiply:"multiply",
    Screen:"screen",
    Overlay:"overlay",
    Darken:"darken",
    Lighten:"lighten",
    ColorDodge:"color-dodge",
    ColorBurn:"color-burn",
    HardLight:"hard-light",
    SoftLight:"soft-light",
    Difference:"difference",
    Exclusion:"exclusion",
    Hue:"hue",
    Saturation:"saturation",
    Color:"color",
    Luminosity:"luminosity",
  };
  constructor(main){
    this.main = main;
    this.writeMode = Layer.WriteMode.Copy;
    this.writeOption = {
      x: 0,
      y: 0,
      alpha: 1,
      overlap: Layer.OverlapType.SourceOver,
    };
    this.parentLayers = [];
    this.childLayers = [];
    this.history = [];
    this.historyPos = -1;
    this.historyMax = -1;
    this.canvasUpdated = false;
    this.canvasCacheUpdated = false;
    this.canvas = this.main.window.document.createElement('canvas');
    this.canvas.width = this.main.basecanvas.width;
    this.canvas.height = this.main.basecanvas.height;
    this.canvasBackup = this.main.window.document.createElement('canvas');
    this.canvasCache = this.main.window.document.createElement('canvas');
    const context = this.canvas.getContext('2d');
    this.fill(this.canvas,[255,255,255,1]);
    this.do_write(null);
  }
  addParentLayer(layer){
    this.parentLayers.push(layer);
  }
  removeParentLayer(layer){
    this.parentLayers = this.parentLayers.filter((v) => v !== layer);
  }
  addChildLayer(layer){
    this.childLayers.push(layer);
  }
  removeChildLayer(layer){
    this.childLayers = this.childLayers.filter((v) => v !== layer);
  }
  loadLocalImage(parentLayer){
    const input = this.main.window.document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      let file = null;
      if (e.target.files){
        file = e.target.files[0];
      }else if (e.dataTransfer.files){
        file = e.dataTransfer.files[0];
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const context = this.canvas.getContext('2d');
          const h = {
            type: Layer.DoMethodType.FileLoad,
            image: structuredClone(context.getImageData(0,0,this.canvas.width,this.canvas.height).data),
            size:{
              w: this.canvas.width,
              h: this.canvas.height,
            },
            loadFile: file,
            loadImage: null,
            loadSize:{
              w: img.width,
              h: img.height,
            },
          };
          this.canvas.width = img.width;
          this.canvas.height = img.height;
          const ga = context.globalAlpha;
          const gcom = context.globalCompositeOperation;
          context.globalAlpha = 1;
          context.globalCompositeOperation = Layer.OverlapType.Copy;
          context.drawImage(img,0,0);
          context.globalAlpha = ga;
          context.globalCompositeOperation = gcom;
          h.loadImage = structuredClone(context.getImageData(0,0,this.canvas.width,this.canvas.height).data);
          this.pushHistory(h);
          this.canvasUpdated = true;
          this.do_write(parentLayer);
        };
        img.onerror = () => {
          alert('ERROR\nnot image file')
        }
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }
  getW(){
    return this.canvas.width;
  }
  getH(){
    return this.canvas.height;
  }
  pushHistory(h){
    if (this.historyMax != 0){
      this.history.push(h);
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
  }
  fillRect(canvas,x,y,w,h,color){
    const context = canvas.getContext('2d');
    const imageData = context.getImageData(x,y,w,h);
    for(let i = 0; i < imageData.data.length; i += 4){
      imageData.data[i] = color[0];
      imageData.data[i + 1] = color[1];
      imageData.data[i + 2] = color[2];
      imageData.data[i + 3] = color[3];
    }
    context.putImageData(imageData,x,y);
  }
  fill(canvas,color){
    this.fillRect(canvas,0,0,canvas.width,canvas.height,color);
  }
  setOverlapMode(mode){
    this.writeOption.overlap = mode;
  }
  getOverlapMode(){
    return this.writeOption.overlap;
  }
  resize(parentLayer,w,h){
    const canvas = this.main.window.document.createElement('canvas');
    const canvasCache = this.main.window.document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvasCache.width = w;
    canvasCache.height = h;
    this.fill(canvas,[255,255,255,1]);
    const thiscontext = this.canvas.getContext('2d');
    const thisimg = thiscontext.getImageData(0,0,this.canvas.width,this.canvas.width);
    thiscontext.putImageData(thisimg,0,0);
    this.pushHistory({
      type: Layer.DoMethodType.Resize,
      image: structuredClone(thisimg.data),
      size:{
        w: this.canvas.width,
        h: this.canvas.height,
      },
    });
    this.canvas = canvas;
    this.canvasCache = canvasCache;
    this.canvasUpdated = true;
    this.do_write(parentLayer);
  }
  do_write_canvas(targetCanvas){
    if (this.writeMode == Layer.WriteMode.Copy){
      const pcontext = targetCanvas.getContext('2d');
      pcontext.globalAlpha = this.writeOption.alpha;
      pcontext.globalCompositeOperation = this.writeOption.overlap;
      pcontext.drawImage(this.canvasCache,0,0,this.canvasCache.width,this.canvasCache.height,this.writeOption.x,this.writeOption.y,this.canvasCache.width,this.canvasCache.height);
    }else{
      // TDW
    }
  }
  do_write_childs(){
    if (this.canvasUpdated == true){
      this.canvasCache.width = this.canvas.width;
      this.canvasCache.height = this.canvas.height;
      const context = this.canvas.getContext('2d');
      const contextCache = this.canvasCache.getContext('2d');
      const img = context.getImageData(0,0,this.canvas.width, this.canvas.height);
      contextCache.putImageData(img,0,0);
      for(let c of this.childLayers){
        c.do_write_childs();
        c.do_write_canvas(this.canvasCache);
      }
      this.canvasUpdated = false;
      this.canvasCacheUpdated = true;
    }
  }
  do_write(parentLayer){
    this.do_write_childs();

    if (this.canvasCacheUpdated == true){
      for(let c of this.parentLayers){
        if (c instanceof modules.browser.Layer) {
          c.canvasUpdated = true;
          c.do_write(parentLayer);
        } else if (c instanceof HTMLCanvasElement) {
          if (c === this.main.basecanvas){
            this.fill(parentLayer,[255,255,255,1]);
          }
          this.do_write_canvas(parentLayer);
        } else {
  
        }
      }
    }
    if (this.parentLayers.length == 0){
      if (this === this.main.clearpatternlayer) {
        this.fill(this.main.basecanvas,[255,255,255,1]);
        this.do_write_canvas(this.main.basecanvas);
      }

      if (parentLayer != null){
        let targetCanvas = null;
        if (parentLayer instanceof modules.browser.Layer) {
          targetCanvas = parentLayer.canvasCache;
        } else if (parentLayer instanceof HTMLCanvasElement) {
          targetCanvas = parentLayer;
        } else {
  
        }
        if (targetCanvas != null){
          if (targetCanvas === this.main.basecanvas){
            this.fill(targetCanvas,[255,255,255,1]);
            this.main.clearpatternlayer.do_write_canvas(this.main.basecanvas);
          }else{
            this.do_write_canvas(targetCanvas);
          }
        }
      }else{
        if (this === this.main.clearpatternlayer) {
          this.fill(this.main.basecanvas,[255,255,255,1]);
          this.do_write_canvas(this.main.basecanvas);
        }
      }  
    }
  }
  pre_change(parentLayer,writeMode,writeOption){
    const nowWriteMode = this.writeMode;
    const nowWriteOption = this.writeOption;
    this.writeMode = writeMode;
    this.writeOption = writeOption;
    this.do_write(parentLayer);
    this.writeMode = nowWriteMode;
    this.writeOption = nowWriteOption;
  }
  do_change(parentLayer,writeMode,whileOption){
    this.pushHistory({
      type: Layer.DoMethodType.ChanegeWriteMode,
      writeMode: this.writeMode,
      writeOption: structuredClone(this.writeOption),
    });
    if (writeMode == null) return;
    this.pre_change(parentLayer,writeMode,whileOption);
    this.writeMode = writeMode;
    this.writeOption = structuredClone(writeOption);
  }
  restoreBackup(){
    this.canvas.width = this.canvasBackup.width;
    this.canvas.height = this.canvasBackup.height;
    const context = this.canvas.getContext('2d');
    const contextBackup = this.canvasBackup.getContext('2d');
    const img = contextBackup.getImageData(0,0,this.canvas.width,this.canvas.height);
    context.putImageData(img,0,0);
    this.canvasUpdated = true;
  }
  pre_method(parentLayer, useBackupCanvas, method, opt){
    if (method == null) return null;
    if (useBackupCanvas == true){
      this.canvasBackup.width = this.canvas.width;
      this.canvasBackup.height = this.canvas.height;
      const context = this.canvas.getContext('2d');
      const contextBackup = this.canvasBackup.getContext('2d');
      const img = context.getImageData(0,0,h.size.w, h.size.h);
      contextBackup.putImageData(img,0,0);
    }
    let r = method(this.canvas, opt);
    this.canvasUpdated = true;
    this.do_write(parentLayer);
    if (useBackupCanvas == true){
      this.restoreBackup();
      this.canvasUpdated = true;
    }
    return r;
  }
  do_method(parentLayer,method, opt){
    const context = this.canvas.getContext('2d');
    this.pushHistory({
      type: Layer.DoMethodType.Execute,
      method,
      opt: structuredClone(opt),
      image: structuredClone(context.getImageData(0,0,this.canvas.width,this.canvas.height).data),
      size:{
        w: this.canvas.width,
        h: this.canvas.height,
      },
    });
    if (method == null) return null;
    return this.pre_method(parentLayer, false, method, opt);
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
  do_history(parentLayer,h){
    if (h.type == Layer.DoMethodType.Execute){
      this.canvas.width = h.size.w;
      this.canvas.height = h.size.h;
      const context = this.canvas.getContext('2d');
      context.putImageData(new ImageData(h.image,h.w,h.h),0,0);
      this.canvasUpdated = true;
    }else if (h.type == Layer.DoMethodType.ChanegeWriteMode){
      this.writeMode = h.writeMode;
      this.writeOption = structuredClone(h.whileOption);
    }else if (h.type == Layer.DoMethodType.Resize){
      this.canvas.width = h.size.w;
      this.canvas.height = h.size.h;
      const context = this.canvas.getContext('2d');
      context.putImageData(new ImageData(h.image,h.w,h.h),0,0);
      this.canvasUpdated = true;
    }else if (h.type == Layer.DoMethodType.FileLoad){
      this.canvas.width = h.size.w;
      this.canvas.height = h.size.h;
      const context = this.canvas.getContext('2d');
      context.putImageData(new ImageData(h.image,h.size.w,h.size.h),0,0);
      this.canvasUpdated = true;
    }else{
    }
    this.do_write(parentLayer);
  }
  historyBack(parentLayer){
    if (this.history.length < 1){
      return;
    }
    if (this.historyPos == -1){
      this.historyPos = this.history.length - 1;
      this.do_history(parentLayer,this.history[this.historyPos]);
    }else{
      if (this.historyPos <= 0){
        return;
      }
      this.do_history(parentLayer,this.history[this.historyPos]);
      this.historyPos -= 1;
    }
  }
  historyForward(parentLayer){
    if (this.history.length < 1){
      return;
    }
    if (this.historyPos > this.history.length - 1){
      this.historyPos = this.history.length - 1;
    }
    if (this.historyPos == -1){
      return;
    }
    this.historyPos += 1;
    if (this.historyPos > this.history.length - 1){
      this.historyPos = -1;
    }
    if (this.historyPos == -1){
      return;
    }
    this.do_history(parentLayer,this.history[this.historyPos]);
  }
}
