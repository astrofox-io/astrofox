/**
 * @author Felix Turner / www.airtight.cc / @felixturner
 *
 * Static effect. Additively blended digital noise.
 *
 * amount - amount of noise to add (0 - 1)
 * size - size of noise grains (pixels)
 *
 * The MIT License
 * 
 * Copyright (c) 2014 Felix Turner
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */

module.exports = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"time":     { type: "f", value: 0.0 },
		"amount":   { type: "f", value: 0.5 },
		"size":     { type: "f", value: 4.0 }
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
	"uniform float size;",

	"varying vec2 vUv;",

	// Start Ashima 2D Simplex Noise

	//outputs in range -1 to 1

	"vec3 mod289(vec3 x) {",
	  "return x - floor(x * (1.0 / 289.0)) * 289.0;",
	"}",

	"vec2 mod289(vec2 x) {",
	  "return x - floor(x * (1.0 / 289.0)) * 289.0;",
	"}",

	"vec3 permute(vec3 x) {",
	  "return mod289(((x*34.0)+1.0)*x);",
	"}",

	"float snoise(vec2 v) {",

		"const vec4 C = vec4(0.211324865405187,",  // (3.0-sqrt(3.0))/6.0
		"				  0.366025403784439,",  // 0.5*(sqrt(3.0)-1.0)
		"				 -0.577350269189626,",  // -1.0 + 2.0 * C.x
		"				  0.024390243902439);", // 1.0 / 41.0",

		"vec2 i  = floor(v + dot(v, C.yy) );",
		"vec2 x0 = v -   i + dot(i, C.xx);",

		"vec2 i1;",
		"i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);",
		"vec4 x12 = x0.xyxy + C.xxzz;",
		"x12.xy -= i1;",

		"i = mod289(i); // Avoid truncation effects in permutation",
		"vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))",
		"	+ i.x + vec3(0.0, i1.x, 1.0 ));",

		"vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);",
		"m = m*m ;",
		"m = m*m ;",

		"vec3 x = 2.0 * fract(p * C.www) - 1.0;",
		"vec3 h = abs(x) - 0.5;",
		"vec3 ox = floor(x + 0.5);",
		"vec3 a0 = x - ox;",

		"m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );",

		"vec3 g;",
		"g.x  = a0.x  * x0.x  + h.x  * x0.y;",
		"g.yz = a0.yz * x12.xz + h.yz * x12.yw;",
		"return 130.0 * dot(m, g);",
	"}",

	// End Ashima 2D Simplex Noise


	"float rand(vec2 co){",
		"return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);",
	"}",

	"float fastNoise(vec2 n) {",
		"const vec2 d = vec2(0.0, 1.0);",
		"vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));",
		"return mix(mix(rand(b), rand(b + d.yx ), f.x), mix(rand(b + d.xy ), rand(b + d.yy ), f.x), f.y);",
	"}",


	"void main() {",
		"vec2 p = vUv;",
		"vec4 color = texture2D(tDiffuse, p);",
		"float xs = floor(gl_FragCoord.x / size);",
		"float ys = floor(gl_FragCoord.y / size);",
		//"vec4 snow = vec4(snoise(vec2(xs * time,ys * time))*amount);",


		"vec4 snow = vec4(1.,1.,1.,(snoise(vec2(xs * time,ys * time))/2.0 + 0.5)*amount);",

		//"gl_FragColor = color + amount * ( snow - color );", //interpolate - greyer

		//"gl_FragColor = color + (snow/2.0 + 0.5);", //additive - whiter
		//"gl_FragColor = color - (snow/2.0 + 0.5);", //darker


		"gl_FragColor = color - snow;", //darker

	"}"

	].join("\n")

};
