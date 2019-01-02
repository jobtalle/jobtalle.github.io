const aspectRatio = 0.6;
const divLife = document.getElementById("game-of-life");
const divSand = document.getElementById("falling-sand");
const canvasLife = document.createElement("canvas");
const canvasSand = document.createElement("canvas");

let lastDate = new Date();
let focus = null;

canvasLife.width = divLife.clientWidth;
canvasLife.height = canvasLife.width * aspectRatio;
canvasSand.width = divSand.clientWidth;
canvasSand.height = canvasSand.width * aspectRatio;

divLife.appendChild(canvasLife);
divSand.appendChild(canvasSand);

const life = new Life(canvasLife);
const sand = new Sand(canvasSand);

life.update(0);
sand.update(0);

const simulations = [
    life, sand
];

function activate(object) {
    for (const simulation of simulations) if (simulation !== object)
        simulation.reset();

    focus = object;
};

const update = timeStep => {
    if (focus)
        focus.update(timeStep);
};

const loopFunction = function(step) {
    const date = new Date();

    update((date - lastDate) * 0.001);
    requestAnimationFrame(loopFunction);

    lastDate = date;
};

requestAnimationFrame(loopFunction);