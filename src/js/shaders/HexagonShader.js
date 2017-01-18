import * as THREE from 'three';
import glsl from '../lib/glsl';

export default {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        center: { type: 'v2', value: new THREE.Vector2(0.5, 0.5) },
        size: { type: 'f', value: 10.0 },
        resolution: { type: 'v2', value: new THREE.Vector2(854, 480) }
    },

    vertexShader: glsl.vertex.Basic,
    fragmentShader: glsl.fragment.Hexagon
};