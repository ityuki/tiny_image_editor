const Window = self.Window = class Window {
  static WindowMode = {
    Normal: 0,
    FullScreen: 1,
    Minimized: 2,
  };
  static currentWindowId = 0;
  getChildWindow() {
    return this.childWindow;
  }
  parentResize() {
    if (this.mode === Window.WindowMode.FullScreen) {
      this.resizer.current.style.width = "100%";
      this.resizer.current.style.height = "100%";
      this.window.style.width = "100%";
      this.window.style.height = "100%";
      this.resizer.resizeMax();
      this.resizer.current.dispatchEvent(new Event("resize"));
      this.window.dispatchEvent(new Event("resize"));
    }
    for(let child of this.getChildWindow()) {
      child.parentResize();
    }
  }
  changeMode(mode) {
    if (this.original.lastMode === Window.WindowMode.Minimized) {
      if (this.parentObj instanceof Window) {
        this.parentObj.childSmallWindow = this.parentObj.childSmallWindow.map((e,i) => {
          if (e === current) {
            return null;
          }
          return e;
        });
        while(this.parentObj.childSmallWindow[this.parentObj.childSmallWindow.length - 1] === null){
          this.parentObj.childSmallWindow.pop();
        }
      }
      switch (mode) {
        case Window.WindowMode.Normal:
          this.titlebarObj.showMinIcon = true;
          this.titlebarObj.showFullscrIcon = true;
          this.titlebarObj.showTitle = true;
          this.resizer.resizeInner(this.original.width,this.original.height);
          this.resizer.move(this.original.left,this.original.top);
          //this.window.style.width = this.original.width;
          //this.window.style.height = this.original.height;
          this.resizer.unsetMin();
          this.resizer.resizeMax();
          this.resizer.setDiff(this.resizerW,this.resizerH);
          this.resizer.this.dispatchEvent(new Event("resize"));
          this.window.dispatchEvent(new Event("resize"));
          this.original.lastMode = Window.WindowMode.Normal;
          this.setTop();
          break;
        case Window.WindowMode.FullScreen:
          this.titlebarObj.showMinIcon = true;
          this.titlebarObj.showFullscrIcon = false;
          this.titlebarObj.showTitle = true;
          this.resizer.this.style.width = "100%";
          this.resizer.this.style.height = "100%";
          this.window.style.width = "100%";
          this.window.style.height = "100%";
          this.resizer.move(0,0);
          this.resizer.setDiff(0,0);
          this.resizer.unsetMin();
          this.resizer.resizeMax();
          //this.resizer.fit();
          this.resizer.this.dispatchEvent(new Event("resize"));
          this.window.dispatchEvent(new Event("resize"));
          this.original.lastMode = Window.WindowMode.FullScreen;
          this.setTop();
          break;
      }
      this.mode = mode;
      this.titlebarObj.update();
      return;
    }
    switch (mode) {
      case Window.WindowMode.Normal:
        this.titlebarObj.showMinIcon = true;
        this.titlebarObj.showFullscrIcon = true;
        this.titlebarObj.showTitle = true;
        this.resizer.setDiff(this.resizerW,this.resizerH);
        this.resizer.resizeInner(this.original.width,this.original.height);
        this.resizer.move(this.original.left,this.original.top);
        this.resizer.this.dispatchEvent(new Event("resize"));
        this.window.dispatchEvent(new Event("resize"));
        this.original.lastMode = Window.WindowMode.Normal;
        this.setTop();
        break;
      case Window.WindowMode.FullScreen:
        this.original.lastMode = Window.WindowMode.FullScreen,
        this.original.width = this.window.getBoundingClientRect().width;
        this.original.height = this.window.getBoundingClientRect().height;
        this.original.top = this.resizer.getPos().top;
        this.original.left = this.resizer.getPos().left;
        this.resizer.this.style.width = "100%";
        this.resizer.this.style.height = "100%";
        this.window.style.width = "100%";
        this.window.style.height = "100%";
        this.resizer.move(0,0);
        this.resizer.setDiff(0,0);
        this.resizer.resizeMax();
        this.resizer.this.dispatchEvent(new Event("resize"));
        //this.resizer.fit();
        this.window.dispatchEvent(new Event("resize"));
        this.titlebarObj.showMinIcon = true;
        this.titlebarObj.showFullscrIcon = false;
        this.titlebarObj.showTitle = true;
        this.setTop();
        break;
      case Window.WindowMode.Minimized:
        if (this.original.lastMode === Window.WindowMode.Normal) {
          this.original.width = this.window.getBoundingClientRect().width;
          this.original.height = this.window.getBoundingClientRect().height;
          this.original.top = this.resizer.getPos().top;
          this.original.left = this.resizer.getPos().left;
          this.titlebarObj.showFullscrIcon = false;
        }else if (this.original.lastMode === Window.WindowMode.FullScreen) {
          this.titlebarObj.showFullscrIcon = true;
        }
        this.original.lastMode = Window.WindowMode.Minimized;
        this.resizer.this.style.top = "calc(100% - 20px)";
        if (this.parentObj instanceof Window) {
          let idx = this.parentObj.childSmallWindow.indexOf(null);
          if (idx < 0) {
            idx = this.parentObj.childSmallWindow.length;
            this.parentObj.childSmallWindow.push(current);
          }
          this.resizer.this.style.left = (idx * 60) + "px";
          this.parentObj.childSmallWindow[idx] = current;
        }else{
          this.resizer.this.style.left = "0px";
        }
        this.window.style.width = "60px";
        this.window.style.height = "20px";  
        this.resizer.setDiff(0,0);
        this.resizer.setMin();
        this.resizer.this.dispatchEvent(new Event("resize"));
        this.titlebarObj.showMinIcon = false;
        this.titlebarObj.showTitle = false;
        break;
    }
    this.titlebarObj.update();
    this.mode = mode;
  }

  constructor(main,parentObj,options) {
    Window.currentWindowId++;
    this.id = Window.currentWindowId;
    if (!options) {
      options = {};
    }
    this.main = main;
    const current = this;
    this.options = options;
    this.visible = true;
    this.parentObj = parentObj || null;
    this.mode = options.mode || Window.WindowMode.Normal;
    this.childSmallWindow = [];
    this.childWindow = [];
    this.autoresize = options.autoresize || false;
    this.innerName = options.innerName || "";
    this.window = this.main.window.document.createElement("div");
    this.window.style.resize = "none";
    this.window.style.cursor = "auto";
    this.window.style.boxSizing = "border-box";
    let prealObj = this.parentObj;
    if (prealObj instanceof Window) {
      prealObj = prealObj.window;
    }
    this.resizer = new ObjectResizer(this.main,this,prealObj);
    this.resizerW = 5;
    this.resizerH = 5;
    if (options.fixsize) {
      // DO NOTHING
    }else{
      this.resizer.setDiff(this.resizerW,this.resizerH);
    }
    this.window.style.overflow = "hidden";
    this.window.style.width = options.width || "200px";
    this.window.style.height = options.height || "100px";
    this.window.style.top = "0px";
    this.window.style.left = "0px";
    this.window.style.borderWidth = "1px";
    this.main.colorClass.setColor(this.window,"WindowBorderColor",this.id);
    this.window.style.borderStyle = "solid";
    if (parentObj) {
      this.window.style.position = "relative";
      this.window.boxSize = "border-box";
      if (parentObj instanceof Window) {
        //this.parentObj.body.appendChild(this.window);
        this.parentObj.addChildWindow(this);
      }else{
        //this.parentObj.appendChild(this.window);
      }
    }else{
      this.window.style.position = "fixed";
      //this.main.window.document.body.appendChild(this.window);
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
      top: this.resizer.getPos().y,
      left: this.resizer.getPos().x,
      lastMode: Window.WindowMode.Normal,
    };
    if (this.parentObj !== null) {
      if (this.parentObj instanceof Window) {
        this.parentObj.window.addEventListener("DOMContentLoaded",()=>{
          this.parentObj.window.addEventListener("resize",this.parentResize);
        });
      }else{
        this.parentObj.addEventListener("DOMContentLoaded",()=>{
          this.parentObj.addEventListener("resize",this.parentResize);
          const observer = new ResizeObserver(this.parentResize);
          observer.observe(this.parentObj);
        });
      }
    }
    this.titlebarObj = new TitleBar(this.main,this.titlebar,{
      title: options.title || "Window",
      onclick: {
        close: function(target,e) {
          e.preventDefault();
          e.stopPropagation();
          console.log("Close");
        },
        normalscr: function(target,e) {
          e.preventDefault();
          e.stopPropagation();
          current.changeMode(Window.WindowMode.Normal);
        },
        fullscr: function(target,e) {
          e.preventDefault();
          e.stopPropagation();
          current.changeMode(Window.WindowMode.FullScreen);
        },
        min: function(target,e) {
          e.preventDefault();
          e.stopPropagation();
          current.changeMode(Window.WindowMode.Minimized);
        },
        menu: function(target,e) {
          e.preventDefault();
          e.stopPropagation();
          console.log("Menu");
        },
        titlebar: function(target,e) {
          e.preventDefault();
          e.stopPropagation();
        },
      },
      ondblclick: {
        close: function(target,e) {
          e.preventDefault();
          e.stopPropagation();
        },
        normalscr: function(target,e) {
          e.preventDefault();
          e.stopPropagation();
        },
        fullscr: function(target,e) {
          e.preventDefault();
          e.stopPropagation();
        },
        min: function(target,e) {
          e.preventDefault();
          e.stopPropagation();
        },
        menu: function(target,e) {
          e.preventDefault();
          e.stopPropagation();
          console.log("Menu");
        },
        titlebar: function(target,e) {
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
        menu: function(target,e) {
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
        menu: function(target,e) {
          current.tooltip.style.display = "none";
        },
      },
      onpointermove: {
        titlebar: function(target,e) {
          if(e.buttons && (e.pointerType !== "touch" && e.pointerType !== "pen")) {
            if (current.original.lastMode === Window.WindowMode.FullScreen) return;
            current.tooltip.style.display = "none";
            if (e.screenX === 0 && e.screenY === 0) {
              return;
            }
            const rpos = current.resizer.getPos();
            current.resizer.move(rpos.left + e.movementX,rpos.top + e.movementY);
            //current.window.style.left     = current.window.offsetLeft + e.movementX + 'px';
            //current.window.style.top      = current.window.offsetTop  + e.movementY + 'px';
            //current.window.style.position = 'absolute';
            //current.original.top = rpos.top + e.movementY;
            //current.original.left = rpos.left + e.movementX;
            current.titlebarObj.titlebar.setPointerCapture(e.pointerId);
            e.preventDefault();
            e.stopPropagation();
          }
        },
      },
      ontouchstart: {
        titlebar: function(target,e) {
          if (current.original.lastMode === Window.WindowMode.FullScreen) return;
          current.tooltip.style.display = "none";
          e.stopPropagation();
          current.touchStartX = e.changedTouches[0].pageX - current.resizer.current.offsetLeft;
          current.touchStartY = e.changedTouches[0].pageY - current.resizer.current.offsetLeft;
        },
      },
      ontouchend: {
        close: function(target,e) {
          e.preventDefault();
          e.stopPropagation();
          current.titlebarObj.closeitem.dispatchEvent(new Event("click"));
        },
        normalscr: function(target,e) {
          e.preventDefault();
          e.stopPropagation();
          current.changeMode(Window.WindowMode.Normal);
          current.titlebarObj.normalscritem.dispatchEvent(new Event("click"));
        },
        fullscr: function(target,e) {
          e.preventDefault();
          e.stopPropagation();
          current.changeMode(Window.WindowMode.FullScreen);
          current.titlebarObj.fullscritem.dispatchEvent(new Event("click"));
        },
        min: function(target,e) {
          e.preventDefault();
          e.stopPropagation();
          current.changeMode(Window.WindowMode.Minimized);
          current.titlebarObj.minitem.dispatchEvent(new Event("click"));
        },
        menu: function(target,e) {
          e.preventDefault();
          e.stopPropagation();
          current.titlebarObj.menuitem.dispatchEvent(new Event("click"));
        },
        titlebar: function(target,e) {
          if (current.original.lastMode === Window.WindowMode.FullScreen) return;
          e.preventDefault();
          e.stopPropagation();
        },
      },
      ontouchmove: {
        titlebar: function(target,e) {
          if (current.original.lastMode === Window.WindowMode.FullScreen) return;
          e.preventDefault();
          e.stopPropagation();
          if (!/^touch/.test(e.type)) return;
          current.resizer.move(e.changedTouches[0].pageX - current.touchStartX,e.changedTouches[0].pageY - current.touchStartY);
          //current.window.style.left = e.changedTouches[0].pageX - current.touchStartX + 'px';
          //current.window.style.top = e.changedTouches[0].pageY - current.touchStartY + 'px';
        },
      },
      fixsize: options.fixsize || false,
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
    this.body.style.position = "relative";
    this.body.style.width = "100%";
    this.body.style.height = "100%";
    this.body.style.top = "0px";
    this.body.style.left = "0px";
    if (this.parentObj instanceof Window) {
      this.resizer.setBody(this.parentObj.body);
    }else{
      this.resizer.setBody(this.parentObj);
    }
    this.resizer.move(options.left || 0,options.top || 0);
    //this.body.style.overflow = "hidden";
    this.main.colorClass.setColorClass(this.body,"WindowBackgroundColor",this.id);
    this.window.dispatchEvent(new Event("resize"));
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
        this.parentObj.childWindow[i].window.resizer.current.style.zIndex = i;
        this.parentObj.childWindow[i].window.window.style.zIndex = i;
        this.parentObj.childWindow[i].window.titlebarObj.unsetTop();
        this.parentObj.childWindow[i].zIndex = i;      
      }
      this.parentObj.childWindow[this.parentObj.childWindow.length-1].window.titlebarObj.setTop();
    }
  }
}
