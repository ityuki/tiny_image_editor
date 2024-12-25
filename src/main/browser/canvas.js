const Canvas = self.Canvas = class Canvas {
  static OverlapType = {
    SourceOver:"source-over",
    SourceIn:"source-in",
    SourceOut:"source-out",
    SourceAtop:"source-atop",
    DestinationOver:"destination-over",
    DestinationIn:"destination-in",
    DestinationOut:"destination-out",
    DestinationAtop:"destination-atop",
    Lighter:"lighter",
    Copy:"copy",
    Xor:"xor",
    Multiply:"multiply",
    Screen:"screen",
    Overlay:"overlay",
    Darken:"darken",
    Lighten:"lighten",
    ColorDodge:"color-dodge",
    ColorBurn:"color-burn",
    HardLight:"hard-light",
    SoftLight:"soft-light",
    Difference:"difference",
    Exclusion:"exclusion",
    Hue:"hue",
    Saturation:"saturation",
    Color:"color",
    Luminosity:"luminosity",
  };
  static ResizeType = {
    Center:"center",
    TopLeft:"top-left",
    TopRight:"top-right",
    BottomLeft:"bottom-left",
    BottomRight:"bottom-right",
  };
  static ScalingType = {
    None:"none",
    Smoothing:"smoothing",
    Nearest:"nearest",
    Bilinear:"bilinear",
    Bicubic:"bicubic",
  };
  

  static currentCanvasId = 0;
  constructor(main, width, height) {
    this.main = main;
    Canvas.currentCanvasId += 1;
    this.id = Canvas.currentCanvasId;
    this.raw = this.main.window.document.createElement('canvas');
    this.raw.id = `tie_${this.main.tieName}_canvas_${this.id}`;
    this.raw.width = width;
    this.raw.height = height;
    this.drawOverlapType = Canvas.OverlapType.SourceOver;
    this.drawAlpha = 1;
    this.resizeType = Canvas.ResizeType.TopLeft;
    this.scalingType = Canvas.ScalingType.None;
  }
  getRawCanvas(canvas){
    if (canvas instanceof Canvas){
      canvas = canvas.raw;
    }else if (canvas instanceof HTMLCanvasElement){
      canvas = canvas;
    }else{
      return null;
    }
    return canvas;
  }
  rcopyRect(destCanvas,w,h,sx,sy,dx,dy){
    destCanvas = this.getRawCanvas(destCanvas);
    if (destCanvas === null){
      return false;
    }
    if (w === undefined){
      w = this.raw.width;
    }
    if (h === undefined){
      h = this.raw.height;
    }
    if (sx === undefined){
      sx = 0;
    }
    if (sy === undefined){
      sy = 0;
    }
    if (dx === undefined){
      dx = sx;
    }
    if (dy === undefined){
      dy = sy;
    }
    const srcContext = this.raw.getContext('2d');
    const destContext = destCanvas.getContext('2d');
    const srcimg = srcContext.getImageData(sx,sy,w,h);
    destContext.putImageData(srcimg,dx,dy,0,0,w,h);
  }
  rcopy(destCanvas){
    this.rcopyRect(destCanvas);
  }
  copyRect(srcCanvas,w,h,sx,sy,dx,dy){
    srcCanvas = this.getRawCanvas(srcCanvas);
    if (srcCanvas === null){
      return false;
    }
    if (w === undefined){
      w = srcCanvas.width;
    }
    if (h === undefined){
      h = srcCanvas.height;
    }
    if (sx === undefined){
      sx = 0;
    }
    if (sy === undefined){
      sy = 0;
    }
    if (dx === undefined){
      dx = sx;
    }
    if (dy === undefined){
      dy = sy;
    }
    const srcContext = srcCanvas.getContext('2d');
    const destContext = this.raw.getContext('2d');
    const srcimg = srcContext.getImageData(sx,sy,w,h);
    destContext.putImageData(srcimg,dx,dy);
  }
  copy(srcCanvas){
    this.copyRect(srcCanvas);
  }
  fillRect(x,y,w,h,color){
    if (x === undefined){
      x = 0;
    }
    if (y === undefined){
      y = 0;
    }
    if (w === undefined){
      w = this.raw.width;
    }
    if (h === undefined){
      h = this.raw.height;
    }
    const colorAry = Color.colorToArray(color);
    const context = this.raw.getContext('2d');
    const contextimg = context.getImageData(x,y,w,h);
    for(let i = 0; i < contextimg.data.length; i += 4){
      contextimg.data[i] = colorAry[0];
      contextimg.data[i + 1] = colorAry[1];
      contextimg.data[i + 2] = colorAry[2];
      contextimg.data[i + 3] = colorAry[3];
    }
    context.putImageData(contextimg,x,y);
  }
  fill(color){
    this.fillRect(0,0,this.raw.width,this.raw.height,color);
  }
  drawRect(canvas,sx,sy,sw,sh,dx,dy,dw,dh){
    canvas = this.getRawCanvas(canvas);
    if (canvas === null){
      return false;
    }
    if (sx === undefined){
      sx = 0;
    }
    if (sy === undefined){
      sy = 0;
    }
    if (sw === undefined){
      sw = this.raw.width;
    }
    if (sh === undefined){
      sh = this.raw.height;
    }
    if (dx === undefined){
      dx = sx;
    }
    if (dy === undefined){
      dy = sy;
    }
    if (dw === undefined){
      dw = sw;
    }
    if (dh === undefined){
      dh = sh;
    }
    const scontext = this.raw.getContext('2d');
    const dcontext = canvas.getContext('2d');
    scontext.globalAlpha = this.drawAlpha;
    scontext.globalCompositeOperation = this.drawOverlapType;
    scontext.drawImage(dcontext,sx,sy,sw,sh,dx,dy,dw,dh);
    return true;
  }
  draw(canvas,dx,dy){
    return this.drawRect(canvas,0,0,this.raw.width,this.raw.height,dx,dy,this.raw.width,this.raw.height);
  }
  getRect(){
    return {
      x: 0,
      y: 0,
      w: this.raw.w,
      h: this.raw.h,
    };
  }
  setResizeType(type){
    this.resizeType = type;
  }
  resize(width,height){
    const tcanvas = this.main.window.document.createElement('canvas');
    tcanvas.width = this.raw.width;
    tcanvas.height = this.raw.height;
    this.rcopy(tcanvas);
    this.raw.width = width;
    this.raw.height = height;
    let x = 0;
    let y = 0;
    if (this.resizeType === Canvas.ResizeType.Center){
      x = (width - tcanvas.width) / 2;
      y = (height - tcanvas.height) / 2;
    }else if (this.resizeType === Canvas.ResizeType.TopLeft){
      // DO NOTHING
    }else if (this.resizeType === Canvas.ResizeType.TopRight){
      x = width - tcanvas.width;
    }else if (this.resizeType === Canvas.ResizeType.BottomLeft){
      y = height - tcanvas.height;
    }else if (this.resizeType === Canvas.ResizeType.BottomRight){
      x = width - tcanvas.width;
      y = height - tcanvas.height;
    }else{
      return false;
    }
    this.copyRect(tcanvas,tcanvas.width,tcanvas.height,0,0,x,y);
    return true;
  }
  setScalingType(type){
    this.scalingType = type;
  }
  scaling(width,height){
    if (width === this.raw.width && height === this.raw.height){
      return true;
    }
    const tcanvas = this.main.window.document.createElement('canvas');
    tcanvas.width = this.raw.width;
    tcanvas.height = this.raw.height;
    this.rcopy(tcanvas);
    const tcontext = tcanvas.getContext('2d');
    this.raw.width = width;
    this.raw.height = height;
    this.fill([255,255,255,0])
    const context = this.raw.getContext('2d');
    const simg = tcontext.getImageData(0,0,tcanvas.width,tcanvas.height);
    const dimg = context.getImageData(0,0,this.raw.width,this.raw.height);
    const wscale = this.raw.width / tcanvas.width;
    const hscale = this.raw.height / tcanvas.height;
    const invWscale = 1 / wscale;
    const invHscale = 1 / hscale;
    const addrXY = (cv,x,y) => {
      return (y * cv.width + x) * 4;
    }
    if (this.scalingType === Canvas.ScalingType.None){
      context.imageSmoothingEnabled = false;
      context.globalAlpha = 1;
      context.globalCompositeOperation = Canvas.OverlapType.SourceOver;
      context.drawImage(tcanvas,0,0,tcanvas.width,tcanvas.height,0,0,this.raw.width,this.raw.height);
    }else if (this.scalingType === Canvas.ScalingType.Smoothing){
      context.imageSmoothingEnabled = true;
      context.globalAlpha = 1;
      context.globalCompositeOperation = Canvas.OverlapType.SourceOver;
      context.drawImage(tcanvas,0,0,tcanvas.width,tcanvas.height,0,0,this.raw.width,this.raw.height);
    }else if (this.scalingType === Canvas.ScalingType.Nearest){
      for(let y = 0; y < this.raw.height; y++){
        for(let x = 0; x < this.raw.width; x++){
          let cx0 = Math.floor((x / wscale) + 0.5);
          let cy0 = Math.floor((y / hscale) + 0.5);
          if (cx0 < 0){
            cx0 = 0;
          }
          if (cy0 < 0){
            cy0 = 0;
          }
          if (cx0 >= tcanvas.width){
            cx0 = tcanvas.width - 1;
          }
          if (cy0 >= tcanvas.height){
            cy0 = tcanvas.height - 1;
          }
          const index = (cy0 * tcanvas.width + cx0) * 4;
          const dindex = (y * this.raw.width + x) * 4;
          dimg.data[dindex] = simg.data[index];
          dimg.data[dindex + 1] = simg.data[index + 1];
          dimg.data[dindex + 2] = simg.data[index + 2];
          dimg.data[dindex + 3] = simg.data[index + 3];
        }
      }
      context.putImageData(dimg,0,0);
    }else if (this.scalingType === Canvas.ScalingType.Bilinear){
      // https://github.com/rgba-image/bilinear/blob/master/src/index.ts (MIT License)
      const inerpolate = (k, kMin,vMin,kMax,vMax) => {
        return (kMin == kMax) ? vMin : Math.round( ( k - kMin ) * vMax + ( kMax - k ) * vMin );
      }
      const assign = (destIndex,sx,xMin,xMax,y,yMin,yMax) => {
        let minIndex = addrXY(tcanvas,xMin,yMin);
        let maxIndex = addrXY(tcanvas,xMax,yMin);
        const vMin0 = inerpolate(sx,xMin,simg.data[minIndex],xMax,simg.data[maxIndex]);
        const vMin1 = inerpolate(sx,xMin,simg.data[minIndex + 1],xMax,simg.data[maxIndex + 1]);
        const vMin2 = inerpolate(sx,xMin,simg.data[minIndex + 2],xMax,simg.data[maxIndex + 2]);
        const vMin3 = inerpolate(sx,xMin,simg.data[minIndex + 3],xMax,simg.data[maxIndex + 3]);
        if (yMax == yMin){
          dimg.data[destIndex+0] = vMin0;
          dimg.data[destIndex+1] = vMin1;
          dimg.data[destIndex+2] = vMin2;
          dimg.data[destIndex+3] = vMin3;
        }else{
          minIndex = addrXY(tcanvas,xMin,yMax);
          maxIndex = addrXY(tcanvas,xMax,yMax);
          const vMax0 = inerpolate(sx,xMin,simg.data[minIndex],xMax,simg.data[maxIndex]);
          const vMax1 = inerpolate(sx,xMin,simg.data[minIndex + 1],xMax,simg.data[maxIndex + 1]);
          const vMax2 = inerpolate(sx,xMin,simg.data[minIndex + 2],xMax,simg.data[maxIndex + 2]);
          const vMax3 = inerpolate(sx,xMin,simg.data[minIndex + 3],xMax,simg.data[maxIndex + 3]);
          dimg.data[destIndex+0] = inerpolate(y,yMin,vMin0,yMax,vMax0);
          dimg.data[destIndex+1] = inerpolate(y,yMin,vMin1,yMax,vMax1);
          dimg.data[destIndex+2] = inerpolate(y,yMin,vMin2,yMax,vMax2);
          dimg.data[destIndex+3] = inerpolate(y,yMin,vMin3,yMax,vMax3);
        }
      }
      for(let y = 0; y < this.raw.height; y++){
        const srcY = y * invHscale;
        const yMin = srcY < 0 ? 0 : Math.trunc(srcY);
        const yMax = Math.min(Math.ceil(srcY),tcanvas.height - 1);
        for(let x = 0; x < this.raw.width; x++){
          const srcX = x * invWscale;
          const xMin = srcX < 0 ? 0 : Math.trunc(srcX);
          const xMax = Math.min(Math.ceil(srcX),tcanvas.width - 1);
          const addr = addrXY(this.raw,x,y);
          assign(addr,srcX,xMin,xMax,srcY,yMin,yMax);
        }
      }
      context.putImageData(dimg,0,0);
    }else if (this.scalingType === Canvas.ScalingType.Bicubic){
      // https://www.rainorshine.asia/2013/04/03/post2351.html
      const bicubicWeight = (d) => {
        if (d < 1){
          return 1 - 2 * d * d + d * d * d;
        }else if (d < 2){
          return 4 - 8 * d + 5 * d * d - d * d * d;
        }else{
          return 0;
        }
      }
      const trimByte = (v) => {
        return Math.min(255,Math.max(0,Math.round(v)));
      }
      for(let iy = 0; iy < this.raw.height; iy++){
        for(let ix = 0; ix < this.raw.width; ix++){
          const wfx = invWscale * ix;
          const wfy = invHscale * iy;
          const x = Math.trunc(wfx);
          const y = Math.trunc(wfy);
          let r = 0;
          let g = 0;
          let b = 0;
          let a = 0;
          for(let jy = y - 1; jy <= y + 2; jy++){
            for(let jx = x - 1; jx <= x + 2; jx++){
              const w = bicubicWeight(Math.abs(wfx - jx)) * bicubicWeight(Math.abs(wfy - jy));
              if (w === 0){
                continue;
              }
              let sx = (jx > tcanvas.width-1) ? x: jx;
              let sy = (jy > tcanvas.height-1) ? y: jy;
              sx = (sx < 0) ? 0: sx;
              sy = (sy < 0) ? 0: sy;
              const addr = addrXY(tcanvas,sx,sy);
              r += simg.data[addr] * w;
              g += simg.data[addr + 1] * w;
              b += simg.data[addr + 2] * w;
              a += simg.data[addr + 3] * w;
            }
          }
          const addr = addrXY(this.raw,ix,iy);
          dimg.data[addr] = trimByte(r);
          dimg.data[addr + 1] = trimByte(g);
          dimg.data[addr + 2] = trimByte(b);
          dimg.data[addr + 3] = trimByte(a);
        }
      }
      context.putImageData(dimg,0,0);
    }else{
      return false;
    }
    return true;
  }
  rateScaling(rate){
    return this.scaling(this.raw.width * rate,this.raw.height * rate);
  }
  loadLocalImage(){
    const input = this.main.window.document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      let file = null;
      if (e.target.files){
        file = e.target.files[0];
      }else if (e.dataTransfer.files){
        file = e.dataTransfer.files[0];
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const context = this.raw.getContext('2d');
          this.raw.width = img.width;
          this.raw.height = img.height;
          context.globalAlpha = 1;
          context.globalCompositeOperation = Layer.OverlapType.Copy;
          context.drawImage(img,0,0);
        };
        img.onerror = () => {
          alert('ERROR\nnot image file')
        }
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }
}
