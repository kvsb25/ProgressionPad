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

    static async initialize() {
        if (Connection.#initialized) {
            return
        }

        try {
            Connection.#midi = await navigator.requestMIDIAccess();
            Connection.#outputPort = [...Connection.#midi.outputs.values()].find(o => o.name.includes('ProgressionPadPort'));
            Connection.#initialized = true;
            alert('Connected to virtual MIDI Port Successfully');
        } catch (err) {
            throw new Error(`MIDI Initialization failed: ${err}`)
            // console.error("MIDI Initialization failed: ", err);
        }
    }

    static async getPort() {
        await this.initialize();
        return Connection.#outputPort;
    }

    static async send(status, note, velocity) {
        if (!Connection.#initialized) {
            await Connection.initialize();
        }

        if (!Connection.#outputPort) {
            throw new Error('Connection output not assigned: class Connection{ send(status, note, velocity }');
        }
        Connection.#outputPort.send([status, note, velocity]);
    }
}

class Transmitter {
    static #statusSustain = 0xB0;
    static #statusOn = 0x90;
    static #statusOff = 0x80;
    static #velocity = 127;

    constructor() {
        Connection.initialize().catch((err) => { console.error(err) });
    }

    async play(note, velocity = Transmitter.#velocity) {
        await Connection.send(Transmitter.#statusOn, note, velocity);
    }

    async stop(note) {
        await Connection.send(Transmitter.#statusOn, note, 0);
    }
}

class ChordGenerator {
    // Notes for octave = -1 as standard
    static NOTE_MAP = new Map([
        ["C", 0],
        ["C#", 1],
        ["DB", 1],
        ["D", 2],
        ["D#", 3],
        ["EB", 3],
        ["E", 4],
        ["F", 5],
        ["F#", 6],
        ["GB", 6],
        ["G", 7],
        ["G#", 8],
        ["AB", 8],
        ["A", 9],
        ["A#", 10],
        ["BB", 10],
        ["B", 11]
    ]); // midi value = NOTE+12*octave

    generateChord({ root, quality }) {

        const semitones = 24;  // 24 full range chords

        root = root.toUpperCase();
        quality = quality.toLowerCase();

        console.log("Root: ", root, " Quality: ", quality);
        const rootNote = ChordGenerator.NOTE_MAP.get(root);
        console.log(rootNote);

        switch (quality) {
            case "major":
                return [rootNote, (rootNote + 4) % semitones, (rootNote + 7) % semitones];
            case "minor":
                return [rootNote, (rootNote + 3) % semitones, (rootNote + 7) % semitones];
            case "diminished":
                return [rootNote, (rootNote + 3) % semitones, (rootNote + 6) % semitones];
            default:
                return ["default"];
        }
    }

    getRootQuality(cell) {

        console.log(cell);
        const root = cell.getAttribute('data-root');
        console.log("root: ", root);

        const row = cell.parentNode;
        const cellIndexInRow = Array.from(row.children).indexOf(cell);
        const qualityHeaders = document.querySelectorAll('.pad-table thead th');
        const quality = qualityHeaders[cellIndexInRow].getAttribute('data-quality');

        return { root, quality };
    }

    getChord(cell) {
        return this.generateChord(this.getRootQuality(cell));
    }
} // this class resolves the abstraction of chords and notes as String/character to their number representation so that we can leverage Transmitter to commuincate with the Virtual MIDI Port to play those chords and notes 

class Initializer {
    static chordGenerator = new ChordGenerator();
    static transmitter = new Transmitter();
    static MIDIConfig = {
        octave: 2,
        velocity: 127,
        ProgressionPads: {
            major: new Pad({ containerClass: "pads", progression: majorChordProg }),
            minor: new Pad({ containerClass: "pads", progression: minorChordProg })
        },
    }
    static keyboardConfig = {
        keys: new Map([
            ["KeyA", 0],
            ["KeyS", 1],
            ["KeyD", 2],
            ["KeyF", 3],
            ["KeyG", 4],
            ["KeyH", 5],
            ["KeyJ", 6]
        ]),
        keyboardRadios: document.querySelectorAll('input[type="radio"]'),
        checkedRow: null,
        siblings: null,
    }

    constructor(padContainerId, octaveInputId, progressionSelectId) {
        Initializer.initialize(padContainerId, octaveInputId, progressionSelectId);
    }

    static initialize(padContainerId, octaveInputId, progressionSelectId) {

        if (typeof padContainerId != "string" || typeof octaveInputId != "string") {
            throw new Error('Container ID or(and) Octave Input ID must be of type "string" : class Initializer{ static initialize(containerId) }');
        }

        //render components on the page
        this.#renderComponents();

        //initialize handlers for Controller Elements
        this.#intializeControllerInput(octaveInputId, progressionSelectId);

        //initialize handlers for Pad interaction
        this.#initializePadInput(padContainerId);

        //initialize keyboard input
        this.#initializeKeyboardInput();
    }

    //initialize handlers for Controller Elements
    static #intializeControllerInput(octaveInputId, progressionSelectId) {

        const octaveInput = document.getElementById(octaveInputId);
        const select = document.getElementById(progressionSelectId);

        octaveInput.addEventListener('change', (event) => {
            this.#setOctave(event.currentTarget.value);
        });

        select.addEventListener('change', (event) => {
            this.MIDIConfig.ProgressionPads[event.target.value].renderComponent();
        });

        this.#setOctave(octaveInput.value); //set octave value
    }

    //initialize handlers for Pad interaction
    static #initializePadInput(containerId) {

        const container = document.getElementById(containerId);

        container.addEventListener('click', (event) => {

            if (event.target.getAttribute('data-root')) {

                console.log(typeof event.target);
                const cell = event.target;
                console.log(typeof cell);

                let chord = this.#MIDIMessageChord(cell);

                this.#play(chord);
                setTimeout(() => { this.#stop(chord) }, 1000);
            }
        });
    }

    static #initializeKeyboardInput() {

        this.#radioBtnInitializer();
        this.#keyboardInitializer();
        
    }

    static #keyboardInitializer() {
        
        const keys = this.keyboardConfig.keys;
        let isKeydown = false;
        document.addEventListener('keydown', (event) => {

            console.log(event.code);
            console.log(keys.get(event.code));

            console.log(!(keys.get(event.code)));
            if (!(keys.get(event.code)) && keys.get(event.code) != 0) {
                return
            }
            console.log("isKeydown ", isKeydown)
            if (!isKeydown) {
                isKeydown = true;
                const cell = this.keyboardConfig.siblings[keys.get(event.code)];
                console.log(cell, "in keyboardinit");
                const chord = this.#MIDIMessageChord(cell);
                this.#play(chord);
            }
        });

        document.addEventListener('keyup', (event) => {
            console.log(event.code);

            console.log(!(keys.get(event.code)));
            if (!(keys.get(event.code)) && keys.get(event.code) != 0) {
                return
            }

            isKeydown = false;
            const cell = this.keyboardConfig.siblings[keys.get(event.code)];
            console.log(cell, "in keyup keyboard init");
            const chord = this.#MIDIMessageChord(cell);
            this.#stop(chord);
        });
    }

