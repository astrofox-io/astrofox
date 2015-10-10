/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Dot screen shader
 * based on glfx.js sepia shader
 * https://github.com/evanw/glfx.js
 */

var THREE = require('three');
var ShaderCode = require('shaders/ShaderCode.js');

var DotScreenShader = {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        tSize: { type: 'v2', value: new THREE.Vector2(256, 256) },
        center: { type: 'v2', value: new THREE.Vector2(0.5, 0.5) },
        angle: { type: 'f', value: 1.57 },
        scale: { type: 'f', value: 1.0 }
    },

    vertexShader: ShaderCode.vertex.Basic,
    fragmentShader: ShaderCode.fragment.DotScreen
};

module.exports = DotScreenShader;