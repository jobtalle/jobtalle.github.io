export class Color {
    static fromHex(hex) {
        const integer = parseInt(hex.slice(1), 16);

        return new Color(
            ((integer >> 16) & 0xFF) / 0xFF,
            ((integer >> 8) & 0xFF) / 0xFF,
            (integer & 0xFF) / 255);
    }

    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
}