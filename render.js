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
        this.isRendering=false;
        this.canvasD = document.getElementById(canvasName);

        this.canvasD.onclick = ()=>{
            this.canvasD.requestPointerLock();
        };

        //this.canvasD = document.createElement("canvas");
        this.ctx = this.canvasD.getContext('2d');
        this.framerate=framerate;

        this.cw=this.canvasD.width;
        this.ch=this.canvasD.height;

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
        cam1.pos.move(-40,0,-60);

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
        //console.log(e);
        switch(e.code){
            case "keyP":
                if(env.isRendering == false)
                    env.startRendering();
                else
                    env.stopRendering();
                break;
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

    convert3dcoord(v,camera,cw,ch){
        //this.currentCamera.pos.toVertex(e.pos).sum(face.vertex_list[0])
        v.rotateAxis(camera.axis);
        console.log("====");
        console.log(v);
        //if(v.defaultAngle() <= this.currentCamera.fov/2)
        var angl=Vertex.prototype._defaultAngle(v.x,v.y,v.z);
        var xz=angl[0];
        var yz=angl[1];
        console.log("angulos",angl);
        //var angl = v.escalar(this.currentCamera.tiltUnit);
        if(v.x < 0)
            xz*=-1;
        if(v.y < 0)
            yz*=-1;

        var fovX,fovY;
        if(cw > ch){
            fovX = camera.fov;
            fovY = camera.fov * ch / cw;
        }else if(ch > cw){
            fovY = camera.fov;
            fovX = camera.fov * cw / ch;
        }else{
            fovX = camera.fov;
            fovY = camera.fov;
        }
        
        var fx = Math.round( ((cw/(2*fovX)) * xz) ) + (cw/2);
        var fy = Math.round( ((ch/(2*fovY)) * yz) ) + (ch/2);
        //console.log(cw,fovX,xz);
        //console.log(ch,fovY,yz);
        console.log(fx,fy);
        return new Point(fx,fy,0);
    };
    resizeCanvas(env){
        if(!env)
            env=this;
        env.canvasD.width = env.canvasD.clientWidth;
        env.canvasD.height = env.canvasD.clientHeight;
        env.cw=env.canvasD.width;
        env.ch=env.canvasD.height;
        if(env.cw > env.ch){
            env.fovX = env.fov;
            env.fovY = env.fov * env.ch / env.cw;
        }else if(env.ch > env.cw){
            env.fovY = env.fov;
            env.fovX = env.fov * env.cw / env.ch;
        }else{
            env.fovX = env.fov;
            env.fovY = env.fov;
        }
    };
    startRendering(){
        this.rendering = setInterval(()=>{
            // Background
            this.ctx.fillStyle = "#000000";
            this.ctx.fillRect(0,0,this.canvasD.width,this.canvasD.height);
            

            this.objects.forEach(e => {
                var bfc=false;
                e.faces.forEach(face => {
                    var cpos=e.pos.toVertex(this.currentCamera.pos);
                    //console.log(ce);
                    var ef=face.normal.newRotateAxis(e.axis);
                    //console.log(ef);
                    ef=ef.mult(face.direction);
                    //console.log(ef);
                    bfc = cpos.escalar(ef);
                    //console.log(bfc);
                    if(bfc > 0){
                        this.ctx.fillStyle = face.color;
                        this.ctx.beginPath();
                        //var cpos = ce.mult(-1);

                        console.log("GO");
                        console.log(face);
                        
                        var pos;
                        var pos1 = this.convert3dcoord(
                            cpos.sum(face.vertex_list[0]).newRotateAxis(e.axis,-1),
                            this.currentCamera,this.cw,this.ch
                            );
                        console.log(this.currentCamera.pos);
                        console.log(pos1);
                        this.ctx.moveTo(pos1.x,pos1.y);
                        for(var vertex=1;vertex < face.vertex_list.length;vertex++){
                            pos = this.convert3dcoord(
                                cpos.sum(face.vertex_list[vertex]).newRotateAxis(e.axis,-1),
                                this.currentCamera,this.cw,this.ch
                                );
                            console.log(pos);
                            this.ctx.lineTo(pos.x,pos.y);
                        }
                        this.ctx.lineTo(pos1.x,pos1.y);
                        this.ctx.fill();
                    }else{
                        //console.log("\\/\\/\\/");
                        //console.log("BFC");
                        //console.log(face);
                        //console.log("BFC");
                        //console.log("^^^^");
                    }
                });
            });

            //FPS
            this.ctx.fillStyle = "#FFFFFF";
            this.ctx.font = "20px Verdana";
            this.ctx.fillText(this.floatFps+" fps",10,20);
            
            this.fps++;
            this.isRendering=true;
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
        this.isRendering=false;
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