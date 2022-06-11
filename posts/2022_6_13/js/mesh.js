import {gl} from "./gl.js";
import {Vector} from "./vector.js";

export class Mesh {
    static SEGMENTS = 16;

    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.spacing = width / (Mesh.SEGMENTS - 1);
        this.buffer = gl.createBuffer();
        this.mirror = new Float32Array(Mesh.SEGMENTS << 3);
        this.spine = [];
        this.spinePrevious = [];
        this.spineInterpolated = [];
        this.phase = 0;
        this.phaseSpeed = .15;
        this.amplitude = .2;
        this.flow = 10;
        this.spring = .55;

        for (let segment = 0; segment < Mesh.SEGMENTS; ++segment) {
            this.spine.push(new Vector());
            this.spinePrevious.push(new Vector());
            this.spineInterpolated.push(new Vector());
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.mirror.byteLength, gl.DYNAMIC_DRAW);
    }

    initialize() {
        this.phase = 0;

        for (let segment = 0; segment < Mesh.SEGMENTS; ++segment) {
            this.spine[segment].x = (1 - segment / (Mesh.SEGMENTS - 1)) * this.width;
            this.spine[segment].y = 0;
            this.spinePrevious[segment].set(this.spine[segment]);
        }
    }

    update() {
        if ((this.phase += this.phaseSpeed) > Math.PI * 2)
            this.phase -= Math.PI * 2;

        let dxp = 0;
        let dyp = 0;

        for (let segment = 0; segment < Mesh.SEGMENTS; ++segment) {
            this.spinePrevious[segment].set(this.spine[segment]);

            if (segment !== 0) {
                if (segment === 1) {
                    const angle = Math.sin(this.phase) * this.amplitude;

                    dxp = Math.cos(angle);
                    dyp = Math.sin(angle);

                    this.spine[segment].x = this.spine[0].x - dxp * this.spacing;
                    this.spine[segment].y = this.spine[0].y - dyp * this.spacing;

                    continue;
                }

                this.spine[segment].x -= this.flow;

                const tx = this.spine[segment - 1].x - dxp * this.spacing;
                const ty = this.spine[segment - 1].y - dyp * this.spacing;
                let dx = tx - this.spine[segment].x;
                let dy = ty - this.spine[segment].y;
                let d = Math.sqrt(dx * dx + dy * dy);

                this.spine[segment].x += dx * this.spring;
                this.spine[segment].y += dy * this.spring;

                dx = this.spine[segment - 1].x - this.spine[segment].x;
                dy = this.spine[segment - 1].y - this.spine[segment].y;
                d = Math.sqrt(dx * dx + dy * dy);

                dxp = dx / d;
                dyp = dy / d;

                this.spine[segment].x += (d - this.spacing) * dx / d;
                this.spine[segment].y += (d - this.spacing) * dy / d;
            }
        }
    }

    makeVertices(time) {
        for (let segment = 0; segment < Mesh.SEGMENTS; ++segment)
            this.spineInterpolated[segment].set(this.spinePrevious[segment]).interpolate(this.spine[segment], time);

        for (let segment = 0; segment < Mesh.SEGMENTS; ++segment) {
            const u = 1 - segment / (Mesh.SEGMENTS - 1);
            let dx = 0;
            let dy = 0;

            if (segment === 0) {
                dx = this.spineInterpolated[0].x - this.spineInterpolated[1].x;
                dy = this.spineInterpolated[0].y - this.spineInterpolated[1].y;
            }
            else if (segment === Mesh.SEGMENTS - 1) {
                dx = this.spineInterpolated[segment - 1].x - this.spineInterpolated[segment].x;
                dy = this.spineInterpolated[segment - 1].y - this.spineInterpolated[segment].y;
            }
            else {
                dx = this.spineInterpolated[segment - 1].x - this.spineInterpolated[segment + 1].x;
                dy = this.spineInterpolated[segment - 1].y - this.spineInterpolated[segment + 1].y;
            }

            const dl = Math.sqrt(dx * dx + dy * dy);

            dx /= dl;
            dy /= dl;

            this.mirror[segment << 3] = this.spineInterpolated[segment].x + dy * this.height * .5;
            this.mirror[(segment << 3) + 1] = this.spineInterpolated[segment].y - dx * this.height * .5;
            this.mirror[(segment << 3) + 2] = u;
            this.mirror[(segment << 3) + 3] = 0;

            this.mirror[(segment << 3) + 4] = this.spineInterpolated[segment].x + dy * this.height * -.5;
            this.mirror[(segment << 3) + 5] = this.spineInterpolated[segment].y - dx * this.height * -.5;
            this.mirror[(segment << 3) + 6] = u;
            this.mirror[(segment << 3) + 7] = 1;
        }
    }

    draw(time) {
        this.makeVertices(time);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.mirror);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, Mesh.SEGMENTS << 1);
    }
}