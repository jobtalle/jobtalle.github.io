export class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    set(vector) {
        this.x = vector.x;
        this.y = vector.y;

        return this;
    }

    interpolate(vector, t) {
        this.x += (vector.x - this.x) * t;
        this.y += (vector.y - this.y) * t;

        return this;
    }
}