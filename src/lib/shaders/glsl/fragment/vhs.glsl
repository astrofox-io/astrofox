uniform sampler2D inputTexture;
uniform vec2 resolution;
uniform float time;
uniform float wave;
uniform float jitter;
uniform float crease;
uniform float switching;
uniform float switchingHeight;
uniform float bloom;
uniform float aberration;
uniform float acBeat;
uniform float grain;
uniform float scanlines;
uniform float vignette;
uniform float saturation;
uniform float exposure;
uniform float barrel;
uniform vec3 bezel;
uniform float creaseNoise;
varying vec2 vUv;

#define PI 3.14159265

float hash(vec2 v) {
    return fract(sin(dot(v, vec2(89.44, 19.36))) * 22189.22);
}

float iHash(vec2 v, vec2 r) {
    float h00 = hash(floor(v * r + vec2(0.0, 0.0)) / r);
    float h10 = hash(floor(v * r + vec2(1.0, 0.0)) / r);
    float h01 = hash(floor(v * r + vec2(0.0, 1.0)) / r);
    float h11 = hash(floor(v * r + vec2(1.0, 1.0)) / r);
    vec2 ip = smoothstep(vec2(0.0), vec2(1.0), mod(v * r, 1.0));
    return (h00 * (1.0 - ip.x) + h10 * ip.x) * (1.0 - ip.y)
        + (h01 * (1.0 - ip.x) + h11 * ip.x) * ip.y;
}

float noise(vec2 v) {
    float sum = 0.0;
    float s = 2.0;
    for (int i = 1; i < 7; i++) {
        sum += iHash(v + vec2(i), vec2(2.0 * s)) / s;
        s *= 2.0;
    }
    return sum;
}

vec4 tape(vec2 p) {
    return texture2D(inputTexture, clamp(p, 0.0005, 0.9995));
}

void main() {
    vec2 uv = vUv;

    float edgeMask = 1.0;
    if (barrel > 0.0) {
        vec2 c = uv * 2.0 - 1.0;
        c *= 1.0 + barrel * 0.15 * dot(c, c);
        float m = max(abs(c.x), abs(c.y));
        edgeMask = 1.0 - smoothstep(1.0 - 0.12 * barrel, 1.0, m);
        if (edgeMask <= 0.0) {
            gl_FragColor = vec4(bezel, 1.0);
            return;
        }
        uv = c * 0.5 + 0.5;
    }

    vec2 uvn = uv;
    float t = time;

    float lineNoise = 0.0;
    if (jitter + crease + switching > 0.0) {
        lineNoise = noise(vec2(uvn.y * 100.0, t * 10.0));
    }

    if (wave > 0.0) {
        uvn.x += (noise(vec2(uvn.y, t)) - 0.5) * 0.005 * wave;
    }
    uvn.x += (lineNoise - 0.5) * 0.01 * jitter;

    float tcPhase = clamp(
        (sin(uvn.y * 8.0 - t * PI * 1.2) - 0.92) * creaseNoise,
        0.0, 0.01
    ) * 10.0 * crease;
    float tcNoise = max(lineNoise - 0.5, 0.0);
    uvn.x -= tcNoise * tcPhase;

    float snPhase = smoothstep(max(switchingHeight, 1e-4), 0.0, uvn.y) * switching;
    uvn.y += snPhase * 0.3;
    uvn.x += snPhase * ((lineNoise - 0.5) * 0.2);

    vec4 base = tape(uvn);
    vec3 col = base.rgb;
    col *= 1.0 - tcPhase;

    col = mix(col, col.yzx, clamp(snPhase, 0.0, 1.0));

    if (bloom > 0.0) {
        float px = aberration / max(resolution.x, 1.0);
        vec3 bloomSum = vec3(0.0);
        for (int i = -8; i <= 2; i++) {
            vec3 s = tape(uvn + vec2(float(i) * px, 0.0)).rgb;
            if (i >= -4) bloomSum.r += s.r;
            if (i >= -6 && i <= 0) bloomSum.g += s.g;
            if (i <= -2) bloomSum.b += s.b;
        }
        bloomSum *= 0.1;

        col = mix(col, (col + bloomSum) / 1.7, clamp(bloom, 0.0, 1.0));
    }

    if (acBeat > 0.0) {
        col *= 1.0 + clamp(
            noise(vec2(0.0, uv.y + t * 0.2)) * 0.6 - 0.25, 0.0, 0.1
        ) * acBeat;
    }

    float g = hash(uv * resolution + fract(t) * vec2(127.1, 311.7)) - 0.5;
    col += g * grain;

    float scan = sin(uv.y * resolution.y * PI) * 0.5;
    col *= 1.0 - scanlines * 0.35 * scan;

    vec2 vd = (uv - 0.5) * vec2(resolution.x / max(resolution.y, 1.0), 1.0);
    col *= 1.0 - vignette * smoothstep(0.4, 1.1, length(vd));

    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(lum), col, clamp(saturation, 0.0, 2.0));

    col *= exposure;

    float alpha = max(base.a, clamp(snPhase + tcPhase, 0.0, 1.0));

    if (barrel > 0.0) {
        col = mix(bezel, col, edgeMask);
        alpha = 1.0;
    }
    gl_FragColor = vec4(col, alpha);
}
