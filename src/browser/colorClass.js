const ColorClass = self.ColorClass = class ColorClass {
  constructor(theme = "default"){
    this.themeName = theme;
    if (theme === undefined || theme === null){
      this.theme = null;
    }else if (typeof theme === "string"){
      for (let themeName in colorTheme){
        if (!themeName.charAt(0).match(/[A-Z]/)) continue;
        if (themeName.toLowerCase() == theme.toLowerCase()){
          this.theme = colorTheme[themeName];
          break;
        }
      }
      if (!this.theme) this.theme = colorTheme.Default;  
    }else{
      this.theme = theme;
    }
    this.classBaseName = "";
    this.classInstanceName = "";
  }
  setClassBaseName(name){
    this.classBaseName = name;
  }
  setClassInstanceName(name){
    this.classInstanceName = name;
  }
  getColorname2Name(colorName){
    if (colorName === undefined || colorName === null){
      return '';
    }
    return colorName
      .replace(/Color$/g, '')
      .replace(/[A-Z]/g, function(s){
        return "_" + s.toLowerCase();
      })
      .replace(/^_/,'');
  }
  setColor(object,name,color){
    if (color === undefined || color === null){
      color = '';
    }
    if (object.style){
      if (name.toLowerCase().endsWith("backgroundcolor")){
        if (object.style.backgroundColor !== undefined){
          object.style.backgroundColor = color;
        }
      }else if (name.match(/Border((?:[A-Z][a-z]+)*)Color$/)){
        let m = name.match(/Border((?:[A-Z][a-z]+)*)Color$/);
        let s = m[0];
        if (object.style["border" + s + "Color"] !== undefined){
          object.style["border" + s + "Color"] = color;
        }
      }else if (name.toLowerCase().endsWith("accentcolor")){
        if (object.style.accentColor !== undefined){
          object.style.accentColor = color;
        }
      }else if (name.toLowerCase().endsWith("caretcolor")){
        if (object.style.caretColor !== undefined){
          object.style.caretColor = color;
        }
      }else if (name.toLowerCase().endsWith("columnrulecolor")){
        if (object.style.columnRuleColor !== undefined){
          object.style.columnRuleColor = color;
        }
      }else if (name.toLowerCase().endsWith("lightingcolor")){
        if (object.style.lightingColor !== undefined){
          object.style.lightingColor = color;
        }
      }else if (name.toLowerCase().endsWith("outlinecolor")){
        if (object.style.outlineColor !== undefined){
          object.style.outlineColor = color;
        }
      }else if (name.toLowerCase().endsWith("scrollbarcolor")){
        if (object.style.scrollbarColor !== undefined){
          object.style.scrollbarColor = color;
        }
      }else if (name.toLowerCase().endsWith("stopcolor")){
        if (object.style.stopColor !== undefined){
          object.style.stopColor = color;
        }
      }else if (name.match(/Text((?:[A-Z][a-z]+)*)Color$/)){
        let m = name.match(/Text((?:[A-Z][a-z]+)*)Color$/);
        let s = m[0];
        if (object.style["text" + s + "Color"] !== undefined){
          object.style["text" + s + "Color"] = color;
        }
      }else{
        if (object.style.color !== undefined){
          object.style.color = color;
        }
      }
    }
  }
  removeClass(object,colorName,id){
    const name = this.getColorname2Name(colorName);
    let className = this.classBaseName + "-" + name;
    let instanceName = className + "-" + this.classInstanceName;
    if (object.classList !== undefined){
      object.classList.remove(className);
      object.classList.remove(instanceName);
      if (id !== undefined && id !== null){
        let instanceNameWithId = instanceName + "-" + id;
        object.classList.remove(instanceNameWithId);
      }
    }
  }
  removeColorClass(object,colorName,id){
    this.removeClass(object,colorName,id);
    this.setColor(object,colorName,'');
  }
  setClass(object,colorName,id){
    const name = this.getColorname2Name(colorName);
    let className = this.classBaseName + "-" + name;
    let instanceName = className + "-" + this.classInstanceName;
    if (object.classList !== undefined){
      if (!object.classList.contains(className)){
        object.classList.add(className);
      }
      if (!object.classList.contains(instanceName)){
        object.classList.add(instanceName);
      }
      if (id !== undefined && id !== null){
        let instanceNameWithId = instanceName + "-" + id;
        if (!object.classList.contains(instanceNameWithId)){
          object.classList.add(instanceNameWithId);
        }
      }
    }
  }
  setColorClass(object,colorName,id){
    let color = this.theme[colorName];
    this.setClass(object,colorName,id);
    this.setColor(object,colorName,color);
  }
  getColor(colorName){
    return this.theme[colorName];
  }
}
