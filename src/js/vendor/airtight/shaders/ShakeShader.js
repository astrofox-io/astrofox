/**
 * @author felixturner / http://airtight.cc/
 *
 *	That ol' shakey cam
 */

module.exports = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"time":     { type: "f", value: 0.0 },
		"amount":  { type: "f", value: 0.05 } //max shake amount as fraction of screen size

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
		"uniform float time;",
		"uniform float amount;",

		"varying vec2 vUv;",

		"float rand(vec2 co){",
			"return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);",
		"}",


		"void main() {",

			"vec2 p = vUv;",
			"vec2 offset = vec2((rand(vec2(time,time)) - 0.5)*amount,(rand(vec2(time + 999.0,time + 999.0))- 0.5) *amount);",
			"p += offset;",
			"gl_FragColor = texture2D(tDiffuse, p);",



		"}"

	].join("\n")

};
