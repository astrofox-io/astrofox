import { ShaderLib, UniformsUtils } from 'three';
const depthShader = ShaderLib['depthRGBA'];
const depthUniforms = UniformsUtils.clone(depthShader.uniforms);

export default {
    uniforms: depthUniforms,
    fragmentShader: depthShader.fragmentShader,
    vertexShader: depthShader.vertexShader
};