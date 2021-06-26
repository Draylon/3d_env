import { Axis } from './axis.js';
import { loadFile } from './functions.js';
import { Point } from './point.js';

import { Vertex } from './vertex.js';

class Face{
    constructor(data_list,color,direction){
        this.vertex_list=[];
        this.color=color;
        this.normal=null;
        this.center=null;
        this.direction=direction;

        data_list.forEach(list => {
            this.vertex_list.push(new Vertex(list[0],list[1],list[2]));
        });

        this.center = Vertex.prototype.avg(this.vertex_list);
        var v1 = this.center.toPoint().toVertex(this.vertex_list[0].toPoint());
        var v2 = this.center.toPoint().toVertex(this.vertex_list[1].toPoint());
        this.normal=v1.cross(v2);
        if(this.normal.escalar(this.center) < 0){
            
            v1 = this.center.toPoint().toVertex(this.vertex_list[1].toPoint());
            v2 = this.center.toPoint().toVertex(this.vertex_list[0].toPoint());
            this.normal=v1.cross(v2);
        }
        this.normal.unit();
    }
};

class Environment{
    constructor(canvasName,framerate){
        console.enableConsole=true;
        console.clog = (t)=>{
            if(console.enableConsole)
                console.log(t);
        };

        this.canvasD = document.getElementById(canvasName);

        this.canvasD.onclick = ()=>{
            this.canvasD.requestPointerLock();
        };

        //this.canvasD = document.createElement("canvas");
        this.ctx = this.canvasD.getContext('2d');
        this.framerate=framerate;

        this.fps=0;
        this.floatFps=0;
        this.cursorLock=false;
        
        this.objects = [];
        this.cameras = [];
        this.currentCamera = null;

        this.objects.push(new GenericShape());
        this.cameras.push(new Camera());

        var cam1 = this.cameras[0];
        var ob1 = this.objects[0];
        this.currentCamera=cam1;
        ob1.pos.move(0,0,25);
        cam1.pos.move(-65,0,-10);

        this.resizeCanvas();
        window.addEventListener("resize",()=>{this.resizeCanvas(this)});
        window.addEventListener("keydown",(e)=>{this.keyDown(this,e)});
        window.addEventListener("mousemove", (e)=>{this.mouseMove(this,e)}, false);
        document.addEventListener('pointerlockchange', ()=>{this.lockChange(this)}, false);
    };
    lockChange(env){
        env.cursorLock=!env.cursorLock;
    }
    mouseMove(env,e){
        if(env.cursorLock){
            var movementX = e.movementX ||e.mozMovementX||e.webkitMovementX||0;
            var movementY = e.movementY ||e.mozMovementY||e.webkitMovementY||0;
            if(movementX != 0){
                movementX*=env.currentCamera.sensitivity;
                if(movementY != 0){
                    movementY*=env.currentCamera.sensitivity;
                    env.currentCamera.axis.tiltXY(-movementX,-movementY);
                }else{
                    env.currentCamera.axis.tiltX(-movementX);
                }
            }else if(movementY != 0){
                movementY*=env.currentCamera.sensitivity;
                env.currentCamera.axis.tiltY(-movementY);
            }
        }
    }
    keyDown(env,e){
        //console.clog(e);
        switch(e.code){
            case "keyF":
                env.currentCamera.fieldOfView(-2);
                break;
                case "keyR":
                    env.currentCamera.fieldOfView(2);
                break;
            case "KeyA":
                env.currentCamera.pos.move(-3,0,0);
                break;
            case "KeyD":
                env.currentCamera.pos.move(3,0,0);
                break;
            case "KeyW":
                env.currentCamera.pos.move(0,0,2);
                break;
            case "KeyS":
                env.currentCamera.pos.move(0,0,-2);
                break;
            case "KeyQ":
                env.currentCamera.axis.tiltZ(-env.currentCamera.sensitivity);
                break;
            case "KeyE":
                    env.currentCamera.axis.tiltZ(env.currentCamera.sensitivity);
                break;
            case "Space":
                env.currentCamera.pos.move(0,-2,0);
                break;
            case "ControlLeft":
                env.currentCamera.pos.move(0,2,0);
                break;
        }
    }

