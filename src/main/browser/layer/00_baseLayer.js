const BaseLayer = self.BaseLayer = class BaseLayer {
  static LayerTransformType = {
    Position: 1,
    Angle: 2,
    Scale: 3,
  };

  static currentLayerId = 0;
  constructor(main,width,height,opt) {
    BaseLayer.currentLayerId++;
    this.id = BaseLayer.currentLayerId;
    if (!opt) {
      opt = {};
    }
    this.main = main;
    this.aboveLayers = [];
    this.belowLayers = [];
    this.layerChain = {
      last: null,
      next: null,
    }
    this.position = { x: 0, y: 0 };
    this.angle = 0;
    this.scale = 1;
    this.canvas = new parent.Canvas(main,width,height);
    this.visible = true;
    this.syncPositionLayers = [];
    this.syncAngleLayers = [];
    this.syncScaleLayers = [];
    this.writeClip = false;
    if (opt.writeClip === true) {
      this.writeClip = opt.writeClip;
    }
  }
  addSyncPositionLayer(layer) {
    this.syncPositionLayers.push(layer);
  }
  removeSyncPositionLayer(layer) {
    this.syncPositionLayers = this.syncPositionLayers.filter(l => l !== layer);
  }
  addSyncAngleLayer(layer) {
    this.syncAngleLayers.push(layer);
  }
  removeSyncAngleLayer(layer) {
    this.syncAngleLayers = this.syncAngleLayers.filter(l => l !== layer);
  }
  addSyncScaleLayer(layer) {
    this.syncScaleLayers.push(layer);
  }
  removeSyncScaleLayer(layer) {
    this.syncScaleLayers = this.syncScaleLayers.filter(l => l !== layer);
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
    for (let layer of this.syncAngleLayers) {
      layer.setAngle(this.angle);
    }
  }
  setScale(scale) {
    this.scale = scale;
    for (let layer of this.syncScaleLayers) {
      layer.setScale(this.scale);
    }
  }
  getAngle() {
    return this.angle;
  }
  getPosition() {
    return structuredClone(this.position);
  }
  getScale() {
    return this.scale;
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
  outputToCanvasFromCanvas(srcCanvas,destCanvas,diffPos,scale,opt) {
    if (!opt) {
      opt = {};
    }
    const crect = srcCanvas.getRect();
    if (opt.diffPos) {
      if (opt.diffPos.x) {
        diffPos.x = opt.diffPos.x;
      }
      if (opt.diffPos.y) {
        diffPos.y = opt.diffPos.y;
      }
    }
    let destHTMLCanvas = null;
    if (destCanvas instanceof parent.Canvas) {
      destHTMLCanvas = destCanvas.getHTMLCanvas();
    }else if (destCanvas instanceof HTMLCanvasElement){
      destHTMLCanvas = destCanvas;
    }else{
      // DO NOTHING
    }
    const context = destHTMLCanvas.getContext('2d');
    context.save();
    context.imageSmoothingEnabled = false;
    context.globalAlpha = srcCanvas.globalAlpha;
    context.globalCompositeOperation = srcCanvas.globalCompositeOperation;
    context.translate(diffPos.x,diffPos.y);
    context.scale(scale,scale);
    context.drawImage(srcCanvas.getHTMLCanvas(),0,0,crect.w,crect.h,0,0,crect.w,crect.h);
    context.restore();
  }
  outputToCanvas(canvas,opt) {
    this.outputToCanvasFromCanvas(this.canvas,canvas,structuredClone(this.position),this.scale,opt);
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
      let s = 0;
      let sw = 0;
      let sh = 0;
      if (this.angle === 0) {
        // DO NOTHING
      }else {
        const tempw = crect.w;
        const temph = crect.h;
        sw = Math.ceil(tempw * Math.abs(Math.cos(this.angle * Math.PI / 180)) + temph * Math.abs(Math.sin(this.angle * Math.PI / 180)));
        sh = Math.ceil(tempw * Math.abs(Math.sin(this.angle * Math.PI / 180)) + temph * Math.abs(Math.cos(this.angle * Math.PI / 180)));
        s = sw + sh;
      }
      //crect.w += Math.abs(this.position.x);
      //crect.h += Math.abs(this.position.y);
      const tcanvas = new parent.Canvas(this.main,crect.w,crect.h);
      if (this.writeClip === true) {
        tcanvas.resizeRect(0,0,this.canvas.getRect().w,this.canvas.getRect().h);
      }
      this.outputBelowLayers(tcanvas,{});
      if (this.angle === 0) {
        this.outputToCanvasFromCanvas(this.canvas,tcanvas,{x:0,y:0},1,{});
        tcanvas.rotateCenter(this.angle);
        this.outputToCanvasFromCanvas(tcanvas,canvas,structuredClone(this.position),this.scale,{});
      }else {
        const ow = tcanvas.getRect().w;
        const oh = tcanvas.getRect().h;
        tcanvas.setResizeType(parent.Canvas.ResizeType.Center);
        tcanvas.resize(s*2,s*2);
        this.outputToCanvasFromCanvas(this.canvas,tcanvas,{x:s-this.canvas.getRect().w/2,y:s-this.canvas.getRect().h/2},1,{});
        tcanvas.rotateCenter(this.angle);
        tcanvas.resizeRect(s-this.canvas.getRect().w/2-this.position.x,s-this.canvas.getRect().h/2-this.position.y,ow,oh);
        if (this.writeClip === true) {
          this.outputToCanvasFromCanvas(tcanvas,canvas,{x:0,y:0},this.scale,{});
        }else{
          this.outputToCanvasFromCanvas(tcanvas,canvas,{x:0,y:0},this.scale,{});
        }
      }
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
  getLayerList(target,exceptList) {
    if (target == null){
      return null;
    }
    if (exceptList === undefined || exceptList === null){
      exceptList = [];
    }
    if (target === this){
      if (exceptList.indexOf(this) !== -1){
        return [];
      }
      return [this];
    }
    if (this.belowLayers.length > 0){
      for (let layer of this.belowLayers){
        if (layer instanceof BaseLayer){
          const r = layer.getLayerList(target,exceptList);
          if (r != null){
            if (exceptList.indexOf(this) !== -1){
              return r;
            }
            r.unshift(this);
            return r;
          }
        }
      }
    }
    if (this.layerChain.next){
      const r = this.layerChain.next.getLayerList(target,exceptList);
      if (r != null){
        if (exceptList.indexOf(this) !== -1){
          return r;
        }
        r.unshift(this);
        return r;
      }
    }
    return null;
  }
  getLayerTransform(){
    if (this.position.x === 0 && this.position.y === 0 && this.angle === 0 && this.scale === 1){
      return [];
    }
    let r = [];
    if (this.angle !== 0){
      r.push({
        type: BaseLayer.LayerTransformType.Angle,
        x: this.canvas.getRect().w/2,
        y: this.canvas.getRect().h/2,
        angle: this.angle,
        layer: this,
      });
    }
    if (this.position.x !== 0 || this.position.y !== 0){
      r.push({
        type: BaseLayer.LayerTransformType.Position,
        x: this.position.x,
        y: this.position.y,
        layer: this,
      });
    }
    if (this.scale !== 1){
      r.push({
        type: BaseLayer.LayerTransformType.Scale,
        scale: this.scale,
        layer: this,
      });
    }
    return r;
  }
  getLayerTransformList(layerList){
    if (layerList == null){
      return null;
    }
    let transformList = [];
    for (let layer of layerList){
      const t = layer.getLayerTransform();
      if (t != null){
        transformList = transformList.concat(t);
      }
    }
    return transformList;
  }
  testFillRect(baseLayer,exceptList){
    const transformList = this.getLayerTransformList(baseLayer.getLayerList(this,exceptList));
    const ctx = this.getCanvas().getHTMLCanvas().getContext('2d');
    ctx.save();
    for (let transform of transformList){
      if (transform.type === BaseLayer.LayerTransformType.Position){
        ctx.translate(-transform.x,-transform.y);
      }else if (transform.type === BaseLayer.LayerTransformType.Angle){
        ctx.translate(transform.x,transform.y);
        ctx.rotate(-transform.angle * Math.PI / 180);
        ctx.translate(-transform.x,-transform.y);
      }else if (transform.type === BaseLayer.LayerTransformType.Scale){
        ctx.scale(1/transform.scale,1/transform.scale);
      }
    }
    ctx.fillStyle = 'rgb(255,0,0)';
    ctx.fillRect(100,200,10,20);
    ctx.restore();
  }
}
