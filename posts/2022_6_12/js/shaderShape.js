import {Shader} from "./shader.js";
import {gl} from "./gl.js";

export class ShaderShape extends Shader {
    static FRAGMENT = `#version 300 es
        #define SHADE_POWER .15
        #define EYE_RADIUS 8.
    
        in mediump vec2 uv;
        out lowp vec4 color;
        
        uniform sampler2D source;
        uniform mediump vec2 size;
        uniform mediump float radius;
        uniform mediump float center;
        uniform mediump float thickness;
        uniform mediump float eyePosition;
        uniform lowp vec3 shade;
        uniform lowp vec3 eye;
        uniform mediump float width;
        
        mediump float getR(mediump float x) {
            if (x < 0. || x > 1.)
                return 0.;
                
            return pow(cos(3.141593 * (pow(1. - x, center) - .5)), thickness) * radius;
        }
        
        mediump float applyWidth(mediump float value) {
            return value / width - 0.5 / width + .5;
        }
        
        void main() {
            mediump float r = getR(applyWidth(uv.x));
            mediump float rEye = getR(eyePosition);
            
            if (abs(uv.y - .5) * 2. > r)
                color = vec4(0.);
            else {
                if (length(vec2(size.x * width, size.y) * (vec2(applyWidth(uv.x), abs(uv.y - .5)) - vec2(eyePosition, rEye * .5))) < EYE_RADIUS)
                    color = vec4(eye, 1.);
                else
                    color = mix(vec4(shade, 1.), texture(source, vec2(uv.x, uv.y)), min(1., pow((r - abs(uv.y - .5) * 2.) / r, SHADE_POWER) * 1.05));
            }
        }`;

    constructor() {
        super(Shader.VERTEX_BLIT, ShaderShape.FRAGMENT);

        this.radius = this.getUniform("radius");
        this.center = this.getUniform("center");
        this.thickness = this.getUniform("thickness");
        this.shade = this.getUniform("shade");
        this.size = this.getUniform("size");
        this.eye = this.getUniform("eye");
        this.eyePosition = this.getUniform("eyePosition");
        this.width = this.getUniform("width");
    }

    setRadius(radius) {
        gl.uniform1f(this.radius, radius);
    }

    setCenter(center) {
        gl.uniform1f(this.center, center);
    }

    setThickness(thickness) {
        gl.uniform1f(this.thickness, thickness);
    }

    setShade(shade) {
        gl.uniform3f(this.shade, shade.r, shade.g, shade.b);
    }

    setSize(width, height) {
        gl.uniform2f(this.size, width, height);
    }

    setEye(eye) {
        gl.uniform3f(this.eye, eye.r, eye.g, eye.b);
    }

    setEyePosition(eyePosition) {
        gl.uniform1f(this.eyePosition, eyePosition);
    }

    setWidth(width) {
        gl.uniform1f(this.width, width);
    }
}