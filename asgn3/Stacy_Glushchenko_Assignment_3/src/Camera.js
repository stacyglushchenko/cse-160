class Camera{
    constructor(){
        this.fov = 60;
        this.eye = new Vector3([0, 0, 1]);
        this.at = new Vector3([0, 0, -100]);
        this.up = new Vector3([0, 1, 0]);
        this.viewMatrix = new Matrix4();
        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0],  this.at.elements[1],  this.at.elements[2],
            this.up.elements[0],  this.up.elements[1],  this.up.elements[2]
        );
        this.projMat = new Matrix4();
        this.projMat.setPerspective(50, canvas.width/canvas.height, 0.1, 1000);

        //gl.uniformMatrix4fv(u_ViewMatrix, false, this.viewMatrix.elements);
    }
    forward(){
        var f = new Vector3();
        f.elements[0] = this.at.elements[0] - this.eye.elements[0];
        f.elements[1] = this.at.elements[1] - this.eye.elements[1];
        f.elements[2] = this.at.elements[2] - this.eye.elements[2];

        f.normalize();

        this.eye.elements[0] += f.elements[0];
        this.eye.elements[1] += f.elements[1];
        this.eye.elements[2] += f.elements[2];

        // let nextX = this.eye.elements[0] + f.elements[0];
        // let nextY = this.eye.elements[1] + f.elements[1];
        // let nextZ = this.eye.elements[2] + f.elements[2];

        // if (!isColliding(nextX, nextZ)){
        //     this.eye.elements[0] += f.elements[0];
        //     this.eye.elements[1] += f.elements[1];
        //     this.eye.elements[2] += f.elements[2];
        // }

        this.at.elements[0] += f.elements[0];
        this.at.elements[1] += f.elements[1];
        this.at.elements[2] += f.elements[2];

        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0],  this.at.elements[1],  this.at.elements[2],
            this.up.elements[0],  this.up.elements[1],  this.up.elements[2]
        );
    }

    back(){
        var f = new Vector3();
        f.elements[0] = this.at.elements[0] - this.eye.elements[0];
        f.elements[1] = this.at.elements[1] - this.eye.elements[1];
        f.elements[2] = this.at.elements[2] - this.eye.elements[2];

        f.normalize();

        this.eye.elements[0] -= f.elements[0];
        this.eye.elements[1] -= f.elements[1];
        this.eye.elements[2] -= f.elements[2];

        this.at.elements[0] -= f.elements[0];
        this.at.elements[1] -= f.elements[1];
        this.at.elements[2] -= f.elements[2];

        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0],  this.at.elements[1],  this.at.elements[2],
            this.up.elements[0],  this.up.elements[1],  this.up.elements[2]
        );
    }

    left(){
        var f = new Vector3();
        f.elements[0] = this.at.elements[0] - this.eye.elements[0];
        f.elements[1] = this.at.elements[1] - this.eye.elements[1];
        f.elements[2] = this.at.elements[2] - this.eye.elements[2];

        var s = new Vector3();
        s.elements[0] = f.elements[1] * this.up.elements[2] - f.elements[2] - this.up.elements[1];
        s.elements[1] = f.elements[2] * this.up.elements[0] - f.elements[0] - this.up.elements[2];
        s.elements[2] = f.elements[0] * this.up.elements[1] - f.elements[1] - this.up.elements[0];

        s.normalize();

        this.eye.elements[0] -= s.elements[0];
        this.eye.elements[1] -= s.elements[1];
        this.eye.elements[2] -= s.elements[2];

        this.at.elements[0] -= s.elements[0];
        this.at.elements[1] -= s.elements[1];
        this.at.elements[2] -= s.elements[2];

        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0],  this.at.elements[1],  this.at.elements[2],
            this.up.elements[0],  this.up.elements[1],  this.up.elements[2]
        );
    }

    right(){
        var f = new Vector3();
        f.elements[0] = this.at.elements[0] - this.eye.elements[0];
        f.elements[1] = this.at.elements[1] - this.eye.elements[1];
        f.elements[2] = this.at.elements[2] - this.eye.elements[2];

        var s = new Vector3();
        s.elements[0] = f.elements[1] * this.up.elements[2] - f.elements[2] - this.up.elements[1];
        s.elements[1] = f.elements[2] * this.up.elements[0] - f.elements[0] - this.up.elements[2];
        s.elements[2] = f.elements[0] * this.up.elements[1] - f.elements[1] - this.up.elements[0];

        s.normalize();

        this.eye.elements[0] += s.elements[0];
        this.eye.elements[1] += s.elements[1];
        this.eye.elements[2] += s.elements[2];

        this.at.elements[0] += s.elements[0];
        this.at.elements[1] += s.elements[1];
        this.at.elements[2] += s.elements[2];

        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0],  this.at.elements[1],  this.at.elements[2],
            this.up.elements[0],  this.up.elements[1],  this.up.elements[2]
        );
    }

    panLeft(){
        var f = new Vector3();
        f.elements[0] = this.at.elements[0] - this.eye.elements[0];
        f.elements[1] = this.at.elements[1] - this.eye.elements[1];
        f.elements[2] = this.at.elements[2] - this.eye.elements[2];

        var alpha = 5;
        var r = new Matrix4();
        r.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let f_prime = new Vector3();
        f_prime = r.multiplyVector3(f);


        this.at.elements[0] = this.eye.elements[0] + f_prime.elements[0];
        this.at.elements[1] = this.eye.elements[1] + f_prime.elements[1];
        this.at.elements[2] = this.eye.elements[2] + f_prime.elements[2];

        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0],  this.at.elements[1],  this.at.elements[2],
            this.up.elements[0],  this.up.elements[1],  this.up.elements[2]
        );
    }

    panRight(){
        var f = new Vector3();
        f.elements[0] = this.at.elements[0] - this.eye.elements[0];
        f.elements[1] = this.at.elements[1] - this.eye.elements[1];
        f.elements[2] = this.at.elements[2] - this.eye.elements[2];

        var alpha = 5;
        var r = new Matrix4();
        r.setRotate(-alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let f_prime = new Vector3();
        f_prime = r.multiplyVector3(f);


        this.at.elements[0] = this.eye.elements[0] + f_prime.elements[0];
        this.at.elements[1] = this.eye.elements[1] + f_prime.elements[1];
        this.at.elements[2] = this.eye.elements[2] + f_prime.elements[2];

        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0],  this.at.elements[1],  this.at.elements[2],
            this.up.elements[0],  this.up.elements[1],  this.up.elements[2]
        );
    }

    panMouse(alpha){
        var f = new Vector3();
        f.elements[0] = this.at.elements[0] - this.eye.elements[0];
        f.elements[1] = this.at.elements[1] - this.eye.elements[1];
        f.elements[2] = this.at.elements[2] - this.eye.elements[2];

        var r = new Matrix4();
        r.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let f_prime = new Vector3();
        f_prime = r.multiplyVector3(f);


        this.at.elements[0] = this.eye.elements[0] + f_prime.elements[0];
        this.at.elements[1] = this.eye.elements[1] + f_prime.elements[1];
        this.at.elements[2] = this.eye.elements[2] + f_prime.elements[2];

        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0],  this.at.elements[1],  this.at.elements[2],
            this.up.elements[0],  this.up.elements[1],  this.up.elements[2]
        );

    }
}

// function isColliding(nextX, nextZ) {
//     console.log("in colision function")
//     let playerRadius = 0.2; 
//     for (let i = 0; i < walls.length; i++) {
//       let wall = walls[i];
//       if (
//         nextX + playerRadius > wall.x - 0.5 &&
//         nextX - playerRadius < wall.x + 0.5 &&
//         nextZ + playerRadius > wall.z - 0.5 &&
//         nextZ - playerRadius < wall.z + 0.5
//       ) {
//         console.log("is coliding");
//         return true;  // collision!
//       }
//     }
//     return false;
//   }