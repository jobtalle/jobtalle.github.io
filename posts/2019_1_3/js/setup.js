const aspectRatio = 0.6;
const divLife = document.getElementById("game-of-life");
const canvasLife = document.createElement("canvas");

let lastDate = new Date();
let focus = null;

canvasLife.width = divLife.clientWidth;
canvasLife.height = canvasLife.width * aspectRatio;

divLife.appendChild(canvasLife);

new Life(canvasLife).update(0);

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