/**
 * @author felixturner / http://airtight.cc/
 *
 * draw B + W dots!
 */

module.exports = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"dots":     { type: "f", value: 10.0 },
		"spacing":     { type: "f", value: 10.0 },
		"size":     { type: "f", value: 4.0 },
		"blur":     { type: "f", value: 4.0 }

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
		"uniform float dots;",
		"uniform float size;",
		"uniform float blur;",

		"varying vec2 vUv;",

		"void main() {",



			"vec2 nearest = 2.0*fract(dots * vUv) - 1.0;",
			"float dist = length(nearest);",
			"vec3 white = vec3(1.0, 1.0, 1.0);",
			"vec3 black = vec3(0.0, 0.0, 0.0);",
			"vec3 fragcolor = mix(black, white, step(size, dist));",
			"gl_FragColor = vec4(fragcolor, 1.0);",



			// "vec2 center = vec2(0.5,0.5);",

			// //get coord of center of circ
			// "vec2 p = vUv;",
			// "p = floor(vUv * dots - center)/dots;",

			// //get color for center of circ
			// "vec4 col = texture2D(tDiffuse, p);",


			// //get distance between here and center of circ
			// "float len = distance(vUv,p);",

			// //draw circ
			// "gl_FragColor = mix(col, vec4(0.0), smoothstep(size, size + blur, len));",

			//"gl_FragColor = col;",




			// "vec2 p = vUv;",

			// //get position of this px relative to center of circ
			// "vec2 pos = mod(gl_FragCoord.xy, vec2(spacing)) - vec2(spacing/2.0);",

			// //"vec4 color = texture2D(tDiffuse, p);",
			// "vec4 color = texture2D(tDiffuse, gl_FragCoord.xy - pos);",


			// //"vec2 center_pos = floor(gl_FragCoord.xy / spacing)*spacing;",
			// //"vec4 color = texture2D(tDiffuse, center_pos);",


			// //get length of pos without sqr root (optimization)
			// "float dist_squared = dot(pos, pos);",

			// //mix between px color and black based on distance from center
			// "gl_FragColor = mix(color, vec4(0.0), smoothstep(size, size + blur, dist_squared));",

		"}"

		].join("\n")

	};
