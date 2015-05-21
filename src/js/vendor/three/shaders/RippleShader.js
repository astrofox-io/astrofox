/**
 * @author felixturner / http://airtight.cc/
 *
 * Draw lines and dots
 * Used in Ripples Viz.
 */

module.exports = {

    uniforms: {

        "noiseTime": { type: "f", value: 1.0 },
        "noiseSize": { type: "f", value: 2.0 },
        "lineTime": { type: "f", value: 1.0 },
        "lineCount": { type: "f", value: 40.0 },
        "dotSize": { type: "f", value: 0.3 },
        "lineSize": { type: "f", value: 0.1 },
        "blur": { type: "f", value: 0.05 },
        "depth": { type: "f", value: 300 },


    },

    vertexShader: [

        "varying vec2 vUv;",
        "varying float vNoiseDisp;",

        "uniform float noiseTime;",
        "uniform float noiseSize;",
        "uniform float depth;",

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

        //normal disp
        "void main() {",
        "vUv = uv;",
        "vNoiseDisp = snoise(vUv*noiseSize + noiseTime) ;",
        "vec3 newPosition = position + normal * vNoiseDisp *depth;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );",

        "}",

    ].join("\n"),

    fragmentShader: [

        "const vec3 black = vec3(0.0, 0.0, 0.0);",

        "uniform float lineTime;",
        "uniform float noiseTime;",
        "uniform float lineCount;",
        "uniform float dotSize;",
        "uniform float lineSize;",
        "uniform float blur;",

        "varying vec2 vUv;",
        "varying float vNoiseDisp;",

        "vec3 hsv2rgb(vec3 c){",
        "vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);",
        "vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);",
        "return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);",
        "}",



        "void main() {",

        //HSV color gradient
        "vec3 c = hsv2rgb(vec3((vUv.x + noiseTime, 0.8, 0.7)));",

        //draw dots
        "vec2 p = vUv;",
        "p.y += lineTime;",

        //find nearest dot posn
        "vec2 nearest = 2.0*fract(lineCount * p) - 1.0;",
        "float dist = length(nearest);",
        "vec3 dotcol = mix(c, black, smoothstep(dotSize, dotSize + dotSize*blur, dist));",

        //draw lines
        "float x = fract(p.y * lineCount) - .5 + lineSize/2.;",
        "float f = smoothstep(-lineSize*blur,0.0, x) - smoothstep(lineSize, lineSize + lineSize*blur, x);",
        "vec3 linecol = mix(black, c, f);",

        //make lines darker based on z pos. Lines further back are darker
        "vec3 fragcol = mix(linecol + dotcol, black, -vNoiseDisp );",


        "gl_FragColor = vec4(fragcol, 1.0);",
        //"gl_FragColor = vec4(white, 1.0);",
        "}",




    ].join("\n")

};