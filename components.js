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

const minorChordProg = {

    headers: ["Minor", "Diminished", "Major", "Minor", "Minor", "Major", "Major"],

    rows: [
        ["A", "B", "C", "D", "E", "F", "G"],
        ["B", "C#", "D", "E", "F#", "G", "A"],
        ["C", "D", "Eb", "F", "G", "Ab", "Bb"],
        ["D", "E", "F", "G", "A", "Bb", "C"],
        ["E", "F#", "G", "A", "B", "C", "D"],
        ["F", "G", "Ab", "Bb", "C", "Db", "Eb"],
        ["G", "A", "Bb", "C", "D", "Eb", "F"]
    ]
}

class Component {

    constructor(props = {}) {
        this.props = props;
        this._html = this.template(props);
    }

    template(props) {
        throw new Error("Child classes must implement template(props)");
    }

    renderComponent() {
        if (!this.props.containerClass) {
            throw new Error("Component requires a containerClass prop");
        }

        const container = document.getElementsByClassName(`${this.props.containerClass}`)[0];
        if (!container) {
            throw new Error(`Container with class '${this.props.containerClass}' not found`);
        }
        container.innerHTML = '';
        container.appendChild(this._stringToElement(this._html));
    }

    _stringToElement(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstElementChild;
    }
}

class Pad extends Component {

    template(props) {
        const { progression } = props;
        if (!progression) {
            throw new Error("Component requires a progression in prop");
        }

        let headerRow = progression.headers.reduce((acc, curr) => acc + `<th data-quality="${curr}">${curr}</th>`, '');
        let rows = progression.rows.reduce((acc, ele) => {

            let rowData = ele.reduce((acc, curr) => acc + `<td data-root="${curr}">${curr}</td>`, '');
            let temp = `<tr><td><input type="radio" name="keyboard"></td>${rowData}</tr>`;
            return acc + temp;
        }, '');
        return `<table class=pad-table><thead><th></th>${headerRow}</thead><tbody>${rows}</tbody></table>`;
    }
}