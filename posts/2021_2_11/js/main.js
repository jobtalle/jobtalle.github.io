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

plotPower.update();
plotSigmoid.update();
plotPlateau.update();