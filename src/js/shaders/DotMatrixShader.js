/**
 * @author felixturner / http://airtight.cc/
 *
 * Renders texture as a grid of dots like an LED display.
 * Pass in the webgl canvas dimensions to give accurate pixelization.
 *
 * spacing: distance between dots in px
 * size: radius of dots in px
 * blur: blur radius of dots in px
 * resolution: width and height of webgl canvas
 */

var THREE = require('three');
var ShaderCode = require('shaders/ShaderCode.js');

var DotMatrixShader = {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        spacing: { type: 'f', value: 10.0 },
        size: { type: 'f', value: 4.0 },
        blur: { type: 'f', value: 4.0 },
        resolution: { type: 'v2', value: new THREE.Vector2(854, 480) }
    },

    vertexShader: ShaderCode.vertex.basic,
    fragmentShader: ShaderCode.fragment.dot_matrix
};

module.exports = DotMatrixShader;