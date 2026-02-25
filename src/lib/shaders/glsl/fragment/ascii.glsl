uniform sampler2D inputTexture;
uniform vec2 resolution;
uniform float charSize;
uniform int colored;
varying vec2 vUv;

float getLuminance(vec3 c) {
    return dot(c, vec3(0.299, 0.587, 0.114));
}

// Returns fill pattern intensity for a given density level (0-1)
// at local UV within the character cell (0-1)
float charPattern(vec2 p, float level) {
    // Level 0.00-0.20: empty (space)
    if (level < 0.20) return 0.0;

    // Level 0.20-0.40: dots at center
    if (level < 0.40) {
        float d = length(p - 0.5);
        return 1.0 - step(0.15, d);
    }

    // Level 0.40-0.60: cross / plus sign
    if (level < 0.60) {
        float h = 1.0 - step(0.1, abs(p.y - 0.5));
        float v = 1.0 - step(0.1, abs(p.x - 0.5));
        return max(h, v);
    }

    // Level 0.60-0.80: grid (#-like)
    if (level < 0.80) {
        float h = step(0.45, fract(p.y * 2.0));
        float v = step(0.45, fract(p.x * 2.0));
        return max(h, v);
    }

    // Level 0.80-1.00: solid fill
    return 1.0;
}

void main() {
    vec2 blockSize = vec2(charSize) / resolution;

    // UV of the top-left corner of the current character block
    vec2 blockOrigin = floor(vUv / blockSize) * blockSize;

    // Sample from center of block to get representative color
    vec4 blockColor = texture2D(inputTexture, blockOrigin + blockSize * 0.5);
    float lum = getLuminance(blockColor.rgb);

    // Local position within the block (0..1)
    vec2 localUV = fract(vUv / blockSize);

    float pattern = charPattern(localUV, lum);

    if (colored > 0) {
        gl_FragColor = vec4(blockColor.rgb * pattern, blockColor.a);
    } else {
        gl_FragColor = vec4(vec3(pattern), blockColor.a);
    }
}
