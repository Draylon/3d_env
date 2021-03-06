import { Axis } from "./axis.js";
import { Point } from "./point.js";

export class Vertex{
    constructor(x,y,z){
        this.x=x;
        this.y=y;
        this.z=z;
    }
    toPoint(){
        return new Point(this.x,this.y,this.z);
    }
    mod(){
        return Math.sqrt( Math.pow(this.x,2)+Math.pow(this.y,2)+Math.pow(this.z,2) );
    }
    mult(n){
        return new Vertex(this.x*n,this.y*n,this.z*n);
    }
    unit(){
        var dmod=this.mod();
        this.x/=dmod;
        this.y/=dmod;
        this.z/=dmod;
    }
    sum(v){
        return new Vertex(this.x+v.x,this.y+v.y,this.z+v.z);
    };
    subtr(v){
        return new Vertex(this.x-v.x,this.y-v.y,this.z-v.z);
    };
    escalar(v){
        return (this.x*v.x + this.y*v.y+this.z*v.z);
    };
    avg(list){
        var x =0,y=0,z=0;
        list.forEach(vert => {
            x+=vert.x;
            y+=vert.y;
            z+=vert.z;
        });
        return new Vertex(x/list.length,y/list.length,z/list.length);
    };
    cross(v){
        var x = this.y*v.z - this.z*v.y;
        var y = this.z*v.x - this.x*v.z;
        var z = this.x*v.y - this.y*v.x;
        return new Vertex(x,y,z);
    };
    proj(v){
        var dot=this.escalar(v);
        var w1=this.x-v.x,w2=this.y-v.y,w3=this.z-v.z;
        var mag = Math.pow(w1,2) + Math.pow(w2,2) + Math.pow(w3,2);
        var p1=dot/mag*w1,p2=dot/mag*w2,p3=dot/mag*w3;
        
        //var p1=dot/mag * 
        //return v.mult( (this.escalar(v))/(v.escalar(v)) );
        return new Vertex(p1,p2,p3);
    };
    defaultAngle(){
        return Math.round2(Math.acos((this.z) / this.mod())*180/Math.PI , 3);
    };
    _defaultAngle(v){
        var ag=[
            Math.round2(Math.acos(
                (v.z) / Math.sqrt(Math.pow(v.x,2)+Math.pow(v.z,2))
            )*180/Math.PI,3),
            Math.round2(Math.acos(
                (v.z) / Math.sqrt(Math.pow(v.y,2)+Math.pow(v.z,2))
            )*180/Math.PI,3)
        ];
        return ag;
    };
    //=============================
    //x -> z | y -> x | z -> y
    //agora
    // yaw -> z
    // pitch -> x
    // roll -> y

