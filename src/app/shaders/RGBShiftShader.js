import vertex from 'glsl/vertex/Basic.glsl';
import fragment from 'glsl/fragment/RGBShift.glsl';

export default {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        amount: { type: 'f', value: 0.005 },
        angle: { type: 'f', value: 0.0 },
    },

    vertexShader: vertex,
    fragmentShader: fragment,
};
