/**
 * @author felixturner / http://airtight.cc/
 *
 * Tile Shader
 * Tiles top-left of the input
 * Ported from http://pixelshaders.com/examples/
 *
 * size: fraction of screen to tile
 */

module.exports = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"size":  { type: "f", value: 0.5 }

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
		"uniform float size;",
		"varying vec2 vUv;",

		"void main() {",

			"vec2 p = vUv;",
			"p.x = mod(p.x, size);",
			"p.x = abs(p.x - size/2.);",
			"p.y = mod(p.y, size);",
			"p.y = abs(p.y - size/2.);",
			"gl_FragColor = texture2D(tDiffuse, p);",

		"}"

	].join("\n")

};
