import { Vertex } from "./vertex.js";

export class Point{
    constructor(x,y,z){
        this.x=x;
        this.y=y;
        this.z=z;
    }
    move(x,y,z){
        this.x+=x;
        this.y+=y;
        this.z+=z;
    }
    moveDirection(v){
        this.x+=v.x;
        this.y+=v.y;
        this.z+=v.z;
    }
    addVertex(v){
        return new Point(this.x+v.x,this.y+v.y,this.z+v.z);
    }
    toVertex(p){
        return new Vertex(p.x-this.x,p.y-this.y,p.z-this.z);
    }
}