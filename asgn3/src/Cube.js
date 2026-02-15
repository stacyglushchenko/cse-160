class Cube{
    constructor(){
        this.type = "cube";
        this.color = [1, 1, 1, 1];
        this.matrix = new Matrix4();
        this.textureNum = -2;
        
        this.cubeVertices = new Float32Array([
          // Front face
          0,0,0,  1,1,0,  1,0,0,
          0,0,0,  0,1,0,  1,1,0,
          
          // Back face
          0,0,1,  0,1,1,  1,1,1,
          0,0,1,  1,1,1,  1,0,1,
          
          // Top face
          0,1,0,  0,1,1,  1,1,1,
          0,1,0,  1,1,1,  1,1,0,
          
          // Bottom face
          0,0,0,  1,0,0,  1,0,1,
          0,0,0,  1,0,1,  0,0,1,
          
          // Left face
          0,0,0,  0,1,0,  0,1,1,
          0,0,0,  0,1,1,  0,0,1,
          
          // Right face
          1,0,0,  1,1,0,  1,1,1,
          1,0,0,  1,1,1,  1,0,1
        ]);

        this.cubeUVs = new Float32Array([
          // Front face
          0,0, 1,1, 1,0,
          0,0, 0,1, 1,1,
          // Back face
          1,1, 1,0, 0,0,
          1,1, 0,0, 0,1,
          // Top face
          0,1, 1,0, 0,0,
          0,1, 0,0, 1,1,
          // Bottom face
          0,0, 1,0, 0,1,
          0,0, 0,1, 1,1,
          // Left face
          0,0, 0,1, 1,0,
          0,0, 1,0, 1,1,
          // Right face
          1,0, 1,1, 0,0,
          1,0, 0,0, 0,1
      ]);
    }
    render(){
        drawCube(this.matrix, this.color, this.textureNum);
    }

    renderfast() {
      var rgba = this.color;

      gl.uniform1i(u_whichTexture, this.textureNum);

      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      // Pass the color of a point to u_FragColor variable

      // Pass the matrix to u_ModelMatrix attribute
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

      var allverts = [];
      // Front of Cube
      allverts = allverts.concat([0,0,0, 1,1,0, 1,0,0 ]);
      allverts = allverts.concat([0,0,0, 0,1,0, 1,1,0 ]);
      // Back
      allverts = allverts.concat([0,0,1, 0,1,1, 1,1,1]);
      allverts = allverts.concat([0,0,1, 0,1,1, 1,1,1]);
      // Top
      allverts = allverts.concat([0,0,1, 0,1,1, 1,1,1 ]);
      allverts = allverts.concat([0,1,1, 0,1,0, 1,1,1 ]);
      // Bottom
      allverts = allverts.concat([0,0,0, 0,0,1, 1,0,0 ]);
      allverts = allverts.concat([1,0,0, 1,0,1, 0,0,1 ]);

      // Left
      allverts = allverts.concat([0,0,0, 0,1,0, 0,1,1 ]);
      allverts = allverts.concat([0,1,1, 0,0,0, 0,0,1 ]);
      // Right
      allverts = allverts.concat([1,0,0, 1,1,0, 1,1,1 ]);
      allverts = allverts.concat([1,1,1, 1,0,0, 1,0,1 ]);
      
      drawTriangle3D(allverts);
    }

    renderfaster(){
      var rgba = this.color;
      gl.uniform1i(u_whichTexture, this.textureNum);
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      // Pass the color of a point to u_FragColor variable

      // Pass the matrix to u_ModelMatrix attribute
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

      if (g_vertexBuffer == null){
        initTriangle3D();
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.cubeVertices, gl.DYNAMIC_DRAW);
      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_Position);
      if (this.textureNum >= 0) {
        gl.bindBuffer(gl.ARRAY_BUFFER, g_uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.cubeUVs), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_UV);
      } else {
        // Disable UV if not using textures
        gl.disableVertexAttribArray(a_UV);
      }
      //gl.disableVertexAttribArray(a_UV);
      gl.drawArrays(gl.TRIANGLES, 0, 36);

    }

}

function drawCube(matrix, color, texture) {
  const rgba = color;
  gl.uniform1i(u_whichTexture, texture);

  gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);
  // FRONT 
  gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  //drawTriangle3DUV([0,0,0,  1,1,0,  1,0,0], [1, 0, 0, 1, 1, 1]);
  drawTriangle3DUV([0,0,0,  1,1,0,  1,0,0], [0, 0, 1, 1, 1, 0]);
  drawTriangle3DUV([0,0,0,  0,1,0,  1,1,0], [0, 0, 0, 1, 1, 1]);

  // TOP (0.9)
  gl.uniform4f(u_FragColor,
    rgba[0] * 0.9,
    rgba[1] * 0.9,
    rgba[2] * 0.9,
    rgba[3]
  );
  drawTriangle3DUV([0,1,0,  0,1,1,  1,1,1], [0, 1, 1, 0, 0, 0]);
  drawTriangle3DUV([0,1,0,  1,1,1,  1,1,0], [0, 1, 0, 0, 1, 1]);

  // RIGHT (0.8)
  gl.uniform4f(u_FragColor,
    rgba[0] * 0.8,
    rgba[1] * 0.8,
    rgba[2] * 0.8,
    rgba[3]
  );
  drawTriangle3DUV([1,0,0,  1,1,0,  1,1,1], [1, 0, 1, 1, 0, 0]);
  drawTriangle3DUV([1,0,0,  1,0,1,  1,1,1], [1, 0, 0, 1, 0, 0]);

  // LEFT (0.8)
  gl.uniform4f(u_FragColor,
    rgba[0] * 0.8,
    rgba[1] * 0.8,
    rgba[2] * 0.8,
    rgba[3]
  );
  drawTriangle3DUV([0,0,0,  0,1,0,  0,1,1], [0, 0, 0, 1, 1, 0]);
  drawTriangle3DUV([0,0,0,  0,1,1,  0,0,1], [0, 0, 1, 0, 1, 1]);

  // BOTTOM (0.8)
  gl.uniform4f(u_FragColor,
    rgba[0] * 0.8,
    rgba[1] * 0.8,
    rgba[2] * 0.8,
    rgba[3]
  );
  drawTriangle3DUV([0,0,0,  1,0,0,  1,0,1], [0, 0, 1, 0, 0, 1]);
  drawTriangle3DUV([0,0,0,  1,0,1,  0,0,1], [0, 0, 0, 1, 1, 1]);

  // BACK (full color)
  gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  drawTriangle3DUV([0,0,1,  0,1,1,  1,1,1], [1, 1, 1, 0, 0, 0]);
  drawTriangle3DUV([0,0,1,  1,1,1,  1,0,1], [1, 1, 0, 0, 0, 1]);
}