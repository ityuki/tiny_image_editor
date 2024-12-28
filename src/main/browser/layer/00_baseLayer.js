const BaseLayer = self.BaseLayer = class BaseLayer {
  static currentLayerId = 0;
  constructor(main) {
    BaseLayer.currentLayerId++;
    this.id = BaseLayer.currentLayerId;
    this.main = main;
    this.aboveLayers = [];
    this.belowLayers = [];
    this.position = { x: 0, y: 0 };
    this.size = { width: 0, height: 0 };
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
  outputToCanvas(canvas) {
  }
  outputBelowLayers(canvas) {
    for (let layer of this.belowLayers) {
      if (layer instanceof BaseLayer) {
        layer.outputToCanvas(canvas);
      } else {
        // DO NOTHING
      }
    }
  }
  outputCurrentLayer(canvas) {
    this.outputBelowLayers(canvas);
    this.outputToCanvas(canvas);
  }
}
