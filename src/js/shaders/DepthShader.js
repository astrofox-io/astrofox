var THREE = require('three');

var depthShader = THREE.ShaderLib['depthRGBA'];
var depthUniforms = THREE.UniformsUtils.clone(depthShader.uniforms);

var DepthShader = {
    uniforms: depthUniforms,
    fragmentShader: depthShader.fragmentShader,
    vertexShader: depthShader.vertexShader
};

module.exports = DepthShader;