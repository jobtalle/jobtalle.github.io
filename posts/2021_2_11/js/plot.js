/**
 * A plot
 * @param {HTMLCanvasElement} canvas The canvas to plot on
 * @constructor
 */
const Plot = function(canvas) {
    this.context = canvas.getContext("2d");
    this.width = canvas.width;
    this.height = canvas.height;
};

Plot.prototype.PADDING = 2;
Plot.prototype.BACKGROUND = "#dece9c";
Plot.prototype.GRID_COLOR = "#ffffff";
Plot.prototype.GRID_LINE_WIDTH = 1.5;
Plot.prototype.AXIS_COLOR = "#000000";
Plot.prototype.AXIS_LINE_WIDTH = 2;
Plot.prototype.TICK_SIZE = 8;
Plot.prototype.PLOT_COLOR = "#ffffff";
Plot.prototype.PLOT_LINE_WIDTH = 2;
Plot.prototype.RESOLUTION = 3;
Plot.prototype.STEP = .001;
Plot.prototype.LEGEND_FONT = "18px sans-serif";
Plot.prototype.LEGEND_FONT_COLOR = "#000000";
Plot.prototype.LEGEND_LINE_HEIGHT = 16;
Plot.prototype.LEGEND_PADDING = 8;
Plot.prototype.AREA_HUE_OFFSET = 20;
Plot.prototype.AREA_FONT = "18px sans-serif";
Plot.prototype.AREA_FONT_COLOR = "#000000";
Plot.prototype.AREA_LINE_HEIGHT = 18;
Plot.prototype.AREA_LABEL_PADDING = 4;

/**
 * Draw the area labels
 * @param {number} ticks The number of ticks
 * @param {Function} f A function for x
 */
Plot.prototype.drawAreaLabels = function(ticks, f) {
    this.context.fillStyle = this.AREA_FONT_COLOR;
    this.context.font = this.AREA_FONT;

    for (let tick = 0; tick < ticks; ++tick) {
        const portion = Math.max(0, f((tick + 1) / ticks) - f(tick / ticks));
        const percentage = (portion * 100).toFixed(0) + "%";
        const center = this.PADDING + (this.width - this.PADDING * 2) * (f((tick + 1) / ticks) + f(tick / ticks)) * .5;
        const width = (this.width - this.PADDING * 2) * (f((tick + 1) / ticks) - f(tick / ticks));
        const textWidth = this.context.measureText(percentage).width;

        if (textWidth > width - this.AREA_LABEL_PADDING * 2) {
            if (center > this.PADDING + (this.width - this.PADDING * 2) * .5)
                this.context.fillText(
                    percentage,
                    this.PADDING + (this.width - this.PADDING * 2) * f(tick / ticks) -
                        this.context.measureText(percentage).width - this.AREA_LABEL_PADDING,
                    this.height - this.PADDING - (this.height - this.PADDING * 2) * ((tick + .5) / ticks) +
                    this.AREA_LINE_HEIGHT * .5);
            else
                this.context.fillText(
                    percentage,
                    this.PADDING + (this.width - this.PADDING * 2) * f((tick + 1) / ticks) +
                        this.AREA_LABEL_PADDING,
                    this.height - this.PADDING - (this.height - this.PADDING * 2) * ((tick + .5) / ticks) +
                    this.AREA_LINE_HEIGHT * .5);
        }
        else
            this.context.fillText(
                percentage,
                center - this.context.measureText(percentage).width * .5,
                this.height - this.PADDING - (this.height - this.PADDING * 2) * ((tick + .5) / ticks) +
                this.AREA_LINE_HEIGHT * .5);
    }
};

/**
 * Draw the probability areas
 * @param {number} ticks The number of ticks
 * @param {Function} f A function for x
 */
Plot.prototype.drawAreas = function(ticks, f) {
    let left = this.PADDING;

    this.context.strokeStyle = this.GRID_COLOR;

    for (let tick = 0; tick < ticks; ++tick) {
        const right = this.PADDING + (this.width - this.PADDING * 2) * f((tick + 1) / ticks);

        this.context.fillStyle = "hsl(" + ((tick / ticks) * 360 + this.AREA_HUE_OFFSET % 360) + ",60%,60%)";

        this.context.beginPath();
        this.context.rect(
            left,
            this.height - this.PADDING - (this.height - this.PADDING * 2) * ((tick + 1) / ticks),
            right - left,
            (this.height - this.PADDING * 2) / ticks);
        this.context.fill();

        if (tick !== 0) {
            this.context.beginPath();
            this.context.moveTo(
                left,
                this.height - this.PADDING - (this.height - this.PADDING * 2) * ((tick - 1) / ticks));
            this.context.lineTo(
                left,
                this.height - this.PADDING - (this.height - this.PADDING * 2) * ((tick + 1) / ticks));
            this.context.stroke();
        }

        left = right;
    }
};

