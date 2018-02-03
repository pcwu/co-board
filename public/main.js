
const hello = function() {

  var socket = io('http://co-board.herokuapp.com');
  var canvas = document.getElementsByClassName('whiteboard')[0];
  var colors = document.getElementsByClassName('color');
  var context = canvas.getContext('2d');

  var current = {
    color: 'black',
    width: 2
  };
  var drawing = false;

  canvas.addEventListener('mousedown', onMouseDown, false);
  canvas.addEventListener('mouseup', onMouseUp, false);
  canvas.addEventListener('mouseout', onMouseUp, false);
  canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

  canvas.addEventListener('touchstart', onMouseDown, false);
  canvas.addEventListener('touchend', onMouseUp, false);
  canvas.addEventListener('touchmove', onMouseMove, false);

  for (var i = 0; i < colors.length; i++){
    colors[i].addEventListener('click', onSettingUpdate, false);
  }

  socket.on('drawing', onDrawingEvent);

  window.addEventListener('resize', onResize, false);
  onResize();

  function getX(e) {
    var touchX = null;
    if (e.touches) {
      if (e.touches.length == 1) { // Only deal with one finger
          var touch = e.touches[0]; // Get the information for finger #1
          touchX=touch.pageX-touch.target.offsetLeft;
          touchY=touch.pageY-touch.target.offsetTop;
      }
    };
    return e.targetTouches[0].clientX || e.clientX;
  }

  function getY(e) {
    var touchY = null;
    if (e.touches) {
      if (e.touches.length == 1) { // Only deal with one finger
          var touch = e.touches[0]; // Get the information for finger #1
          touchX=touch.pageX-touch.target.offsetLeft;
          touchY=touch.pageY-touch.target.offsetTop;
      }
    };
    return e.targetTouches[0].clientY || e.clientY;
  }


  function drawLine(x0, y0, x1, y1, color, width, emit){
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = width;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.stroke();
    context.closePath();

    if (!emit) { return; }
    var w = canvas.width;
    var h = canvas.height;

    socket.emit('drawing', {
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color: color,
      width: width
    });
  }

  function onMouseDown(e){
    drawing = true;
    current.x = getX(e);
    current.y = getY(e);
  }

  function onMouseUp(e){
    if (!drawing && !e.touches) { return; }
    drawing = false;
    drawLine(current.x, current.y, getX(e), getY(e), current.color, current.width, true);
  }

  function onMouseMove(e){
    if (!drawing && !e.touches) { return; }
    drawLine(current.x, current.y, getX(e), getY(e), current.color, current.width, true);
    current.x = getX(e);
    current.y = getY(e);
  }

  function onSettingUpdate(e){
    if(e.target.className.split(' ')[1] === 'eraser'){
      current.color = 'white';
      current.width = 15;
    }else{
      current.color = e.target.className.split(' ')[1];
      current.width = 2;
    }
  }

  // limit the number of events per second
  function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function() {
      var time = new Date().getTime();

      if ((time - previousCall) >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  function onDrawingEvent(data){
    var w = canvas.width;
    var h = canvas.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.width);
  }

  // make the canvas fill its parent
  function onResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

};

hello();
