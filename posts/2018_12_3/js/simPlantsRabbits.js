const container = document.getElementById("sim-plants-rabbits");
const plantsRabbitsGridDiv = container.getElementsByClassName("grid")[0];
const plantsRabbitsGraphDiv = container.getElementsByClassName("graph")[0];
const plantsRabbitsGridLegendDiv = plantsRabbitsGridDiv.getElementsByClassName("legend-area")[0];
const plantsRabbitsGraphLegendDiv = plantsRabbitsGraphDiv.getElementsByClassName("legend-area")[0];
const plantsRabbitsControls = container.getElementsByClassName("controls")[0];
const plantsRabbitsGridCanvas = document.createElement("canvas");
const plantsRabbitsGraphCanvas = document.createElement("canvas");

plantsRabbitsGridCanvas.width = plantsRabbitsGridDiv.clientWidth;
plantsRabbitsGridCanvas.height = plantsRabbitsGridCanvas.width * 0.6;
plantsRabbitsGraphCanvas.width = plantsRabbitsGraphDiv.clientWidth;
plantsRabbitsGraphCanvas.height = plantsRabbitsGraphCanvas.width * 0.2;

plantsRabbitsGridDiv.appendChild(plantsRabbitsGridCanvas);
plantsRabbitsGraphDiv.appendChild(plantsRabbitsGraphCanvas);

new Instance(
	7,
	plantsRabbitsGridCanvas,
	plantsRabbitsGridLegendDiv,
	plantsRabbitsGraphCanvas,
	plantsRabbitsGraphLegendDiv,
	[Types.TYPE_PLANT, Types.TYPE_RABBIT],
    [0.5, 0.02],
    plantsRabbitsControls.getElementsByClassName("frame")[0],
    plantsRabbitsControls.getElementsByClassName("stop")[0],
    plantsRabbitsControls.getElementsByClassName("play")[0],
    plantsRabbitsControls.getElementsByClassName("step")[0],
    plantsRabbitsControls.getElementsByClassName("reset")[0],
	550);