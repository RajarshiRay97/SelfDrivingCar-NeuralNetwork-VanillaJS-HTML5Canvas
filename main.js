const carControl = document.getElementById('carControl');
const carCanvas = document.getElementById('carCanvas');
carCanvas.width = 200;
const networkCanvas = document.getElementById('networkCanvas');
networkCanvas.width = 300;

// Drawing on Canvas using drawing context
const carCtx = carCanvas.getContext('2d');
const networkCtx = networkCanvas.getContext('2d');
const road = new Road(carCanvas.width/2,carCanvas.width);

let controlMode = "KEY";

let manualCar = generateManualCar();

let N, cars, bestCar;

let traffic = generateTraffic();

// animation
animate();

// function to generate manual car
function generateManualCar(){
    return new Car(road.getLaneCenter(1),100,30,50,controlMode);
}

// function to assign AI cars into cars and to assign best car brain
function aasignAICarsAndBestCarBrain(){
    N= 1;
    cars = generateCars(N);
    bestCar = cars[0];
    if (localStorage.getItem("bestBrain")){
        for (let i=0;i<cars.length;i++){
            cars[i].brain = JSON.parse(
                localStorage.getItem("bestBrain")
            );
            if (i !== 0){
                NeuralNetwork.mutate(cars[i].brain, 0.2);
            }
        }
}
}

// function to generate traffic
function generateTraffic(){
    return [
        new Car(road.getLaneCenter(1),-100,30,50,"DUMMY",2, getRandomColor()),
        new Car(road.getLaneCenter(0),-300,30,50,"DUMMY",2, getRandomColor()),
        new Car(road.getLaneCenter(2),-300,30,50,"DUMMY",2, getRandomColor()),
        new Car(road.getLaneCenter(1),-400,30,50,"DUMMY",2, getRandomColor()),
        new Car(road.getLaneCenter(0),-500,30,50,"DUMMY",2, getRandomColor()),
        new Car(road.getLaneCenter(1),-700,30,50,"DUMMY",2, getRandomColor()),
        new Car(road.getLaneCenter(2),-700,30,50,"DUMMY",2, getRandomColor()),
        new Car(road.getLaneCenter(0),-850,30,50,"DUMMY",2, getRandomColor()),
        new Car(road.getLaneCenter(1),-950,30,50,"DUMMY",2, getRandomColor()),
        new Car(road.getLaneCenter(1),-1050,30,50,"DUMMY",2, getRandomColor()),
        new Car(road.getLaneCenter(2),-1200,30,50,"DUMMY",2, getRandomColor()),
    ];
}

// function to make the controlType of the car as KEY
function manualDrive(){
    networkCanvas.style.display="none";
    carControl.style.display = "flex";
    controlMode = "KEY";
    manualCar = generateManualCar();
    traffic = generateTraffic();
}

// function to make the controlType of the car as AI
function selfDrive(){
    carControl.style.display = "none";
    networkCanvas.style.display="block";
    controlMode = "AI";
    aasignAICarsAndBestCarBrain();
    traffic = generateTraffic();

}

// to save the best AI car brain in localStorage
function save(){
    localStorage.setItem("bestBrain",
        JSON.stringify(bestCar.brain)
    );
}

// to remove the best AI car brain from localStorage
function discard(){
    localStorage.removeItem("bestBrain");
}

// to generate multiple AI cars such that we can find the best AI car
function generateCars(N) {
    const cars = [];
    for (i=0;i<N;i++) {
        cars.push(new Car(road.getLaneCenter(1),100,30,50,"AI"));
    }
    return cars;
}

// for creating animation in carCanvas and networkCanvas 
function animate(time){
    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    for (let i=0;i<traffic.length;i++){
        traffic[i].update(road.borders,[]);
    }
    
    if (controlMode === "AI"){
        for (i=0;i<cars.length;i++){
            cars[i].update(road.borders,traffic);
        }
    
        bestCar = cars.find(c=>
            c.y==Math.min(...cars.map(c=>c.y))
        );
    
    
        carCtx.save();
        carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);           // to move the camera along with car
        road.draw(carCtx);
        for (let i=0;i<traffic.length;i++){
            traffic[i].draw(carCtx);;
        }
    
        carCtx.globalAlpha = 0.2;
    
        for (i=0;i<cars.length;i++){
            cars[i].draw(carCtx);
        }
        carCtx.globalAlpha = 1;
        bestCar.draw(carCtx, true);
    
        carCtx.restore();
    
        networkCtx.lineDashOffset = -time/50;
        Visualizer.drawNetwork(networkCtx,bestCar.brain);
    }
    else if (controlMode === "KEY"){
        manualCar.update(road.borders,traffic);
    
        carCtx.save();
        carCtx.translate(0, -manualCar.y + carCanvas.height * 0.7);           // to move the camera along with car
        road.draw(carCtx);
        for (let i=0;i<traffic.length;i++){
            traffic[i].draw(carCtx);
        }
    
        manualCar.draw(carCtx);
    
        carCtx.restore();
    }
    
    requestAnimationFrame(animate);      // requestAnimationFrame calls the animate method again and again many times per second (to make the illusion of movement)
}