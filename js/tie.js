class Tie{
  constructor(baseObject, tie_name) {
    this.baseObject = baseObject;
    if (tie_name === undefined) {
      tie_name = "default";
    }
    this.name = tie_name;
    this.default_lang = 'ja';
    this.lang = (navigator.browserLanguage || navigator.language || navigator.userLanguage).substr(0,2);
    this.init();
  }
  getMsg(){
    let msg = this.msg;
    for(let arg of arguments){
      msg = msg[arg];
      if (msg === undefined){
        return '';
      }
    }
    if (msg[this.lang] === undefined){
      if (msg[this.default_lang] === undefined){
        return '';
      }
      return msg[this.default_lang];
    }
    return msg[this.lang];
  }
  saveStorage(key,value){
    localStorage.setItem("tie_" + this.name + "_" + key, value);
  }
  loadStorage(key){
    return localStorage.getItem("tie_" + this.name + "_" + key);
  }
  deleteStorage(key){
    localStorage.removeItem("tie_" + this.name + "_" + key);
  }
  clearStorage(){
    for (let i = 0; i < localStorage.length; i++) {
      const name = localStorage.key(i);
      if (name !== ''){
        if (name.startsWith("tie_" + this.name + "_")){
          localStorage.removeItem(name);
        }
      } 
    }
  }
  getObjIdName(name){
    return "tie_obj_" + this.name + "_" + name;
  }
  getClassNames(name){
    return ["tie_cls_" + name,"tie_cls_" + this.name + "_" + name];
  }
  createElement(tag,name,innerHTML,opt) {
    const obj = document.createElement(tag);
    if (typeof name === 'string') {
      obj.id = this.getObjIdName(name);
      obj.classList.add(... (this.getClassNames(name)));        
    }
    if (typeof innerHTML === 'string') {
      obj.innerHTML = innerHTML;
    }
    if (opt !== undefined){
      for (let key of Object.keys(opt)){
        obj[key] = opt[key];
      }
    }
    return obj;
  }
  createTextNode(text){
    return document.createTextNode(text);
  }
  addHTMLToNode(obejct,text){
    obejct.insertAdjacentHTML("beforeend",text);
  }
  setupMoveableObject(object){
    var clickX = 0;
    var clickY = 0;
    const obj = object;
    const self = this;
    const objId = obj.id;
    if (objId){
      const left = self.loadStorage('conf.pos.mvobj.left.' + objId);
      if (left != null){
        obj.style.left = left + "px";
      }
      const top = self.loadStorage('conf.pos.mvobj.top.' + objId);
      if (top != null){
        obj.style.top = top + "px";
      }
    }
    obj.style.cursor = 'move';
    obj.style.position = 'absolute';
    obj.style.zIndex = '1000';
    obj.addEventListener('mousedown',mdown,false);
    obj.addEventListener('touchstart',mdown,false);
    function mdown(e){
      this.classList.add(... (self.getClassNames("event_drag")));
      let event = e.type === 'mousedown' ? e : e.changedTouches[0];
      clickX = event.pageX - this.offsetLeft;
      clickY = event.pageY - this.offsetTop;
      obj.addEventListener("mouseup", mup, false);
      obj.addEventListener("touchend", mup, false);
      document.body.addEventListener("mousemove", mmove, false);
      document.body.addEventListener("touchmove", mmove, false);
      document.body.addEventListener("mouseleave", mup, false);
      document.body.addEventListener("touchleave", mup, false);
    }
    function mmove(e) {
      let event = e.type === 'mousemove' ? e : e.changedTouches[0];
      e.preventDefault();
      obj.style.left = (event.pageX - clickX) + "px";
      obj.style.top = (event.pageY - clickY) + "px";
      self.saveStorage('conf.pos.mvobj.left.' + objId,(event.pageX - clickX));
      self.saveStorage('conf.pos.mvobj.top.' + objId,(event.pageY - clickY));
    }
    function mup(e) {
      obj.removeEventListener("mouseup", mup, false);
      obj.removeEventListener("touchend", mup, false);
      document.body.removeEventListener("mousemove", mmove, false);
      document.body.removeEventListener("touchmove", mmove, false);
      document.body.removeEventListener("mouseleave", mup, false);
      document.body.removeEventListener("touchleave", mup, false);
      this.classList.remove(... (self.getClassNames("event_drag")));
    }
  }
  setVisible(object,visible){
    object.style.display = visible !== false ? 'block' : 'none';
    const objId = object.id;
    if (objId){
      this.saveStorage('conf.visible.obj.' + objId,visible);
    }
  }
  getSavedVisible(object,defaultValue){
    const objId = object.id;
    if (objId){
      const v = this.loadStorage('conf.visible.obj.' + objId);
      if (v === null) return defaultValue;
      return v;
    }
    return defaultValue;
  }
  init(){
    // create tie objects
    // cleanup
    while(this.baseObject.firstChild ){
      this.baseObject.removeChild( this.baseObject.firstChild );
    }
    // add menu object
    const mainMenuList = [
      {
        name: 'mainMenuBar',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 12 24" width="12" fill="#000000"><path d="M2 2h8v20H2z"/></svg>',
        title: this.getMsg('mainMenu','bar'),
      },
      {
        name:'undo',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>',
        onclick: this.menu.undo,
        title: this.getMsg('mainMenu','undo'),
      },
      {
        name:'redo',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>',
        onclick: this.menu.redo,
        title: this.getMsg('mainMenu','redo'),
      },
    ];
    const mainMenuObj = this.createElement('div','mainMenu');
    let mainMenu1st = true;
    for (let m of mainMenuList) {
      if (!mainMenu1st){
        this.addHTMLToNode(mainMenuObj,'&nbsp;');
      }
      const obj = this.createElement('a','mainMenu_item_' + m.name,m.icon);
      if (m.onclick){
        obj.href = '#';
        obj.onclick = m.onclick;
      }
      obj.title = m.title;
      mainMenuObj.appendChild(obj);
      mainMenu1st = false;
    }
    this.baseObject.appendChild(mainMenuObj);
    this.setupMoveableObject(mainMenuObj);
    this.setVisible(mainMenuObj,this.getSavedVisible(mainMenuObj,true))
  }
  menu = {
    undo: ()=>{
      console.log(this);
    },
    redo: ()=>{
      console.log(this);
    }
  }
  msg = {
    mainMenu: {
      bar: {
        ja: 'メインメニューです。移動可能です。',
        en: 'menu bar',
      },
      undo: {
        ja: '操作を一段階戻します',
        en: 'undo',
      },
      redo: {
        ja: '戻した操作をもう一度実行します',
        en: 'redo',
      },
    },
  }

}