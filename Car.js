class Car {
    constructor(x,y,width,height,controlType,maxSpeed=3,color="#597dff") {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = maxSpeed;
        this.friction = 0.05;
        this.angle = 0;
        this.damaged = false;

        this.useBrain = controlType==="AI";

        if (controlType !== "DUMMY") {
            this.sensor = new Sensor(this);
            if (controlType === "AI") this.brain = new NeuralNetwork([this.sensor.rayCount,6,4]);
        }
        this.controls = new Controls(controlType);

        this.img = new Image();
        this.img.src = "Imgs/Car.png";

        this.mask = document.createElement("canvas");
        this.mask.width = width;
        this.mask.height = height;

        const maskCtx = this.mask.getContext("2d");
        this.img.onload = ()=>{
            maskCtx.fillStyle = color;
            maskCtx.rect(0,0,this.width,this.height);
            maskCtx.fill();

            maskCtx.globalCompositeOperation = "destination-atop";
            maskCtx.drawImage(this.img,0,0,this.width,this.height);
        }
    }

    // to update the position and sensor of the car
    update(roadBorders,traffic){
        if (!this.damaged){
            this.#move();
            this.polygon = this.#createPolygon();
            this.damaged = this.#assessDamage(roadBorders,traffic);
        }

        if (this.sensor){
            this.sensor.update(roadBorders, traffic);
            if(this.brain){
                const offsets = this.sensor.readings.map(s=>s===null?0:1-s.offset);
                const outputs = NeuralNetwork.feedForward(offsets,this.brain);

                this.controls.forward = outputs[0];
                this.controls.left = outputs[1];
                this.controls.right = outputs[2];
                this.controls.reverse = outputs[3];
            }
        }
    }

    // to check weather the car is damaged or not w.r.t roadBorders and traffic cars
    #assessDamage(roadBorders, traffic) {
        for (let i=0;i<roadBorders.length;i++) {
            let borderEdge = roadBorders[i].map(p=>{
                let temp = new Object();
                temp.x = p.x+Road.borderWidth/2*(i===0?-1:1);
                temp.y = p.y;
                return temp;
            });
            if(polysIntersect(this.polygon,borderEdge)) return true;
        }
        for (let i=0;i<traffic.length;i++) {
            if(polysIntersect(this.polygon,traffic[i].polygon)) return true;
        }

        return false;
    }

    // to create a polygon and to get polygon points
    #createPolygon() {
        const points = [];
        const rad = Math.hypot(this.width,this.height)/2;
        const alpha = Math.atan2(this.width,this.height);

        // top-right point
        points.push({
            x: this.x-Math.sin(this.angle-alpha)*rad,
            y: this.y-Math.cos(this.angle-alpha)*rad
        });
        // top-left point
        points.push({
            x: this.x-Math.sin(this.angle+alpha)*rad,
            y: this.y-Math.cos(this.angle+alpha)*rad
        });
        // bottom-left point
        points.push({
            x: this.x-Math.sin(Math.PI+this.angle-alpha)*rad,
            y: this.y-Math.cos(Math.PI+this.angle-alpha)*rad
        });
        // bottom-right point
        points.push({
            x: this.x-Math.sin(Math.PI+this.angle+alpha)*rad,
            y: this.y-Math.cos(Math.PI+this.angle+alpha)*rad
        });

        return points;
    }

    // to move the car
    #move(){
        // Forward and Reverse direction
        // Considering speed and acceleration
        if (this.controls.forward){
            this.speed += this.acceleration;
        }
        if (this.controls.reverse){
            this.speed -= this.acceleration;
        }

        // Considering maximum speed
        if (this.speed > this.maxSpeed){
            this.speed = this.maxSpeed;
        }
        if (this.speed < -this.maxSpeed/2){
            this.speed = - this.maxSpeed/2;
        }

        // Considering friction
        if (this.speed > 0){
            this.speed -= this.friction;
        }
        if (this.speed < 0){
            this.speed += this.friction;
        }

        if (Math.abs(this.speed) < this.friction){
            this.speed = 0;
        }


        // Left and Right direction
        if (this.speed != 0){
            const flip = this.speed>0?1:-1;
            if (this.controls.left){
                this.angle += 0.03*flip;
            }
            if (this.controls.right){
                this.angle -= 0.03*flip;
            }
        }

        this.x -= Math.sin(this.angle)*this.speed;
        this.y -= Math.cos(this.angle)*this.speed;
    }

    // to draw the car
    draw(ctx,drawSensors=false){
        if (this.sensor && drawSensors) this.sensor.draw(ctx);

        ctx.save();
        ctx.translate(this.x,this.y);
        ctx.rotate(-this.angle);

        if (!this.damaged){
            ctx.drawImage(
                this.mask,
                -this.width/2,
                -this.height/2,
                this.width,
                this.height
            );
            ctx.globalCompositeOperation = "multiply";
        }
        ctx.drawImage(
            this.img,
            -this.width/2,
            -this.height/2,
            this.width,
            this.height
        );
        ctx.restore();

    }
}