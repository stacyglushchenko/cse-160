class Circle{
    constructor(){
        this.type = "circle";
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
        this.segments = 10;
    }
    render(){
        drawCircle(this.position, this.color, this.size, this.segments);
        // var xy = this.position;
        // var rgba = this.color;
        // var size = this.size;
    
        // // Pass the position of a point to a_Position variable
        // //gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
        // // Pass the color of a point to u_FragColor variable
        // gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    
        // // Draw
        // var d = this.size/200.0
        // var angleStep = 360/this.segments

        // for (var angle = 0; angle < 360; angle += angleStep){
        //     let center = [xy[0], xy[1]];
        //     let angle1 = angle;
        //     let angle2 = angle + angleStep;
        //     let vector1 = [Math.cos(angle1 * Math.PI/180)*d, Math.sin(angle1 * Math.PI/180)*d];
        //     let vector2 = [Math.cos(angle2 * Math.PI/180)*d, Math.sin(angle2 * Math.PI/180)*d];
        //     let pt1 = [center[0] + vector1[0], center[1] + vector1[1]];
        //     let pt2 = [center[0] + vector2[0], center[1] + vector2[1]];
        //     drawTriangle([xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1]]);
        // }
    }
}

function drawCircle(position, color, size, segments){
    var xy = position;
    var rgba = color;
    var size = size;

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Draw
    var d = size/200.0
    var angleStep = 360/segments

    for (var angle = 0; angle < 360; angle += angleStep){
        let center = [xy[0], xy[1]];
        let angle1 = angle;
        let angle2 = angle + angleStep;
        let vector1 = [Math.cos(angle1 * Math.PI/180)*d, Math.sin(angle1 * Math.PI/180)*d];
        let vector2 = [Math.cos(angle2 * Math.PI/180)*d, Math.sin(angle2 * Math.PI/180)*d];
        let pt1 = [center[0] + vector1[0], center[1] + vector1[1]];
        let pt2 = [center[0] + vector2[0], center[1] + vector2[1]];
        drawTriangle([xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1]]);
    }
}
