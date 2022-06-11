import {gl} from "./gl.js";

export class Shader {
    static VERTEX_BLIT = `#version 300 es
        out vec2 uv;
        
        void main() {
            uv = vec2(gl_VertexID & 1, (gl_VertexID & 2) >> 1);
            
            gl_Position = vec4(uv * 2. - 1., 0., 1.);
        }`;

    /**
     * Construct a shader
     * @param {String} vertex The vertex shader
     * @param {String} fragment The fragment shader
     */
    constructor(vertex, fragment) {
        const shaderVertex = gl.createShader(gl.VERTEX_SHADER);
        const shaderFragment = gl.createShader(gl.FRAGMENT_SHADER);

        this.program = gl.createProgram();

        gl.shaderSource(shaderVertex, vertex);
        gl.compileShader(shaderVertex);

        if (!gl.getShaderParameter(shaderVertex, gl.COMPILE_STATUS))
            console.error(gl.getShaderInfoLog(shaderVertex));

        gl.shaderSource(shaderFragment, fragment);
        gl.compileShader(shaderFragment);

        if (!gl.getShaderParameter(shaderFragment, gl.COMPILE_STATUS))
            console.error(gl.getShaderInfoLog(shaderFragment));

        gl.attachShader(this.program, shaderVertex);
        gl.attachShader(this.program, shaderFragment);
        gl.linkProgram(this.program);
        gl.detachShader(this.program, shaderVertex);
        gl.detachShader(this.program, shaderFragment);
        gl.deleteShader(shaderVertex);
        gl.deleteShader(shaderFragment);

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS))
            console.error(gl.getProgramInfoLog(this.program));
    }

    /**
     * Get a uniform location
     * @param {string} name The uniform name
     * @returns {GLint} The uniform location
     */
    getUniform(name) {
        return gl.getUniformLocation(this.program, name);
    }

    /**
     * Use this shader
     */
    use() {
        gl.useProgram(this.program);
    }

    /**
     * Free allocated resources
     */
    free() {
        gl.deleteShader(this.program);
    }
}