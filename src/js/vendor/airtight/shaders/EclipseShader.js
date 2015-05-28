/**
 * @author felixturner / http://airtight.cc/
 *
 * Draw lines and dots
 * Used in Ripples Viz.
 */

module.exports = {

	uniforms: {

		"volume": { type: "f", value: 1.0 },
		"smoothedVolume": { type: "f", value: 1.0 },
		// "noiseSize": { type: "f", value: 2.0 },
		// "lineTime": { type: "f", value: 1.0 },
		// "lineCount": { type: "f", value: 40.0 },
		// "dotSize": { type: "f", value: 0.3 },
		// "lineSize": { type: "f", value: 0.1 },
		// "blur": { type: "f", value: 0.05 },
		// "depth": { type: "f", value: 300 },


	},

	vertexShader: [

		"varying vec2 vUv;",
		//"varying float vNoiseDisp;",
		"uniform float noiseTime;",
		//"uniform float noiseSize;",
		//"uniform float depth;",

		"uniform float volume;",
		"uniform float smoothedVolume;",

	
		//normal disp
		"void main() {",
			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}",

	].join("\n"),

	fragmentShader: [


		"const float dots = 10.;", //number of lights
		"const float radius = .24;", //radius of light ring
		//"const float brightness = 0.012;",


		"varying vec2 vUv;",
		"uniform float noiseTime;",
		"uniform float volume;",
		"uniform float smoothedVolume;",

		//convert HSV to RGB
		"vec3 hsv2rgb(vec3 c){",
			"vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);",
			"vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);",
			"return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);",
		"}",
				
		"void main( void ) {",
			
			"vec2 p=2.* vUv - 1.;",
			"vec3 c=vec3(0,0,0.1);", //background color

			"float size = 0.3 + smoothedVolume;",
				
			"for(float i=0.;i<dots; i++){",
			
				//read frequency for this dot from audio input channel 
				//based on its index in the circle
				//"float vol =  1.0;",
				"float b = volume * 0.01;",
				

				//get location of dot
				"float x = size*radius*cos(2.*3.14*float(i)/dots);",
				"float y = size*radius*sin(2.*3.14*float(i)/dots);",
				"vec2 o = vec2(x,y);",
				
				//get color of dot based on its index in the 
				//circle + time to rotate colors
				"vec3 dotCol = hsv2rgb(vec3((i + noiseTime*10000.)/dots,1.,1.0));",
				
				//get brightness of this pixel based on distance to dot
				"c += b/(length(p-o))*dotCol;",
			"}",
			
			//black circle overlay	   
			"float dist = distance(p , vec2(0));  ",
			"c = mix(vec3(0), c, smoothstep(size * 0.26, size * 0.28, dist));",
			
			"gl_FragColor = vec4(c,1);",
		"}",





		].join("\n")

	};
