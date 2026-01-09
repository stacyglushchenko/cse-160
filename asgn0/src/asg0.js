// DrawTriangle.js (c) 2012 matsuda
function main() {  
  // Retrieve <canvas> element
  canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  ctx = canvas.getContext('2d');

  // Draw a blue rectangle
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to blue
  ctx.fillRect(0, 0, canvas.width, canvas.height);        // Fill a rectangle with the color
}

function drawVector(v, color){
  let cx = canvas.width/2;
  let cy = canvas.height/2;
  let endx = cx + v.elements[0] * 20;
  let endy = cy - v.elements[1] * 20;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(endx, endy);
  ctx.strokeStyle = color;
  ctx.stroke();
}

function handleDrawEvent(){
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to black
  ctx.fillRect(0, 0, canvas.width, canvas.height); 

  let x1 = parseFloat(document.getElementById("x1").value) || 0;
  let y1 = parseFloat(document.getElementById("y1").value) || 0;
  v1 = new Vector3([x1, y1, 0]);
  drawVector(v1, "red")

  let x2 = parseFloat(document.getElementById("x2").value) || 0;
  let y2 = parseFloat(document.getElementById("y2").value) || 0;
  v2 = new Vector3([x2, y2, 0]);
  drawVector(v2, "blue")
}

function handleDrawOperationEvent(){
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to black
  ctx.fillRect(0, 0, canvas.width, canvas.height); 
  
  let x1 = parseFloat(document.getElementById("x1").value) || 0;
  let y1 = parseFloat(document.getElementById("y1").value) || 0;
  v1 = new Vector3([x1, y1, 0]);
  drawVector(v1, "red")

  let x2 = parseFloat(document.getElementById("x2").value) || 0;
  let y2 = parseFloat(document.getElementById("y2").value) || 0;
  v2 = new Vector3([x2, y2, 0]);
  drawVector(v2, "blue")

  let operation = document.getElementById("select").value;

  if (operation == "add"){
    v3 = v1.add(v2);
    drawVector(v3, "green");
  } else if (operation == "subtract"){
    v3 = v1.sub(v2);
    drawVector(v3, "green");
  } else if (operation == "multiply"){
    let scalar = document.getElementById("scalar").value;
    v3 = v1.mul(scalar);
    v4 = v2.mul(scalar);
    drawVector(v3, "green");
    drawVector(v4, "green");
  } else if (operation == "divide"){
    let scalar = document.getElementById("scalar").value;
    v3 = v1.div(scalar);
    v4 = v2.div(scalar);
    drawVector(v3, "green");
    drawVector(v4, "green");
  } else if (operation == "magnitude"){
    mag1 = v1.magnitude();
    mag2 = v2.magnitude();
    console.log("Magnitude v1: " + mag1);
    console.log("Magnitude v2: " + mag2);
  } else if (operation == "normalize"){
    norm1 = v1.normalize();
    norm2 = v2.normalize();
    drawVector(v1, "green");
    drawVector(v2, "green");
  } else if (operation == "angle"){
    angleBetween(v1, v2);
  } else if (operation == "area"){
    areaTriangle(v1, v2);
  }
}

function angleBetween(v1, v2){
  dot = Vector3.dot(v1, v2);
  mag1 = v1.magnitude();
  mag2 = v2.magnitude();
  angle = Math.acos(dot/(mag1 * mag2));
  angle = angle * (180/Math.PI);
  console.log("Angle:" + angle);
}

function areaTriangle(v1, v2){
  cross = Vector3.cross(v1, v2);
  area = cross.magnitude();
  console.log("Area of Triangle: " + area/2);
}
