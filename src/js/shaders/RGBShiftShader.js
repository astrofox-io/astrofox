var THREE = require('three');
var ShaderCode = require('./ShaderCode.js');

var RGBShiftShader = {
	uniforms: {
        tDiffuse: { type: 't', value: null },
        amount: { type: 'f', value: 0.005 },
        angle: { type: 'f', value: 0.0 }
	},

	vertexShader: ShaderCode.vertex.Basic,
	fragmentShader: ShaderCode.fragment.RGBShift
};

module.exports = RGBShiftShader;