class NeuralNetwork {
    constructor(neuronCounts) {
        this.levels = [];
        for (let i=0;i<neuronCounts.length-1;i++){
            this.levels.push(new Level(neuronCounts[i],neuronCounts[i+1]));
        }
    }

    // feedForward algorithm for whole Neural Network
    static feedForward(givenInputs, network){
        let outputs = Level.feedForward(givenInputs,network.levels[0]);

        for(let i=1;i<network.levels.length;i++){
            outputs = Level.feedForward(outputs,network.levels[i]);
        }

        return outputs;
    }

    // to mutate Neural Network
    static mutate(network, ammount=1){
        network.levels.forEach(level => {
            // mutate biases
            for (let i=0;i<level.biases.length;i++) {
                level.biases[i] = lerp(
                    level.biases[i],
                    -1+2*Math.random(),
                    ammount
                );
            }

            // mutate weights
            for (let i=0;i<level.weights.length;i++) {
                for(let j=0;j<level.weights[i].length;j++){
                    level.weights[i][j] = lerp(
                        level.weights[i][j],
                        -1+2*Math.random(),
                        ammount
                    );
                }
            }
        });
    }
}

class Level {
    constructor(inputCount, outputCount){
        this.inputs = new Array(inputCount);
        this.outputs = new Array(outputCount);

        // Every output neuron has a bias, the value above it will be fired
        this.biases = new Array(outputCount);

        this.weights = [];
        for (let i=0;i<inputCount;i++) {
            this.weights[i] = new Array(outputCount);
        }

        Level.#randomize(this);
    }

    // to randomize weights and biases
    static #randomize(level) {
        for (let i=0;i<level.inputs.length;i++) {
            for (let j=0;j<level.outputs.length;j++) {
                level.weights[i][j] = -1 + 2*Math.random();    // to set each weight in between -1 to 1
            }
        }

        for (let i=0;i<level.biases.length;i++){
            level.biases[i] = -1 + 2*Math.random();
        }
    }

    // feedForward algorithm for s single level in NN
    static feedForward(givenInputs, level) {
        for (let i=0;i<level.inputs.length;i++) {
            level.inputs[i] = givenInputs[i];
        }

        for (let i=0;i<level.outputs.length;i++){
            let sum = 0;
            for (let j=0;j<level.inputs.length;j++) sum += level.inputs[j]*level.weights[j][i];

            if (sum>level.biases[i]) level.outputs[i] = 1;
            else level.outputs[i] = 0;
        }

        return level.outputs;
    }
}