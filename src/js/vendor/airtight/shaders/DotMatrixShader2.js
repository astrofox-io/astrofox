/**
 * @author felixturner / http://airtight.cc/
 *
 * Renders texture as a grid of dots
 *
 * dots: number of dots on x + y axis
 * size: size of dot within dot area 0-1
 * blur: size of blur within dot area 0-1
 */

 THREE.DotMatrixShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"dots":  { type: "f", value: 40.0 }, //size of dot area as fraction of screen
		"size":     { type: "f", value: 0.3 }, //0-1 size of dot within dot area
		"blur":     { type: "f", value: 0.3 } //size of blur within dot area

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
		"uniform float dots;",
		"uniform float size;",
		"uniform float blur;",

		"varying vec2 vUv;",

		"void main() {",

			"float dotSize = 1.0/dots;",
			"vec2 samplePos = vUv - mod(vUv, dotSize) + 0.5 * dotSize;",
			"float distanceFromSamplePoint = distance(samplePos, vUv);",
			"vec4 col = texture2D(tDiffuse, samplePos);",
			"gl_FragColor = mix(col, vec4(0.0), smoothstep(dotSize * size, dotSize *(size + blur), distanceFromSamplePoint));",

		"}"

		].join("\n")

	};
