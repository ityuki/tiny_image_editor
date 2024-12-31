const Window = self.Window = class Window {
  static WindowMode = {
    Normal: 0,
    FullScreen: 1,
    Minimized: 2,
  };
  static currentWindowId = 0;
  constructor(main,parentObj,options) {
    Window.currentWindowId++;
    this.id = Window.currentWindowId;
    if (!options) {
      options = {};
    }
    this.main = main;
    this.options = options;
    this.visible = true;
    this.parentObj = parentObj || null;
    this.mode = options.mode || Window.WindowMode.Normal;
    this.childSmallWindow = [];
    this.childWindow = [];
    this.window = this.main.window.document.createElement("div");
    if (options.fixsize) {
      this.window.style.resize = "none";
    }else{
      this.window.style.resize = "both";
    }
    this.window.style.overflow = "hidden";
    this.window.style.width = options.width || "200px";
    this.window.style.height = options.height || "100px";
    this.window.style.top = options.top || "0px";
    this.window.style.left = options.left || "0px";
    this.window.style.borderWidth = "1px";
    this.main.colorClass.setColor(this.window,"WindowBorderColor",this.id);
    this.window.style.borderStyle = "solid";
    if (parentObj) {
      this.window.style.position = "absolute";
      this.window.boxSize = "border-box";
      if (parentObj instanceof Window) {
        this.parentObj.body.appendChild(this.window);
        this.parentObj.addChildWindow(this);
      }else{
        this.parentObj.appendChild(this.window);
      }
    }else{
      this.window.style.position = "fixed";
      this.main.window.document.body.appendChild(this.window);
    }
    this.titlebar = this.main.window.document.createElement("div");
    this.tooltip = this.main.window.document.createElement("div");
    this.tooltip.style.position = "fixed";
    this.tooltip.style.display = "none";
    this.main.colorClass.setColorClass(this.tooltip,"WindowTooltipBackgroundColor",this.id);
    this.main.colorClass.setColorClass(this.tooltip,"WindowTooltipColor",this.id);
    this.tooltip.style.padding = "4px";
    this.tooltip.style.borderRadius = "4px";
    this.tooltip.style.zIndex = "1000";
    this.tooltip.style.boxShadow = "0px 0px 4px " + this.main.colorClass.getColor("WindowTooltipBackgroundColor");
    this.tooltip.style.transition = "opacity 0.2s";
    this.window.appendChild(this.tooltip);
    this.window.appendChild(this.titlebar);
    this.original = {
      width: this.window.style.width,
      height: this.window.style.height,
      top: this.window.style.top,
      left: this.window.style.left,
      lastMode: Window.WindowMode.Normal,
    };
    const current = this;
    this.changeMode = function(mode) {
      if (current.original.lastMode === Window.WindowMode.Minimized) {
        if (current.parentObj instanceof Window) {
          current.parentObj.childSmallWindow = current.parentObj.childSmallWindow.map((e,i) => {
            if (e === current) {
              return null;
            }
            return e;
          });
          while(current.parentObj.childSmallWindow[current.parentObj.childSmallWindow.length - 1] === null){
            current.parentObj.childSmallWindow.pop();
          }
        }
        switch (mode) {
          case Window.WindowMode.Normal:
            current.titlebarObj.showMinIcon = true;
            current.titlebarObj.showFullscrIcon = true;
            current.titlebarObj.showTitle = true;
            current.window.style.top = current.original.top;
            current.window.style.left = current.original.left;
            current.window.style.width = current.original.width;
            current.window.style.height = current.original.height;
            current.original.lastMode = Window.WindowMode.Normal;
            break;
          case Window.WindowMode.FullScreen:
            current.titlebarObj.showMinIcon = true;
            current.titlebarObj.showFullscrIcon = false;
            current.titlebarObj.showTitle = true;
            current.window.style.top = "0px";
            current.window.style.left = "0px";
            current.window.style.width = "calc(100%-2px)";
            current.window.style.height = "calc(100%-2px)";
            current.original.lastMode = Window.WindowMode.FullScreen;
            break;
        }
        current.titlebarObj.update();
        return;
      }
      switch (mode) {
        case Window.WindowMode.Normal:
          current.titlebarObj.showMinIcon = true;
          current.titlebarObj.showFullscrIcon = true;
          current.titlebarObj.showTitle = true;
          current.window.style.top = current.original.top;
          current.window.style.left = current.original.left;
          current.window.style.width = current.original.width;
          current.window.style.height = current.original.height;
          current.original.lastMode = Window.WindowMode.Normal;
          break;
        case Window.WindowMode.FullScreen:
          current.original.lastMode = Window.WindowMode.FullScreen,
          current.window.style.top = "0px";
          current.window.style.left = "0px";
          current.window.style.width = "calc(100% - 2px)";
          current.window.style.height = "calc(100% - 2px)";
          current.titlebarObj.showMinIcon = true;
          current.titlebarObj.showFullscrIcon = false;
          current.titlebarObj.showTitle = true;
          break;
        case Window.WindowMode.Minimized:
          if (current.original.lastMode === Window.WindowMode.Normal) {
            current.window.style.top = current.original.top;
            current.window.style.left = current.original.left;
            current.window.style.width = current.original.width;
            current.window.style.height = current.original.height;
            current.titlebarObj.showFullscrIcon = false;
          }else if (current.original.lastMode === Window.WindowMode.FullScreen) {
            current.titlebarObj.showFullscrIcon = true;
          }
          current.original.lastMode = Window.WindowMode.Minimized;
          current.window.style.top = "calc(100% - 20px)";
          if (current.parentObj instanceof Window) {
            let idx = current.parentObj.childSmallWindow.indexOf(null);
            if (idx < 0) {
              idx = current.parentObj.childSmallWindow.length;
              current.parentObj.childSmallWindow.push(current);
            }
            current.window.style.left = (idx * 60) + "px";
            current.parentObj.childSmallWindow[idx] = current;
          }else{
            current.window.style.left = "0px";
          }
          current.window.style.width = "60px";
          current.window.style.height = "20px";  
          current.titlebarObj.showMinIcon = false;
          current.titlebarObj.showTitle = false;
          break;
      }
      current.titlebarObj.update();
    };
    this.titlebarObj = new TitleBar(this.main,this.titlebar,{
      title: options.title || "Window",
      onclick: {
        close: function() {
          console.log("Close");
        },
        normalscr: function() {
          current.changeMode(Window.WindowMode.Normal);
        },
        fullscr: function() {
          current.changeMode(Window.WindowMode.FullScreen);
        },
        min: function() {
          current.changeMode(Window.WindowMode.Minimized);
        },
        menu: function() {
          console.log("Menu");
        },
        titlebar: function() {
          current.setTop();
        },
      },
      ondblclick: {
        titlebar: function() {
          if (current.original.lastMode === Window.WindowMode.Normal) {
            current.changeMode(Window.WindowMode.FullScreen);
          }else if (current.original.lastMode === Window.WindowMode.FullScreen) {
            current.changeMode(Window.WindowMode.Normal);
          }else if (current.original.lastMode === Window.WindowMode.Minimized) {
            if (current.titlebarObj.showFullscrIcon) {
              current.changeMode(Window.WindowMode.FullScreen);
            }else{
              current.changeMode(Window.WindowMode.Normal);
            }
          }
        },
      },
      onmouseover: {
        menu: function() {
          current.tooltip.style.display = "block";
          current.tooltip.innerHTML = current.titlebarObj.title;
          current.tooltip.style.left = current.titlebarObj.menuitem.getBoundingClientRect().left + "px";
          if (current.parentObj instanceof Window) {
            if (current.titlebarObj.menuitem.getBoundingClientRect().bottom > current.parentObj.body.getBoundingClientRect().bottom/2) {
              current.tooltip.style.top = current.titlebarObj.menuitem.getBoundingClientRect().top - current.tooltip.getBoundingClientRect().height + "px";
            }else{
              current.tooltip.style.top = current.titlebarObj.menuitem.getBoundingClientRect().bottom + "px";
            }
          }else{
            current.tooltip.style.top = current.titlebarObj.menuitem.getBoundingClientRect().bottom + "px";
          }
        },
      },
      onmouseout: {
        menu: function() {
          current.tooltip.style.display = "none";
        },
      },
      onpointermove: {
        titlebar: function(target,e) {
          if(e.buttons){
            if (current.original.lastMode === Window.WindowMode.FullScreen) return;
            current.tooltip.style.display = "none";
            if (e.screenX === 0 && e.screenY === 0) {
              return;
            }
            current.window.style.left     = current.window.offsetLeft + e.movementX + 'px';
            current.window.style.top      = current.window.offsetTop  + e.movementY + 'px';
            //current.window.style.position = 'absolute';
            current.original.top = current.window.style.top;
            current.original.left = current.window.style.left;
            current.titlebarObj.titlebar.setPointerCapture(e.pointerId);
          }
        },
      },
    });
    this.bodybarria = this.main.window.document.createElement("div");
    this.bodybarria.addEventListener("click",function(e){
      current.setTop();
    });
    this.body = this.main.window.document.createElement("div");
    if (options.enableVScrollbar) {
      if (options.enableHScrollbar) {
        this.body.style.overflow = "scroll";
      }else if (options.enableHScrollbar === null) {
        this.body.style.overflow = "auto";
        this.body.style.overflowX = "auto";
        this.body.style.overflowY = "scroll";
      }else{
        this.body.style.overflow = "auto";
        this.body.style.overflowX = "hidden";
        this.body.style.overflowY = "scroll";
      }
    }else if (options.enableVScrollbar === null) {
      if (options.enableHScrollbar) {
        this.body.style.overflow = "auto";
        this.body.style.overflowX = "scroll";
        this.body.style.overflowY = "auto";
      }else if (options.enableHScrollbar === null) {
        this.body.style.overflow = "auto";
        this.body.style.overflowX = "auto";
        this.body.style.overflowY = "auto";
      }else{
        this.body.style.overflow = "auto";
        this.body.style.overflowX = "hidden";
        this.body.style.overflowY = "auto";
      }
    }else{
      if (options.enableHScrollbar) {
        this.body.style.overflow = "auto";
        this.body.style.overflowX = "scroll";
        this.body.style.overflowY = "hiedden";
      }else if (options.enableHScrollbar === null) {
        this.body.style.overflow = "auto";
        this.body.style.overflowX = "auto";
        this.body.style.overflowY = "hidden";
      }else{
        this.body.style.overflow = "hidden";
      }
    }
    this.window.appendChild(this.bodybarria);
    this.bodybarria.appendChild(this.body);
    this.bodybarria.style.position = "absolute";
    this.bodybarria.top = "0px";
    this.bodybarria.left = "0px";
    this.bodybarria.style.width = "100%";
    this.bodybarria.style.height = "calc(100% - " + (this.titlebarObj.titlebar.style.height).replace(/px$/,"") + "px)";
    this.bodybarria.style.overflow = "hidden";
    this.body.style.width = "100%";
    this.body.style.height = "100%";
    this.body.style.top = "0px";
    this.body.style.left = "0px";
    //this.body.style.overflow = "hidden";
    this.main.colorClass.setColorClass(this.body,"WindowBackgroundColor",this.id);
  }
  addChildWindow(window) {
    this.childWindow.push({window:window,zIndex:this.childWindow.length});
  }
  removeChildWindow(window) {
    this.childWindow = this.childWindow.filter(e => e.window !== window);
  }
  setTop(){
    if (this.parentObj instanceof Window) {
      this.parentObj.childWindow = this.parentObj.childWindow.filter(e => e.window !== this).sort((a,b) => a.zIndex - b.zIndex);
      this.parentObj.childWindow.push({window:this,zIndex:this.childWindow.length});
      for(let i=0;i<this.parentObj.childWindow.length;i++){
        this.parentObj.childWindow[i].window.window.style.zIndex = i;
        this.parentObj.childWindow[i].window.titlebarObj.unsetTop();
        this.parentObj.childWindow[i].zIndex = i;      
      }
      this.parentObj.childWindow[this.parentObj.childWindow.length-1].window.titlebarObj.setTop();
    }
  }
}
