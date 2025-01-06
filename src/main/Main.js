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
      title:"Test Window - v0.0.1.20250106-1350",
      width: 800 + "px",
      height: 600 + "px",
    });
    this.targetObj.appendChild(this.baseCanvas);

    this.testWindow2 = new modules.browser.Window(this,this.testWindow,{
      enableVScrollbar: false,
      enableHScrollbar: false,
      fixsize: false,
      title:"Test Window2",
      width: 640 + "px",
      height: 480 + "px",
      innerName: "testWindow2",
    });
    this.testWindow3 = new modules.browser.Window(this,this.testWindow,{
      enableVScrollbar: null,
      enableHScrollbar: null,
      fixsize: false,
      autoresize: true,
      title:"Test Window3",
      width: 640 + "px",
      height: 480 + "px",
      top: 20 + "px",
      left: 20 + "px",
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

    this.baseCanvas2 = this.window.document.createElement("canvas");
    this.baseCanvas2.width = this.testWindow2.body.getBoundingClientRect().width;
    this.baseCanvas2.height = this.testWindow2.body.getBoundingClientRect().height;
    this.testWindow2.body.appendChild(this.baseCanvas2);
    this.backgroundLayer2 = new modules.browser.Layer(this,this.testWindow2.body.getBoundingClientRect().width, this.testWindow2.body.getBoundingClientRect().height,{innerName: "backgroundLayer2"});
    this.viewerLayer2 = new modules.browser.Layer(this,this.testWindow2.body.getBoundingClientRect().width, this.testWindow2.body.getBoundingClientRect().height,{innerName: "viewerLayer2"});
    this.backgroundLayer2.insertLastLayer(this.viewerLayer2);
    this.clearpatternLayer2 = new modules.browser.Layer(this,this.testWindow2.body.getBoundingClientRect().width, this.testWindow2.body.getBoundingClientRect().height,{innerName: "clearpatternLayer2"});
    //this.viewerLayer2.addBelowLayer(this.clearpatternLayer2);
    this.baseLayer2 = new modules.browser.Layer(this,this.testWindow2.body.getBoundingClientRect().width, this.testWindow2.body.getBoundingClientRect().height,{writeClip: true,innerName: "baseLayer2"});
    this.baseLayer2.insertLastLayer(this.backgroundLayer2);
    
    this.layerMain = new modules.browser.Layer(this,this.testWindow2.body.getBoundingClientRect().width, this.testWindow2.body.getBoundingClientRect().height,{innerName: "layerMain"});
    this.baseLayer2.addBelowLayer(this.clearpatternLayer2);
    this.baseLayer2.addBelowLayer(this.layerMain);
    modules.browser.canvasMethod.fillClearPattern(this.clearpatternLayer2.canvas);
    {
      const ovserver = new ResizeObserver(() => {
        if (this.testWindow2.body.getBoundingClientRect().width === 0 || this.testWindow2.body.getBoundingClientRect().height === 0){
          return;
        }
        this.baseCanvas2.width = this.testWindow2.body.getBoundingClientRect().width;
        this.baseCanvas2.height = this.testWindow2.body.getBoundingClientRect().height;
        this.viewerLayer2.getCanvas().resize(this.testWindow2.body.getBoundingClientRect().width, this.testWindow2.body.getBoundingClientRect().height);
        this.backgroundLayer2.getCanvas().resize(this.testWindow2.body.getBoundingClientRect().width, this.testWindow2.body.getBoundingClientRect().height);
        modules.browser.canvasMethod.fillBackgroundPattern(this.backgroundLayer2.canvas);
        this.viewerLayer2.outputCurrentLayer(this.baseCanvas2);
      });
      ovserver.observe(this.testWindow2.body);
    }

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
