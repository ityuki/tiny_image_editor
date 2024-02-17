class Tie{
  constructor(baseObject, tie_name) {
    this.baseObject = baseObject;
    if (tie_name === undefined) {
      tie_name = "default";
    }
    this.name = tie_name;
    this.default_lang = 'ja';
    this.lang = (navigator.browserLanguage || navigator.language || navigator.userLanguage).substr(0,2);
    this.zIndexValues = [];
    class MTRand{
      constructor(seed){
        this.N = 624;
        this.M = 397;
        this.MATRIX_A = 0x9908b0df;
        this.UPPER_MASK = 0x80000000;
        this.LOWER_MASK = 0x7fffffff;
        this.mt = new Array(this.N);
        this.mti = this.N + 1;
        if (seed !== undefined){
          if (typeof seed === 'number'){
            this.init(seed);
          }else{
            this.init_by_array(seed);
          }
        }
      }
      xor(a,b){
        return ((((a >>> 16) & 0x0000ffff) ^ ((b >>> 16) & 0x0000ffff)) << 16) + ((a & 0x0000ffff) ^ (b & 0x0000ffff)) >>> 0;
      }
      mul(a,b){
        if (a < b){
          const t = a;
          a = b;
          b = t;
        }
        return ((((a >>> 16) & 0x0000ffff) * b) << 16) + ((a & 0x0000ffff) * b) >>> 0;
      }
      init(seed){
        this.seed = seed;
        this.mt[0] = seed >>> 0; // this.mt[0] = seed & 0xffffffff;
        for (this.mti=1; this.mti<this.N; this.mti++) {
          this.mt[this.mti] = (this.mul(1812433253 , (this.xor(this.mt[this.mti-1] , (this.mt[this.mti-1] >>> 30)))) + this.mti);
          this.mt[this.mti] = this.mt[this.mti] >>> 0; //this.mt[this.mti] &= 0xffffffff;
        }
      }
      init_by_array(seeds){
        this.seed = seeds;
        let i, j, k;
        this.init(19650218);
        i=1; j=0;
        k = (this.N>seeds.length ? this.N : seeds.length);
        for (; k; k--) {
          this.mt[i] = (this.xor(this.mt[i] , (this.mul(this.xor(this.mt[i-1] , (this.mt[i-1] >>> 30)) , 1664525)))) + seeds[j] + j;
          this.mt[i] = this.mt[i] >>> 0; // this.mt[i] &= 0xffffffff;
          i++; j++;
          if (i>=this.N) { this.mt[0] = this.mt[this.N-1]; i=1; }
          if (j>=seeds.length) j=0;
        }
        for (k=this.N-1; k; k--) {
          this.mt[i] = (this.xor(this.mt[i] , (this.mul(this.xor(this.mt[i-1] , (this.mt[i-1] >>> 30)) , 1566083941)))) - i;
          this.mt[i] = this.mt[i] >>> 0; // this.mt[i] &= 0xffffffff;
          i++;
          if (i>=this.N) { this.mt[0] = this.mt[this.N-1]; i=1; }
        }
        this.mt[0] = 0x80000000;        
      }
      rand(){
        let y;
        const mag01 = [0x0, this.MATRIX_A];
        if (this.mti >= this.N) {
          let kk;
          if (this.mti == this.N+1) this.init(5489);
          for (kk=0;kk<this.N-this.M;kk++) {
            y = (this.mt[kk]&this.UPPER_MASK)|(this.mt[kk+1]&this.LOWER_MASK);
            this.mt[kk] = this.xor(this.xor(this.mt[kk+this.M] , (y >>> 1)) , mag01[y & 0x1]);
          }
          for (;kk<this.N-1;kk++) {
            y = (this.mt[kk]&this.UPPER_MASK)|(this.mt[kk+1]&this.LOWER_MASK);
            this.mt[kk] = this.xor(this.xor(this.mt[kk+(this.M-this.N)] , (y >>> 1)) , mag01[y & 0x1]);
          }
          y = (this.mt[this.N-1]&this.UPPER_MASK)|(this.mt[0]&this.LOWER_MASK);
          this.mt[this.N-1] = this.xor(this.xor(this.mt[this.M-1] , (y >>> 1)) , mag01[y & 0x1]);
          this.mti = 0;
        }
        y = this.mt[this.mti++];
        y = this.xor(y,(y >>> 11));
        y = this.xor(y,(y << 7) & 0x9d2c5680);
        y = this.xor(y,(y << 15) & 0xefc60000);
        y = this.xor(y,(y >>> 18));
        return y >>> 0;
      }
      randN(count){
        const r = new Array(count);
        for(let i=0;i<count;i++){
          r[i] = this.rand();
        }
        return r;
      }
    }
    this.MTRand = MTRand;
    // MTRand Sample
    /*
    console.log((new this.MTRand([0x123, 0x234, 0x345, 0x456])).randN(5));
    console.log("1067595299  955945823  477289528 4107218783 4228976476")
    */
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
    localStorage.setItem("tie_" + this.name + "_" + key, JSON.stringify(value));
  }
  loadStorage(key){
    const v = localStorage.getItem("tie_" + this.name + "_" + key);
    if (v == null) return v;
    try{
      return JSON.parse(v);
    }catch(e){
      console.log('loadStorage:error key=[' + key + '] value=[' + v + ']');
      return null;
    }
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
    var moving = false;
    var zIndex = null;
    const obj = object;
    const self = this;
    const objId = obj.id;
    obj.style.cursor = 'move';
    obj.style.position = 'absolute';
    obj.style.whiteSpace = 'nowrap';
    obj.addEventListener('mousedown',mdown,false);
    obj.addEventListener('touchstart',mdown,false);
    obj.addEventListener('click',mclick,{capture: true});
    function mclick(e){
      let event = e.type === 'click' ? e : e.changedTouches[0];
      if (moving){
        event.stopPropagation();
      }
      moving = false;
    }
    function mdown(e){
      this.classList.add(... (self.getClassNames("event_drag")));
      let event = e.type === 'mousedown' ? e : e.changedTouches[0];
      clickX = event.pageX - this.offsetLeft;
      clickY = event.pageY - this.offsetTop;
      zIndex = obj.style.zIndex;
      obj.style.zIndex = self.getZIndexMax() + 1;
      obj.addEventListener("mouseup", mup, false);
      obj.addEventListener("touchend", mup, false);
      document.body.addEventListener("mousemove", mmove, false);
      document.body.addEventListener("touchmove", mmove, false);
      document.body.addEventListener("mouseleave", mup, false);
      document.body.addEventListener("touchleave", mup, false);
    }
    function mmove(e) {
      let event = e.type === 'mousemove' ? e : e.changedTouches[0];
      event.preventDefault();
      moving = true;
      self.setPosition(obj,'left',event.pageX - clickX);
      self.setPosition(obj,'top',event.pageY - clickY);
    }
    function mup(e) {
      let event = (e.type === 'mouseleave' || 'mouseup') ? e : e.changedTouches[0];
      event.preventDefault();
      obj.style.zIndex = zIndex;
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
  setPosition(object,type,value){
    const objId = object.id;
    if (objId){
      this.saveStorage('conf.position.obj.' + type + "." + objId,value);
    }
    object.style[type] = value + "px";
  }
  getSavedPosition(object,type,defaultValue){
    const objId = object.id;
    let defVal = defaultValue;
    if (defVal === undefined) defVal = 0;
    if (objId){
      const v = this.loadStorage('conf.position.obj.' + type + "." + objId);
      if (v === null) return defVal;
      return v;
    }
    return defVal;
  }
  saveZIndex(){
    const d = {};
    for (let zidx of this.zIndexValues){
      d[zidx.object.id] = zidx.zIndex;
    }
    this.saveStorage('conf.zIndex',d);
  }
  loadZIndex(){
    const d = this.loadStorage('conf.zIndex');
    if (d === null) return;
    const skeys = Object.keys(d).toSorted((a,b)=> d[a] - d[b] )
    const ckeys = {};
    for(let k of this.zIndexValues){
      ckeys[k.object.id] = k;
    }
    const zindex_load_min = 2000;
    const zindex_load_step = 10;
    let current = 0;
    const newZIndexValues = [];
    const added = {}
    for (let key of skeys){
      if (ckeys[key] !== undefined){
        newZIndexValues.push({
          object: ckeys[key].object,
          zIndex: zindex_load_min + (current * zindex_load_step),
        })
        added[key] = ckeys[key];
        current += 1;
      }
    }
    let target = []
    for (let i=0;i<this.zIndexValues.length;i++){
      if (added[this.zIndexValues[i].object.id] === undefined){
        target.push(added[this.zIndexValues[i].object.id]);
      }
    }
    target = target.toSorted((a,b) => a.zIndex - b.zIndex);
    for (let t of target){
      newZIndexValues.push({
        object: t.object,
        zIndex: zindex_load_min + (current * zindex_load_step),
      })
      current += 1;
    }
    for (let zidx of newZIndexValues){
      zidx.object.style.zIndex = zidx.zIndex;
    }
    this.zIndexValues = newZIndexValues;
  }
  searchZIndexObject(object){
    return this.zIndexValues.findIndex((e) => Object.is(object,e.object));
  }
  getZIndexMax(){
    const zindex_get_min = 2000;
    let max = null;
    for (let zidx of this.zIndexValues){
      if (max === null) max = zidx.zIndex;
      if (zidx.zIndex > max){
        max = zidx.zIndex;
      }
    }
    if (max === null) return zindex_get_min -1;
    return max;
  }
  sortZIndex(){
    const zindex_sort_min = 2000;
    const zindex_sort_step = 10;
    const newZIndexValues = this.zIndexValues.toSorted((a,b) => a.zIndex - b.zIndex);
    for (let i=0;i<newZIndexValues.length; i++){
      newZIndexValues[i].zIndex = zindex_sort_min + (i * zindex_sort_step);
      newZIndexValues[i].object.style.zIndex = newZIndexValues[i].zIndex;
    }
    this.zIndexValues = newZIndexValues;
  }
  addZIndexObject(object){
    const idx = this.searchZIndexObject(object);
    if (idx === -1){
      const zIndex = this.getZIndexMax() + 1;
      this.zIndexValues.push({ object, zIndex});
      object.style.zIndex = zIndex;
    }
  }
  removeZIndexObject(object){
    const idx = this.searchZIndexObject(object);
    if (idx !== -1){
      this.zIndexValues = this.zIndexValues.toSpliced(idx,1);
      object.style.zIndex = 'auto';
    }
  }
  setZIndexObjectToTop(object){
    const idx = this.searchZIndexObject(object);
    if (idx !== -1){
      const max = this.getZIndexMax();
      if (this.zIndexValues[idx].zIndex !== max){
        this.zIndexValues[idx].zIndex = this.getZIndexMax() + 1;
        object.style.zIndex = this.zIndexValues[idx].zIndex;  
      }
    }
  }
  setZIndexObjectToBottom(object){
    const zindex_min = 1000;
    const idx = this.searchZIndexObject(object);
    if (idx !== -1){
      let min = null;
      for (let zidx of this.zIndexValues) {
        if (min === null) min = zidx.zIndex;
        if (zidx.zIndex < min){
          min = zidx.zIndex;
        }
      }
      if (this.zIndexValues[idx].zIndex !== min){
        this.zIndexValues[idx].zIndex = min - 1;
        if (this.zIndexValues[idx].zIndex < zindex_min){
          this.sortZIndex();
        }
        object.style.zIndex = this.zIndexValues[idx].zIndex;
      }
    }
  }
  setZIndexObjectToUponTarget(object,target){
    if (Object.is(object,target)) return;
    let idx = this.searchZIndexObject(object);
    let tidx = this.searchZIndexObject(target);
    if (idx !== -1 && tidx !== -1){
      if (this.zIndexValues[idx].zIndex < this.zIndexValues[tidx].zIndex){
        let objVal = this.zIndexValues[tidx].zIndex + 1;
        let chk = true;
        for (let zidx of this.zIndexValues) {
          if (zidx.zIndex === objVal){
            chk = false;
            break;
          }
        }
        if (!chk){
          this.sortZIndex();
          idx = this.searchZIndexObject(object);
          tidx = this.searchZIndexObject(target);
          objVal = this.zIndexValues[tidx].zIndex + 1; // OK.
        }
        this.zIndexValues[idx].zIndex = objVal
        object.style.zIndex = this.zIndexValues[idx].zIndex;
      }
    }
  }
  setZIndexObjectToBelowTarget(object,target){
    this.setZIndexObjectToBelowTarget(target,object); // reversed
  }
  init(){
    // create tie objects
    // cleanup
    while(this.baseObject.firstChild ){
      this.baseObject.removeChild( this.baseObject.firstChild );
    }
    // add menu object
    for (let menuName of Object.keys(this.menuList)) {
      const menuObj = this.createElement('div',menuName);
      const menuContens = this.menuList[menuName].contants;
      if (menuContens !== undefined) {
        let menuItem1st = true;
        for (let c of menuContens) {
          if (!menuItem1st) this.addHTMLToNode(menuObj,'&nbsp;');
          const itemObj = this.createElement('a',menuName + '_item_' + c.name, c.icon);
          if (c.events !== undefined) {
            for (let event of Object.keys(c.events)) {
              if (event === 'click') itemObj.href = '#';
              if (this.menuList[menuName].functions[c.name] !== undefined){
                itemObj.addEventListener(event, this.menuList[menuName].functions[c.name]);
              }
            }  
          }
          const t = this.getMsg('menu',menuName,c.name);
          if (t) itemObj.title = t;
          menuItem1st = false;
          menuObj.appendChild(itemObj);
        }  
      }
      if (this.menuList[menuName].events !== undefined) {
        for (let event of Object.keys(this.menuList[menuName].events)) {
          menuObj.addEventListener(event, this.menuList[menuName].events[event]);
        }
      }
      this.baseObject.appendChild(menuObj);
      if (this.menuList[menuName].default !== undefined) {
        this.setPosition(menuObj,'left',this.getSavedPosition(menuObj,'left',this.menuList[menuName].default.left));
        this.setPosition(menuObj,'top',this.getSavedPosition(menuObj,'top',this.menuList[menuName].default.top));
        if (this.menuList[menuName].default.isMovable === true){
          this.setupMoveableObject(menuObj);
        }
        if (this.menuList[menuName].default.visible !== undefined){
          this.setVisible(menuObj,this.getSavedVisible(menuObj,this.menuList[menuName].default.visible)); 
        }
      }
      this.addZIndexObject(menuObj);
    }
    this.loadZIndex();
    // rightClickMenu SP
    const rClickMenuObj = document.getElementById(this.getObjIdName('rightClickMenu'));
    if (rClickMenuObj !== null) {
      this.setZIndexObjectToTop(rClickMenuObj);
      this.setVisible(rClickMenuObj,false);
    }
    this.saveZIndex();
  }
  menuList = {
    rightClickMenu: {
      default: {
        visible: false,
        isMovable: true,
        left: 0,
        top: 0,
      },
      events: {
      },
      functions: {
      },
      contants: [
        {
          name: 'bar',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 12 24" width="12" fill="#000000"><path d="M2 2h8v20H2z"/></svg>',
        },
      ],
    },
    mainMenu: {
      default: {
        visible: true,
        isMovable: true,
        left: 0,
        top: 0,
      },
      events: {
      },
      functions: {
        undo: (e)=>{
          console.log(this);
          console.log(e);
        },
        redo: (e)=>{
          console.log(this);
          console.log(e);
        }
      },
      contants: [
        {
          name: 'bar',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 12 24" width="12" fill="#000000"><path d="M2 2h8v20H2z"/></svg>',
        },
        {
          name:'undo',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>',
          events: { click: 'undo', },
        },
        {
          name:'redo',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>',
          events: { click: 'redo', },
        },  
      ],
    },
  }
  msg = {
    menu:{
      rightClickMenu:{
        bar: {
          ja: '右クリックメニューで操作します',
          en: 'right click menu bar',
        },
      },
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
    },
  }

}