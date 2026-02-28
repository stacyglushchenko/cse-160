// prettier-ignore
class Model {
    /**
     * @param {WebGLRenderingContext} gl
     * @param {string} filePath 
     */
    constructor(gl, filePath) {
        this.gl = gl;
        this.filePath = filePath;
        this.color = [1, 1, 1, 1];
        this.matrix = new Matrix4();
        this.isFullyLoaded = false;

        this.vertexBuffer = null;
        this.normalBuffer = null;
        this.modelData = null;

        this.getFileContent().then(() => {
            this.vertexBuffer = gl.createBuffer();
            this.normalBuffer = gl.createBuffer();

            if (!this.vertexBuffer || !this.normalBuffer) {
                console.error("Failed to create buffer for", this.filePath);
                return;
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.modelData.vertices, gl.STATIC_DRAW);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.modelData.normals, gl.STATIC_DRAW);
            this.isFullyLoaded = true;

            console.log(`Model loaded: ${this.filePath} | Triangles: ${this.modelData.vertices.length / 9}`);
        }).catch(e => console.error(e));
    }

    parseModel(fileContent) {
        const lines = fileContent.split("\n");
        const allVertices = [];
        const allNormals = [];
        const unpackedVerts = [];
        const unpackedNormals = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || line.startsWith('#')) continue;

            const tokens = line.split(/\s+/);
            const type = tokens[0];

            if (type === 'v') {
                allVertices.push(
                    parseFloat(tokens[1]),
                    parseFloat(tokens[2]),
                    parseFloat(tokens[3])
                );
            } else if (type === 'vn') {
                allNormals.push(
                    parseFloat(tokens[1]),
                    parseFloat(tokens[2]),
                    parseFloat(tokens[3])
                );
            } else if (type === 'f') {
                // Support triangles AND quads (fan triangulation)
                const faceTokens = tokens.slice(1);
                for (let t = 1; t < faceTokens.length - 1; t++) {
                    for (const faceToken of [faceTokens[0], faceTokens[t], faceTokens[t + 1]]) {
                        const indices = faceToken.split('//');
                        const vIdx = (parseInt(indices[0]) - 1) * 3;
                        const nIdx = (parseInt(indices[1]) - 1) * 3;

                        unpackedVerts.push(
                            allVertices[vIdx],
                            allVertices[vIdx + 1],
                            allVertices[vIdx + 2]
                        );
                        unpackedNormals.push(
                            allNormals[nIdx],
                            allNormals[nIdx + 1],
                            allNormals[nIdx + 2]
                        );
                    }
                }
            }
        }

        this.modelData = {
            vertices: new Float32Array(unpackedVerts),
            normals: new Float32Array(unpackedNormals)
        };
        //this.isFullyLoaded = true;
    }

    /**
     * Render the model. Call this every frame inside your render loop.
     * @param {WebGLRenderingContext} gl
     * @param {object} program - object with attribute/uniform locations, e.g.:
     *   program.a_Position, program.a_Normal,
     *   program.u_ModelMatrix, program.u_NormalMatrix, program.u_FragColor
     */
    render(gl, program) {
        if (!this.isFullyLoaded || !this.vertexBuffer) return;

        //gl.disableVertexAttribArray(a_UV);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(program.a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(program.a_Position);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(program.a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(program.a_Normal);

        gl.uniformMatrix4fv(program.u_ModelMatrix, false, this.matrix.elements);

        const normalMatrix = new Matrix4();
        normalMatrix.setInverseOf(this.matrix);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(program.u_NormalMatrix, false, normalMatrix.elements);

        gl.uniform4fv(program.u_FragColor, this.color);

        gl.drawArrays(gl.TRIANGLES, 0, this.modelData.vertices.length / 3);
    }

    async getFileContent() {
        const response = await fetch(this.filePath);
        if (!response.ok) {
            throw new Error(`Could not load "${this.filePath}". Check the file path.`);
        }
        const text = await response.text();
        this.parseModel(text);
    }
}