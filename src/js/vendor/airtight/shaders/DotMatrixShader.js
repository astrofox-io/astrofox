/**
 * @author felixturner / http://airtight.cc/
 *
 * Renders texture as a grid of dots like an LED display.
 * Pass in the webgl canvas dimensions to give accurate pixelization.
 *
 * spacing: distance between dots in px
 * size: radius of dots in px
 * blur: blur radius of dots in px
 * resolution: width and height of webgl canvas
 */

var THREE = require('three');

module.exports = {

    uniforms: {

        "tDiffuse":   { type: "t", value: null },
        "spacing":    { type: "f", value: 10.0 },
        "size":       { type: "f", value: 4.0 },
        "blur":       { type: "f", value: 4.0 },
        "resolution": { type: "v2", value: new THREE.Vector2( 800, 600)  }

    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join("\n"),

    fragmentShader: [

        "uniform sampler2D tDiffuse;",
        "uniform float spacing;",
        "uniform float size;",
        "uniform float blur;",
        "uniform vec2 resolution;",

        "varying vec2 vUv;",

        "void main() {",

        "vec2 count = vec2(resolution/spacing);",
        "vec2 p = floor(vUv*count)/count;",

        "vec4 color = texture2D(tDiffuse, p);",

        "vec2 pos = mod(gl_FragCoord.xy, vec2(spacing)) - vec2(spacing/2.0);",
        "float dist_squared = dot(pos, pos);",
        "gl_FragColor = mix(color, vec4(0.0), smoothstep(size, size + blur, dist_squared));",

        "}"

    ].join("\n")

};