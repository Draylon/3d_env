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
    }
    cross(v){
        var x = this.y*v.z - this.z*v.y;
        var y = this.z*v.x - this.x*v.z;
        var z = this.x*v.y - this.y*v.x;
        return new Vertex(x,y,z);
    }
    proj(v){
        var dot=this.escalar(v);
        var w1=this.x-v.x,w2=this.y-v.y,w3=this.z-v.z;
        var mag = Math.pow(w1,2) + Math.pow(w2,2) + Math.pow(w3,2);
        var p1=dot/mag*w1,p2=dot/mag*w2,p3=dot/mag*w3;
        
        //var p1=dot/mag * 
        //return v.mult( (this.escalar(v))/(v.escalar(v)) );
        return new Vertex(p1,p2,p3);
    }
    defaultAngle(){
        return Math.round(Math.acos((this.z) / this.mod())*180/Math.PI);
    }
    _defaultAngle(x,y){
        return Math.round(Math.acos(
            (y) / (Math.pow(x,2)+Math.pow(y,2))
        )*180/Math.PI);
    }
    rotateX(yaw){
        var cosa = Math.cos(yaw),sina = Math.sin(yaw);

        var Axx = cosa, Axy =  -sina, Axz = 0;

        var Ayx = sina, Ayy = cosa, Ayz = 0;

        var Azx = 0, Azy = 0, Azz = 1;

        var plx=this.x,ply=this.y,plz=this.z;
        
        this.x = Axx*plx + Axy*ply + Axz*plz;
        this.y = Ayx*plx + Ayy*ply + Ayz*plz;
        this.z = Azx*plx + Azy*ply + Azz*plz;
    }
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
        
        this.x = Axx*plx + Axy*ply + Axz*plz;
        this.y = Ayx*plx + Ayy*ply + Ayz*plz;
        this.z = Azx*plx + Azy*ply + Azz*plz;
    }
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
        
        this.x = Axx*plx + Axy*ply + Axz*plz;
        this.y = Ayx*plx + Ayy*ply + Ayz*plz;
        this.z = Azx*plx + Azy*ply + Azz*plz;
    }
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
        
        this.x = Axx*plx + Axy*ply + Axz*plz;
        this.y = Ayx*plx + Ayy*ply + Ayz*plz;
        this.z = Azx*plx + Azy*ply + Azz*plz;
    }
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
        
        this.x = Axx*plx + Axy*ply + Axz*plz;
        this.y = Ayx*plx + Ayy*ply + Ayz*plz;
        this.z = Azx*plx + Azy*ply + Azz*plz;
    }
    rotateAxis(axis){
        var cosa = Math.cos(axis.x),sina = Math.sin(yaw);
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
        
        this.x = Axx*plx + Axy*ply + Axz*plz;
        this.y = Ayx*plx + Ayy*ply + Ayz*plz;
        this.z = Azx*plx + Azy*ply + Azz*plz;
    }
    newRotateAxis(axis){
        var cosa = Math.cos(axis.x),sina = Math.sin(yaw);
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
        return new Vertex(Axx*plx + Axy*ply + Axz*plz,Ayx*plx + Ayy*ply + Ayz*plz,Azx*plx + Azy*ply + Azz*plz);
    }
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
    }
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
