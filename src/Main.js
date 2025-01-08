// Main (export) class
const Main = self.Main = class Main {
  constructor(targetObj, tieName, bodyObj,opt) {
    this.$tie = Main.$tie;
    this.window = app.g_window;
    this.version = "@__REPLACE__BUILD_INFO_APP_VERSION__@";
    this.targetObj = targetObj;
    this.targetObj.style.overflow = "hidden";
    this.targetObj.style.position = "relative";
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
      title:"Test Window - v"+this.version+".@__REPLACE__BUILD_INFO_YMD__@-@__REPLACE__BUILD_INFO_HM__@",
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
    this.eyesWindow = new modules.browser.Window(this,this.testWindow,{
      enableVScrollbar: false,
      enableHScrollbar: false,
      fixsize: true,
      title:"eyes",
      width: 100 + "px",
      height: 100 + "px",
      top: 0 + "px",
      left: 800-100 + "px",
    });
    //this.testWindow.body.appendChild(this.testWindow2);
    this.eyesCanvas = this.window.document.createElement("canvas");
    this.eyesCanvas.width = this.eyesWindow.body.getBoundingClientRect().width;
    this.eyesCanvas.height = this.eyesWindow.body.getBoundingClientRect().height;
    this.eyesWindow.body.appendChild(this.eyesCanvas);
    this.eyesWindowExecute = false;
    this.bodyObj.addEventListener("mousemove", (e) => {
      const ex = this.eyesWindow.body.getBoundingClientRect().left;
      const ey = this.eyesWindow.body.getBoundingClientRect().top;
      const pw = this.baseCanvas.getBoundingClientRect().width;
      const ph = this.baseCanvas.getBoundingClientRect().height;
      const width = this.eyesCanvas.width;
      const height = this.eyesCanvas.height;
      const ctx = this.eyesCanvas.getContext("2d");
      const ptx = e.pageX || pw + width/2;
      const pty = e.pageY || ph + height/2;
      const dtx = e.movementX || 0;
      const dty = e.movementY || 0;
      const dt = 1;// - Math.log((Math.sqrt(dtx*dtx+dty*dty)));
      if (dt < 0){
        dt = 0;
      }
      let cnt = 0;
      const cntMax = 1;
      if (this.eyesWindowTimer != null){
        clearTimeout(this.eyesWindowTimer);
        this.eyesWindowTimer = null;
      }
      const writer = () => {
        // clear
        ctx.clearRect(0,0,width,height);      
        // left eye
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(width/4,height/2, width/4-2, height/2-2, 0, 2 * Math.PI,false);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.restore();
        // right eye
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(width*3/4,height/2, width/4-2, height/2-2, 0, 2 * Math.PI,false);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.restore();
        // left eye
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = "black";
        let dx = ptx - ex - width/4;
        let dy = pty - ey - height/2;
        let r = Math.sqrt(dx*dx+dy*dy);
        let x =(r<10) ? dx: dx*10/r;
        let y =(r<10) ? dy: dy*10/r;
        let s = 1.5*(pw+ph)/r;
        if (s < 3){
          s = 3;
        }
        if (s > 8){
          s = 8;
        }
        let s2 = (s - 3)*(dt*Math.abs(cntMax-cnt+1)/cntMax) + 3;
        ctx.arc(width/4+x,height/2+y, s2, 0, 2 * Math.PI,false);
        ctx.fill();
        ctx.restore();
        // right eye
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = "black";
        dx = ptx - ex - width*3/4;
        dy = pty - ey - height/2;
        r = Math.sqrt(dx*dx+dy*dy);
        x =(r<10) ? dx: dx*10/r;
        y =(r<10) ? dy: dy*10/r;
        s = 1.5*(pw+ph)/r;
        if (s < 3){
          s = 3;
        }
        if (s > 8){
          s = 8;
        }
        s2 = (s - 3)*(dt*Math.abs(cntMax-cnt+1)/cntMax) + 3;
        ctx.arc(width*3/4+x,height/2+y, s2, 0, 2 * Math.PI,false);
        ctx.fill();
        ctx.restore();
      };
      writer();
      cnt += 1;
      const timeoutFunc = (first) => {
        if (first || (this.eyesWindowExecute != null && cnt < cntMax*2)){
          writer();
          cnt += 1;
          this.eyesWindowTimer = setTimeout(() => {timeoutFunc(false);}, 10);
        }else{
          this.eyesWindowTimer = null;
        }
        return this.eyesWindowTimer;
      }
      timeoutFunc(true);
    });
    this.bodyObj.dispatchEvent(new Event("mousemove"));

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
  static $tie = app;
}
