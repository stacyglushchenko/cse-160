// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position; 
    //gl_PointSize = 10.0; 
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size){
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 10;
let g_selectedType = POINT;
let g_segmentSize = 20;
let g_showPictures = false;
let g_colorBlend = false;
let g_lastX = null;
let g_lastY = null;
let speed = 0;

function addActionsForHTML(){

  document.getElementById('clear').onclick = function() {g_shapesList = []; g_showPictures = false; renderAllShapes();};

  document.getElementById('point').onclick = function() {g_selectedType = POINT;};
  document.getElementById('triangle').onclick = function() {g_selectedType = TRIANGLE;};
  document.getElementById('circle').onclick = function() {g_selectedType = CIRCLE;};

  document.getElementById('redSlide').addEventListener('mouseup', function() {g_selectedColor[0] = this.value/100;});
  document.getElementById('greenSlide').addEventListener('mouseup', function() {g_selectedColor[1] = this.value/100;});
  document.getElementById('blueSlide').addEventListener('mouseup', function() {g_selectedColor[2] = this.value/100;});

  document.getElementById('colorChange').addEventListener('change', function(){g_colorBlend = document.getElementById('colorChange').checked;});
  
  document.getElementById('sizeSlide').addEventListener('mouseup', function() {g_selectedSize = this.value});

  document.getElementById('segmentSlide').addEventListener('mouseup', function() {g_segmentSize = this.value});

  document.getElementById('draw').onclick = function(){ g_showPictures = true; renderAllShapes();};
}

function main() {

  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHTML();
  
  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) {if (ev.buttons == 1) {click(ev)}};

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];

function click(ev) {

  let x = ev.clientX;
  let y = ev.clientY;

  if (g_lastX !== null && g_lastY !== null) {
    let dx = x - g_lastX;
    let dy = y - g_lastY;
    speed = Math.sqrt(dx * dx + dy * dy);
  }

  g_lastX = x;
  g_lastY = y;

  [x,y] = convertCoordinatesEventtoGL(ev);

  let point;
  if (g_selectedType==POINT){
    point = new Point();
  } else if (g_selectedType==TRIANGLE){
    point = new Triangle();
  } else{
    point = new Circle();
    point.segments = g_segmentSize;
  }
  point.position = [x,y];
  if (g_colorBlend && ev.buttons == 1){
    point.color = getAnimatedColor(speed);
  } else{
    point.color = g_selectedColor.slice();
  }
  point.size = g_selectedSize;

  g_shapesList.push(point);
  renderAllShapes();
}

function convertCoordinatesEventtoGL(ev){
  var x = ev.clientX; 
  var y = ev.clientY; 
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x,y]);
}

function renderAllShapes(){
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  if (g_showPictures) {
    drawPicture();
  }

  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }
}

function getAnimatedColor(speed) {
  let t = performance.now() * (0.002 + speed*0.00001); 

  return [
    0.5 + 0.5 * Math.sin(t),
    0.5 + 0.5 * Math.sin(t + 2.0),
    0.5 + 0.5 * Math.sin(t + 4.0),
    0.6 
  ];
}

