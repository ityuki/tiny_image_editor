const fillBackgroundPattern = self.fillBackgroundPattern = function fillBackgroundPattern(canvas, opt) {
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
  const len = 2;
  for(let x=0;x<rawCanvas.width;x+=len){
    for(let y=0;y<rawCanvas.height;y+=len){
      if (x % (len*2) == y % (len*2)) {
        continue;
      }
      // clear pattern
      context.fillStyle = 'rgba(200, 200, 200, 1)';
      context.beginPath();
      context.moveTo(x,y);
      context.lineTo(x+len,y);
      context.lineTo(x+len,y+len);
      context.lineTo(x,y+len);
      context.closePath();
      context.fill();
    }
  }
}
