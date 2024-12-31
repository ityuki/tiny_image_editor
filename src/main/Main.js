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

    this.viewerLayer = new modules.browser.Layer(this,this.defaultLayer.width,this.defaultLayer.height);

    this.clearpatternLayer = new modules.browser.Layer(this,this.defaultLayer.width,this.defaultLayer.height);
    this.clearpatternLayer.insertLastLayer(this.viewerLayer);

    this.baseLayer = new modules.browser.Layer(this,this.defaultLayer.width,this.defaultLayer.height,{writeClip: true});
    this.baseLayer.insertLastLayer(this.clearpatternLayer);
    this.baseLayer.addSyncPositionLayer(this.clearpatternLayer);
    this.baseLayer.addSyncAngleLayer(this.clearpatternLayer);
    this.baseLayer.addSyncScaleLayer(this.clearpatternLayer);

    this.layer = new modules.browser.Layer(this,this.defaultLayer.width,this.defaultLayer.height);
    this.baseLayer.addBelowLayer(this.layer);
    this.layer2 = new modules.browser.Layer(this,this.defaultLayer.width,this.defaultLayer.height);
    this.baseLayer.addBelowLayer(this.layer2);

    modules.browser.canvasMethod.fillClearPattern(this.clearpatternLayer.canvas);
    this.viewerLayer.outputCurrentLayer(this.baseCanvas);
    this.window.addEventListener("DOMContentLoaded", () =>{
      const ovserver = new ResizeObserver(() => {
        this.baseCanvas.width = this.targetObj.getBoundingClientRect().width;
        this.baseCanvas.height = this.targetObj.getBoundingClientRect().height;
        this.viewerLayer.getCanvas().resize(this.baseCanvas.width, this.baseCanvas.height);
        modules.browser.canvasMethod.fillClearPattern(this.clearpatternLayer.canvas);
        this.viewerLayer.outputCurrentLayer(this.baseCanvas);
      });
      ovserver.observe(this.targetObj);
    });
  }
  static $tie = $tie;
}
