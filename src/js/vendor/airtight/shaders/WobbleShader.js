/**
 * @author felixturner / http://airtight.cc/
 *
 * Ported from http://pixelshaders.com/examples/
 */

module.exports = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"time":     { type: "f", value: 0.0 },
		"distortion":  { type: "f", value: 3.0 }

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
		"uniform float distortion;",

		"varying vec2 vUv;",

		"void main() {",

			"vec2 p = vUv;",
			"p.x = p.x + sin(p.y*distortion+time*60.)*0.03;",
			"gl_FragColor = texture2D(tDiffuse, p);",



		"}"

	].join("\n")

};
