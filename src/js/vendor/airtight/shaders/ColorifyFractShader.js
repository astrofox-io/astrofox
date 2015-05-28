/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Colorify shader
 * MODIFIED TO ADD AMOUNT??
 */

var THREE = require('three');

module.exports = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"color":    { type: "c", value: new THREE.Color( 0xffffff ) },
		"amount":   { type: "f", value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform vec3 color;",
		"uniform sampler2D tDiffuse;",
		"uniform float amount;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 texel = texture2D( tDiffuse, vUv );",

			"vec3 luma = vec3( 0.299, 0.587, 0.114 );",
			"float v = dot( texel.xyz, luma );",

			"vec4 col = vec4( v * color, texel.w );",


			//"gl_FragColor.rgb = gl_FragColor.rgb * amount;// + (1.0 - amount) * col;",
			//"gl_FragColor = mix( gl_FragColor.rgb, col, amount );",

			"gl_FragColor = texel + amount * ( col - texel );", //interpolate

		"}"

	].join("\n")

};
