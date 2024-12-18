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
    this.basecanvas = this.window.document.createElement("canvas");
    this.basecanvas.width = this.targetObj.getBoundingClientRect().width;
    this.basecanvas.height = this.targetObj.getBoundingClientRect().height;
    this.targetObj.appendChild(this.basecanvas);
    this.clearpatternlayer = new modules.browser.Layer(this);
    this.clearpatternlayer.setHistoryMax(0);
    this.layer = new modules.browser.Layer(this);
    this.layer2 = new modules.browser.Layer(this);
    //this.clearpatternlayer.addParentLayer(this.basecanvas);
    this.clearpatternlayer.addChildLayer(this.layer);
    this.layer.addParentLayer(this.clearpatternlayer);
    this.clearpatternlayer.do_method(null,modules.canvasMethod.fillClearPattern,null);
    this.clearpatternlayer.do_write(this.basecanvas);
    this.window.addEventListener("DOMContentLoaded", () =>{
      const ovserver = new ResizeObserver(() => {
        this.basecanvas.width = this.targetObj.getBoundingClientRect().width;
        this.basecanvas.height = this.targetObj.getBoundingClientRect().height;
        this.clearpatternlayer.resize(null, this.basecanvas.width, this.basecanvas.height);
        this.clearpatternlayer.do_method(null,modules.canvasMethod.fillClearPattern,null);
        this.clearpatternlayer.do_write(this.basecanvas);
      });
      ovserver.observe(this.targetObj);
    });
  }
  static $tie = $tie;
}
