// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotation;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position =  u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotation * u_ModelMatrix * a_Position; 
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2){
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1){
      gl_FragColor = vec4(v_UV, 1, 1);
    } else if (u_whichTexture == 0){
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1){
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    }else if (u_whichTexture == 2){
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    }else if (u_whichTexture == 3){
      gl_FragColor = texture2D(u_Sampler3, v_UV);
    } else{
      gl_FragColor = vec4(1, 0.2, 0.2, 1);
    }
  }`

let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotation;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_GlobalUpRotation;
let u_whichTexture;
let g_camera;
let totalGems = 10;
let collected = 0;
let won = false;

let gems = [];

let cameraX = 0;
let cameraZ = 0;


function setupWebGL(){

  canvas = document.getElementById('webgl');

  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){

  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
      console.log('Failed to get the storage location of a_UV');
      return;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
      console.log('Failed to get u_whichTexture');
      return;
  }

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

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
      console.log('Failed to get the storage location of u_ViewMatrix');
      return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
      console.log('Failed to get the storage location of u_ProjectionMatrix');
      return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, "u_Sampler0");
  if(!u_Sampler0){
    console.log("Failed to get the storage location of u_Sampler0");
    return false;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, "u_Sampler1");
  if(!u_Sampler1){
    console.log("Failed to get the storage location of u_Sampler1");
    return false;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, "u_Sampler2");
  if(!u_Sampler2){
    console.log("Failed to get the storage location of u_Sampler2");
    return false;
  }

  u_Sampler3 = gl.getUniformLocation(gl.program, "u_Sampler3");
  if(!u_Sampler3){
    console.log("Failed to get the storage location of u_Sampler3");
    return false;
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

let g_mouseX = 0;
let g_mouseY = 0;
let g_prevMouseX = 0;
let g_prevMouseY = 0;
let g_isMouseDragging = false;


function initTextures(){
  var image = new Image();
  var image1 = new Image();
  var image2 = new Image();
  var image3 = new Image();

  if (!image){
    console.log("Failed to create the image object");
    return false;
  }
  if (!image1){
    console.log("Failed to create the image1 object");
    return false;
  }
  if (!image2){
    console.log("Failed to create the image2 object");
    return false;
  }
  if (!image3){
    console.log("Failed to create the image3 object");
    return false;
  }

  image.onload = function(){sendTextureToTEXTURE0(image); renderScene();};
  image.src = 'sky.jpg';

  image1.onload = function(){sendTextureToTEXTURE1(image1); renderScene();};
  image1.src = 'grass.avif';

  image2.onload = function(){sendTextureToTEXTURE2(image2); renderScene();};
  image2.src = 'jungle.jpg';

  image3.onload = function(){sendTextureToTEXTURE3(image3); renderScene();};
  image3.src = 'stone.jpg';
  return true;
}

function sendTextureToTEXTURE0(image){
  var texture = gl.createTexture();
  if (!texture){
    console.log("Failed to create the texture object");
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler0, 0);
}

function sendTextureToTEXTURE1(image){
  var texture = gl.createTexture();
  if (!texture){
    console.log("Failed to create the texture object");
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(u_Sampler1, 1);
}

function sendTextureToTEXTURE2(image){
  var texture = gl.createTexture();
  if (!texture){
    console.log("Failed to create the texture object");
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(u_Sampler2, 2);
}

function sendTextureToTEXTURE3(image){
  var texture = gl.createTexture();
  if (!texture){
    console.log("Failed to create the texture object");
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE3);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(u_Sampler3, 3);
}

function main() {

  setupWebGL();
  connectVariablesToGLSL();

  g_camera = new Camera();

  document.onkeydown = keydown;

  initTextures();
  generateMap();
  initGems();
  canvas.onmousedown = onMouseDown;
  canvas.onmouseup = onMouseUp;
  canvas.onmousemove = onMouseMove;
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  renderScene();
}

var g_startTime = performance.now()/1000;
var g_seconds = performance.now()/1000;

let g_map;

function generateMap() {
  g_map = [];
  for (let i = 0; i < 32; i++) {
    g_map[i] = [];
    for (let j = 0; j < 32; j++) {
      // Border walls
      if (i == 0 || i == 31 || j == 0 || j == 31) {
        g_map[i][j] = 4;
      } 
      else if ((i == 5 || i == 10 || i == 15 || i == 20) && j % 4 == 0) {
        g_map[i][j] = 2;
      }
      else if (i >= 14 && i <= 17 && j >= 14 && j <= 17) {
        g_map[i][j] = 0; 
      }
      else {
        let distCorner1 = Math.sqrt((i - 0) * (i - 0) + (j - 0) * (j - 0));
        let distCorner2 = Math.sqrt((i - 31) * (i - 31) + (j - 0) * (j - 0));
        let distCorner3 = Math.sqrt((i - 0) * (i - 0) + (j - 31) * (j - 31));
        let distCorner4 = Math.sqrt((i - 31) * (i - 31) + (j - 31) * (j - 31));
        
        let minDistToCorner = Math.min(distCorner1, distCorner2, distCorner3, distCorner4);
        
        let height = 0;
        if (minDistToCorner < 12) {
          height = 6 - (minDistToCorner / 2);
          
          height += Math.sin(i * 0.5) * Math.cos(j * 0.5) * 0.8;
          
          if (Math.random() > 0.3) {
            height = 0;
          }
        }
        
        height = Math.max(0, Math.floor(height));
        g_map[i][j] = height;
      }
    }
  }
}

function drawMap(){
  var wall = new Cube();
  for (x = 0; x < 32; x++){
    for (y = 0; y < 32; y++){
      let height = g_map[x][y];
      if (height > 0) {
        for (let z = 0; z < height; z++) {
          if (z == 0){
            wall.textureNum = 3;
          } else{
            wall.textureNum = 2;
          }        
          wall.matrix.setTranslate(x - 16, z - 0.75, y - 16);
          wall.renderfaster();
        }
      }
    }
  }
}


function initGems(){
  gems = [];  
  collected = 0;
  won = false;
  
  for (let i = 0; i < totalGems; i++) {
    let x = Math.floor(Math.random() * 32);  
    let z = Math.floor(Math.random() * 32);
        
    gems.push({
      x: x,
      y: 0.3,
      z: z,
      collected: false,
    });
  }
}

function drawGems(){
  for (let i = 0; i < gems.length; i++) {
    if (!gems[i].collected) {
      var gem = new Cube();
      gem.textureNum = -1;
      
      let worldX = gems[i].x - 16;
      let worldZ = gems[i].z - 16;
      
      gem.matrix.translate(worldX, gems[i].y, worldZ);
      gem.matrix.scale(0.3, 0.3, 0.3);
      gem.render();
    
    }
  }
}

function checkGemCollection() {
  if (won) return;
  
  for (let i = 0; i < gems.length; i++) {
    if (!gems[i].collected) {
      let gemWorldX = gems[i].x - 16;
      let gemWorldZ = gems[i].z - 16;
      
      var dx = cameraX - gemWorldX;
      var dz = cameraZ - gemWorldZ;
      var distance = Math.sqrt(dx * dx + dz * dz);
            
      if (distance < 1.0) {
        gems[i].collected = true;
        collected++;
        updateUI();
        
        if (collected >= totalGems) {
          won = true;
          showWinMessage();
        }
      }
    }
  }
}

function updateUI() {
  sendTextToHTML("Gems: " + collected + " / " + totalGems, "gemCounter");
}

function showWinMessage() {
  alert("You Win! You collected all the gems!");
}

function convertCoordinatesEventtoGL(ev){
  var x = ev.clientX; 
  var y = ev.clientY; 
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x,y]);
}

function onMouseDown(ev){
  let [x,y] = convertCoordinatesEventtoGL(ev);
  g_isMouseDragging = true;
  g_prevMouseX = x;
  g_prevMouseY = y;
}

function onMouseMove(ev) {

  if (!g_isMouseDragging){
    return;
  }
  let [x,y] = convertCoordinatesEventtoGL(ev);

  let deltaX = x - g_prevMouseX;
  let deltaY = y - g_prevMouseY;

  let sensitivity = 100;
  g_camera.panMouse(deltaX * sensitivity);

  g_prevMouseX = x;
  g_prevMouseY = y;
  renderScene();
}

function onMouseUp(ev) {
  g_isMouseDragging = false;
}

function canMoveTo(x, z) {
  let mapX = Math.floor(x + 16);
  let mapZ = Math.floor(z + 16);
  
  if (mapX < 0 || mapX >= 32 || mapZ < 0 || mapZ >= 32) {
    return false;
  }
  
  if (g_map[mapX][mapZ] > 0) {
    return false;
  }
  
  return true;
}
function keydown(ev){
  let moved = false;
  
  if (ev.keyCode == 39 || ev.keyCode == 68){
    var f = new Vector3();
    f.elements[0] = g_camera.at.elements[0] - g_camera.eye.elements[0];
    f.elements[1] = g_camera.at.elements[1] - g_camera.eye.elements[1];
    f.elements[2] = g_camera.at.elements[2] - g_camera.eye.elements[2];

    var s = new Vector3();
    s.elements[0] = f.elements[1] * g_camera.up.elements[2] - f.elements[2] - g_camera.up.elements[1];
    s.elements[1] = f.elements[2] * g_camera.up.elements[0] - f.elements[0] - g_camera.up.elements[2];
    s.elements[2] = f.elements[0] * g_camera.up.elements[1] - f.elements[1] - g_camera.up.elements[0];
    s.normalize();
    
    let newX = g_camera.eye.elements[0] + s.elements[0];
    let newZ = g_camera.eye.elements[2] + s.elements[2];
    
    if (canMoveTo(newX, newZ)) {
      g_camera.right();
      cameraX = g_camera.eye.elements[0];
      cameraZ = g_camera.eye.elements[2];
      moved = true;
    }
  } else if (ev.keyCode == 37 || ev.keyCode == 65){
    var f = new Vector3();
    f.elements[0] = g_camera.at.elements[0] - g_camera.eye.elements[0];
    f.elements[1] = g_camera.at.elements[1] - g_camera.eye.elements[1];
    f.elements[2] = g_camera.at.elements[2] - g_camera.eye.elements[2];

    var s = new Vector3();
    s.elements[0] = f.elements[1] * g_camera.up.elements[2] - f.elements[2] - g_camera.up.elements[1];
    s.elements[1] = f.elements[2] * g_camera.up.elements[0] - f.elements[0] - g_camera.up.elements[2];
    s.elements[2] = f.elements[0] * g_camera.up.elements[1] - f.elements[1] - g_camera.up.elements[0];
    s.normalize();
    
    let newX = g_camera.eye.elements[0] - s.elements[0];
    let newZ = g_camera.eye.elements[2] - s.elements[2];
    
    if (canMoveTo(newX, newZ)) {
      g_camera.left();
      cameraX = g_camera.eye.elements[0];
      cameraZ = g_camera.eye.elements[2];
      moved = true;
    }
  } else if (ev.keyCode == 38 || ev.keyCode == 87){
    var f = new Vector3();
    f.elements[0] = g_camera.at.elements[0] - g_camera.eye.elements[0];
    f.elements[1] = g_camera.at.elements[1] - g_camera.eye.elements[1];
    f.elements[2] = g_camera.at.elements[2] - g_camera.eye.elements[2];
    f.normalize();
    
    let newX = g_camera.eye.elements[0] + f.elements[0];
    let newZ = g_camera.eye.elements[2] + f.elements[2];
    
    if (canMoveTo(newX, newZ)) {
      g_camera.forward();
      cameraX = g_camera.eye.elements[0];
      cameraZ = g_camera.eye.elements[2];
      moved = true;
    }
  } else if (ev.keyCode == 40 || ev.keyCode == 83){
    var f = new Vector3();
    f.elements[0] = g_camera.at.elements[0] - g_camera.eye.elements[0];
    f.elements[1] = g_camera.at.elements[1] - g_camera.eye.elements[1];
    f.elements[2] = g_camera.at.elements[2] - g_camera.eye.elements[2];
    f.normalize();
    
    let newX = g_camera.eye.elements[0] - f.elements[0];
    let newZ = g_camera.eye.elements[2] - f.elements[2];
    
    if (canMoveTo(newX, newZ)) {
      g_camera.back();
      cameraX = g_camera.eye.elements[0];
      cameraZ = g_camera.eye.elements[2];
      moved = true;
    }
  } else if (ev.keyCode == 81){
    g_camera.panLeft();
  } else if (ev.keyCode == 69){
    g_camera.panRight();
  } else if (ev.keyCode == 32){
    addBlock();
  } else if (ev.keyCode == 8){
    deleteBlock();
  }
  
  if (moved) {
    checkGemCollection();
  }
  renderScene();
}

function addBlock(){
  let [x,z] = findBlock();
  g_map[x][z]++;
}

function deleteBlock(){
  let [x,z] = findBlock();
  console.log(x, z);
  if (g_map[x][z] > 0){
    g_map[x][z]--;
  }
}

function findBlock(){
  let camX = g_camera.eye.elements[0];
  let camZ = g_camera.eye.elements[2];

  let dirX = g_camera.at.elements[0] - g_camera.eye.elements[0];
  let dirZ = g_camera.at.elements[2] - g_camera.eye.elements[2];

  let length = Math.sqrt(dirX * dirX + dirZ * dirZ);
  dirX = dirX / length;
  dirZ = dirZ / length;

  let targetX = camX + dirX * 1.5;
  let targetZ = camZ + dirZ * 1.5;

  let x = Math.floor(targetX + 16);
  let z = Math.floor(targetZ + 16);

  x = Math.max(0, Math.min(31, x));
  z = Math.max(0, Math.min(31, z));

  return [x, z];
}

let startTime;

function renderScene(){

  var projMat = new Matrix4();
  projMat.setPerspective(120, canvas.width/canvas.height, .1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var viewMat = new Matrix4();
  //viewMat.setLookAt(g_eye[0], g_eye[1], g_eye[2], g_at[0], g_at[1], g_at[2], g_up[0], g_up[1], g_up[2]);
  viewMat.setLookAt(g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
    g_camera.at.elements[0],g_camera.at.elements[1],g_camera.at.elements[2],
    g_camera.up.elements[0],g_camera.up.elements[1],g_camera.up.elements[2]);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotation, false, globalRotMat.elements);

  startTime = performance.now();
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  drawMap();
  drawGems();
  let floor = new Cube();
  floor.color = [1, 0, 0, 1];
  floor.textureNum = 1;
  floor.matrix.translate(0, -0.25, 0);
  floor.matrix.scale(32, 0.01, 32);
  floor.matrix.translate(-0.5, 0, -0.5);
  floor.render();
  //floor.renderfast();

  let sky = new Cube();
  sky.color = [1, 0, 0, 1];
  sky.textureNum = 0;
  sky.matrix.scale(100, 100, 100);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.renderfaster();

  drawAnimal();

  var duration = performance.now() - startTime;
  sendTextToHTML(" ms " + Math.floor(duration) + " fps " + Math.floor(1000/duration), "numdot");
}

function drawAnimal(){

  body = new Cube();
  body.textureNum = -2;
  body.color = [0.4, 0.3, 0.2, 1];
  body.matrix.translate(3.5, -0.8 + 1, 0);
  body.matrix.rotate(30, 0, 0);
  var bodyCoordinates = new Matrix4(body.matrix);
  body.matrix.scale(0.5, 0.9, 0.4);

  head = new Cube();
  head.textureNum = -2;
  head.color = [0.4, 0.3, 0.2, 1];
  head.matrix = new Matrix4(bodyCoordinates);
  head.matrix.rotate(headTilt, 0, 0, 1);
  head.matrix.translate(-0.22, 0.8, 0);
  head.matrix.scale(0.5, 0.5, 0.4);

  face = new Cube();
  face.textureNum = -2;
  face.color = [0.8, 0.6, 0.4, 1];
  face.matrix = new Matrix4(bodyCoordinates);
  face.matrix.rotate(headTilt, 0, 0, 1);
  face.matrix.translate(-0.17, 0.85, -0.01);
  face.matrix.scale(0.4, 0.4, 0.32);

  eyeShadow1 = new Cube();
  eyeShadow1.textureNum = -2;
  eyeShadow1.color = [0.5, 0.3, 0.1, 1];
  eyeShadow1.matrix = new Matrix4(bodyCoordinates);
  eyeShadow1.matrix.rotate(headTilt, 0, 0, 1);
  eyeShadow1.matrix.rotate(8, 0, 0, 1);
  eyeShadow1.matrix.translate(-0.05, 1.05, -0.02);
  eyeShadow1.matrix.scale(0.18, 0.08, 0.01);

  eyeShadow2 = new Cube();
  eyeShadow2.textureNum = -2;
  eyeShadow2.color = [0.5, 0.3, 0.1, 1];
  eyeShadow2.matrix = new Matrix4(bodyCoordinates);
  eyeShadow2.matrix.rotate(headTilt, 0, 0, 1);
  eyeShadow2.matrix.rotate(-15, 0, 0, 1);
  eyeShadow2.matrix.translate(-0.2, 1.05, -0.02);
  eyeShadow2.matrix.scale(0.18, 0.08, 0.01);

  eye1 = new Cylinder();
  eye1.textureNum = -2;
  eye1.color = [0.25, 0.2, 0.2, 1];
  eye1.matrix = new Matrix4(bodyCoordinates);
  eye1.matrix.rotate(headTilt, 0, 0, 1);
  eye1.matrix.translate(-0.07, 1.1, -0.03);
  eye1.matrix.rotate(90, 1, 0, 0);
  eye1.matrix.scale(0.05, 0.05, 0.05 * eyeScaleY1);

  eye2 = new Cylinder();
  eye2.textureNum = -2;
  eye2.color = [0.25, 0.2, 0.2, 1];
  eye2.matrix = new Matrix4(bodyCoordinates);
  eye2.matrix.rotate(headTilt, 0, 0, 1);
  eye2.matrix.translate(0.12, 1.1, -0.03);
  eye2.matrix.rotate(90, 1, 0, 0);
  eye2.matrix.scale(0.05, 0.05, 0.05);

  nose = new Cube();
  nose.textureNum = -2;
  nose.color = [0.25, 0.2, 0.2, 1];
  nose.matrix = new Matrix4(bodyCoordinates);
  nose.matrix.rotate(headTilt, 0, 0, 1);
  nose.matrix.rotate(0, 0, 0, 1);
  nose.matrix.translate(0, 1.0, -0.04);
  nose.matrix.scale(0.05, 0.03, 0.03);

  leg1a = new Cube();
  leg1a.textureNum = -2;
  leg1a.color = [0.4, 0.3, 0.2, 1];
  leg1a.matrix.setTranslate(-0.1 + 3.5, -0.6+ 1, 0);
  leg1a.matrix.rotate(30, 0, 1, 0)
  leg1a.matrix.rotate(-g_legAngle, 0, 0, 1);
  var legCoordinates1 = new Matrix4(leg1a.matrix);
  leg1a.matrix.scale(0.25, 0.5, 0.2);

  leg1b = new Cube();
  leg1b.textureNum = -2;
  leg1b.color = [0.35, 0.25, 0.15, 1];
  leg1b.matrix = new Matrix4(legCoordinates1);
  leg1b.matrix.translate(0, 0.5, 0);
  leg1b.matrix.rotate(15, 1, 0, 0);
  var legCoordinates1b = new Matrix4(leg1b.matrix);
  leg1b.matrix.scale(0.2, 0.25, 0.1);

  leg1c = new Cube();
  leg1c.textureNum = -2;
  leg1c.color = [0.3, 0.25, 0.3, 1];
  leg1c.matrix = new Matrix4(legCoordinates1b);
  leg1c.matrix.translate(0, 0.24, 0.02);
  leg1c.matrix.rotate(g_armAngle4, 0, 0, 1);
  leg1c.matrix.scale(0.15, 0.1, 0.05);

  leg2a = new Cube();
  leg2a.textureNum = -2;
  leg2a.color = [0.4, 0.3, 0.2, 1];
  leg2a.matrix.translate(-0.05+ 3.5, -0.6+ 1, 0.37);
  leg2a.matrix.rotate(20, 0, 1, 0);
  leg2a.matrix.rotate(-65, 0, 0, 1);
  var legCoordinates2 = new Matrix4(leg2a.matrix);
  leg2a.matrix.scale(0.25, 0.8, 0.2);

  leg2b = new Cube();
  leg2b.textureNum = -2;
  leg2b.color = [0.35, 0.25, 0.15, 1];
  leg2b.matrix = new Matrix4(legCoordinates2);
  leg2b.matrix.translate(0, 0.7, 0.1);
  leg2b.matrix.rotate(-30, 1, 0, 0)
  var legCoordinates2a = new Matrix4(leg2b.matrix);
  leg2b.matrix.scale(0.2, 0.3, 0.1);

  leg2c = new Cube();
  leg2c.textureNum = -2;
  leg2c.color = [0.3, 0.25, 0.3, 1];
  leg2c.matrix = new Matrix4(legCoordinates2a);
  leg2c.matrix.translate(0, 0.3, 0.03);
  // leg2c.matrix.rotate(-30, 1, 0, 0)
  leg2c.matrix.scale(0.15, 0.1, 0.05);

  arm1a = new Cylinder();
  arm1a.textureNum = -2;
  arm1a.color = [0.4, 0.3, 0.2, 1];
  //arm1a.matrix.rotate(-g_armAngle, 0, 0, 1);
  arm1a.matrix.translate(-0.25 + 3.5, -0.77+ 1, 0);
  var armCoordinates1 = new Matrix4(arm1a.matrix);
  arm1a.matrix.scale(0.2, 0.6, 0.15);

  arm1b = new Cylinder();
  arm1b.textureNum = -2;
  arm1b.color = [0.35, 0.25, 0.15, 1];
  arm1b.matrix = new Matrix4(armCoordinates1);
  arm1b.matrix.translate(0, 0.05, 0);
  arm1b.matrix.rotate(-g_armAngle2, 1, 0, 0);
  arm1b.matrix.translate(0, -0.2, 0);
  var armCoordinates1b = new Matrix4(arm1b.matrix);
  arm1b.matrix.scale(0.15, 0.2, 0.1);

  arm1c = new Cube();
  arm1c.textureNum = -2;
  arm1c.color = [0.3, 0.25, 0.3, 1];
  arm1c.matrix = new Matrix4(armCoordinates1b);
  arm1c.matrix.rotate(g_armAngle3, 0, 0, 1);
  arm1c.matrix.translate(-0.05, -0.05, -0.03);
  arm1c.matrix.scale(0.1, 0.08, 0.05);

  arm2a = new Cylinder();
  arm2a.textureNum = -2;
  arm2a.color = [0.4, 0.3, 0.2, 1];
  //arm2a.matrix.rotate(-10, 1, 0, 0);
  //arm2a.matrix.rotate(-10, 0, 0, 1);
  arm2a.matrix.translate(0.1+ 3.5, -0.25+ 1, 0.2);
  var armCoordinates2 = new Matrix4(arm2a.matrix);
  arm2a.matrix.scale(0.2, 0.8, 0.15);

  arm2b = new Cylinder();
  arm2b.textureNum = -2;
  arm2b.color = [0.35, 0.25, 0.15, 1];
  arm1c.matrix = new Matrix4(armCoordinates2);
  //arm2b.matrix.rotate(-30, 1, 0, 0);
  arm2b.matrix.translate(0.2, 0.4, 0.38);
  var armCoordinates2b = new Matrix4(arm2b.matrix);
  arm2b.matrix.scale(0.15, 0.2, 0.1);

  arm2c = new Cube();
  arm2c.textureNum = -2;
  arm2c.color = [0.3, 0.25, 0.3, 1];
  arm2c.matrix = new Matrix4(armCoordinates2b);
  //arm2c.matrix.rotate(g_armAngle4, 1, 0, 0);
  //arm2c.matrix.translate(-0.05, 0.2+1, -0.02);
  arm2c.matrix.scale(0.1, 0.08, 0.05);

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
  arm2a.render();
  eyeShadow1.render();
  eyeShadow2.render();
  eye1.render();
  eye2.render();
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