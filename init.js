const NOTE = {
    "C": 0,
    "C#": 1,
    "D": 2,
    "D#": 3,
    "E": 4,
    "F": 5,
    "F#": 6,
    "G": 7,
    "G#": 8,
    "A": 9,
    "A#": 10,
    "B": 11
}; // midi value = NOTE["C"]+12*octave

const semitones = 12;  // 12 ko 15 se replace krdo agar next octave ke notes consider krne hai for a chord

const chord = (root, quality) => {
    root = root.toUpperCase();
    quality = quality.toLowerCase();
    switch(quality){
        case "major":
            return [NOTE[root], (NOTE[root]+4)%semitones, (NOTE[root]+7)%semitones];
        case "minor":
            return [NOTE[root], (NOTE[root]+3)%semitones, (NOTE[root]+7)%semitones];
    }
}

// console.log(chord("C", "major"));