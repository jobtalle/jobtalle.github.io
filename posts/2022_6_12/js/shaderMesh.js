import {Shader} from "./shader.js";
import {gl} from "./gl.js";

export class ShaderMesh extends Shader {
    static VERTEX = `#version 300 es
        layout(location=0) in vec4 vertex;
        
        out vec2 uv;
        
        uniform vec2 size;
        
        void main() {
            uv = vertex.zw;
            
            gl_Position = vec4(vertex.x / size.x * 2. - 1., vertex.y / size.y * 2., 0., 1.);
        }`;
    static FRAGMENT = `#version 300 es
        in mediump vec2 uv;
        out lowp vec4 color;
        
        uniform sampler2D source;
        
        void main() {
            color = texture(source, uv);
        }`;

    constructor() {
        super(ShaderMesh.VERTEX, ShaderMesh.FRAGMENT);

        this.size = this.getUniform("size");
    }

    setSize(width, height) {
        gl.uniform2f(this.size, width, height);
    }
}