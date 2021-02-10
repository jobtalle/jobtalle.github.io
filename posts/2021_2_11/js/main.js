const plotPower = new PlotPower(
    new Plot(document.getElementById("plot-probabilities-power")),
    document.getElementById("plot-probabilities-power-count"),
    document.getElementById("plot-probabilities-power-exponent"));
const plotSigmoid = new PlotSigmoid(
    new Plot(document.getElementById("plot-probabilities-sigmoid")),
    document.getElementById("plot-probabilities-sigmoid-count"),
    document.getElementById("plot-probabilities-sigmoid-exponent"));
const plotPlateau = new PlotPlateau(
    new Plot(document.getElementById("plot-probabilities-plateau")),
    document.getElementById("plot-probabilities-plateau-count"),
    document.getElementById("plot-probabilities-plateau-height"),
    document.getElementById("plot-probabilities-plateau-exponent"));
const plotDistribution = new PointPlot(document.getElementById("plot-distribution"));
const pointDistributionRandom = new PointDistributionRandom(
    plotDistribution,
    document.getElementById("plot-distribution-spacing"));
const pointDistributionGrid = new PointDistributionGrid(
    plotDistribution,
    document.getElementById("plot-distribution-spacing"));
const pointDistributionPoisson = new PointDistributionPoisson(
    plotDistribution,
    document.getElementById("plot-distribution-spacing"));
let distribution = pointDistributionRandom;

plotPower.update();
plotSigmoid.update();
plotPlateau.update();
distribution.update();