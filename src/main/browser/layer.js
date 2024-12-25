const Layer = self.Layer = class Layer {
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

  static LinkedLayerType = {
    Window: 'window',
    Size: 'size',
    Pos: 'pos',
    Move: 'move',
    CanvasSize: 'canvasSize',
  };

  static DoMethodType = {
    Execute: 0,
    FileLoad: 1,
    CanvasPosChange: 2,
    CanvasSizeChange: 3,
    CanvasAlphaChange: 4,
    CanvasOverlapChange: 5,
    OutputPosChange: 6,
    OutputSizeChange: 7,
    OutputAlphaChange: 8,
    OutputOverlapChange: 9,
  };

  static layerId = 0;

  constructor(main, copyFromLayer){
    this.main = main;
    Layer.layerId += 1;
    this.id = Layer.layerId;
    let x = 0;
    let y = 0;
    let w = this.main.defaultLayer.width;
    let h = this.main.defaultLayer.height;
    if (copyFromLayer != null){
      x = copyFromLayer.canvas.x;
      y = copyFromLayer.canvas.y;
      w = copyFromLayer.canvas.w;
      h = copyFromLayer.canvas.h;
    }
    this.canvasOpt = {
      x: x,
      y: y,
      w: w,
      h: h,
      alpha: 1,
      overlap: Layer.OverlapType.SourceOver,
    };
    let ox = 0;
    let oy = 0;
    let ow = this.main.defaultLayer.width;
    let oh = this.main.defaultLayer.height;
    if (copyFromLayer != null){
      ox = copyFromLayer.outputRect.x;
      oy = copyFromLayer.outputRect.y;
      ow = copyFromLayer.outputRect.w;
      oh = copyFromLayer.outputRect.h;
    }
    this.outputOpt = {
      x: ox,
      y: oy,
      w: ow,
      h: oh,
      alpha: 1,
      overlap: Layer.OverlapType.SourceOver,
    };
    this.canvasCacheRect = {
      x: 0,
      y: 0,
      w: 0,
      h: 0,
    }
    this.parentLayers = [];
    this.childLayers = [];
    this.linkedLayers = {
      window: [],
      size: [],
      pos: [],
      move: [],
      canvasSize: [],
    }
    this.defaultExternalColor = [255,255,255,0]
    this.history = [];
    this.historyPos = -1;
    this.historyMax = -1;
    this.updated = false;
    this.canvasUpdated = false;
    this.canvasCacheUpdated = false;
    this.canvasObj = this.main.window.document.createElement('canvas');
    this.canvasObj.id = 'tie_' + this.main.tieName + '_layer_' + this.id + '_canvas';
    this.canvasObj.width = this.canvasOpt.w;
    this.canvasObj.height = this.canvasOpt.h;
    this.canvasBackupObj = this.main.window.document.createElement('canvas');
    this.canvasBackupObj.id = 'tie_' + this.main.tieName + '_layer_' + this.id + '_canvasBackup';
    this.canvasCacheObj = this.main.window.document.createElement('canvas');
    this.canvasCacheObj.id = 'tie_' + this.main.tieName + '_layer_' + this.id + '_canvasCache';
    this.fill(this.canvasObj,[255,255,255,0]);
  }
  addParentLayer(layer){
    this.parentLayers.push(layer);
    this.updated = true;
  }
  removeParentLayer(layer){
    this.parentLayers = this.parentLayers.filter((v) => v !== layer);
    this.updated = true;
  }
  addChildLayer(layer){
    this.childLayers.push(layer);
    this.updated = true;
  }
  removeChildLayer(layer){
    this.childLayers = this.childLayers.filter((v) => v !== layer);
    this.updated = true;
  }
  addLinkedLayer(layer, type){
    if (type === Layer.LinkedLayerType.Window){
      this.linkedLayers.window.push(layer);
    }else if (type === Layer.LinkedLayerType.Size){
      this.linkedLayers.size.push(layer);
    }else if (type === Layer.LinkedLayerType.Pos){
      this.linkedLayers.pos.push(layer);
    }else if (type === Layer.LinkedLayerType.Move){
      this.linkedLayers.move.push(layer);
    }else if (type === Layer.LinkedLayerType.CanvasSize){
      this.linkedLayers.canvasSize.push(layer);
    }
  }
  removeLinkedLayer(layer, type){
    if (type === Layer.LinkedLayerType.Window){
      this.linkedLayers.window = this.linkedLayers.window.filter((v) => v !== layer);
    }else if (type === Layer.LinkedLayerType.Size){
      this.linkedLayers.size = this.linkedLayers.size.filter((v) => v !== layer);
    }else if (type === Layer.LinkedLayerType.Pos){
      this.linkedLayers.pos = this.linkedLayers.pos.filter((v) => v !== layer);
    }else if (type === Layer.LinkedLayerType.Move){
      this.linkedLayers.move = this.linkedLayers.move.filter((v) => v !== layer);
    }else if (type === Layer.LinkedLayerType.CanvasSize){
      this.linkedLayers.canvasSize = this.linkedLayers.canvasSize.filter((v) => v !== layer);
    }
  }
  setExternalColor(color){
    this.defaultExternalColor = color;
    this.updated = true;
  }
  getExternalColor(){
    return this.defaultExternalColor;
  }
  loadLocalImage(){
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
          const context = this.canvasObj.getContext('2d');
          const h = {
            type: Layer.DoMethodType.FileLoad,
            image: structuredClone(context.getImageData(0,0,this.canvasObj.width,this.canvasObj.height).data),
            size:{
              w: this.canvasObj.width,
              h: this.canvasObj.height,
            },
            loadFile: file,
            loadImage: null,
            loadSize:{
              w: img.width,
              h: img.height,
            },
          };
          this.canvasObj.width = img.width;
          this.canvasObj.height = img.height;
          this.canvasOpt.w = img.width;
          this.canvasOpt.h = img.height;
          const ga = context.globalAlpha;
          const gcom = context.globalCompositeOperation;
          context.globalAlpha = 1;
          context.globalCompositeOperation = Layer.OverlapType.Copy;
          context.drawImage(img,0,0);
          context.globalAlpha = ga;
          context.globalCompositeOperation = gcom;
          h.loadImage = structuredClone(context.getImageData(0,0,this.canvasObj.width,this.canvasObj.height).data);
          this.pushHistory(h);
          this.updated = true;
          this.canvasUpdated = true;
          this.doWrite();
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
  colorRGBA2Array(color){
    if (color === null || color === undefined){
      return [255,255,255,0];
    }else if (color instanceof Array){
      if (color.length == 3){
        color.push(1);
      }
      return color.map((v) => parseInt(v));
    }else if (typeof color === 'string'){
      if (color.startsWith('rgba(')){
        color = color.replace('rgba(','').replace(')','');
      }else if (color.startsWith('rgb(')){
        color = color.replace('rgb(','').replace(')',',1');
      }else{
        return [255,255,255,0];
      }
      const c = color.split(',');
      if (c.length == 3){
        c.push(1);
      }
      return c.map((v) => parseInt(v));
    }else{
      return [255,255,255,0];
    }
  }
  fillRect(canvas,x,y,w,h,color){
    const context = canvas.getContext('2d');
    const cary = this.colorRGBA2Array(color);
    const contextimg = context.getImageData(x,y,w,h);
    for(let i = 0; i < contextimg.data.length; i += 4){
      contextimg.data[i] = cary[0];
      contextimg.data[i + 1] = cary[1];
      contextimg.data[i + 2] = cary[2];
      contextimg.data[i + 3] = cary[3];
    }
    context.putImageData(contextimg,x,y);
  }
  fill(canvas,color){
    this.fillRect(canvas,0,0,canvas.width,canvas.height,color);
  }
  setCanvasPos(x,y,callers){
    const crect = this.getCanvasRect();
    if (crect.x == x && crect.y == y){
      return;
    }
    let nextcallers = [];
    if (callers !== null && callers !== undefined){
      if (callers.indexOf(this.id) >= 0){
        return;
      }
      nextcallers = structuredClone(callers);
    }
    nextcallers.push(this.id);
    this.pushHistory({
      type: Layer.DoMethodType.CanvasPosChange,
      pos:{
        x: this.canvasOpt.x,
        y: this.canvasOpt.y,
      },
    });
    this.canvasOpt.x = x;
    this.canvasOpt.y = y;
    this.updated = true;
    const xdiff = crect.x - x;
    const ydiff = crect.y - y;
    for(let l of this.linkedLayers.pos){
      const lrect = l.getCanvasRect();
      l.setCanvasPos(lrect.x - xdiff,lrect.y - ydiff,nextcallers);
    }
    for (let l of this.linkedLayers.move){
      const lrect = l.getCanvasRect();
      l.setCanvasPos(lrect.x - xdiff,lrect.y - ydiff,nextcallers);
      const lorect = l.getOutputRect();
      l.setOutputPos(lorect.x - xdiff,lorect.y - ydiff, nextcallers);
    }
  }
  setCanvasSize(w,h,callers){
    const crect = this.getCanvasRect();
    if (crect.w == w && crect.h == h){
      return;
    }
    let nextcallers = [];
    if (callers !== null && callers !== undefined){
      if (callers.indexOf(this.id) >= 0){
        return;
      }
      nextcallers = structuredClone(callers);
    }
    nextcallers.push(this.id);
    // copy
    if (w > 0 && h > 0){
      const canvas = this.main.window.document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      this.fill(canvas,[255,255,255,0]);
      if (this.canvasObj.width > 0 && this.canvasObj.height > 0){
        const thiscontext = this.canvasObj.getContext('2d');
        const thisimg = thiscontext.getImageData(0,0,this.canvasObj.width,this.canvasObj.width);
        const context = canvas.getContext('2d');
        context.putImageData(thisimg,0,0,0,0,this.canvasObj.width,this.canvasObj.height);
        this.pushHistory({
          type: Layer.DoMethodType.CanvasSizeChange,
          image: structuredClone(thisimg.data),
          size:{
            w: this.canvasObj.width,
            h: this.canvasObj.height,
          },
        });
        const nextimg = context.getImageData(0,0,w,h);
        this.canvasObj.width = w;
        this.canvasObj.height = h;
        thiscontext.putImageData(nextimg,0,0);
        this.canvasOpt.w = w;
        this.canvasOpt.h = h;
      }else{
        this.pushHistory({
          type: Layer.DoMethodType.CanvasSizeChange,
          image: null,
          size:{
            w: this.canvasObj.width,
            h: this.canvasObj.height,
          },
        });  
        this.canvasObj.width = w;
        this.canvasObj.height = h;
        this.canvasOpt.w = w;
        this.canvasOpt.h = h;
      }
    } else {
      const thiscontext = this.canvasObj.getContext('2d');
      const thisimg = thiscontext.getImageData(0,0,this.canvasObj.width,this.canvasObj.width);
      this.pushHistory({
        type: Layer.DoMethodType.CanvasSizeChange,
        image: structuredClone(thisimg.data),
        size:{
          w: this.canvasObj.width,
          h: this.canvasObj.height,
        },
      });
      w = h = 0;
      this.canvasObj.width = w;
      this.canvasObj.height = h;
      this.canvasOpt.w = w;
      this.canvasOpt.h = h;
    }
    this.updated = true;
    for(let l of this.linkedLayers.canvasSize){
      l.setCanvasSize(w,h,nextcallers);
    }
  }
  getCanvasRect(){
    return {
      x: this.canvasOpt.x,
      y: this.canvasOpt.y,
      w: this.canvasOpt.w,
      h: this.canvasOpt.h,
    };
  }
  setCanvasAlpha(alpha){
    if (this.canvasOpt.alpha == alpha){
      return;
    }
    this.pushHistory({
      type: Layer.DoMethodType.CanvasAlphaChange,
      alpha: this.canvasOpt.alpha,
    });
    this.canvasOpt.alpha = alpha;
    this.updated = true;
  }
  getCanvasAlpha(){
    return this.canvasOpt.alpha;
  }
  setCanvasOverlapMode(mode){
    if (this.canvasOpt.overlap == mode){
      return;
    }
    this.pushHistory({
      type: Layer.DoMethodType.CanvasOverlapChange,
      overlap: this.canvasOpt.overlap,
    });
    this.canvasOpt.overlap = mode;
    this.updated = true;
  }
  getCanvasOverlapMode(){
    return this.canvasOpt.overlap;
  }
  setOutputPos(x,y,callers){
    const crect = this.getOutputRect();
    if (crect.x == x && crect.y == y){
      return;
    }
    let nextcallers = [];
    if (callers !== null && callers !== undefined){
      if (callers.indexOf(this.id) >= 0){
        return;
      }
      nextcallers = structuredClone(callers);
    }
    nextcallers.push(this.id);
    this.pushHistory({
      type: Layer.DoMethodType.OutputPosChange,
      pos:{
        x: this.outputOpt.x,
        y: this.outputOpt.y,
      },
    });
    this.outputOpt.x = x;
    this.outputOpt.y = y;
    this.updated = true;
    const xdiff = crect.x - x;
    const ydiff = crect.y - y;
    for(let l of this.linkedLayers.window){
      const lrect = l.getOutputRect();
      l.setOutputPos(lrect.x - xdiff,lrect.y - ydiff,nextcallers);
    }
    for(let l of this.linkedLayers.move){
      const lrect = l.getCanvasRect();
      l.setCanvasPos(lrect.x - xdiff,lrect.y - ydiff,nextcallers);
      const lorect = l.getOutputRect();
      l.setOutputPos(lorect.x - xdiff,lorect.y - ydiff,nextcallers);
    }
  }
  setOutputSize(w,h,callers){
    const crect = this.getOutputRect();
    if (crect.w == w && crect.h == h){
      return;
    }
    let nextcallers = [];
    if (callers !== null && callers !== undefined){
      if (callers.indexOf(this.id) >= 0){
        return;
      }
      nextcallers = structuredClone(callers);
    }
    nextcallers.push(this.id);
    this.pushHistory({
      type: Layer.DoMethodType.OutputSizeChange,
      size:{ 
        w: this.outputOpt.w,
        h: this.outputOpt.h,
      }
    });
    this.outputOpt.w = w;
    this.outputOpt.h = h;
    this.updated = true;
    if (callers !== null && callers !== undefined){
      if (callers.indexOf(this) >= 0){
        return;
      }
    }
    for(let l of this.linkedLayers.size){
      const lrect = l.getOutputRect();
      l.setOutputPos(lrect.x - xdiff,lrecy.y - ydiff, nextcallers);
    }
  }
  getOutputRect(){
    return {
      x: this.outputOpt.x,
      y: this.outputOpt.y,
      w: this.outputOpt.w,
      h: this.outputOpt.h,
    };
  }
  setOutputAlpha(alpha){
    if (this.outputOpt.alpha == alpha){
      return;
    }
    this.pushHistory({
      type: Layer.DoMethodType.OutputAlphaChange,
      alpha: this.outputOpt.alpha,
    });
    this.outputOpt.alpha = alpha;
    this.updated = true;
  }
  getOutputAlpha(){
    return this.outputOpt.alpha;
  }
  setOutputOverlapMode(mode){
    if (this.outputOpt.overlap == mode){
      return;
    }
    this.pushHistory({
      type: Layer.DoMethodType.OutputOverlapChange,
      overlap: this.outputOpt.overlap,
    });
    this.outputOpt.overlap = mode;
    this.updated = true;
  }
  getOutputOverlapMode(){
    return this.outputOpt.overlap;
  }
  calcCacheRect(){
    let x = this.canvasOpt.x;
    let y = this.canvasOpt.y;
    let w = this.canvasOpt.w - this.canvasOpt.x;
    let h = this.canvasOpt.h - this.canvasOpt.y;
    if (this.outputOpt.x < x){
      x = this.outputOpt.x;
    }
    if (this.outputOpt.y < y){
      y = this.outputOpt.y;
    }
    if (this.outputOpt.w - this.outputOpt.x > w){
      w = this.outputOpt.w - this.outputOpt.x;
    }
    if (this.outputOpt.h - this.outputOpt.y > h){
      h = this.outputOpt.h - this.outputOpt.y;
    }
    for(let c of this.childLayers){
      const r = c.calcCacheRect();
      if (r.x < x){
        x = r.x;
      }
      if (r.y < y){
        y = r.y;
      }
      if (r.w - r.x > w){
        w = r.w - r.x;
      }
      if (r.h - r.y > h){
        h = r.h - r.y;
      }
    }
    if (w < 0){
      w = 1;
    }
    if (h < 0){
      h = 1;
    }
    return {
      x: x,
      y: y,
      w: w,
      h: h,
    };
  }
  doWriteCanvas2Canvas(srcCanvasObj,destCanvasObj,srcCanvasOpt,destCanvasRect){
    if (srcCanvasObj.width <= 0 || srcCanvasObj.height <= 0){
      return;
    }
    if (destCanvasObj.width <= 0 || destCanvasObj.height <= 0){
      return;
    }
    if (srcCanvasOpt.w <= 0 || srcCanvasOpt.h <= 0){
      return;
    }
    if (destCanvasRect.w <= 0 || destCanvasRect.h <= 0){
      return;
    }
    const context = destCanvasObj.getContext('2d');
    context.globalAlpha = srcCanvasOpt.alpha;
    context.globalCompositeOperation = srcCanvasOpt.overlap;
    let srcX = srcCanvasOpt.x;
    let srcY = srcCanvasOpt.y;
    let srcW = srcCanvasObj.width;
    let srcH = srcCanvasObj.height;
    let destX = (destCanvasRect.x);
    let destY = (destCanvasRect.y);
    let destW = srcCanvasObj.width;
    let destH = srcCanvasObj.height;
    console.log(srcCanvasObj,destCanvasObj)
    console.log(srcCanvasOpt,destCanvasRect,srcX,srcY,srcW,srcH,destX,destY,destW,destH);
    //if (destX != 0){
      try{ throw new Error(''); }catch(e){ console.log(e.stack); }
    //}
    context.drawImage(srcCanvasObj,srcX,srcY,srcW,srcH,destX,destY,destW,destH);
  }
  parentCacheClear(){
    for(let p of this.parentLayers){
      if (p instanceof Layer){
        p.fill(p.canvasCacheObj,p.defaultExternalColor);
        p.canvasCacheUpdated = true;
        p.parentCacheClear();
      }else if (p instanceof HTMLCanvasElement){
        this.fill(p,this.defaultExternalColor);
      }
    }
  }

  initCanvasCache(force){
    let updated = false;
    let canvasCacheRect = this.calcCacheRect();
    if (canvasCacheRect.x != this.canvasCacheRect.x ||
        canvasCacheRect.y != this.canvasCacheRect.y ||
        canvasCacheRect.w != this.canvasCacheRect.w ||
        canvasCacheRect.h != this.canvasCacheRect.h){
      this.canvasCacheRect = canvasCacheRect;
      this.canvasCacheObj.width = canvasCacheRect.w;
      this.canvasCacheObj.height = canvasCacheRect.h;
      updated = true;
      this.canvasCacheUpdated = true;
    }
    if (force == true || this.updated == true || this.canvasUpdated == true){
      this.canvasCacheUpdated = true;
    }
    if (this.updated == true || this.canvasUpdated == true){
      updated = true;
    }
    for(let c of this.childLayers){
      if (c instanceof Layer){
        if(c.initCanvasCache(force) == true){
          updated = true;
        }
      }else if (c instanceof HTMLCanvasElement){
        updated = true;
      }
    }
    if (force == true || updated == true){
      this.fill(this.canvasCacheObj,this.defaultExternalColor);
      this.canvasCacheUpdated = true;
      updated = true;
    }
    return updated;
  }
  checkCanvasUpdated(){
    if (this.updated == true || this.canvasUpdated == true){
      return true;
    }
    for(let c of this.childLayers){
      if (c instanceof Layer){
        if (c.checkCanvasUpdated() == true){
          return true;
        }else if (c instanceof HTMLCanvasElement){
          return true;
        }
      }
    }
    return false;
  }
  checkCanvasCacheUpdated(){
    if (this.canvasCacheUpdated == true){
      return true;
    }
    for(let c of this.childLayers){
      if (c instanceof Layer){
        if (c.checkCanvasCacheUpdated() == true){
          return true;
        }else if (c instanceof HTMLCanvasElement){
          return true;
        }
      }
    }
    return false;
  }
  doWriteChildLayers2Cache(force){
    let updated = false;
    if (this.updated == true || this.canvasUpdated == true){
      this.updated = false;
      this.canvasUpdated = false;
      updated = true;
    }
    const copyopt = structuredClone(this.canvasCacheRect);
    copyopt.x = 0;
    copyopt.y = 0;
    for(let c of this.childLayers){
      if (c instanceof Layer){
        let cupdated = false;
        if (force == true || c.checkCanvasUpdated() == true || this.checkCanvasCacheUpdated() == true){
          cupdated = c.doWriteCanvas2Cache(force);
          c.updated = false;
          c.canvasUpdated = false;
          c.canvasCacheUpdated = true;
        }
        if (cupdated == true || c.canvasCacheUpdated == true){
          this.doWriteCanvas2Canvas(c.canvasCacheObj,this.canvasCacheObj,c.outputOpt,copyopt);
          c.canvasCacheUpdated = false;
          updated = true;
        }
      }else if (c instanceof HTMLCanvasElement){
        this.doWriteCanvas2Canvas(c,this.canvasCache,{x:0,y:0,w:c.width,h:c.height,alpha:1,overlap:Layer.OverlapType.SourceOut},copyopt);
        updated = true;
      }
    }
    if (updated == true){
      this.canvasCacheUpdated = true;
    }
    return updated;
  }
  doWriteCanvas2Cache(force){
    let updated = this.doWriteChildLayers2Cache(force);
    if (force || updated == true || this.updated == true || this.canvasUpdated == true || this.canvasCacheUpdated == true){
      const copyopt = structuredClone(this.canvasOpt);
      copyopt.x = 0;
      copyopt.y = 0;
      this.doWriteCanvas2Canvas(this.canvasObj,this.canvasCacheObj,copyopt,this.canvasOpt);
      this.updated = false;
      this.canvasUpdated = false;
      this.canvasCacheUpdated = true;
      updated = true;
    }
    return updated;
  }
  getTopParentLayers(){
    let layers = [];
    if (this.parentLayers.length == 0){
      return [this.canvasObj];
    }
    for(let p of this.parentLayers){
      if (p instanceof Layer){
        layers = layers.concat(p.getTopParentLayers());
      }else if (p instanceof HTMLCanvasElement){
        layers.push(this);
      }
    }
    return layers;
  }
  doWriteCanvasCache2CanvasElement(force){
    let updated = false;
    for(let p of this.parentLayers){
      if (p instanceof Layer){
        // do nothing
      }else if (p instanceof HTMLCanvasElement){
        this.doWriteCanvas2Canvas(this.canvasCacheObj,p,{x:0,y:0,w:this.canvasCacheObj.width,h:this.canvasCacheObj.height,alpha:1,overlap:Layer.OverlapType.SourceOver},{x:0,y:0,w:p.width,h:p.height});
        updated = true;
      }
    }
    return updated;
  }
  doWrite(force){
    let updated = false;
    const initUpdate = this.initCanvasCache(force);
    if (initUpdate == true || this.canvasCacheUpdated == true){
      this.parentCacheClear();
    }
    for(let tlayer of this.getTopParentLayers()){
      if (tlayer instanceof Layer){
        if (tlayer.doWriteCanvas2Cache(force) == true){
          tlayer.doWriteCanvasCache2CanvasElement(force);
          updated = true;
        }
      }else if (tlayer instanceof HTMLCanvasElement){
        // do nothing
      }
    }
    return updated;
  }

  saveBackup(){
    this.canvasBackupObj.width = this.canvasObj.width;
    this.canvasBackupObj.height = this.canvasObj.height;
    const context = this.canvasObj.getContext('2d');
    const contextBackup = this.canvasBackupObj.getContext('2d');
    const img = context.getImageData(0,0,this.canvasObj.width,this.canvasObj.height);
    contextBackup.putImageData(img,0,0);
  }
  restoreBackup(){
    this.canvasObj.width = this.canvasBackupObj.width;
    this.canvasObj.height = this.canvasBackupObj.height;
    const context = this.canvasObj.getContext('2d');
    const contextBackup = this.canvasBackupObj.getContext('2d');
    const img = contextBackup.getImageData(0,0,this.canvasObj.width,this.canvasObj.height);
    context.putImageData(img,0,0);
    this.canvasUpdated = true;
  }
  doMethod(method, opt){
    if (method === null || method === undefined) return null;
    const context = this.canvasObj.getContext('2d');
    this.pushHistory({
      type: Layer.DoMethodType.Execute,
      method,
      opt: structuredClone(opt),
      image: structuredClone(context.getImageData(0,0,this.canvasObj.width,this.canvasObj.height).data),
      imageOpt: structuredClone(this.canvasOpt),
    });
    const r = method(this.canvasObj,opt);
    this.canvasUpdated = true;
    //this.doWrite();
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
  doHistory(h){
    // TODO
    this.doWrite();
  }
  historyBack(){
    if (this.history.length < 1){
      return;
    }
    if (this.historyPos == -1){
      this.historyPos = this.history.length - 1;
      this.doHistory(this.history[this.historyPos]);
    }else{
      if (this.historyPos <= 0){
        return;
      }
      this.doHistory(this.history[this.historyPos]);
      this.historyPos -= 1;
    }
  }
  historyForward(){
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
    this.doHistory(this.history[this.historyPos]);
  }
}
