/**
 * A function with inverted axes
 * @param {Function} fy A function for y
 * @returns {Function} A function in the form fx(y)
 */
const SwappedFunction = function(fy) {
    this.fy = fy;

    return this.evaluate.bind(this);
};

SwappedFunction.prototype.STEP = 1 / 1024;

/**
 * Evaluate
 * @param {number} y The Y value to solve for
 * @returns {number} The X value
 */
SwappedFunction.prototype.evaluate = function(y) {
    let x = 0;

    while (y > this.fy(x))
        x += this.STEP;

    return x;
};