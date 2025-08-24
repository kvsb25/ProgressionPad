/*
0. connect to loopMIDI's virtual MIDI port
1. event listener key up, down:
    key down: detect chord, send midi to play that chord
    key up: send midi signal to turn off
    
2. cycle chord progression w/rerendering
3. cycle chord progression w/o rerendering

------------------------------------------------------

connect to loopMIDI virtual MIDI port
render controls, add event listeners to them in such that signal velocity can be manipulated dynamically
render pad, add eventlisteners to them (Event Delegation)
detect chord pressed and send midi signals to turn on and off the chords in DAW (result of adding event listeners)

*/

/*
let velocity = 0;

// const select = document.querySelector.bind(document);
const velocityEle = document.querySelector('input[name="velocity"]');
// const velocityEle = select('input[name="velocity"]');

velocity = velocityEle.value;

velocityEle.addEventListener('change', (event)=>{
    velocity = event.currentTarget.value;
});
*/

class Connection {
    static #midi = null;
    static #outputPort = null;
    static #initialized = false;

    constructor(){}

    static async initialize() {
        if (this.#initialized) {
            return
        }

        try {
            this.#midi = await navigator.requestMIDIAccess();
            this.#outputPort = [...this.#midi.outputs.values()].find(o => o.name.includes('ProgressionPadPort'));
            this.#initialized = true;
        } catch (err) {
            console.err("MIDI Initialization failed: ", err);
        }
    }

    static async getPort() {
        await this.initialize();
        return this.#outputPort;
    }

    static send(status, note, velocity){
        this.#outputPort.send([status, note, velocity]);
    }
}

class Transmitter {
    static #statusOn = 0x90;
    static #statusOff = 0x80;
    static #velocity = 127;
    static connection = new Connection();
    
    constructor(){
        connection.initialize();
    }

    static play(note){
        Transmitter.connection.send(Transmitter.#statusOn, note, Transmitter.#velocity); 
    }

    static stop(note){
        Transmitter.connection.send(Transmitter.#statusOff, note, Transmitter.#velocity);
    }
}