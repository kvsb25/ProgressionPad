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

// returns notes of a chord based on root and quality
const chord = (root, quality) => {
    const semitones = 12;  // 12 ko 15 se replace krdo agar next octave ke notes consider krne hai for a chord
    root = root.toUpperCase();
    quality = quality.toLowerCase();
    switch (quality) {
        case "major":
            return [NOTE[root], (NOTE[root] + 4) % semitones, (NOTE[root] + 7) % semitones];
        case "minor":
            return [NOTE[root], (NOTE[root] + 3) % semitones, (NOTE[root] + 7) % semitones];
        case "diminshed":
            return [];
        default:
            return [];
    }
}

const majorChordProg = {
    // sequence of chord qualities in the progression
    headers: ["Major", "Minor", "Minor", "Major", "Major", "Minor", "Diminished"],
    // root progressions of the chord progression
    rows: [
        ["A", "B", "C#", "D", "E", "F#", "G#"],
        ["B", "C#", "D#", "E", "F#", "G#", "A#"],
        ["C", "D", "E", "F", "G", "A", "B"],
        ["D", "E", "F#", "G", "A", "B", "C#"],
        ["E", "F#", "G#", "A", "B", "C#", "D#"],
        ["F", "G", "A", "Bb", "C", "D", "E"],
        ["G", "A", "B", "C", "D", "E", "F#"]
    ]
}

// const stringToElement = (html) => {
//     const template = document.createElement('template');
//     console.log(html.trim());
//     template.innerHTML = html.trim();
//     console.log(template.content.firstElementChild);
//     return template.content.firstElementChild;
// }

// const renderComponent = (containerClass, component, data) => {
//     const container = document.getElementsByClassName(`${containerClass}`)[0];
//     container.innerHTML = '';
//     container.appendChild(stringToElement(component(data)));
// }

// const components = {
//     pads: (progression) => {
//         let headerRow = progression.headers.reduce((acc, curr) => acc + `<th data-quality="${curr}">${curr}</th>`, '');
//         let rows = progression.rows.reduce((acc, ele) => {
//             let rowData = ele.reduce((acc, curr) => acc + `<td data-root="${curr}">${curr}</td>`, '');
//             let temp = `<tr>${rowData}</tr>`;
//             return acc + temp;
//         }, '');
//         return `<table class="pad-table"><thead>${headerRow}</thead><tbody>${rows}</tbody></table>`;
//     }
// }

// renderComponent('pads', components.pads, majorChordProg);

// // console.log(chord("C", "major"));
// class Component {
//     // static html;

//     stringToElement() {
//         let html = Component._html;
//         const template = document.createElement('template');
//         console.log(html.trim());
//         template.innerHTML = html.trim();
//         console.log(template.content.firstElementChild);
//         return template.content.firstElementChild;
//     }

//     renderComponent(containerClass, component, data) {
//         const container = document.getElementsByClassName(`${containerClass}`)[0];
//         container.innerHTML = '';
//         container.appendChild(stringToElement(component(data)));
//     }
// }

// class Pads extends Component {
//     static _html;
//     static _progression;

//     set progression({ headers, rows }) {
//         this.progression = {
//             headers,
//             rows
//         }
//     }

//     set html(html) {
//         this.html = html;
//     }

//     constructor({ headers, rows }) {
//         this._progression = { headers, rows };
//         this._html = this.#characteristics(this._progression);
//     }

//     #characteristics(progression) {
//         let headerRow = progression.headers.reduce((acc, curr) => acc + `<th data-quality="${curr}">${curr}</th>`, '');
//         let rows = progression.rows.reduce((acc, ele) => {
//             let rowData = ele.reduce((acc, curr) => acc + `<td data-root="${curr}">${curr}</td>`, '');
//             let temp = `<tr>${rowData}</tr>`;
//             return acc + temp;
//         }, '');
//         return `<table class="pad-table"><thead>${headerRow}</thead><tbody>${rows}</tbody></table>`;
//     }
// }

class Component {
    constructor(props = {}) {
        this.props = props;
        this._html = this.getTemplate(props);
    }

    getTemplate(props) {
        throw new Error("Child classes must implement getTemplate(props)");
    }

    renderComponent() {
        if (!this.props.className) {
            throw new Error("Component requires a className prop");
        }

        const container = document.getElementsByClassName(`${this.props.className}`)[0];
        if (!container) {
            throw new Error(`Container with class '${this.props.className}' not found`);
        }
        container.innerHTML = '';
        container.appendChild(this._stringToElement(this._html));
    }

    _stringToElement(html) {
        const template = document.createElement('template');
        console.log(html.trim());
        template.innerHTML = html.trim();
        console.log(template.content.firstElementChild);
        return template.content.firstElementChild;
    }
}

class Pad extends Component {
    getTemplate(props) {
        const { className, progression } = props;
        if (!progression) {
            throw new Error("Component requires a progression in prop");
        }

        let headerRow = progression.headers.reduce((acc, curr) => acc + `<th data-quality="${curr}">${curr}</th>`, '');
        let rows = progression.rows.reduce((acc, ele) => {
            let rowData = ele.reduce((acc, curr) => acc + `<td data-root="${curr}">${curr}</td>`, '');
            let temp = `<tr>${rowData}</tr>`;
            return acc + temp;
        }, '');
        return `<table class="${className}"><thead>${headerRow}</thead><tbody>${rows}</tbody></table>`;
    }
}