    convert3dcoord(v){
        //this.currentCamera.pos.toVertex(e.pos).sum(face.vertex_list[0])
        v.rotateAxis(this.currentCamera.axis);
        //if(v.defaultAngle() <= this.currentCamera.fov/2)
        var xz=Vertex.prototype._defaultAngle(v.x,v.z);
        var yz=Vertex.prototype._defaultAngle(v.y,v.z);
        var angl = v.escalar(this.currentCamera.tiltUnit);
        
        if(angl > 0){
            var m=v.mod();
            v=v.proj(this.currentCamera.tiltUnit);
            v=v.mult(m);
            console.clog(v);

            var pX = (v.x * (40/v.z)),
            pY = (v.y * (40/v.z));
            var cx = this.canvasD.width/2;
            var cy = this.canvasD.height/2;
            return new Point(pX+cx,pY+cy,0);
        }else{
            var m=v.mod();
            v=v.proj(this.currentCamera.tiltUnit.mult(-1));
            v=v.mult(m);
            console.clog(v);

            var pX = (v.x * (40/v.z)),
            pY = (v.y * (40/v.z));
            var cx = this.canvasD.width/2;
            var cy = this.canvasD.height/2;
            return new Point(pX+cx,pY+cy,0);
        }
    };
    resizeCanvas(env){
        if(!env)
            env=this;
        env.canvasD.width = env.canvasD.clientWidth;
        env.canvasD.height = env.canvasD.clientHeight;
    };
    startRendering(){
        this.rendering = setInterval(()=>{
            // Background
            this.ctx.fillStyle = "#000000";
            this.ctx.fillRect(0,0,this.canvasD.width,this.canvasD.height);
            

            this.objects.forEach(e => {
                var bfc=false;
                e.faces.forEach(face => {
                    var ce=e.pos.toVertex(this.currentCamera.pos);
                    var ef=face.normal.newRotateAxis(e.axis).mult(face.direction);
                    bfc = ce.escalar(ef);
                    if(bfc > 0){
                        this.ctx.fillStyle = face.color;
                        this.ctx.beginPath();
                        var cpos = ce.mult(-1);

                        console.clog("GO");
                        console.clog(face);
                        
                        var pos;
                        var pos1 = this.convert3dcoord(
                            cpos.sum(face.vertex_list[0].newRotateAxis(e.axis))
                            );
                        console.clog(pos1);
                        this.ctx.moveTo(pos1.x,pos1.y);
                        for(var vertex=1;vertex < face.vertex_list.length;vertex++){
                            pos = this.convert3dcoord(
                                cpos.sum(face.vertex_list[vertex].newRotateAxis(e.axis))
                                );
                            console.clog(pos);
                            this.ctx.lineTo(pos.x,pos.y);
                        }
                        this.ctx.lineTo(pos1.x,pos1.y);
                        this.ctx.fill();
                    }else{
                        console.clog("\\/\\/\\/");
                        console.clog("BFC");
                        console.clog(face);
                        console.clog("BFC");
                        console.clog("^^^^");
                    }
                });
            });

            //FPS
            this.ctx.fillStyle = "#FFFFFF";
            this.ctx.font = "20px Verdana";
            this.ctx.fillText(this.floatFps+" fps",10,20);
            
            this.fps++;
            this.stopRendering();
        },this.framerate < 60 && this.framerate > 0 ? 1000/this.framerate : 15);
    
        this.fpsCount = setInterval(()=>{
            this.floatFps=this.fps;
            this.fps=0;
        },1000);
    }

    stopRendering(){
        clearInterval(this.rendering);
        clearInterval(this.fpsCount);
    }
};


class BaseObject {
    constructor(){
        this.pos = new Point(0,0,0); // position
        this.axis = new Axis(0,0,0);
        this.faces=[];
    }
    rotationVector(){
        return new Vertex(0,0,1).rotateAxis(this.axis);
    }
};

class GenericShape extends BaseObject{
    constructor(){
        super();
        
        var file = loadFile('/models/closed_box.txt');
        file = eval(file);
        var poly = file[0];
        var colors=file[1];
        var bfc=file[2];
        this.faces=[];
        for(var face=0;face < poly.length;face++)
            this.faces.push(new Face(
                    poly[face],
                    colors[face],
                    bfc[face],
                )
            );
    };
}

class Camera extends BaseObject{
    constructor(){
        super();
        this.fov=90;
        this.sensitivity=0.03;
        this.target=null; // Qualquer objeto BaseObject
    }
    tilt(){
        return this.tiltUnit.mult(this.f);
    }
    fieldOfView(n){
        if(n > 0)
            this.fov = this.fov +2 > 360 ? 0 : this.fov + 2;
        else if(n < 0)
            this.fov = this.fov -2 > 0 ? 360 : this.fov - 2;
    }
};


window.RenderJS = {Environment,BaseObject,Camera,Vertex,Face};