function drawPicture(){
  //gl.clear(gl.COLOR_BUFFER_BIT);

  //face + white ears
  let t1 = new Triangle();
  t1.color = [0.8, 0.8, 0.8, 1];
  t1.vertices = [-0.45, 0.8, -0.15, 0.5, -0.6, 0.5];
  t1.render();
  let t2 = new Triangle();
  t2.color = [0.8, 0.8, 0.8, 1];
  t2.vertices = [0.45, 0.8, 0.15, 0.5, 0.6, 0.5];
  t2.render();
  let t3 = new Triangle();
  t3.color = [0.8, 0.8, 0.8, 1];
  t3.vertices = [-0.6, 0.5, 0.6, 0.5, -0.6, -0.2];
  t3.render();
  let t4 = new Triangle();
  t4.color = [0.8, 0.8, 0.8, 1];
  t4.vertices = [0.6, 0.5, 0.6, -0.2, -0.6, -0.2];
  t4.render();
  let t5 = new Triangle();
  t5.color = [0.8, 0.8, 0.8, 1];
  t5.vertices = [-0.6, 0.5, -0.7, 0, -0.6, -0.2];
  t5.render();
  let t6 = new Triangle();
  t6.color = [0.8, 0.8, 0.8, 1];
  t6.vertices = [0.6, 0.5, 0.7, 0, 0.6, -0.2];
  t6.render();
  let t18 = new Triangle();
  t18.color = [0.8, 0.8, 0.8, 1];
  t18.vertices = [-0.6, -0.2, 0, -0.35, 0.6, -0.2];
  t18.render();

  //pink ears
  let t7 = new Triangle();
  t7.color = [0.92, 0.64, 0.58, 1];
  t7.vertices = [-0.53, 0.5, -0.44, 0.65, -0.25, 0.5];
  t7.render();
  let t8 = new Triangle();
  t8.color = [0.92, 0.64, 0.58, 1];
  t8.vertices = [0.53, 0.5, 0.44, 0.65, 0.25, 0.5];
  t8.render();

  //black eyes
  let t9 = new Triangle();
  t9.color = [0, 0, 0, 1];
  t9.vertices = [-0.4, 0.35, -0.15, 0.35, -0.4, 0.05];
  t9.render();
  let t10 = new Triangle();
  t10.color = [0, 0, 0, 1];
  t10.vertices = [-0.4, 0.05, -0.15, 0.35, -0.15, 0.05];
  t10.render();
  let t11 = new Triangle();
  t11.color = [0, 0, 0, 1];
  t11.vertices = [0.4, 0.35, 0.15, 0.35, 0.4, 0.05];
  t11.render();
  let t12 = new Triangle();
  t12.color = [0, 0, 0, 1];
  t12.vertices = [0.4, 0.05, 0.15, 0.35, 0.15, 0.05];
  t12.render();

  //white eyes
  let t13 = new Triangle();
  t13.color = [1, 1, 1, 1];
  t13.vertices = [-0.15, 0.35, -0.25, 0.35, -0.25, 0.25];
  t13.render();
  let t14 = new Triangle();
  t14.color = [1, 1, 1, 1];
  t14.vertices = [-0.15, 0.35, -0.15, 0.25, -0.25, 0.25];
  t14.render();
  let t15 = new Triangle();
  t15.color = [1, 1, 1, 1];
  t15.vertices = [0.4, 0.35, 0.3, 0.35, 0.3, 0.25];
  t15.render();
  let t16 = new Triangle();
  t16.color = [1, 1, 1, 1];
  t16.vertices = [0.4, 0.35, 0.3, 0.25, 0.4, 0.25];
  t16.render();

  //nose
  let t17 = new Triangle();
  t17.color = [0.92, 0.64, 0.58, 1];
  t17.vertices = [-0.1, 0, 0.1, 0, 0, -0.10];
  t17.render();

  //whiskers
  let t19 = new Triangle();
  t19.color = [0.7, 0.7, 0.7, 1];
  t19.vertices = [-0.12, 0, -0.6, 0, -0.6, -0.03];
  t19.render();

  let t20 = new Triangle();
  t20.color = [0.7, 0.7, 0.7, 1];
  t20.vertices = [-0.12, 0, -0.12, -0.03, -0.6, -0.03];
  t20.render();

  let t21 = new Triangle();
  t21.color = [0.7, 0.7, 0.7, 1];
  t21.vertices = [-0.12, -0.05, -0.6, -0.05, -0.6, -0.08];
  t21.render();

  let t22 = new Triangle();
  t22.color = [0.7, 0.7, 0.7, 1];
  t22.vertices = [-0.12, -0.05, -0.12, -0.08, -0.6, -0.08];
  t22.render();

  let t23 = new Triangle();
  t23.color = [0.7, 0.7, 0.7, 1];
  t23.vertices = [0.12, 0, 0.6, 0, 0.6, -0.03];
  t23.render();

  let t24 = new Triangle();
  t24.color = [0.7, 0.7, 0.7, 1];
  t24.vertices = [0.12, 0, 0.12, -0.03, 0.6, -0.03];
  t24.render();

  let t25 = new Triangle();
  t25.color = [0.7, 0.7, 0.7, 1];
  t25.vertices = [0.23, -0.05, 0.6, -0.05, 0.6, -0.08];
  t25.render();

  let t26 = new Triangle();
  t26.color = [0.7, 0.7, 0.7, 1];
  t26.vertices = [0.23, -0.05, 0.23, -0.08, 0.6, -0.08];
  t26.render();

  //intials S
  let t27 = new Triangle();
  t27.color = [0.7, 0.7, 0.7, 1];
  t27.position = [0.12,-0.06]
  t27.render();
  let t31 = new Triangle();
  t31.color = [0.7, 0.7, 0.7, 1];
  t31.position = [0.14,-0.06]
  t31.render();
  let t28 = new Triangle();
  t28.color = [0.7, 0.7, 0.7, 1];
  t28.position = [0.12,-0.08]
  t28.render();
  let t29 = new Triangle();
  t29.color = [0.7, 0.7, 0.7, 1];
  t29.position = [0.13,-0.09]
  t29.render();
  let t30 = new Triangle();
  t30.color = [0.7, 0.7, 0.7, 1];
  t30.position = [0.14,-0.10]
  t30.render();
  let t32 = new Triangle();
  t32.color = [0.7, 0.7, 0.7, 1];
  t32.position = [0.14,-0.11]
  t32.render();
  let t33 = new Triangle();
  t33.color = [0.7, 0.7, 0.7, 1];
  t33.position = [0.13,-0.12]
  t33.render();
  let t34 = new Triangle();
  t34.color = [0.7, 0.7, 0.7, 1];
  t34.position = [0.12,-0.13]
  t34.render();

  //intiials G
  let t35 = new Triangle();
  t35.color = [0.7, 0.7, 0.7, 1];
  t35.position = [0.18,-0.06]
  t35.render();
  let t36 = new Triangle();
  t36.color = [0.7, 0.7, 0.7, 1];
  t36.position = [0.2,-0.06]
  t36.render();
  let t37 = new Triangle();
  t37.color = [0.7, 0.7, 0.7, 1];
  t37.position = [0.21,-0.07]
  t37.render();
  let t38 = new Triangle();
  t38.color = [0.7, 0.7, 0.7, 1];
  t38.position = [0.18,-0.075]
  t38.render();
  let t39 = new Triangle();
  t39.color = [0.7, 0.7, 0.7, 1];
  t39.position = [0.18,-0.085]
  t39.render();
  let t40 = new Triangle();
  t40.color = [0.7, 0.7, 0.7, 1];
  t40.position = [0.18,-0.1]
  t40.render();
  let t41 = new Triangle();
  t41.color = [0.7, 0.7, 0.7, 1];
  t41.position = [0.18,-0.12]
  t41.render();
  let t42 = new Triangle();
  t42.color = [0.7, 0.7, 0.7, 1];
  t42.position = [0.185,-0.12]
  t42.render();
  let t43 = new Triangle();
  t43.color = [0.7, 0.7, 0.7, 1];
  t43.position = [0.2,-0.125]
  t43.render();
  let t44 = new Triangle();
  t44.color = [0.7, 0.7, 0.7, 1];
  t44.position = [0.22,-0.115]
  t44.render();
  let t45 = new Triangle();
  t45.color = [0.7, 0.7, 0.7, 1];
  t45.position = [0.21,-0.115]
  t45.render();
}