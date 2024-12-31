const Window = self.Window = class Window {
  static WindowMode = {
    Normal: 0,
    FullScreen: 1,
    Minimized: 2,
  };
  static currentWindowId = 0;
  constructor(main,parentObj,options) {
    Layer.currentWindowId++;
    this.id = Layer.currentWindowId;
    if (!options) {
      options = {};
    }
    this.main = main;
    this.options = options;
    this.visible = true;
    this.parentObj = parentObj || null;
    this.mode = options.mode || Window.WindowMode.Normal;
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
    this.window.style.borderColor = "rgba(0,0,0,1)";
    this.window.style.borderStyle = "solid";
    if (parentObj) {
      this.window.style.position = "absolute";
      this.parentObj.appendChild(this.window);
    }else{
      this.window.style.position = "fixed";
      this.main.window.document.body.appendChild(this.window);
    }
    this.titlebar = this.main.window.document.createElement("div");
    this.tooltip = this.main.window.document.createElement("div");
    this.tooltip.style.position = "fixed";
    this.tooltip.style.display = "none";
    this.tooltip.style.backgroundColor = "rgba(0,0,0,0.8)";
    this.tooltip.style.color = "rgba(255,255,255,1)";
    this.tooltip.style.padding = "4px";
    this.tooltip.style.borderRadius = "4px";
    this.tooltip.style.zIndex = "1000";
    this.tooltip.style.boxShadow = "0px 0px 4px rgba(0,0,0,0.8)";
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
            current.window.style.width = "100%";
            current.window.style.height = "100%";
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
          current.window.style.width = "100%";
          current.window.style.height = "100%";
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
          current.window.style.top = "0px";
          current.window.style.left = "0px";
          current.window.style.width = "60px";
          current.window.style.height = "16px";
          current.titlebarObj.showMinIcon = false;
          current.titlebarObj.showTitle = false;
          break;
      }
      current.titlebarObj.update();
    };
    this.startmouseoffset = {
      x: 0,
      y: 0,
    }
    this.inDraging = false;
    const drag_handler = function(e) {
      e.preventDefault();
    };
    const allowDropEventAll = function(){
      current.main.window.document.addEventListener("drop",drag_handler);
      current.main.window.document.addEventListener("dragover",drag_handler);
    }
    const removeDropEventAll = function(){
      current.main.window.document.removeEventListener("drop",drag_handler);
      current.main.window.document.removeEventListener("dragover",drag_handler);
    }
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
          current.tooltip.style.top = current.titlebarObj.menuitem.getBoundingClientRect().bottom + "px";
        },
      },
      onmouseout: {
        menu: function() {
          current.tooltip.style.display = "none";
        },
      },
      ondrag: {
        titlebar: function(target,e) {
          if (current.original.lastMode === Window.WindowMode.FullScreen) return;
          current.tooltip.style.display = "none";
          if (e.screenX === 0 && e.screenY === 0) {
            return;
          }
          current.window.style.top = (e.clientY-current.startmouseoffset.y) + "px";
          current.window.style.left = (e.clientX-current.startmouseoffset.x) + "px";
          current.original.top = current.window.style.top;
          current.original.left = current.window.style.left;
        },
      },
      ondragstart: {
        titlebar: function(target,e) {
          if (current.original.lastMode === Window.WindowMode.FullScreen) return;
          current.startmouseoffset.x = e.offsetX;
          current.startmouseoffset.y = e.offsetY;
          current.tooltip.style.display = "none";
          current.window.style.opacity = 0.5;
          allowDropEventAll();
          current.inDraging = true;
        },
      },
      ondragend: {
        titlebar: function(target,e) {
          if (current.original.lastMode === Window.WindowMode.FullScreen) return;
          current.window.style.opacity = 1;
          //current.window.style.top = (e.clientY-current.startmouseoffset.y) + "px";
          //current.window.style.left = (e.clientX-current.startmouseoffset.x) + "px";
          //current.original.top = current.window.style.top;
          //current.original.left = current.window.style.left;
          current.window.style.top = current.original.top;
          current.window.style.left = current.original.left;
          removeDropEventAll();
          current.inDraging = false;
        },
      },
      ondragleave: {
        titlebar: function(target,e) {
          e.preventDefault();
          if (current.original.lastMode === Window.WindowMode.FullScreen) return;
          current.isDraging = false;
          current.window.style.top = current.original.top;
          current.window.style.left = current.original.left;
        },
      },
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
    this.window.appendChild(this.body);
    this.body.style.width = "100%";
    this.body.style.height = "calc(100% - " + (this.titlebarObj.titlebar.style.height).replace(/px$/,"") + "px)";
    this.body.style.backgroundColor = "rgba(255,255,255,1)";
    //this.body.style.overflow = "hidden";
  }
}
