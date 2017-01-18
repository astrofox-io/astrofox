import * as THREE from 'three';
const depthShader = THREE.ShaderLib['depthRGBA'];
const depthUniforms = THREE.UniformsUtils.clone(depthShader.uniforms);

export default {
    uniforms: depthUniforms,
    fragmentShader: depthShader.fragmentShader,
    vertexShader: depthShader.vertexShader
};