    //fzer
    //yaw -> x
    //pitch -> y
    //roll -> z
    rotateX(yaw){
        var cosa = Math.cos(yaw),sina = Math.sin(yaw);

        var Axx = cosa, Axy =  -sina, Axz = 0;

        var Ayx = sina, Ayy = cosa, Ayz = 0;

        var Azx = 0, Azy = 0, Azz = 1;

        var plx=this.x,ply=this.y,plz=this.z;
        
        this.x = Math.round2(Axx*plx + Axy*ply + Axz*plz,4);
        this.y = Math.round2(Ayx*plx + Ayy*ply + Ayz*plz,4);
        this.z = Math.round2(Azx*plx + Azy*ply + Azz*plz,4);
    };
    rotateY(pitch){
        var cosb = Math.cos(pitch),sinb = Math.sin(pitch);

        var Axx = cosb;
        var Axy = 0;
        var Axz = sinb;

        var Ayx = 0;
        var Ayy = 1;
        var Ayz = 0;

        var Azx = -sinb;
        var Azy = 0;
        var Azz = cosb;

        var plx=this.x,ply=this.y,plz=this.z;
        
        this.x = Math.round2(Axx*plx + Axy*ply + Axz*plz,4);
        this.y = Math.round2(Ayx*plx + Ayy*ply + Ayz*plz,4);
        this.z = Math.round2(Azx*plx + Azy*ply + Azz*plz,4);
    };
    rotateXY(yaw,pitch){
        var cosa = Math.cos(yaw),sina = Math.sin(yaw);
        var cosb = Math.cos(pitch),sinb = Math.sin(pitch);

        var Axx = cosa*cosb;
        var Axy = -sina;
        var Axz = cosa*sinb;

        var Ayx = sina*cosb;
        var Ayy = cosa;
        var Ayz = sina*sinb;

        var Azx = -sinb;
        var Azy = 0;
        var Azz = cosb;

        var plx=this.x,ply=this.y,plz=this.z;
        
        this.x = Math.round2(Axx*plx + Axy*ply + Axz*plz,4);
        this.y = Math.round2(Ayx*plx + Ayy*ply + Ayz*plz,4);
        this.z = Math.round2(Azx*plx + Azy*ply + Azz*plz,4);
    };
    rotateZ(roll){
        var cosc = Math.cos(roll),sinc = Math.sin(roll);

        var Axx = 1;
        var Axy = 0;
        var Axz = 0;

        var Ayx = 0;
        var Ayy = cosc;
        var Ayz = -sinc;

        var Azx = 0;
        var Azy = sinc;
        var Azz = cosc;

        var plx=this.x,ply=this.y,plz=this.z;
        
        this.x = Math.round2(Axx*plx + Axy*ply + Axz*plz,4);
        this.y = Math.round2(Ayx*plx + Ayy*ply + Ayz*plz,4);
        this.z = Math.round2(Azx*plx + Azy*ply + Azz*plz,4);
    };
    rotate(yaw,pitch,roll){
        var cosa = Math.cos(yaw),sina = Math.sin(yaw);
        var cosb = Math.cos(pitch),sinb = Math.sin(pitch);
        var cosc = Math.cos(roll),sinc = Math.sin(roll);

        var Axx = cosa*cosb;
        var Axy = cosa*sinb*sinc - sina*cosc;
        var Axz = cosa*sinb*cosc + sina*sinc;

        var Ayx = sina*cosb;
        var Ayy = sina*sinb*sinc + cosa*cosc;
        var Ayz = sina*sinb*cosc - cosa*sinc;

        var Azx = -sinb;
        var Azy = cosb*sinc;
        var Azz = cosb*cosc;

        var plx=this.x,ply=this.y,plz=this.z;
        
        this.x = Math.round2(Axx*plx + Axy*ply + Axz*plz,4);
        this.y = Math.round2(Ayx*plx + Ayy*ply + Ayz*plz,4);
        this.z = Math.round2(Azx*plx + Azy*ply + Azz*plz,4);
    };
    rotateAxis(axis){
        var cosa = Math.cos(axis.yaw),sina = Math.sin(axis.yaw);
        var cosb = Math.cos(axis.pitch),sinb = Math.sin(axis.pitch);
        var cosc = Math.cos(axis.roll),sinc = Math.sin(axis.roll);

        var Axx = cosa*cosb;
        var Axy = cosa*sinb*sinc - sina*cosc;
        var Axz = cosa*sinb*cosc + sina*sinc;

        var Ayx = sina*cosb;
        var Ayy = sina*sinb*sinc + cosa*cosc;
        var Ayz = sina*sinb*cosc - cosa*sinc;

        var Azx = -sinb;
        var Azy = cosb*sinc;
        var Azz = cosb*cosc;

        var plx=this.x,ply=this.y,plz=this.z;
        
        this.x = Math.round2(Axx*plx + Axy*ply + Axz*plz,4);
        this.y = Math.round2(Ayx*plx + Ayy*ply + Ayz*plz,4);
        this.z = Math.round2(Azx*plx + Azy*ply + Azz*plz,4);
    };
    newRotateAxis(axis,coef=1){
        var cosa = Math.cos(axis.yaw*coef),sina = Math.sin(axis.yaw*coef);
        var cosb = Math.cos(axis.pitch*coef),sinb = Math.sin(axis.pitch*coef);
        var cosc = Math.cos(axis.roll*coef),sinc = Math.sin(axis.roll*coef);

        var Axx = cosa*cosb;
        var Axy = cosa*sinb*sinc - sina*cosc;
        var Axz = cosa*sinb*cosc + sina*sinc;

        var Ayx = sina*cosb;
        var Ayy = sina*sinb*sinc + cosa*cosc;
        var Ayz = sina*sinb*cosc - cosa*sinc;

        var Azx = -sinb;
        var Azy = cosb*sinc;
        var Azz = cosb*cosc;

        var plx=this.x,ply=this.y,plz=this.z;
        //console.log(plx,ply,plz,Axx,Axy,Axz,Ayx,Ayy,Ayz,Azx,Azy,Azz);
        //var asd = new Vertex(Axx*plx + Axy*ply + Axz*plz,Ayx*plx + Ayy*ply + Ayz*plz,Azx*plx + Azy*ply + Azz*plz);
        
        //return new Vertex(Axx*plx + Axy*ply + Axz*plz,Ayx*plx + Ayy*ply + Ayz*plz,Azx*plx + Azy*ply + Azz*plz);
        return new Vertex(Math.round2(Axx*plx + Axy*ply + Axz*plz,3),Math.round2(Ayx*plx + Ayy*ply + Ayz*plz,3),Math.round2(Azx*plx + Azy*ply + Azz*plz,3));
        //return asd;
    };
    //===========
    _sum(a,b){
        return new Vertex(a.x+b.x,a.y+b.y,a.z+b.z);
    };
    _subtr(a,b){
        return new Vertex(a.x-b.x,a.y-b.y,a.z-b.z);
    };
    _escalar(a,b){
        return (a.x*b.x + a.y*b.y+a.z*b.z);
    };
    _avg(list){
        var x =0,y=0,z=0;
        list.forEach(vert => {
            x+=vert.x;
            y+=vert.y;
            z+=vert.z;
        });
        return new Vertex(x/list.length,y/list.length,z/list.length);
    };
    _cross(a,b){
        var x = a.y*b.z - a.z*b.y;
        var y = a.z*b.x - a.x*b.z;
        var z = a.x*b.y - a.y*b.x;
        return new Vertex(x,y,z);
    }
    //===========
    colinear(){
        return false;
    };
    coplanar(){
        return false;
    };
};
