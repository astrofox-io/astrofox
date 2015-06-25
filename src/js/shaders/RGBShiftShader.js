/**
 * @author felixturner / http://airtight.cc/
 *
 * RGB Shift Shader
 * Shifts red and blue channels from center in opposite directions
 * Ported from http://kriss.cx/tom/2009/05/rgb-shift/
 * by Tom Butterworth / http://kriss.cx/tom/
 *
 * amount: shift distance (1 is width of input)
 * angle: shift angle in radians
 */

var THREE = require('three');
var ShaderCode = require('shaders/ShaderCode.js');

var RGBShiftShader = {
	uniforms: {
        tDiffuse: { type: 't', value: null },
        amount: { type: 'f', value: 0.005 },
        angle: { type: 'f', value: 0.0 }
	},

	vertexShader: ShaderCode.vertex.basic,
	fragmentShader: ShaderCode.fragment.rgb_shift
};

module.exports = RGBShiftShader;