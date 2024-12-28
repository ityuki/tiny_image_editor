const fillClearPattern = self.fillClearPattern = function fillClearPattern(canvas, opt) {
  if (!opt) {
    opt = {};
  }
  if (!canvas) {
    return;
  }
  const rawCanvas = parent.Canvas.getRawCanvas(canvas);
  if (!rawCanvas) {
    return;
  }
  const context = rawCanvas.getContext('2d');
  // fill white
  context.fillStyle = 'rgba(255, 255, 255, 1)';
  context.fillRect(0, 0, rawCanvas.width, rawCanvas.height);
  const len = 16;
  for(let x=0;x<rawCanvas.width;x+=len){
    for(let y=0;y<rawCanvas.height;y+=len){
      // clear pattern
      context.fillStyle = 'rgba(224, 224, 224, 1)';
      context.beginPath();
      context.moveTo(x+len/2,y);
      context.lineTo(x+len,y+len/2);
      context.lineTo(x+len/2,y+len);
      context.lineTo(x,y+len/2);
      context.closePath();
      context.fill();
    }
  }
}
