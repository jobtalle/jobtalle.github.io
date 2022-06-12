import {Shader} from "./shader.js";
import {gl} from "./gl.js";

export class ShaderSpots extends Shader {
    static FRAGMENT = `#version 300 es
        mediump float random3(highp vec3 p) {
            return fract(sin(dot(p, vec3(12.9898, 78.2331, 42.1914))) * 43758.5452);
        }
        
        mediump float interpolate(mediump float a, mediump float b, mediump float c, mediump float d, mediump float x) {
            mediump float p = (d - c) - (a - b);
            
            return x * (x * (x * p + ((a - b) - p)) + (c - a)) + b;
        }
    
        mediump float sampleX(mediump vec3 at) {
            mediump float floored = floor(at.x);
            
            return interpolate(
                random3(vec3(floored - 1., at.yz)),
                random3(vec3(floored, at.yz)),
                random3(vec3(floored + 1., at.yz)),
                random3(vec3(floored + 2., at.yz)),
                at.x - floored) * .5 + .25;
        }
        
        mediump float sampleY(mediump vec3 at) {
            mediump float floored = floor(at.y);
            
            return interpolate(
                sampleX(vec3(at.x, floored - 1., at.z)),
                sampleX(vec3(at.x, floored, at.z)),
                sampleX(vec3(at.x, floored + 1., at.z)),
                sampleX(vec3(at.x, floored + 2., at.z)),
                at.y - floored);
        }
        
        mediump float cubicNoise(mediump vec3 at) {
            mediump float floored = floor(at.z);
            
            return interpolate(
                sampleY(vec3(at.xy, floored - 1.)),
                sampleY(vec3(at.xy, floored)),
                sampleY(vec3(at.xy, floored + 1.)),
                sampleY(vec3(at.xy, floored + 2.)),
                at.z - floored);
        }

        #define POSITION_MAGNITUDE 10.

        uniform mediump vec3 colorA;
        uniform mediump vec3 colorB;
        uniform mediump vec2 size;
        uniform mediump float scale;
        uniform mediump float threshold;
        uniform mediump vec3 position;
        uniform mediump vec2 rotation;
        
        in mediump vec2 uv;
        out lowp vec4 color;
        
        void main() {
            mediump mat3 rotationX = mat3(
                1., 0., 0.,
                0., cos(rotation.x), -sin(rotation.x),
                0., sin(rotation.x), cos(rotation.x));
            mediump mat3 rotationY = mat3(
                cos(rotation.y), 0., sin(rotation.y),
                0., 1., 0.,
                -sin(rotation.y), 0, cos(rotation.y));
            mediump mat3 rotationXY = rotationY * rotationX;
            mediump vec3 samplePosition = position * POSITION_MAGNITUDE + vec3((uv - .5) * size, 0.) * rotationXY * scale;
            
            if (cubicNoise(samplePosition) < threshold)
                color = vec4(colorA, 1.);
            else
                color = vec4(colorB, 1.);
        }`;

    constructor() {
        super(Shader.VERTEX_BLIT, ShaderSpots.FRAGMENT);

        this.colorA = this.getUniform("colorA");
        this.colorB = this.getUniform("colorB");
        this.size = this.getUniform("size");
        this.scale = this.getUniform("scale");
        this.threshold = this.getUniform("threshold");
        this.position = this.getUniform("position");
        this.rotation = this.getUniform("rotation");
    }

    setColors(a, b) {
        gl.uniform3f(this.colorA, a.r, a.g, a.b);
        gl.uniform3f(this.colorB, b.r, b.g, b.b);
    }

    setSize(width, height) {
        gl.uniform2f(this.size, width, height);
    }

    setScale(scale) {
        gl.uniform1f(this.scale, scale);
    }

    setThreshold(threshold) {
        gl.uniform1f(this.threshold, threshold);
    }

    setPosition(x, y, z) {
        gl.uniform3f(this.position, x, y, z);
    }

    setRotation(x, y) {
        gl.uniform2f(this.rotation, x, y);
    }
}