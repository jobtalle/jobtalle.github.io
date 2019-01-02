const aspectRatio = 0.6;
const divLife = document.getElementById("game-of-life");
const canvasLife = document.createElement("canvas");

canvasLife.width = divLife.clientWidth;
canvasLife.height = canvasLife.width * aspectRatio;

divLife.appendChild(canvasLife);

new Life(canvasLife);