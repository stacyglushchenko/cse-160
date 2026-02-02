class Cube{
    constructor(){
        this.type = "cube";
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }
    render(){
        drawCube(this.matrix, this.color);
    }
}

function drawCube(matrix, color) {
  const rgba = color;

  gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);
  // FRONT 
  gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  drawTriangle3D([0,0,0,  1,1,0,  1,0,0]);
  drawTriangle3D([0,0,0,  0,1,0,  1,1,0]);

  // TOP (0.9)
  gl.uniform4f(u_FragColor,
    rgba[0] * 0.9,
    rgba[1] * 0.9,
    rgba[2] * 0.9,
    rgba[3]
  );
  drawTriangle3D([0,1,0,  0,1,1,  1,1,1]);
  drawTriangle3D([0,1,0,  1,1,1,  1,1,0]);

  // RIGHT (0.8)
  gl.uniform4f(u_FragColor,
    rgba[0] * 0.8,
    rgba[1] * 0.8,
    rgba[2] * 0.8,
    rgba[3]
  );
  drawTriangle3D([1,0,0,  1,1,0,  1,1,1]);
  drawTriangle3D([1,0,0,  1,0,1,  1,1,1]);

  // LEFT (0.8)
  gl.uniform4f(u_FragColor,
    rgba[0] * 0.8,
    rgba[1] * 0.8,
    rgba[2] * 0.8,
    rgba[3]
  );
  drawTriangle3D([0,0,0,  0,1,0,  0,1,1]);
  drawTriangle3D([0,0,0,  0,1,1,  0,0,1]);

  // BOTTOM (0.8)
  gl.uniform4f(u_FragColor,
    rgba[0] * 0.8,
    rgba[1] * 0.8,
    rgba[2] * 0.8,
    rgba[3]
  );
  drawTriangle3D([0,0,0,  0,1,0,  0,1,1]);
  drawTriangle3D([0,0,0,  0,1,1,  0,0,1]);

  // BACK (full color)
  gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  drawTriangle3D([0,0,1,  0,1,1,  1,1,1]);
  drawTriangle3D([0,0,1,  1,1,1,  1,0,1]);
}