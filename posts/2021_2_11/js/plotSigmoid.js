/**
 * A sigmoid plot
 * @param {Plot} plot The plot
 * @param {HTMLInputElement} count The item count
 * @param {HTMLInputElement} power The sigmoid power
 * @constructor
 */
const PlotSigmoid = function(plot, count, power) {
    this.plot = plot;
    this.count = count;
    this.power = power;
};

/**
 * Update the plot
 */
PlotSigmoid.prototype.update = function() {
    this.plot.draw(
    x => {
        if (x < .5)
            return .5 * (x + x) ** Number.parseFloat(this.power.value);

        return 1 - .5 * (2 - x - x) ** Number.parseFloat(this.power.value);
    },
    this.count.valueAsNumber,
    [
        "power: " + this.power.value
    ]);
};