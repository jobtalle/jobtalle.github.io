const aspectRatio = 0.5;
const divLife = document.getElementById("game-of-life");
const divSand = document.getElementById("falling-sand");
const divWater = document.getElementById("water");
const canvasLife = document.createElement("canvas");
const canvasSand = document.createElement("canvas");
const canvasWater = document.createElement("canvas");

let lastDate = new Date();
let focus = null;

canvasLife.width = Math.ceil(divLife.clientWidth);
canvasLife.height = Math.ceil(divLife.clientWidth * aspectRatio);
canvasSand.width = Math.ceil(divSand.clientWidth);
canvasSand.height = Math.ceil(divSand.clientWidth * aspectRatio);
canvasWater.width = Math.ceil(divWater.clientWidth);
canvasWater.height = Math.ceil(divWater.clientWidth * aspectRatio);

divLife.appendChild(canvasLife);
divSand.appendChild(canvasSand);
divWater.appendChild(canvasWater);

const life = new Life(canvasLife);
const sand = new Sand(canvasSand);
const water = new Water(canvasWater);

function activate(object) {
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