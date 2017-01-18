import * as THREE from 'three';
import glsl from '../lib/glsl';

export default {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        opacity: { type: 'f', value: 1.0 },
        color: { type: 'c', value: new THREE.Color(0xffffff) }
    },

    vertexShader: glsl.vertex.Point,
    fragmentShader: glsl.fragment.Point,
    alphaTest: 0.9
};