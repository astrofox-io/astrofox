uniform sampler2D inputTexture;
uniform vec2 resolution;
uniform float thickness;
uniform int neon;
uniform vec3 edgeColor;
varying vec2 vUv;

float getLuminance(vec3 c) {
    return dot(c, vec3(0.299, 0.587, 0.114));
}

void main() {
    vec2 texel = thickness / resolution;

    // Sobel kernel samples
    vec3 tl = texture2D(inputTexture, vUv + vec2(-texel.x,  texel.y)).rgb;
    vec3 tc = texture2D(inputTexture, vUv + vec2( 0.0,       texel.y)).rgb;
    vec3 tr = texture2D(inputTexture, vUv + vec2( texel.x,   texel.y)).rgb;
    vec3 ml = texture2D(inputTexture, vUv + vec2(-texel.x,   0.0    )).rgb;
    vec3 mr = texture2D(inputTexture, vUv + vec2( texel.x,   0.0    )).rgb;
    vec3 bl = texture2D(inputTexture, vUv + vec2(-texel.x,  -texel.y)).rgb;
    vec3 bc = texture2D(inputTexture, vUv + vec2( 0.0,      -texel.y)).rgb;
    vec3 br = texture2D(inputTexture, vUv + vec2( texel.x,  -texel.y)).rgb;

    // Sobel in X and Y directions
    vec3 sobelX = -tl - 2.0*ml - bl + tr + 2.0*mr + br;
    vec3 sobelY = -tl - 2.0*tc - tr + bl + 2.0*bc + br;
    float edge = length(vec2(getLuminance(sobelX), getLuminance(sobelY)));
    edge = clamp(edge, 0.0, 1.0);

    vec4 original = texture2D(inputTexture, vUv);

    if (neon > 0) {
        // Neon: edges glow on black background
        gl_FragColor = vec4(edgeColor * edge, 1.0);
    } else {
        // Outline: draw edges over original image
        vec3 col = mix(original.rgb, edgeColor, edge);
        gl_FragColor = vec4(col, original.a);
    }
}
