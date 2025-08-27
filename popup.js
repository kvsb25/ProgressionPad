// const MajorPad = new Pad({containerClass: "pads", progression: majorChordProg});
// MajorPad.renderComponent();
const select = document.querySelector("select");
const padTable = document.querySelector(".pads");

const ProgressionPads = {
    major: new Pad({containerClass: "pads", progression: majorChordProg}),
    minor: new Pad({containerClass: "pads", progression: minorChordProg})
}

ProgressionPads.major.renderComponent();


select.addEventListener('change', (event)=>{
    ProgressionPads[event.target.value].renderComponent();
});

padTable.addEventListener('click', (event)=>{
    const cell = event.target;
    console.log(cell);
    console.log([...event.currentTarget.children]);
})