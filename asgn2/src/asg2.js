// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotation;
  uniform mat4 u_GlobalUpRotation;
  void main() {
    gl_Position = u_GlobalUpRotation * u_GlobalRotation * u_ModelMatrix * a_Position; 
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
let u_ModelMatrix;
let u_GlobalRotation;
let u_GlobalUpRotation;

function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
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

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotation = gl.getUniformLocation(gl.program, 'u_GlobalRotation');
  if (!u_GlobalRotation) {
    console.log('Failed to get the storage location of u_GlobalRotation');
    return;
  }

  u_GlobalUpRotation = gl.getUniformLocation(gl.program, 'u_GlobalUpRotation');
  if (!u_GlobalUpRotation) {
    console.log('Failed to get the storage location of u_GlobalRotation');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

let g_globalAngle = 0;
let g_globalAngleX = 0;
let g_legAngle = 65;
let g_armAngle = 15;
let g_armAngle2 = 0;
let g_armAngle3 = 0;
let g_armAngle4 = 0;
let g_handAngle = 0;
let g_animation = false;
let g_poke = false;
let g_pokeTime = 0;
let g_magentaAnimation = false;
let g_upAngle = 0;
let g_mouseDown = false;
let headTilt = -15;
let g_wink = false;
let g_winkTime = 0;
let eyeScaleY1 = 1;
let g_heartSize = 0;


function addActionsForHTML(){

  document.getElementById('angleSlide').addEventListener('mousemove', function() {g_globalAngle = this.value; renderScene();});

  document.getElementById('armSlide').addEventListener('mousemove', function() {g_armAngle = this.value; renderScene();});

  document.getElementById('handSlide').addEventListener('mousemove', function() {g_armAngle2 = this.value; renderScene();});

  document.getElementById('animationOnY').onclick = function() {g_animation = true;};
  document.getElementById('animationOffY').onclick = function() {g_animation = false;};

  document.getElementById('upSlide').addEventListener('mousemove', function() {g_upAngle = this.value; renderScene();});

}

function main() {

  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHTML();

  canvas.onmousedown = onMouseDown;
  canvas.onmouseup = onMouseUp;
  canvas.onmousemove = onMouseMove;
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  requestAnimationFrame(tick);
  requestAnimationFrame(renderScene);
}

var g_startTime = performance.now()/1000;
var g_seconds = performance.now()/1000;

function tick(){
  g_seconds = performance.now()/1000-g_startTime;
  if (g_poke) {
    g_pokeTime += 0.03;

    if (g_pokeTime > 2.5) {
      g_poke = false;
      g_animation = false;
      g_pokeTime = 0;
      g_heartSize = 0;
    }
  }
  if (g_wink) {
    g_winkTime += 0.03;

    if (g_winkTime > 2) {
      g_wink = false;
      g_winkTime = 0;
    }
  }
  updateAnimationAngles();
  requestAnimationFrame(tick);
}

function updateAnimationAngles(){
  if (g_animation){
    g_legAngle = 65 + (5 * Math.sin(0.5 * g_seconds));
    g_armAngle = 15 + (5 * Math.sin(2 * g_seconds));
    g_armAngle2 = (15 * Math.sin(3 * g_seconds));
    g_armAngle3 = (10 * Math.sin(2 * g_seconds));
    g_armAngle4 =  (5 * Math.sin(3 * g_seconds));
    //g_armAngle3 = (10 * Math.sin(2 * g_seconds));
    renderScene();
  }

  BASE_HEAD = -15;
  const TILT_AMT = 12; 

  if (g_poke) {
    headTilt = -15 +(Math.abs(Math.sin (g_pokeTime))) * 3;
    renderScene();
  }

  if (g_wink) {
    if (g_winkTime < 1) {
      let t = g_winkTime / 1;
      eyeScaleY1 = 1.0 - t; 
    } else {
      let t = (g_winkTime - 1) / 1;
      eyeScaleY1 = t;
    }
    renderScene();
  }
}


function convertCoordinatesEventtoGL(ev){
  var x = ev.clientX; 
  var y = ev.clientY; 
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x,y]);
}

function onMouseMove(ev){
  if (!g_mouseDown){
    return; 
  }
  let [x,y] = convertCoordinatesEventtoGL(ev);
  g_globalAngle = x * 180;
  g_globalAngleX = y * 180;

  renderScene();
}

