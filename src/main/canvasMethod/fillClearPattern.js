const fillClearPattern = self.fillClearPattern = function fillClearPattern(canvas, opt) {
  const context = canvas.getContext('2d');
  // fill white
  context.fillStyle = 'rgba(255, 255, 255, 1)';
  context.fillRect(0, 0, canvas.width, canvas.height);
  const len = 32;
  for(let x=0;x<canvas.width;x+=len){
    for(let y=0;y<canvas.height;y+=len){
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
