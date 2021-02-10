/**
 * A power plot
 * @param {Plot} plot The plot
 * @param {HTMLInputElement} count The item count
 * @param {HTMLInputElement} power The power
 * @constructor
 */
const PlotPower = function(plot, count, power) {
    this.plot = plot;
    this.count = count;
    this.power = power;
};

/**
 * Update the plot
 */
PlotPower.prototype.update = function() {
    this.plot.draw(
        x => x ** Number.parseFloat(this.power.value),
        this.count.valueAsNumber,
        [
            "exponent: " + this.power.value
        ]);
};