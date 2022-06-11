import {Shader} from "./shader.js";

export class ShaderBlit extends Shader {
    static FRAGMENT = `#version 300 es
        in mediump vec2 uv;
        out lowp vec4 color;
        
        uniform sampler2D source;
        
        void main() {
            color = texture(source, uv);
        }`;

    constructor() {
        super(Shader.VERTEX_BLIT, ShaderBlit.FRAGMENT);
    }
}