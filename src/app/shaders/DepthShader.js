import { ShaderLib, UniformsUtils } from 'three';

const { uniforms, fragmentShader, vertexShader } = ShaderLib.depthRGBA;

export default {
    uniforms: UniformsUtils.clone(uniforms),
    fragmentShader,
    vertexShader,
};
