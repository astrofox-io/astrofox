import vertex from 'glsl/vertex/Basic';
import fragment from 'glsl/fragment/ColorShift';

export default {
    uniforms: {
        time: { type: 'f', value: 1.0 }
    },

    vertexShader: vertex,
    fragmentShader: fragment
};