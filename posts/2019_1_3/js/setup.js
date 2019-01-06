const aspectRatio = 0.5;
const divLife = document.getElementById("game-of-life");
const divSand = document.getElementById("falling-sand");
const divWater = document.getElementById("water");
const divGrass = document.getElementById("grass");
const canvasLife = document.createElement("canvas");
const canvasSand = document.createElement("canvas");
const canvasWater = document.createElement("canvas");
const canvasGrass = document.createElement("canvas");

let focus = null;

canvasLife.width = Math.ceil(divLife.clientWidth - 1);
canvasLife.height = Math.ceil(divLife.clientWidth * aspectRatio);
canvasSand.width = Math.ceil(divSand.clientWidth - 1);
canvasSand.height = Math.ceil(divSand.clientWidth * aspectRatio);
canvasWater.width = Math.ceil(divWater.clientWidth - 1);
canvasWater.height = Math.ceil(divWater.clientWidth * aspectRatio);
canvasGrass.width = Math.ceil(divGrass.clientWidth - 1);
canvasGrass.height = Math.ceil(divGrass.clientWidth * aspectRatio);

divLife.appendChild(canvasLife);
divSand.appendChild(canvasSand);
divWater.appendChild(canvasWater);
divGrass.appendChild(canvasGrass);

const life = new Life(canvasLife);
const sand = new Sand(canvasSand);
const water = new Water(canvasWater);
const grass = new Grass(canvasGrass);

grass.update();

function activate(object) {
    focus = object;
};

const update = () => {
    if (focus)
        focus.update();
};

const loopFunction = function(step) {
    update();
    requestAnimationFrame(loopFunction);
};

requestAnimationFrame(loopFunction);