    static #radioBtnInitializer() {
        const radios = this.keyboardConfig.keyboardRadios = document.querySelectorAll('input[type="radio"]');
        console.log(radios);
        radios[0].setAttribute('checked', true);

        const checkedRow = this.keyboardConfig.checkedRow = Array.from(radios).find(radio => (radio.checked));
        console.log(checkedRow);
        console.log(checkedRow.parentElement.parentElement);
        const siblings = this.keyboardConfig.siblings = Array.from(checkedRow.parentElement.parentElement.children).filter((sib, idx) => idx != 0);
        console.log(siblings);

        radios.forEach(radio => radio.addEventListener('change', () => {
            const checkedRow = this.keyboardConfig.checkedRow = Array.from(radios).find(radio => (radio.checked));
            this.keyboardConfig.siblings = Array.from(checkedRow.parentElement.parentElement.children).filter((sib, idx) => idx != 0);
        }));
    }

    static #renderComponents() {
        this.MIDIConfig.ProgressionPads.major.renderComponent();
    }

    static #setOctave(newOctave) {
        newOctave = Number(newOctave);
        this.MIDIConfig.octave = newOctave;
    }

    static #setVelocity(newVelocity) {
        this.MIDIConfig.velocity = newVelocity;
    }

    static #play(chord) {
        if (!Array.isArray(chord)) {
            throw new Error('Chord must be of type "object" to be playable : class Initializer{ static play(chord) }');
        }
        Array.from(chord).forEach(note => this.transmitter.play(note));
    }

    static #stop(chord) {

        // if (!Array.isArray(chord)) {
        //     throw new Error('Chord must be of type "object" to be playable : class Initializer{ static stop(chord) }');
        // }
        Array.from(chord).forEach(note => this.transmitter.stop(note));
    }

    static #MIDIMessageChord(cell) {

        let chord = this.chordGenerator.getChord(cell);

        console.log("chord: ", chord, " octave: ", this.MIDIConfig.octave + 1);

        chord = chord.map(note => note + 12 * (this.MIDIConfig.octave + 1));
        console.log(chord);

        return chord;
    }
}

const app = new Initializer("padTable", "octave", "progression");