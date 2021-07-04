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
    constructor(canvasContainer,framerate){
        this.enableRendering=false;
        this.container = canvasContainer;
        this.canvasD = document.createElement("canvas");
        this.canvasD.width=1920;
        this.canvasD.height=1080;
        this.canvasD.style = "position: absolute;top: 0;left: 0;width: 100%;height: 100%;";
        this.canvasF = document.createElement("canvas");
        this.canvasF.width=300;
        this.canvasF.height=150;
        this.canvasF.style = "position: absolute;top: 0;left: 0;";

        this.canvasD.onclick = ()=>{
            this.canvasD.requestPointerLock();
        };

        //this.canvasD = document.createElement("canvas");
        this.ctx = this.canvasD.getContext('2d');
        this.fps_ctx = this.canvasF.getContext('2d');
        this.framerate=framerate;

        this.cw=this.canvasD.width;
        this.ch=this.canvasD.height;

        this.fps=0;
        this.floatFps=0;
        this.cursorLock=false;
        
        this.objects = [];
        this.cameras = [];
        this.currentCamera = null;
        
        canvasContainer.append(this.canvasD);
        canvasContainer.append(this.canvasF);

        this.resizeCanvas();
        window.addEventListener("resize",this.resizeCanvas.bind(this));
        window.addEventListener("keydown",this.keyDown.bind(this));
        window.addEventListener("mousemove",this.mouseMove.bind(this), false);
        document.addEventListener('pointerlockchange',this.lockChange.bind(this), false);
    };
    addObject(object){
        this.objects.push(object);
        return object;
    };
    addCamera(cam){
        this.cameras.push(cam);
        return cam;
    };
    lockChange(){
        this.cursorLock=!this.cursorLock;
    };
    mouseMove(e){
        if(this.cursorLock){
            var movementX = e.movementX ||e.mozMovementX||e.webkitMovementX||0;
            var movementY = e.movementY ||e.mozMovementY||e.webkitMovementY||0;
            if(movementX != 0){
                movementX*=this.currentCamera.sensitivity;
                if(movementY != 0){
                    movementY*=this.currentCamera.sensitivity;
                    this.currentCamera.axis.tiltYZ(-movementX,movementY);
                }else{
                    this.currentCamera.axis.tiltY(-movementX);
                }
            }else if(movementY != 0){
                movementY*=this.currentCamera.sensitivity;
                this.currentCamera.axis.tiltZ(movementY);
            }
        }
    };
    //input -> acao
    //x -> z | y -> x | z -> y
    keyDown(e){
        //console.log(e.code);
        switch(e.code){
            case "KeyP":
                if(this.enableRendering == false)
                    this.startRendering();
                else
                    this.stopRendering();
                break;
            case "KeyF":
                this.currentCamera.fieldOfView(-2);
                break;
                case "KeyR":
                this.currentCamera.fieldOfView(2);
                break;
            case "KeyA":
                this.currentCamera.move(-3,0,0);
                break;
            case "KeyD":
                this.currentCamera.move(3,0,0);
                break;
            case "KeyW":
                this.currentCamera.move(0,0,2);
                break;
            case "KeyS":
                this.currentCamera.move(0,0,-2);
                break;
            case "KeyQ":
                this.currentCamera.axis.tiltX(-this.currentCamera.sensitivity);
                break;
            case "KeyE":
                    this.currentCamera.axis.tiltX(this.currentCamera.sensitivity);
                break;
            case "Space":
                this.currentCamera.move(0,-2,0);
                break;
            case "ControlLeft":
                this.currentCamera.move(0,2,0);
                break;
        }
    }

    convert3dcoord(v,camera,cw,ch){
        //this.currentCamera.pos.toVertex(e.pos).sum(face.vertex_list[0])
        v.rotateAxis(camera.axis);
        //console.log("====");
        //console.log(v);
        //if(v.defaultAngle() <= this.currentCamera.fov/2)
        var angl=Vertex.prototype._defaultAngle(v);
        var xz=angl[0];
        var yz=angl[1];
        
        //var angl = v.escalar(this.currentCamera.tiltUnit);
        if(v.x < 0)
            xz*=-1;
        if(v.y < 0)
            yz*=-1;
        //console.log("angulos",xz,yz);
        var fovX,fovY;
        if(cw > ch){
            fovX = camera.fov;
            fovY = camera.fov * ch / cw;
        }else if(ch > cw){
            fovX = camera.fov * cw / ch;
            fovY = camera.fov;
        }else{
            fovX = camera.fov;
            fovY = camera.fov;
        }
        
        var fx = Math.round2( (cw/(2*fovX)) * xz ,3) + (cw/2);
        var fy = Math.round2( (ch/(2*fovY)) * yz ,3) + (ch/2);
        //console.log(cw,fovX,xz);
        //console.log(ch,fovY,yz);
        //console.log(fx,fy);
        return new Point(fx,fy,0);
    };
    resizeCanvas(){
        this.canvasD.width = this.canvasD.clientWidth;
        this.canvasD.height = this.canvasD.clientHeight;
        this.cw=this.canvasD.width;
        this.ch=this.canvasD.height;
        if(this.cw > this.ch){
            this.fovX = this.fov;
            this.fovY = this.fov * this.ch / this.cw;
        }else if(this.ch > this.cw){
            this.fovY = this.fov;
            this.fovX = this.fov * this.cw / this.ch;
        }else{
            this.fovX = this.fov;
            this.fovY = this.fov;
        }
    };
    startRendering(){
        this.enableRendering=true;
        setTimeout(()=>{
            window.requestAnimationFrame(this.render.bind(this));
        },0);
        setTimeout(()=>{
            this.fpsCount = setInterval(()=>{
                if(!this.enableRendering)
                    clearInterval(this.fpsCount);
                this.floatFps=this.fps;
                //FPS
                this.fps_ctx.clearRect(0,0,this.canvasF.width,this.canvasF.height);
                this.fps_ctx.fillStyle = "#FFFFFF";
                this.fps_ctx.font = "20px Verdana";
                this.fps_ctx.fillText(this.floatFps+" fps",10,20);
                this.fps=0;
            },1000);
        },0);
    };
    
    render(){
        // Background
        this.ctx.fillStyle = "#000000";
        //this.ctx.fillRect(0,0,this.canvasD.width,this.canvasD.height);
        this.ctx.clearRect(0,0,this.canvasD.width,this.canvasD.height);
        

        this.objects.forEach(e => {
            var bfc;
            e.faces.forEach(face => {
                
                var cpos=this.currentCamera.pos.toVertex(e.pos).sum(face.center.newRotateAxis(e.axis));
                var epos=this.currentCamera.pos.toVertex(e.pos);
                //console.log(ce);
                if(face.direction == 0){
                    bfc = -1;
                }else{
                    //console.log(ef);
                    bfc = cpos.escalar(face.normal.newRotateAxis(e.axis).mult(face.direction));
                }
                //console.log(bfc);
                if(bfc < 0){
                    this.ctx.fillStyle = face.color;
                    this.ctx.beginPath();

                    //console.log("GO");
                    //console.log(face);
                    
                    var pos;
                    var pos1 = this.convert3dcoord(
                        epos.sum(face.vertex_list[0]).newRotateAxis(e.axis,-1),
                        this.currentCamera,this.cw,this.ch
                        );
                    //console.log(this.currentCamera.pos);
                    //console.log(pos1);
                    this.ctx.moveTo(pos1.x,pos1.y);
                    for(var vertex=1;vertex < face.vertex_list.length;vertex++){
                        pos = this.convert3dcoord(
                            epos.sum(face.vertex_list[vertex]).newRotateAxis(e.axis,-1),
                            this.currentCamera,this.cw,this.ch
                            );
                        //console.log(pos);
                        this.ctx.lineTo(pos.x,pos.y);
                    }
                    this.ctx.lineTo(pos1.x,pos1.y);
                    this.ctx.fill();
                }//else{
                    //console.log("\\/\\/\\/");
                    //console.log("BFC");
                    //console.log(face);
                    //console.log("BFC");
                    //console.log("^^^^");
                //}
            });
        });
        this.fps++;
        if(this.enableRendering)
            window.requestAnimationFrame(this.render.bind(this));
        //this.stopRendering();
    };
    
    

    stopRendering(){
        clearInterval(this.fpsCount);
        this.enableRendering=false;
    }
};


class BaseObject {
    constructor(){
        this.pos = new Point(0,0,0); // position
        this.axis = new Axis(0,0,0);
        this.faces=[];
    }
    move(x,y,z){
        this.pos.moveDirection(new Vertex(x,y,z).newRotateAxis(this.axis,-1));
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
        this.fov=50;
        this.sensitivity=0.03;
        this.target=null; // Qualquer objeto BaseObject
    }
    tilt(){
        return this.tiltUnit.mult(this.f);
    }
    /* move(x,y,z){
        this.pos.moveDirection(new Vertex(x,y,z).newRotateAxis(this.axis,-1));
        if(this.target != null)
            this.axis = 
    } */
    fieldOfView(n){
        if(n > 0)
            this.fov = this.fov +2 > 360 ? 360 : this.fov + 2;
        else if(n < 0)
            this.fov = this.fov -2 < 0 ? 0 : this.fov - 2;
    }
};


window.RenderJS = {Environment,GenericShape,BaseObject,Camera,Face};