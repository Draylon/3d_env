export class Axis{
    constructor(yaw,pitch,roll){
        this.yaw=yaw;
        this.pitch=pitch;
        this.roll=roll;
    }
    tiltX(a){
        if(a>0)
            this.yaw = this.yaw+a > 360 ? 0 : this.yaw+a
        else if(a<0)
            this.yaw = this.yaw+a < 0 ? 360 : this.yaw+a
    }
    tiltY(b){
        if(b>0)
            this.pitch = this.pitch+b > 360 ? 0 : this.pitch+b
        else if(b<0)
            this.pitch = this.pitch+b < 0 ? 360 : this.pitch+b
    }
    tiltXY(a,b){
        if(a>0)
            this.yaw = this.yaw+a > 360 ? 0 : this.yaw+a
        else if(a<0)
            this.yaw = this.yaw+a < 0 ? 360 : this.yaw+a
        
        if(b>0)
            this.pitch = this.pitch+b > 360 ? 0 : this.pitch+b
        else if(b<0)
            this.pitch = this.pitch+b < 0 ? 360 : this.pitch+b
    }
    tiltZ(c){
        if(c>0)
            this.roll = this.roll+c > 360 ? 0 : this.roll+c
        else if(c<0)
            this.roll = this.roll+c < 0 ? 360 : this.roll+c
    }
    tilt(a,b,c){
        if(a>0)
            this.yaw = this.yaw+a > 360 ? 0 : this.yaw+a
        else if(a<0)
            this.yaw = this.yaw+a < 0 ? 360 : this.yaw+a
        
        if(b>0)
            this.pitch = this.pitch+b > 360 ? 0 : this.pitch+b
        else if(b<0)
            this.pitch = this.pitch+b < 0 ? 360 : this.pitch+b
        
        if(c>0)
            this.roll = this.roll+c > 360 ? 0 : this.roll+c
        else if(c<0)
            this.roll = this.roll+c < 0 ? 360 : this.roll+c
    }
}