// Main (export) class
const Main = self.Main = class Main {
  constructor(targetObj, tieName, bodyObj) {
    this.$tie = Main.$tie;
    this.window = app.g_window;
    this.targetObj = targetObj;
    if (tieName === undefined || tieName === null) {
      tieName = 'default';
    }
    this.tieName = tieName;
    if (bodyObj === undefined || bodyObj === null){
      bodyObj = app.g_window.document.getElementsByTagName("body")[0];
    }
    this.bodyObj = bodyObj;
    this.storage = new modules.browser.Storage(this,this.window);
    this.history = {
      maxdepth: -1,
    };
    this.baseCanvas = this.window.document.createElement("canvas");
    this.baseCanvas.width = this.targetObj.getBoundingClientRect().width;
    this.baseCanvas.height = this.targetObj.getBoundingClientRect().height;
    this.defaultLayer = {
      bgcolor: "rgba(255,255,255,1)",
      fgcolor: "rgba(0,0,0,1)",
      externalColor: "rgba(0,216,216,1)",
      width: this.baseCanvas.width,
      height: this.baseCanvas.height,
    };
    this.targetObj.appendChild(this.baseCanvas);

    this.viewerLayer = new modules.browser.Layer(this);
    this.viewerLayer.setHistoryMax(0);
    this.viewerLayer.setExternalColor(this.defaultLayer.externalColor);
    this.viewerLayer.setCanvasSize(0,0);
    this.viewerLayer.addParentLayer(this.baseCanvas);

    this.clearpatternLayer = new modules.browser.Layer(this);
    this.clearpatternLayer.setHistoryMax(0);
    this.clearpatternLayer.addParentLayer(this.viewerLayer);
    this.viewerLayer.addChildLayer(this.clearpatternLayer);
    //this.clearpatternLayer.addLinkedLayer(this.viewerLayer,modules.browser.Layer.LinkedLayerType.CanvasSize);
    //this.viewerLayer.addLinkedLayer(this.clearpatternLayer,modules.browser.Layer.LinkedLayerType.CanvasSize);

    this.baseLayer = new modules.browser.Layer(this);
    this.baseLayer.setHistoryMax(0);
    this.baseLayer.addParentLayer(this.viewerLayer);
    this.viewerLayer.addChildLayer(this.baseLayer);
    this.baseLayer.addLinkedLayer(this.viewerLayer,modules.browser.Layer.LinkedLayerType.CanvasSize);
    this.viewerLayer.addLinkedLayer(this.baseLayer,modules.browser.Layer.LinkedLayerType.CanvasSize);
    this.baseLayer.addLinkedLayer(this.clearpatternLayer,modules.browser.Layer.LinkedLayerType.Move);
    this.clearpatternLayer.addLinkedLayer(this.baseLayer,modules.browser.Layer.LinkedLayerType.Move);

    this.layer = new modules.browser.Layer(this);
    this.baseLayer.addChildLayer(this.layer);
    this.layer.addParentLayer(this.baseLayer);
    this.baseLayer.addLinkedLayer(this.layer,modules.browser.Layer.LinkedLayerType.Move);
    this.layer.addLinkedLayer(this.baseLayer,modules.browser.Layer.LinkedLayerType.Move);

    this.layer2 = new modules.browser.Layer(this);
    this.baseLayer.addChildLayer(this.layer2);
    this.layer2.addParentLayer(this.baseLayer);
    this.baseLayer.addLinkedLayer(this.layer2,modules.browser.Layer.LinkedLayerType.Move);
    this.layer2.addLinkedLayer(this.baseLayer,modules.browser.Layer.LinkedLayerType.Move);

    this.clearpatternLayer.doMethod(modules.canvasMethod.fillClearPattern,null);
    this.viewerLayer.doWrite();
    this.window.addEventListener("DOMContentLoaded", () =>{
      const ovserver = new ResizeObserver(() => {
        this.baseCanvas.width = this.targetObj.getBoundingClientRect().width;
        this.baseCanvas.height = this.targetObj.getBoundingClientRect().height;
        this.viewerLayer.setCanvasSize(this.baseCanvas.width, this.baseCanvas.height);
        this.viewerLayer.setOutputPos(0,0);
        this.viewerLayer.setOutputSize(0,0);
        const cacheRect = this.viewerLayer.calcCacheRect();
        this.viewerLayer.setCanvasSize(0,0);
        this.viewerLayer.setOutputPos(cacheRect.x,cacheRect.y);
        this.viewerLayer.setOutputSize(cacheRect.w,cacheRect.h);
        //this.viewerLayer.setOutputSize(this.baseCanvas.width, this.baseCanvas.height);
        this.clearpatternLayer.doMethod(modules.canvasMethod.fillClearPattern,null);
        this.viewerLayer.doWrite();
      });
      ovserver.observe(this.targetObj);
    });
  }
  static $tie = $tie;
}
