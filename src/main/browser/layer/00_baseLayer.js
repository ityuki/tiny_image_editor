const BaseLayer = self.BaseLayer = class BaseLayer {
  static currentLayerId = 0;
  constructor(main,width,height) {
    BaseLayer.currentLayerId++;
    this.id = BaseLayer.currentLayerId;
    this.main = main;
    this.aboveLayers = [];
    this.belowLayers = [];
    this.layerChain = {
      last: null,
      next: null,
    }
    this.position = { x: 0, y: 0 };
    this.angle = 0;
    this.canvas = new parent.Canvas(main,width,height);
    this.visible = true;
    this.syncPositionLayers = [];
  }
  addSyncPositionLayer(layer) {
    this.syncPositionLayers.push(layer);
  }
  removeSyncPositionLayer(layer) {
    this.syncPositionLayers = this.syncPositionLayers.filter(l => l !== layer);
  }
  setPosition(x, y) {
    this.position.x = x;
    this.position.y = y;
    for (let layer of this.syncPositionLayers) {
      layer.setPosition(x, y);
    }
  }
  movePosition(x, y) {
    this.position.x += x;
    this.position.y += y;
    for (let layer of this.syncPositionLayers) {
      layer.movePosition(x, y);
    }
  }
  setAngle(angle) {
    this.angle = angle % 360;
  }
  getAngle() {
    return this.angle;
  }
  getPosition() {
    return structuredClone(this.position);
  }
  setVisible(visible) {
    this.visible = visible;
  }
  getVisible() {
    return this.visible;
  }
  addAboveLayer(layer) {
    this.aboveLayers.push(layer);
  }
  addBelowLayer(layer) {
    this.belowLayers.push(layer);
  }
  removeAboveLayer(layer) {
    this.aboveLayers = this.aboveLayers.filter(l => l !== layer);
  }
  removeBelowLayer(layer) {
    this.belowLayers = this.belowLayers.filter(l => l !== layer);
  }
  getNextLayer() {
    return this.layerChain.next;
  }
  getLastLayer() {
    return this.layerChain.last;
  }
  getStartLayer() {
    let startLayer = this;
    while (startLayer.layerChain.last) {
      startLayer = startLayer.layerChain.last;
    }
    return startLayer;
  }
  getEndLayer() {
    let endLayer = this;
    while (endLayer.layerChain.next) {
      endLayer = endLayer.layerChain.next;
    }
    return endLayer;
  }
  insertNextLayer(layer) {
    if (this.layerChain.next) {
      this.layerChain.next.layerChain.last = layer;
      layer.layerChain.next = this.layerChain.next;
    }
    this.layerChain.next = layer;
    layer.layerChain.last = this;
  }
  insertLastLayer(layer) {
    if (this.layerChain.last) {
      this.layerChain.last.layerChain.next = layer;
      layer.layerChain.last = this.layerChain.last;
    }
    this.layerChain.last = layer;
    layer.layerChain.next = this;
  }
  deleteNextLayer() {
    if (this.layerChain.next) {
      const nextLayer = this.layerChain.next;
      this.layerChain.next = this.layerChain.next.layerChain.next;
      this.layerChain.next.layerChain.last = this;
      nextLayer.layerChain.next = null;
      nextLayer.layerChain.last = null;
    }
  }
  deleteLastLayer() {
    if (this.layerChain.last) {
      const lastLayer = this.layerChain.last;
      this.layerChain.last = this.layerChain.last.layerChain.last;
      this.layerChain.last.layerChain.next = this;
      lastLayer.layerChain.next = null;
      lastLayer.layerChain.last = null;
    }
  }
  getTopLayers() {
    let topLayers = [];
    if (this.aboveLayers.length === 0) {
      topLayers.push(this);
      return topLayers;
    }
    for (let layer of this.aboveLayers) {
      if (layer instanceof BaseLayer) {
        topLayers = topLayers.concat(layer.getTopLayers());
      } else {
        // DO NOTHING
      }
    }
    return topLayers;
  }
  outputToCanvasFromCanvas(srcCanvas,destCanvas,opt) {
    if (!opt) {
      opt = {};
    }
    const crect = srcCanvas.getRect();
    let diffPos = this.getPosition();
    if (opt.nonDiffPos === true) {
      diffPos = { x: 0, y: 0 };
    }
    if (destCanvas instanceof parent.Canvas) {
      destCanvas.drawRect(srcCanvas,0,0,crect.w,crect.h,diffPos.x,diffPos.y);
    }else if (destCanvas instanceof HTMLCanvasElement){
      const context = destCanvas.getContext('2d');
      context.save();
      context.globalAlpha = srcCanvas.globalAlpha;
      context.globalCompositeOperation = srcCanvas.globalCompositeOperation;
      context.drawImage(srcCanvas.getHTMLCanvas(),0,0,crect.w,crect.h,diffPos.x,diffPos.y,crect.w,crect.h);
      context.restore();
    }else{
      // DO NOTHING
    }
  }
  outputToCanvas(canvas,opt) {
    this.outputToCanvasFromCanvas(this.canvas,canvas,opt);
  }
  outputBelowLayers(canvas,opt) {
    for (let layer of this.belowLayers) {
      if (layer instanceof BaseLayer) {
        layer.outputCurrentLayer(canvas,opt);
      } else {
        // DO NOTHING
      }
    }
  }
  clearCanvas(canvas, opt) {
    if (!opt) {
      opt = {};
    }
    if (opt.clearCanvas) {
      let color = [255,255,255,0];
      if (opt.clearColor) {
        color = parent.Color.colorToArray(opt.clearColor);
      }
      if (canvas instanceof parent.Canvas) {
        canvas.fill(color);
      }else if (canvas instanceof HTMLCanvasElement){
        const colorAry = parent.Color.colorToArray(color);
        const context = canvas.getContext('2d');
        const contextimg = context.getImageData(0,0,canvas.width,canvas.height);
        for(let i = 0; i < contextimg.data.length; i += 4){
          contextimg.data[i] = colorAry[0];
          contextimg.data[i + 1] = colorAry[1];
          contextimg.data[i + 2] = colorAry[2];
          contextimg.data[i + 3] = colorAry[3];
        }
        context.putImageData(contextimg,0,0);
      }else{
        // DO NOTHING
      }
    }
  }
  outputCurrentLayer(canvas, opt) {
    if (!opt) {
      opt = {};
    }
    if (opt.clearCanvas) {
      let color = [255,255,255,0];
      if (opt.clearColor) {
        color = parent.Color.colorToArray(opt.clearColor);
      }
      this.clearCanvas(canvas, opt);
    }
    if (this.visible === true) {
      let crect = {
        x:0,y:0,w:0,h:0
      };
      if (canvas instanceof parent.Canvas) {
        crect = canvas.getRect();
      }else if (canvas instanceof HTMLCanvasElement){
        crect.w = canvas.width;
        crect.h = canvas.height;
      }
      if (this.angle === 0 || this.angle === 180) {
        // DO NOTHING
      }else {
        const tempw = crect.w;
        const temph = crect.h;
        let s = Math.ceil(tempw * Math.abs(Math.cos(this.angle * Math.PI / 180)) + temph * Math.abs(Math.sin(this.angle * Math.PI / 180)));
        s += Math.ceil(tempw * Math.abs(Math.sin(this.angle * Math.PI / 180)) + temph * Math.abs(Math.cos(this.angle * Math.PI / 180)));
        crect.w = s;
        crect.h = s;
      }
      crect.w += Math.abs(this.position.x);
      crect.h += Math.abs(this.position.y);
      const tcanvas = new parent.Canvas(this.main,crect.w,crect.h);
      this.outputBelowLayers(tcanvas,{nonDiffPos: false});
      this.outputToCanvas(tcanvas,{nonDiffPos: false});
      tcanvas.rotate(this.position.x+this.canvas.getRect().w/2,this.position.y+this.canvas.getRect().h/2,this.angle);
      tcanvas.resize(this.canvas.getRect().w,this.canvas.getRect().h);
      this.outputToCanvasFromCanvas(tcanvas,canvas,{nonDiffPos: true});
    }
    if (this.layerChain.next) {
      this.layerChain.next.outputCurrentLayer(canvas);
    }
  }
  outputCurrentFullLayres(canvas,opt) {
    this.getStartLayer().outputCurrentLayer(canvas,opt);
  }
  outputFullLayres(canvas) {
    const topLayers = this.getTopLayers();
    for (let layer of topLayers) {
      layer.outputCurrentFullLayres(canvas);
    }
  }
  getCanvas() {
    return this.canvas;
  }
}
