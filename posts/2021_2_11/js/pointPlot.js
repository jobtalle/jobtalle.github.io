/**
 * A point plot
 * @param {HTMLCanvasElement} canvas The canvas to plot on
 * @constructor
 */
const PointPlot = function(canvas) {
    this.context = canvas.getContext("2d");
    this.width = canvas.width;
    this.height = canvas.height;
};

PointPlot.prototype.BACKGROUND = "#dece9c";
PointPlot.prototype.POINT_COLOR = "#5a5a5a";
PointPlot.prototype.POINT_RADIUS = 2;

/**
 * Draw points
 * @param {Point[]} points An array of points
 */
PointPlot.prototype.draw = function(points) {
    this.context.clearRect(0, 0, this.width, this.height);

    this.context.fillStyle = this.BACKGROUND;

    this.context.beginPath();
    this.context.rect(0, 0, this.width, this.height);
    this.context.fill();

    this.context.save();
    this.context.beginPath();
    this.context.rect(0, 0, this.width, this.height);
    this.context.clip();

    this.context.fillStyle = this.POINT_COLOR;

    for (const point of points) {
        this.context.beginPath();
        this.context.arc(point.x, point.y, this.POINT_RADIUS, 0, Math.PI * 2);
        this.context.fill();
    }

    this.context.restore();
};