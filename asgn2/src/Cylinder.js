class Cylinder{
    constructor(){
        this.type = "cylinder";
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.segments = 12
    }
    render(){
        drawCylinder(this.matrix, this.color, this.segments);
    }
}

function drawCylinder(matrix, color, segments) {
    const rgba = color;
    const r = 0.5;  
    const h = 1.0;    
    const angleStep = 360 / segments;
  
    gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);

    // bottom circle
    gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
  
    for (let angle = 0; angle < 360; angle += angleStep) {
      let a1 = angle * Math.PI / 180;
      let a2 = (angle + angleStep) * Math.PI / 180;
  
      drawTriangle3D([
        0, 0, 0,
        r * Math.cos(a2), 0, r * Math.sin(a2),
        r * Math.cos(a1), 0, r * Math.sin(a1)
      ]);
    }
  
    // top circle
    gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
  
    for (let angle = 0; angle < 360; angle += angleStep) {
      let a1 = angle * Math.PI / 180;
      let a2 = (angle + angleStep) * Math.PI / 180;
  
      drawTriangle3D([
        0, h, 0,
        r * Math.cos(a1), h, r * Math.sin(a1),
        r * Math.cos(a2), h, r * Math.sin(a2)
      ]);
    }
  
    // side
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  
    for (let angle = 0; angle < 360; angle += angleStep) {
      let a1 = angle * Math.PI / 180;
      let a2 = (angle + angleStep) * Math.PI / 180;
  
      let x1 = r * Math.cos(a1);
      let z1 = r * Math.sin(a1);
      let x2 = r * Math.cos(a2);
      let z2 = r * Math.sin(a2);
  
      // quad split into 2 triangles
      drawTriangle3D([
        x1, 0, z1,
        x2, h, z2,
        x1, h, z1
      ]);
  
      drawTriangle3D([
        x1, 0, z1,
        x2, 0, z2,
        x2, h, z2
      ]);
    }
  }
  