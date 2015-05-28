/**
 * @author @felixturner / www.airtight.cc
 *
 * Strobe brightness
 * brightness: -1 to 1 (-1 is solid black, 1 is solid white)
 * period: duration of strobe
 * time: steadily increasing float passed in (assuming incremented by 0.1 each frame)
 */

module.exports = {

	uniforms: {

		"tDiffuse":   { type: "t", value: null },
		"brightness": { type: "f", value: -1.0 },
		"period":   { type: "f", value: 2.0 },
		"time":     { type: "f", value: 0.0 }

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
		"uniform float brightness;",
		"uniform float time;",
		"uniform float period;",

		"varying vec2 vUv;",

		"void main() {",

			"gl_FragColor = texture2D( tDiffuse, vUv );",

			//smooth strobe
			"gl_FragColor.rgb += brightness * mod(time * 10.0, period)/period;",

			//smooth + brighter - retains orig color 50% of the time
			//"float t = (mod(time * 10.0, period))/period;",
			//"gl_FragColor.rgb += brightness * (clamp(t - 0.5,0.0,1.0)*2.0);",

			//binary strobe - more harsh
			//"gl_FragColor.rgb += brightness * floor((mod(time * 10.0, period))/period + 0.5);",


		"}"

	].join("\n")

};



