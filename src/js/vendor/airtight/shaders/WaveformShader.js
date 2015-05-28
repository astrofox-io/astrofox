/**
 * @author felixturner / http://airtight.cc/
 *
 * Waveform Shader
 * Distort video based on audio waveform
 *
 * waveform: 512 floats of audio data passed in every frame
 * distortion: amount of waveform distortion
 */

module.exports = {
	uniforms: {
		"tDiffuse": { type: "t", value: null },
		"waveform":     { type: "uniform1fv", value: null },
		"distortion":     { type: "f", value: 0.3 },
		"waveSize":     { type: "f", value: 256.0 }
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
		"uniform float distortion;",
		"uniform float waveform[ 256 ];",
		"varying vec2 vUv;",
		"uniform float waveSize;",
		"void main() {",
		"vec2 p = vUv;",
		//get closest waveform array index
		"int i = int(vUv.y*waveSize);",
		"float offset = waveform[i]*distortion;",
		"gl_FragColor = texture2D(tDiffuse,  vec2(fract(p.x + offset),p.y));",

		"}"

	].join("\n")

};
