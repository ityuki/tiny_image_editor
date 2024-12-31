// Main (export) class
const Main = self.Main = class Main {
  constructor(targetObj, tieName, bodyObj,opt) {
    this.$tie = Main.$tie;
    this.window = app.g_window;
    this.targetObj = targetObj;
    this.targetObj.style.overflow = "hidden";
    if (tieName === undefined || tieName === null) {
      tieName = 'default';
    }
    if (!opt){
      opt = {};
    }
    this.tieName = tieName;
    if (bodyObj === undefined || bodyObj === null){
      bodyObj = app.g_window.document.getElementsByTagName("body")[0];
    }
    this.bodyObj = bodyObj;
    this.option = opt;
    this.colorClass = new modules.browser.ColorClass(this.option.color);
    this.colorClass.setClassBaseName(app.APP_ID);
    this.colorClass.setClassInstanceName(this.tieName);
    this.storage = new modules.browser.Storage(this,this.window);
    this.history = {
      maxdepth: -1,
    };
    this.baseCanvas = this.window.document.createElement("canvas");
    this.baseCanvas.width = this.targetObj.getBoundingClientRect().width;
    this.baseCanvas.height = this.targetObj.getBoundingClientRect().height;
    this.defaultLayer = {
      width: this.baseCanvas.width,
      height: this.baseCanvas.height,
    };

    this.testWindow = new modules.browser.Window(this,this.targetObj,{
      enableVScrollbar: false,
      enableHScrollbar: false,
      fixsize: false,
      title:"Test Window",
    });
    this.targetObj.appendChild(this.baseCanvas);

    this.testWindow2 = new modules.browser.Window(this,this.testWindow,{
      enableVScrollbar: null,
      enableHScrollbar: null,
      fixsize: false,
      title:"Test Window2",
    });
    this.testWindow3 = new modules.browser.Window(this,this.testWindow,{
      enableVScrollbar: null,
      enableHScrollbar: null,
      fixsize: false,
      title:"Test Window3",
    });
    //this.testWindow.body.appendChild(this.testWindow2);

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
