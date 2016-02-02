var THREE = require('three');
var ShaderCode = require('./ShaderCode.js');

var MirrorShader = {
	uniforms: {
        tDiffuse: { type: 't', value: null },
        side: { type: 'i', value: 1 }
	},

	vertexShader: ShaderCode.vertex.Basic,
	fragmentShader: ShaderCode.fragment.Mirror
};

module.exports = MirrorShader;