function onMouseDown(ev) {
  if (ev.shiftKey) {
    g_poke = true;
    g_pokeTime = 0;
    g_wink = true;
    g_winkTime = 0;
    g_heartSize = 0.03;
    updateAnimationAngles();
    return;
  } else{
    g_mouseDown = true;
  }
}

function onMouseUp(ev) {
  g_mouseDown = false;
}

//let head, face, body, leg1a, leg1b, leg1c, leg2a, leg2b, leg2c, arm1a, arm1b, arm1c, arm2a, arm2b, arm2c, tree, branch, eyeShadow1, eyeShadow2, eye1, eye2;

function renderScene(){

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  globalRotMat.rotate(g_globalAngleX, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotation, false, globalRotMat.elements);

  var globalRotMatUp = new Matrix4().rotate(g_upAngle, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalUpRotation, false, globalRotMatUp.elements);

  var startTime = performance.now();
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  tree = new Cylinder();
  tree.color = [0.32, 0.45, 0.25, 1];
  tree.matrix.translate(0.6, -1, 0);
  tree.matrix.scale(0.4, 2, 0.4); 

  branch = new Cylinder();
  branch.color = [0.32, 0.45, 0.25, 1];
  branch.matrix.translate(0.6, 0, 0);
  branch.matrix.rotate(40, 0, 0);
  branch.matrix.scale(0.2, 4, 0.2); 

  body = new Cube();
  body.color = [0.4, 0.3, 0.2, 1];
  body.matrix.translate(0, -0.8, 0);
  body.matrix.rotate(30, 0, 0);
  var bodyCoordinates = new Matrix4(body.matrix);
  body.matrix.scale(0.5, 0.9, 0.4);

  head = new Cube();
  head.color = [0.4, 0.3, 0.2, 1];
  head.matrix = new Matrix4(bodyCoordinates);
  head.matrix.rotate(headTilt, 0, 0, 1);
  head.matrix.translate(-0.22, 0.8, 0);
  head.matrix.scale(0.5, 0.5, 0.4);

  face = new Cube();
  face.color = [0.8, 0.6, 0.4, 1];
  face.matrix = new Matrix4(bodyCoordinates);
  face.matrix.rotate(headTilt, 0, 0, 1);
  face.matrix.translate(-0.17, 0.85, -0.01);
  face.matrix.scale(0.4, 0.4, 0.32);

  eyeShadow1 = new Cube();
  eyeShadow1.color = [0.5, 0.3, 0.1, 1];
  eyeShadow1.matrix = new Matrix4(bodyCoordinates);
  eyeShadow1.matrix.rotate(headTilt, 0, 0, 1);
  eyeShadow1.matrix.rotate(8, 0, 0, 1);
  eyeShadow1.matrix.translate(-0.05, 1.05, -0.02);
  eyeShadow1.matrix.scale(0.18, 0.08, 0.01);

  eyeShadow2 = new Cube();
  eyeShadow2.color = [0.5, 0.3, 0.1, 1];
  eyeShadow2.matrix = new Matrix4(bodyCoordinates);
  eyeShadow2.matrix.rotate(headTilt, 0, 0, 1);
  eyeShadow2.matrix.rotate(-15, 0, 0, 1);
  eyeShadow2.matrix.translate(-0.2, 1.05, -0.02);
  eyeShadow2.matrix.scale(0.18, 0.08, 0.01);

  eye1 = new Cylinder();
  eye1.color = [0.25, 0.2, 0.2, 1];
  eye1.matrix = new Matrix4(bodyCoordinates);
  eye1.matrix.rotate(headTilt, 0, 0, 1);
  eye1.matrix.translate(-0.07, 1.1, -0.03);
  eye1.matrix.rotate(90, 1, 0, 0);
  eye1.matrix.scale(0.05, 0.05, 0.05 * eyeScaleY1);

  eye2 = new Cylinder();
  eye2.color = [0.25, 0.2, 0.2, 1];
  eye2.matrix = new Matrix4(bodyCoordinates);
  eye2.matrix.rotate(headTilt, 0, 0, 1);
  eye2.matrix.translate(0.12, 1.1, -0.03);
  eye2.matrix.rotate(90, 1, 0, 0);
  eye2.matrix.scale(0.05, 0.05, 0.05);

  nose = new Cube();
  nose.color = [0.25, 0.2, 0.2, 1];
  nose.matrix = new Matrix4(bodyCoordinates);
  nose.matrix.rotate(headTilt, 0, 0, 1);
  nose.matrix.rotate(0, 0, 0, 1);
  nose.matrix.translate(0, 1.0, -0.04);
  nose.matrix.scale(0.05, 0.03, 0.03);

  leg1a = new Cube();
  leg1a.color = [0.4, 0.3, 0.2, 1];
  leg1a.matrix.setTranslate(-0.1, -0.6, 0);
  leg1a.matrix.rotate(30, 0, 1, 0)
  leg1a.matrix.rotate(-g_legAngle, 0, 0, 1);
  var legCoordinates1 = new Matrix4(leg1a.matrix);
  leg1a.matrix.scale(0.25, 0.5, 0.2);

  leg1b = new Cube();
  leg1b.color = [0.35, 0.25, 0.15, 1];
  leg1b.matrix = new Matrix4(legCoordinates1);
  leg1b.matrix.translate(0, 0.5, 0);
  leg1b.matrix.rotate(15, 1, 0, 0);
  var legCoordinates1b = new Matrix4(leg1b.matrix);
  leg1b.matrix.scale(0.2, 0.25, 0.1);

  leg1c = new Cube();
  leg1c.color = [0.3, 0.25, 0.3, 1];
  leg1c.matrix = new Matrix4(legCoordinates1b);
  leg1c.matrix.translate(0, 0.24, 0.02);
  leg1c.matrix.rotate(g_armAngle4, 0, 0, 1);
  leg1c.matrix.scale(0.15, 0.1, 0.05);

  leg2a = new Cube();
  leg2a.color = [0.4, 0.3, 0.2, 1];
  leg2a.matrix.translate(-0.05, -0.6, 0.37);
  leg2a.matrix.rotate(20, 0, 1, 0);
  leg2a.matrix.rotate(-65, 0, 0, 1);
  var legCoordinates2 = new Matrix4(leg2a.matrix);
  leg2a.matrix.scale(0.25, 0.8, 0.2);

  leg2b = new Cube();
  leg2b.color = [0.35, 0.25, 0.15, 1];
  leg2b.matrix = new Matrix4(legCoordinates2);
  leg2b.matrix.translate(0, 0.7, 0.1);
  leg2b.matrix.rotate(-30, 1, 0, 0)
  var legCoordinates2a = new Matrix4(leg2b.matrix);
  leg2b.matrix.scale(0.2, 0.3, 0.1);

  leg2c = new Cube();
  leg2c.color = [0.3, 0.25, 0.3, 1];
  leg2c.matrix = new Matrix4(legCoordinates2a);
  leg2c.matrix.translate(0, 0.3, 0.03);
  // leg2c.matrix.rotate(-30, 1, 0, 0)
  leg2c.matrix.scale(0.15, 0.1, 0.05);

  arm1a = new Cylinder();
  arm1a.color = [0.4, 0.3, 0.2, 1];
  arm1a.matrix.rotate(-g_armAngle, 0, 0, 1);
  arm1a.matrix.translate(-0.25, -0.77, 0);
  var armCoordinates1 = new Matrix4(arm1a.matrix);
  arm1a.matrix.scale(0.2, 0.6, 0.15);

  arm1b = new Cylinder();
  arm1b.color = [0.35, 0.25, 0.15, 1];
  arm1b.matrix = new Matrix4(armCoordinates1);
  arm1b.matrix.translate(0, 0.05, 0);
  arm1b.matrix.rotate(-g_armAngle2, 1, 0, 0);
  arm1b.matrix.translate(0, -0.2, 0);
  var armCoordinates1b = new Matrix4(arm1b.matrix);
  arm1b.matrix.scale(0.15, 0.2, 0.1);

  arm1c = new Cube();
  arm1c.color = [0.3, 0.25, 0.3, 1];
  arm1c.matrix = new Matrix4(armCoordinates1b);
  arm1c.matrix.rotate(g_armAngle3, 0, 0, 1);
  arm1c.matrix.translate(-0.05, -0.05, -0.03);
  arm1c.matrix.scale(0.1, 0.08, 0.05);

  arm2a = new Cylinder();
  arm2a.color = [0.4, 0.3, 0.2, 1];
  arm2a.matrix.rotate(-10, 1, 0, 0);
  arm2a.matrix.rotate(-10, 0, 0, 1);
  arm2a.matrix.translate(0.1, -0.25, 0.2);
  var armCoordinates2 = new Matrix4(arm2a.matrix);
  arm2a.matrix.scale(0.2, 0.8, 0.15);

  arm2b = new Cylinder();
  arm2b.color = [0.35, 0.25, 0.15, 1];
  arm2b.matrix.rotate(-30, 1, 0, 0);
  arm2b.matrix.translate(0.2, 0.4, 0.38);
  var armCoordinates2b = new Matrix4(arm2b.matrix);
  arm2b.matrix.scale(0.15, 0.2, 0.1);

  arm2c = new Cube();
  arm2c.color = [0.3, 0.25, 0.3, 1];
  arm2c.matrix = new Matrix4(armCoordinates2b);
  arm2c.matrix.rotate(g_armAngle4, 1, 0, 0);
  arm2c.matrix.translate(-0.05, 0.2, -0.02);
  arm2c.matrix.scale(0.1, 0.08, 0.05);

  heart1 = new Cube();
  heart1.color = [1, 0, 0, 1];
  heart1.matrix.translate(-0.03, -0.1, -0.01);
  heart1.matrix.scale(g_heartSize, g_heartSize, g_heartSize);

  heart2 = new Cube();
  heart2.color = [1, 0, 0, 1];
  heart2.matrix.translate(0, -0.13, -0.01);
  heart2.matrix.scale(g_heartSize, g_heartSize, g_heartSize);

  heart3 = new Cube();
  heart3.color = [1, 0, 0, 1];
  heart3.matrix.translate(0.03, -0.1, -0.01);
  heart3.matrix.scale(g_heartSize, g_heartSize, g_heartSize);

  heart4 = new Cube();
  heart4.color = [1, 0, 0, 1];
  heart4.matrix.translate(-0.03, -0.13, -0.01);
  heart4.matrix.scale(g_heartSize, g_heartSize, g_heartSize);

  heart5 = new Cube();
  heart5.color = [1, 0, 0, 1];
  heart5.matrix.translate(-0.06, -0.13, -0.01);
  heart5.matrix.scale(g_heartSize, g_heartSize, g_heartSize);

  heart6 = new Cube();
  heart6.color = [1, 0, 0, 1];
  heart6.matrix.translate(0, -0.13, -0.01);
  heart6.matrix.scale(g_heartSize, g_heartSize, g_heartSize);

  heart7 = new Cube();
  heart7.color = [1, 0, 0, 1];
  heart7.matrix.translate(0.03, -0.13, -0.01);
  heart7.matrix.scale(g_heartSize, g_heartSize, g_heartSize);

  heart8 = new Cube();
  heart8.color = [1, 0, 0, 1];
  heart8.matrix.translate(0.06, -0.13, -0.01);
  heart8.matrix.scale(g_heartSize, g_heartSize, g_heartSize);

  heart9 = new Cube();
  heart9.color = [1, 0, 0, 1];
  heart9.matrix.translate(-0.03, -0.16, -0.01);
  heart9.matrix.scale(g_heartSize, g_heartSize, g_heartSize);

  heart10 = new Cube();
  heart10.color = [1, 0, 0, 1];
  heart10.matrix.translate(0.03, -0.16, -0.01);
  heart10.matrix.scale(g_heartSize, g_heartSize, g_heartSize);

  heart11 = new Cube();
  heart11.color = [1, 0, 0, 1];
  heart11.matrix.translate(0, -0.16, -0.01);
  heart11.matrix.scale(g_heartSize, g_heartSize, g_heartSize);

  heart12 = new Cube();
  heart12.color = [1, 0, 0, 1];
  heart12.matrix.translate(0, -0.19, -0.01);
  heart12.matrix.scale(g_heartSize, g_heartSize, g_heartSize);

  head.render();
  face.render();
  body.render();
  leg1a.render();
  leg1b.render();
  leg1c.render();
  leg2a.render();
  leg2b.render();
  leg2c.render();
  arm1a.render();
  arm1b.render();
  arm1c.render();
  arm2a.render();
  arm2b.render();
  arm2c.render();
  eyeShadow1.render();
  eyeShadow2.render();
  eye1.render();
  eye2.render();
  tree.render();
  branch.render();
  heart1.render();
  heart2.render();
  heart3.render();
  heart4.render();
  heart5.render();
  heart6.render();
  heart7.render();
  heart8.render();
  heart9.render();
  heart10.render();
  heart11.render();
  heart12.render();
  nose.render();

  var duration = performance.now() - startTime;
  sendTextToHTML(" ms " + Math.floor(duration) + " fps " + Math.floor(1000/duration), "numdot");
  
}

function sendTextToHTML(text, htmlID){
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm){
    console.log("Failed to get " + htmlID + "for html");
    return;
  }
  htmlElm.innerHTML = text;

}