const TitleBar = self.TitleBar = class TitleBar {
  static currentTitlebarId = 0;
  constructor(main,parentObj,options) {
    TitleBar.currentTitlebarId++;
    this.id = TitleBar.currentTitlebarId;
    if (!options) {
      options = {};
    }
    this.main = main;
    this.visible = true;
    this.parentObj = parentObj || main.targetObj;
    this.height = 20;
    this.menuIcon = options.menuIcon || '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#5f6368"><path d="M144-264v-72h672v72H144Zm0-180v-72h672v72H144Zm0-180v-72h672v72H144Z"/></svg>';
    this.title = options.title || "";
    this.closeIcon = options.closeIcon || '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#5f6368"><path d="m291-240-51-51 189-189-189-189 51-51 189 189 189-189 51 51-189 189 189 189-51 51-189-189-189 189Z"/></svg>';
    this.fullscrIcon = options.fullscrIcon || '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#5f6368"><path d="M168-192q-29.7 0-50.85-21.16Q96-234.32 96-264.04v-432.24Q96-726 117.15-747T168-768h624q29.7 0 50.85 21.16Q864-725.68 864-695.96v432.24Q864-234 842.85-213T792-192H168Zm0-72h624v-360H168v360Z"/></svg>';
    this.minIcon = options.minIcon || '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#5f6368"><path d="M288-144v-72h384v72H288Z"/></svg>';
    this.normalscrIcon = options.normalscrIcon || '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#5f6368"><path d="M312-312h480v-408H312v408Zm0 72q-29.7 0-50.85-21.15Q240-282.3 240-312v-480q0-29.7 21.15-50.85Q282.3-864 312-864h480q29.7 0 50.85 21.15Q864-821.7 864-792v480q0 29.7-21.15 50.85Q821.7-240 792-240H312ZM168-96q-29.7 0-50.85-21.15Q96-138.3 96-168v-552h72v552h552v72H168Zm144-696v480-480Z"/></svg>';

    if (options.color === undefined) {
      options.color = {};
    }
    this.color = {
      iconbgcolor: options.color.iconbgcolor || "WindowIconBackgroundColor",
      iconcolor: options.color.iconcolor || "WindowIconColor",
      iconhoverbgcolor: options.color.iconhoverbgcolor || "WindowIconHoverBackgroundColor",
      iconhovercolor: options.color.iconhovercolor || "WindowIconHoverColor",
      bgcolor: options.color.bgcolor || "WindowTitlebarBackgroundColor",
      color: options.color.color || "WindowTitlebarColor",
    };

    this.showMenuIcon = options.showMenuIcon || true;
    this.showTitle = options.showTitle || true;
    this.showCloseIcon = options.showCloseIcon || true;
    this.showFullscrIcon = options.showFullscrIcon || true;
    this.showMinIcon = options.showMinIcon || true;
    if (options.onclick === undefined) {
      options.onclick = {};
    }
    this.onclick = {
      menu: options.onclick.menu || function(){},
      min: options.onclick.min || function(){},
      normalscr: options.onclick.normalscr || function(){},
      fullscr: options.onclick.fullscr || function(){},
      close: options.onclick.close || function(){},
      titlebar: options.onclick.titlebar || function(){},
    };
    if (options.ondblclick === undefined) {
      options.ondblclick = {};
    }
    this.ondblclick = {
      menu: options.ondblclick.menu || function(){},
      min: options.ondblclick.min || function(){},
      normalscr: options.ondblclick.normalscr || function(){},
      fullscr: options.ondblclick.fullscr || function(){},
      close: options.ondblclick.close || function(){},
      titlebar: options.ondblclick.titlebar || function(){},
    };
    if (options.onmouseover === undefined) {
      options.onmouseover = {};
    }
    this.onmouseover = {
      menu: options.onmouseover.menu || function(){},
      min: options.onmouseover.min || function(){},
      normalscr: options.onmouseover.normalscr || function(){},
      fullscr: options.onmouseover.fullscr || function(){},
      close: options.onmouseover.close || function(){},
      titlebar: options.onmouseover.titlebar || function(){},
    };
    if (options.onmouseout === undefined) {
      options.onmouseout = {};
    }
    this.onmouseout = {
      menu: options.onmouseout.menu || function(){},
      min: options.onmouseout.min || function(){},
      normalscr: options.onmouseout.normalscr || function(){},
      fullscr: options.onmouseout.fullscr || function(){},
      close: options.onmouseout.close || function(){},
      titlebar: options.onmouseout.titlebar || function(){},
    };
    if (options.onpointermove === undefined) {
      options.onpointermove = {};
    }
    this.onpointermove = {
      menu: options.onpointermove.menu || function(){},
      min: options.onpointermove.min || function(){},
      normalscr: options.onpointermove.normalscr || function(){},
      fullscr: options.onpointermove.fullscr || function(){},
      close: options.onpointermove.close || function(){},
      titlebar: options.onpointermove.titlebar || function(){},
    };
    if (options.ondrag === undefined) {
      options.ondrag = {};
    }

    this.titlebar = this.main.window.document.createElement("div");
    this.titlebar.style.width = "100%";
    this.titlebar.style.height = this.height + "px";
    this.main.colorClass.setColorClass(this.titlebar,this.color.bgcolor,this.id);
    this.main.colorClass.setColorClass(this.titlebar,this.color.color,this.id);
    this.titlebar.style.textAlign = "left";
    this.titlebar.style.padding = "0px";
    this.titlebar.style.margin = "0px";
    this.titlebar.style.border = "0px";
    this.titlebar.style.overflow = "hidden";
    this.titlebar.style.boxSizing = "border-box";
    this.titlebar.style.display = "flex";
    this.titlebar.draggable = false;
    this.leftitem = this.main.window.document.createElement("div");
    this.leftitem.style.width = "auto";
    this.leftitem.style.height = this.height + "px";
    this.leftitem.style.padding = "0px";
    this.leftitem.style.border = "0px";
    this.leftitem.style.overflow = "hidden";
    this.leftitem.style.boxSizing = "border-box";
    this.leftitem.style.textAlign = "left";
    this.leftitem.style.whiteSpace = "nowrap";
    this.leftitem.draggable = false;
    this.titlebar.appendChild(this.leftitem);
    this.menuitem = this.main.window.document.createElement("div");
    this.menuitem.style.width = "auto";
    this.menuitem.style.height = this.height + "px";
    this.menuitem.style.padding = "0px";
    this.menuitem.style.border = "0px";
    this.menuitem.style.overflow = "hidden";
    this.menuitem.style.boxSizing = "border-box";
    this.menuitem.style.textAlign = "left";
    this.menuitem.draggable = false;
    this.main.colorClass.setColorClass(this.menuitem,this.color.iconbgcolor,this.id);
    this.main.colorClass.setColorClass(this.menuitem,this.color.iconcolor,this.id);
    this.main.colorClass.setClass(this.menuitem,this.color.iconhoverbgcolor,this.id);
    this.main.colorClass.setClass(this.menuitem,this.color.iconhovercolor,this.id);
    this.menuitem.innerHTML = this.menuIcon;
    this.leftitem.appendChild(this.menuitem);
    this.titleitem = this.main.window.document.createElement("div");
    this.titleitem.style.width = "auto";
    this.titleitem.style.height = this.height + "px";
    this.titleitem.style.padding = "0px";
    this.titleitem.style.border = "0px";
    this.titleitem.style.textAlign = "left";
    this.titleitem.style.marginLeft = "2px";
    this.titleitem.style.marginRight = "2px";
    this.titleitem.style.overflow = "hidden";
    this.titleitem.style.boxSizing = "border-box";
    this.titleitem.style.fontSize = "14px";
    this.titleitem.style.whiteSpace = "nowrap";
    this.titleitem.draggable = false;
    this.main.colorClass.setColorClass(this.menuitem,this.color.bgcolor,this.id);
    this.main.colorClass.setColorClass(this.menuitem,this.color.color,this.id);
    this.titleitem.innerHTML = this.title;
    this.titlebar.appendChild(this.titleitem);
    this.rightitem = this.main.window.document.createElement("div");
    this.rightitem.style.width = "auto";
    this.rightitem.style.height = this.height + "px";
    this.rightitem.style.padding = "0px";
    this.rightitem.style.border = "0px";
    this.rightitem.style.overflow = "hidden";
    this.rightitem.style.boxSizing = "border-box";
    this.rightitem.style.textAlign = "right";
    this.rightitem.style.marginLeft = "auto";
    this.rightitem.style.whiteSpace = "nowrap";
    this.rightitem.style.display = "flex";
    this.rightitem.draggable = false;
    this.titlebar.appendChild(this.rightitem);
    this.minitem = this.main.window.document.createElement("div");
    this.minitem.style.width = "auto";
    this.minitem.style.height = this.height + "px";
    this.minitem.style.overflow = "hidden";
    this.minitem.draggable = false;
    this.main.colorClass.setColorClass(this.minitem,this.color.iconbgcolor,this.id);
    this.main.colorClass.setColorClass(this.minitem,this.color.iconcolor,this.id);
    this.main.colorClass.setClass(this.minitem,this.color.iconhoverbgcolor,this.id);
    this.main.colorClass.setClass(this.minitem,this.color.iconhovercolor,this.id);
    this.minitem.innerHTML = this.minIcon;
    this.rightitem.appendChild(this.minitem);
    this.normalscritem = this.main.window.document.createElement("div");
    this.normalscritem.style.width = "auto";
    this.normalscritem.style.height = this.height + "px";
    this.normalscritem.style.overflow = "hidden";
    this.normalscritem.innerHTML = this.normalscrIcon;
    this.normalscritem.draggable = false;
    this.main.colorClass.setColorClass(this.normalscritem,this.color.iconbgcolor,this.id);
    this.main.colorClass.setColorClass(this.normalscritem,this.color.iconcolor,this.id);
    this.main.colorClass.setClass(this.normalscritem,this.color.iconhoverbgcolor,this.id);
    this.main.colorClass.setClass(this.normalscritem,this.color.iconhovercolor,this.id);
    this.rightitem.appendChild(this.normalscritem);
    this.fullscritem = this.main.window.document.createElement("div");
    this.fullscritem.style.width = "auto";
    this.fullscritem.style.height = this.height + "px";
    this.fullscritem.style.overflow = "hidden";
    this.fullscritem.innerHTML = this.fullscrIcon;
    this.fullscritem.draggable = false;
    this.main.colorClass.setColorClass(this.fullscritem,this.color.iconbgcolor,this.id);
    this.main.colorClass.setColorClass(this.fullscritem,this.color.iconcolor,this.id);
    this.main.colorClass.setClass(this.fullscritem,this.color.iconhoverbgcolor,this.id);
    this.main.colorClass.setClass(this.fullscritem,this.color.iconhovercolor,this.id);
    this.rightitem.appendChild(this.fullscritem);
    this.closeitem = this.main.window.document.createElement("div");
    this.closeitem.style.width = "auto";
    this.closeitem.style.height = this.height + "px";
    this.closeitem.style.overflow = "hidden";
    this.closeitem.draggable = false;
    this.main.colorClass.setColorClass(this.closeitem,this.color.iconbgcolor,this.id);
    this.main.colorClass.setColorClass(this.closeitem,this.color.iconcolor,this.id);
    this.main.colorClass.setClass(this.closeitem,this.color.iconhoverbgcolor,this.id);
    this.main.colorClass.setClass(this.closeitem,this.color.iconhovercolor,this.id);
    this.closeitem.innerHTML = this.closeIcon;
    this.rightitem.appendChild(this.closeitem);
    if (this.parentObj) {
      this.parentObj.appendChild(this.titlebar);
    }
    this.dblclickTimer = null;
    const current = this;
    for(let itemName of ["min","normalscr","fullscr","close"]) {
      let item = this[itemName + "item"];
      item.addEventListener("mouseover", () => {
        this.main.colorClass.setColorClass(item,current.color.iconhoverbgcolor,current.id);
        this.main.colorClass.setColorClass(item,current.color.iconhovercolor,current.id);
        this.onmouseover[itemName](itemName);
      });
      item.addEventListener("mouseout", () => {
        this.main.colorClass.setColorClass(item,current.color.iconbgcolor,current.id);
        this.main.colorClass.setColorClass(item,current.color.iconcolor,current.id);
        this.onmouseout[itemName](itemName);
      });
      item.addEventListener("click", () => {
        this.onclick[itemName](itemName);
      });
      item.addEventListener("pointermove", (e) => {
        this.onpointermove[itemName](itemName,e);
      });
    }
    for(let itemName of ["titlebar","menu"]) {
      let item = this[itemName + "item"];
      if (itemName === "titlebar") {
        item = this.titlebar;
      }
      item.addEventListener("mouseover", () => {
        this.onmouseover[itemName](itemName);
      });
      item.addEventListener("mouseout", () => {
        this.onmouseout[itemName](itemName);
      });
      item.addEventListener("click", (e) => {
        e.preventDefault();
        if (this.dblclickTimer !== null){
          clearTimeout(this.dblclickTimer);
          this.dblclickTimer = null;
          this.ondblclick[itemName](itemName);
          return;          
        }
        this.dblclickTimer = setTimeout(() => {
          this.dblclickTimer = null;
          this.onclick[itemName](itemName);
        },300);
      });
      item.addEventListener("pointermove", (e) => {
        this.onpointermove[itemName](itemName,e);
      });
    }
    this.update();
  }
  update() {
    if (!this.visible) {
      this.titlebar.style.display = "none";
    } else {
      this.titlebar.style.display = "flex";
    }
    if (!this.showMenuIcon) {
      this.menuitem.style.display = "none";
    }else{
      this.menuitem.style.display = "block";
    }
    this.titleitem.innerHTML = this.title;
    if (!this.showTitle) {
      this.titleitem.style.display = "none";
    }else{
      this.titleitem.style.display = "block";
    }
    if (!this.showMinIcon) {
      this.minitem.style.display = "none";
    } else {
      this.minitem.style.display = "block";
    }
    if (!this.showFullscrIcon) {
      this.normalscritem.style.display = "block";
      this.fullscritem.style.display = "none";
    }else{
      this.normalscritem.style.display = "none";
      this.fullscritem.style.display = "block";
    }
    if (!this.showCloseIcon) {
      this.closeitem.style.display = "none";
    }else{
      this.closeitem.style.display = "block";
    }
  }
}
