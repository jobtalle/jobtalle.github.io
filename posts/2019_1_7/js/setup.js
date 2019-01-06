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

canvasLife.width = Math.floor(divLife.clientWidth);
canvasLife.height = Math.floor(divLife.clientWidth * aspectRatio);
canvasSand.width = Math.floor(divSand.clientWidth);
canvasSand.height = Math.floor(divSand.clientWidth * aspectRatio);
canvasWater.width = Math.floor(divWater.clientWidth);
canvasWater.height = Math.floor(divWater.clientWidth * aspectRatio);
canvasGrass.width = Math.floor(divGrass.clientWidth);
canvasGrass.height = Math.floor(divGrass.clientWidth * aspectRatio);

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