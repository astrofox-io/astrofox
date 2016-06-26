const THREE = require('three');
const depthShader = THREE.ShaderLib['depthRGBA'];
const depthUniforms = THREE.UniformsUtils.clone(depthShader.uniforms);

module.exports = {
    uniforms: depthUniforms,
    fragmentShader: depthShader.fragmentShader,
    vertexShader: depthShader.vertexShader
};