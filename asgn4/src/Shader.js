// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_NormalMatrix;
  uniform mat4 u_GlobalRotation;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position =  u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotation * u_ModelMatrix * a_Position; 
    v_UV = a_UV;
    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1)));
    //v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform int u_whichTexture;
  uniform vec3 u_lightPos;
  uniform vec3 u_cameraPos;
  varying vec4 v_VertPos;
  uniform bool u_lightOn;
  uniform vec3 u_lightColor;
  uniform vec3 u_spotDirection;
  uniform float u_spotCutoff;
  uniform bool u_spotOn;
   
  void main() {
    if (u_whichTexture == -3){
      gl_FragColor = vec4((v_Normal + 1.0)/2.0, 1.0);
    } else if (u_whichTexture == -2){
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

    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    float r = length(lightVector);

    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N,L), 0.0);
    vec3 R = reflect(-L, N);
    vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

    float specular = 0.0;
    if (nDotL > 0.0) {
        specular = pow(max(dot(E, R), 0.0), 10.0) * 0.5;
    }
    vec3 diffuse = vec3(gl_FragColor) * u_lightColor * nDotL * 0.7;
    vec3 ambient = vec3(gl_FragColor) * 0.4;

    if (u_lightOn) {
      if (u_spotOn) {
        vec3 spotDir = normalize(u_spotDirection);
        float spotCos = dot(-L, spotDir); 
        
        if (spotCos > u_spotCutoff) {
          float intensity = pow(spotCos, 8.0);
          if (u_whichTexture == -2) {
            gl_FragColor = vec4((specular + diffuse) * intensity + ambient, 1.0);
          } else {
            gl_FragColor = vec4(diffuse * intensity + ambient, 1.0);
          }
        } else {
          gl_FragColor = vec4(ambient, 1.0); // outside cone = ambient only
        }
      } else {
        if (u_whichTexture == -2) {
          gl_FragColor = vec4(specular + diffuse + ambient, 1.0);
        } else {
          gl_FragColor = vec4(diffuse + ambient, 1.0);
        }
      }
    }
    
  }`

let canvas;
let gl;
let a_Position;
let a_UV;
var a_Normal;
let u_FragColor;
let u_NormalMatrix;
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
let u_lightPos;
let u_cameraPos;
let u_lightOn;
let u_lightColor;
let u_spotDirection;
let u_spotCutoff;
let u_spotOn;
//let totalGems = 10;
let collected = 0;
let won = false;

//let gems = [];

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

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
      console.log('Failed to get the storage location of a_Normal');
      return;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
      console.log('Failed to get u_whichTexture');
      return;
  }

  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
      console.log('Failed to get u_lightPos');
      return;
  }

  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
      console.log('Failed to get u_lightOn');
      return;
  }

  u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
  if (!u_lightColor) {
      console.log('Failed to get u_lightColor');
      return;
  }

  u_spotDirection = gl.getUniformLocation(gl.program, 'u_spotDirection');
  if (!u_spotDirection) {
      console.log('Failed to get spotDirection');
      return;
  }

  u_spotCutoff = gl.getUniformLocation(gl.program, 'u_spotCutoff');
  if (!u_spotCutoff) {
      console.log('Failed to get u_spotCutoff');
      return;
  }

  u_spotOn = gl.getUniformLocation(gl.program, 'u_spotOn');
  if (!u_spotOn) {
      console.log('Failed to get u_spotOn');
      return;
  }

  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
      console.log('Failed to get u_cameraPos');
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

  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (!u_NormalMatrix) {
    console.log('Failed to get the storage location of u_NormalMatrix');
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

function addActionsForHTML(){
  document.getElementById('angleSlide').addEventListener('mousemove', function() {g_globalAngle = this.value; renderScene();});
  document.getElementById('normalOn').onclick = function() {g_normalOn = true; renderScene();};
  document.getElementById('normalOff').onclick = function() {g_normalOn = false; renderScene();};

  document.getElementById('lightX').addEventListener('mousemove', function(ev) { if (ev.buttons == 1) {g_lightPos[0] = this.value; renderScene();}});
  document.getElementById('lightY').addEventListener('mousemove', function(ev) { if (ev.buttons == 1) {g_lightPos[1] = this.value; renderScene();}});
  document.getElementById('lightZ').addEventListener('mousemove', function(ev) { if (ev.buttons == 1) {g_lightPos[2] = this.value; renderScene();}});

  document.getElementById('animationOn').onclick = function() {g_animation = true;};
  document.getElementById('animationOff').onclick = function() {g_animation = false;};

  document.getElementById('lightOn').onclick = function() {g_lightOn = true;};
  document.getElementById('lightOff').onclick = function() {g_lightOn = false;};

  document.getElementById('red').addEventListener('mousemove', function() {g_lightColor[0] = this.value/100; renderScene();});
  document.getElementById('green').addEventListener('mousemove', function() {g_lightColor[1] = this.value/100; renderScene();});
  document.getElementById('blue').addEventListener('mousemove', function() {g_lightColor[2] = this.value/100; renderScene();});

  document.getElementById('spotlightOn').onclick = function() {g_spotOn = true;};
  document.getElementById('spotlightOff').onclick = function() {g_spotOn = false;};
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
let g_normalOn = false;
let g_lightPos = [0, 2.5, 0];
let g_camera;
let g_lightOn = true;
let g_lightColor = [1, 1, 1, 1];
let g_spotOn = false;
let g_model;

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

  console.log("STARTING");

  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHTML();

  g_camera = new Camera();

  document.onkeydown = keydown;

  initTextures();
  generateMap();
  g_model = new Model(gl, 'bunny.obj'); // replace with your actual .obj filename
  g_model.color = [1, 1, 1, 1.0];    // any color you want
  g_model.matrix.setTranslate(2, 2, 0);  
  //initGems();
  canvas.onmousedown = onMouseDown;
  canvas.onmouseup = onMouseUp;
  canvas.onmousemove = onMouseMove;
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  requestAnimationFrame(tick);
  renderScene();
}

var g_startTime = performance.now()/1000;
var g_seconds = performance.now()/1000;

let g_lastFrame = 0;
function tick(timestamp){
  if (timestamp - g_lastFrame < 16) { // ~60fps cap
    requestAnimationFrame(tick);
    return;
  }
  g_lastFrame = timestamp;
  updateAnimationAngles();
  renderScene();
  requestAnimationFrame(tick);
}

function updateAnimationAngles(){
  g_seconds = performance.now()/1000 - g_startTime;
  if(g_animation){
    
    g_lightPos[0] = 3 * Math.cos(g_seconds);
    g_lightPos[2] = 3 * Math.sin(g_seconds);
  }
}



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
      // else if ((i == 5 || i == 10 || i == 15 || i == 20) && j % 4 == 0) {
      //   g_map[i][j] = 2;
      // }
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
            if (g_normalOn){
              wall.textureNum = -3;
            }else{
              wall.textureNum = 3;
            }
            //wall.textureNum = 3;
          } else{
            if (g_normalOn){
              wall.textureNum = -3;
            }else{
              wall.textureNum = 2;
            }
            //wall.textureNum = 2;
          }        
          wall.matrix.setTranslate(x - 16, z - 0.75, y - 16);
          wall.renderfaster();
        }
      }
    }
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
  
  // if (moved) {
  //   checkGemCollection();
  // }
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
  globalRotMat.rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotation, false, globalRotMat.elements);

  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);
  gl.uniform1i(u_lightOn, g_lightOn);
  gl.uniform3f(u_lightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2]);  

  gl.uniform3f(u_spotDirection, 0, -1, 0);       // pointing downward
  gl.uniform1f(u_spotCutoff, Math.cos(Math.PI/6)); // 30 degree cone
  gl.uniform1i(u_spotOn, g_spotOn ? 1 : 0);

  startTime = performance.now();
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  drawMap();
  //drawGems();
  let floor = new Cube();
  floor.color = [1, 0, 0, 1];
  if (g_normalOn){
    floor.textureNum = -3;
  }else{
    floor.textureNum = 1;
  }
  //floor.textureNum = 1;
  floor.matrix.translate(0, -0.25, 0);
  floor.matrix.scale(32, 0.01, 32);
  floor.matrix.translate(-0.5, 0, -0.5);
  floor.renderfaster();

  let sky = new Cube();
  sky.color = [0, 0, 1, 1];
  if (g_normalOn){
    sky.textureNum = -3;
  }else{
    sky.textureNum = 0;
  }
  sky.matrix.scale(-100, -100, -100);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.renderfaster();

  //g_model.render(gl, program);
  if (g_model && g_model.isFullyLoaded) {
    gl.uniform1i(u_whichTexture, g_normalOn ? -3 : -2);
    gl.disableVertexAttribArray(a_UV);
    g_model.matrix.setTranslate(-2, -0.2, 0);
    g_model.matrix.scale(0.2, 0.2, 0.2);
    g_model.render(gl, {
        a_Position: a_Position,
        a_Normal:   a_Normal,
        u_ModelMatrix:  u_ModelMatrix,
        u_NormalMatrix: u_NormalMatrix,
        u_FragColor:    u_FragColor
    });
    gl.enableVertexAttribArray(a_UV);
}


  let light = new Cube();
  light.color = [2, 2, 0, 1];
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-0.1, -0.1, -0.1);
  light.matrix.translate(-0.5, -0.5, -0.5);
  light.renderfaster();

  let sphere = new Sphere();
  sphere.color = [1, 1, 1, 1];
  if (g_normalOn){
    sphere.textureNum = -3;
  } else {
    sphere.textureNum = -2;
  }
  //cube.matrix.translate(3.5, -0.8 + 1, 0);
  //cube.matrix.scale(2, 2, 2);
  sphere.matrix.translate(0, 0.3, 0);
  sphere.matrix.scale(0.5, 0.5, 0.5);
  sphere.render();
  

  //drawAnimal();

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