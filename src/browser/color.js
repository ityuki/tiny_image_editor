const Color = self.Color = class Color {
  static colorToArray(color, defaultColor){
    if (defaultColor === null || defaultColor === undefined){
      defaultColor = [255,255,255,0];
    }
    if (color === null || color === undefined){
      return defaultColor;
    }else if (color instanceof Array){
      if (color.length == 3){
        color.push(1);
      }
      return color.map((v) => parseInt(v));
    }else if (typeof color === 'string'){
      if (color.startsWith('rgba(')){
        color = color.replace('rgba(','').replace(')','');
      }else if (color.startsWith('rgb(')){
        color = color.replace('rgb(','').replace(')',',1');
      }else{
        return defaultColor;
      }
      const c = color.split(',');
      if (c.length == 3){
        c.push(1);
      }
      return c.map((v) => parseInt(v));
    }else{
      return defaultColor;
    }
  }
}
