const THREE = require('three');
const ShaderCode = require('./ShaderCode');

module.exports = {
	uniforms: {
        tDiffuse: { type: 't', value: null },
        side: { type: 'i', value: 1 }
	},

	vertexShader: ShaderCode.vertex.Basic,
	fragmentShader: ShaderCode.fragment.Mirror
};