/**
 * Draw the grid lines
 * @param {number} ticks The number of ticks
 */
Plot.prototype.drawGrid = function(ticks) {
    this.context.strokeStyle = this.GRID_COLOR;
    this.context.lineWidth = this.GRID_LINE_WIDTH;

    for (let tick = 0; tick < ticks; ++tick) {
        const y = this.PADDING + (this.height - this.PADDING * 2) * tick / ticks;
        const x = this.width - this.PADDING - (this.width - this.PADDING * 2) * tick / ticks;

        this.context.beginPath();
        this.context.moveTo(this.PADDING, y);
        this.context.lineTo(this.width - this.PADDING, y);
        this.context.stroke();

        this.context.beginPath();
        this.context.moveTo(x, this.PADDING);
        this.context.lineTo(x, this.height - this.PADDING);
        this.context.stroke();
    }
};

/**
 * Draw both axes
 * @param {number} ticks The number of ticks
 */
Plot.prototype.drawAxes = function(ticks) {
    this.context.strokeStyle = this.AXIS_COLOR;
    this.context.lineWidth = this.AXIS_LINE_WIDTH;

    this.context.beginPath();
    this.context.moveTo(this.PADDING, this.PADDING);
    this.context.lineTo(this.PADDING, this.height - this.PADDING);
    this.context.stroke();

    this.context.beginPath();
    this.context.moveTo(this.PADDING, this.height - this.PADDING);
    this.context.lineTo(this.width - this.PADDING, this.height - this.PADDING);
    this.context.stroke();

    for (let tick = 0; tick < ticks; ++tick) {
        const y = this.PADDING + (this.height - this.PADDING * 2) * tick / ticks;
        const x = this.width - this.PADDING - (this.width - this.PADDING * 2) * tick / ticks;

        this.context.beginPath();
        this.context.moveTo(this.PADDING, y);
        this.context.lineTo(this.PADDING + this.TICK_SIZE, y);
        this.context.stroke();

        this.context.beginPath();
        this.context.moveTo(x, this.height - this.PADDING - this.TICK_SIZE);
        this.context.lineTo(x, this.height - this.PADDING);
        this.context.stroke();
    }
};

/**
 * Plot the function
 * @param {Function} f A function to plot
 */
Plot.prototype.drawPlot = function(f) {
    let xPrevious = this.PADDING;
    let yPrevious = this.height - this.PADDING;

    this.context.strokeStyle = this.PLOT_COLOR;
    this.context.lineWidth = this.PLOT_LINE_WIDTH;

    this.context.beginPath();
    this.context.moveTo(xPrevious, yPrevious);

    for (let xStep = this.STEP; xStep <= 1; xStep += this.STEP) {
        const x = this.PADDING + (this.width - this.PADDING * 2) * xStep;
        const y = this.height - this.PADDING - f(xStep) * (this.height - this.PADDING * 2);
        const dy = y - yPrevious;

        if (this.STEP * this.STEP + dy * dy > this.RESOLUTION * this.RESOLUTION) {
            this.context.lineTo(x, y);

            xPrevious = x;
            yPrevious = y;
        }
    }

    this.context.lineTo(this.width - this.PADDING, this.PADDING);
    this.context.stroke();
};

/**
 * Draw the legend
 * @param {String[]} legend A number of strings to display as a legend
 */
Plot.prototype.drawLegend = function(legend) {
    this.context.font = this.LEGEND_FONT;
    this.context.fillStyle = this.LEGEND_FONT_COLOR;

    for (let line = 0; line < legend.length; ++line)
        this.context.fillText(
            legend[line],
            this.LEGEND_PADDING + this.PADDING,
            this.LEGEND_PADDING + this.PADDING + this.LEGEND_LINE_HEIGHT * (line + 1));
};

/**
 * Draw a plot
 * @param {Function} fy A function for Y
 * @param {number} itemCount The item count
 * @param {String[]} legend A number of strings to display as a legend
 */
Plot.prototype.draw = function(fy, itemCount, legend) {
    const fx = new SwappedFunction(fy);

    this.context.clearRect(0, 0, this.width, this.height);
    this.context.fillStyle = this.BACKGROUND;
    this.context.beginPath();
    this.context.rect(this.PADDING, this.PADDING, this.width - this.PADDING * 2, this.height - this.PADDING * 2);
    this.context.fill();

    this.drawAreas(itemCount, fx);
    this.drawGrid(itemCount);
    this.drawPlot(fy);
    this.drawAxes(itemCount);
    this.drawAreaLabels(itemCount, fx);
    this.drawLegend([itemCount.toString() + " items", ...legend]);
};