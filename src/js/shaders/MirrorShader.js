/**
 * @author felixturner / http://airtight.cc/
 *
 * Mirror Shader
 * Copies half the input to the other half
 *
 * side: side of input to mirror (0 = left, 1 = right, 2 = top, 3 = bottom)
 */

var THREE = require('three');
var ShaderCode = require('shaders/ShaderCode.js');

var MirrorShader = {
	uniforms: {
        tDiffuse: { type: 't', value: null },
        side: { type: 'i', value: 1 }
	},

	vertexShader: ShaderCode.vertex.basic,
	fragmentShader: ShaderCode.fragment.mirror
};

module.exports = MirrorShader;