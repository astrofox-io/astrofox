uniform sampler2D tBase;
uniform sampler2D tBlend;
uniform int mode;
uniform int alpha;
uniform float opacity;

varying vec2 vUv;

// Color Dodge
float blendColorDodge(float base, float blend) {
    return (blend==1.0)?blend:min(base/(1.0-blend),1.0);
}

vec3 blendColorDodge(vec3 base, vec3 blend) {
    return vec3(blendColorDodge(base.r,blend.r),blendColorDodge(base.g,blend.g),blendColorDodge(base.b,blend.b));
}

// Color Burn
float blendColorBurn(float base, float blend) {
    return (blend==0.0)?blend:max((1.0-((1.0-base)/blend)),0.0);
}

vec3 blendColorBurn(vec3 base, vec3 blend) {
    return vec3(blendColorBurn(base.r,blend.r),blendColorBurn(base.g,blend.g),blendColorBurn(base.b,blend.b));
}

// Vivid Light
float blendVividLight(float base, float blend) {
    return (blend<0.5)?blendColorBurn(base,(2.0*blend)):blendColorDodge(base,(2.0*(blend-0.5)));
}

vec3 blendVividLight(vec3 base, vec3 blend) {
    return vec3(blendVividLight(base.r,blend.r),blendVividLight(base.g,blend.g),blendVividLight(base.b,blend.b));
}
// Hard Mix
float blendHardMix(float base, float blend) {
    return (blendVividLight(base,blend)<0.5)?0.0:1.0;
}

vec3 blendHardMix(vec3 base, vec3 blend) {
    return vec3(blendHardMix(base.r,blend.r),blendHardMix(base.g,blend.g),blendHardMix(base.b,blend.b));
}

// Linear Dodge
float blendLinearDodge(float base, float blend) {
    // Note : Same implementation as BlendAddf
    return min(base+blend,1.0);
}

vec3 blendLinearDodge(vec3 base, vec3 blend) {
    // Note : Same implementation as BlendAdd
    return min(base+blend,vec3(1.0));
}

// Linear Burn
float blendLinearBurn(float base, float blend) {
    // Note : Same implementation as BlendSubtractf
    return max(base+blend-1.0,0.0);
}

vec3 blendLinearBurn(vec3 base, vec3 blend) {
    // Note : Same implementation as BlendSubtract
    return max(base+blend-vec3(1.0),vec3(0.0));
}

// Linear Light
float blendLinearLight(float base, float blend) {
    return blend<0.5?blendLinearBurn(base,(2.0*blend)):blendLinearDodge(base,(2.0*(blend-0.5)));
}

vec3 blendLinearLight(vec3 base, vec3 blend) {
    return vec3(blendLinearLight(base.r,blend.r),blendLinearLight(base.g,blend.g),blendLinearLight(base.b,blend.b));
}

// Lighten
float blendLighten(float base, float blend) {
    return max(blend,base);
}

vec3 blendLighten(vec3 base, vec3 blend) {
    return vec3(blendLighten(base.r,blend.r),blendLighten(base.g,blend.g),blendLighten(base.b,blend.b));
}

// Darken
float blendDarken(float base, float blend) {
    return min(blend,base);
}

vec3 blendDarken(vec3 base, vec3 blend) {
    return vec3(blendDarken(base.r,blend.r),blendDarken(base.g,blend.g),blendDarken(base.b,blend.b));
}

// Pin Light
float blendPinLight(float base, float blend) {
    return (blend<0.5)?blendDarken(base,(2.0*blend)):blendLighten(base,(2.0*(blend-0.5)));
}

vec3 blendPinLight(vec3 base, vec3 blend) {
    return vec3(blendPinLight(base.r,blend.r),blendPinLight(base.g,blend.g),blendPinLight(base.b,blend.b));
}

// Reflect
float blendReflect(float base, float blend) {
    return (blend==1.0)?blend:min(base*base/(1.0-blend),1.0);
}

vec3 blendReflect(vec3 base, vec3 blend) {
    return vec3(blendReflect(base.r,blend.r),blendReflect(base.g,blend.g),blendReflect(base.b,blend.b));
}

// Glow
vec3 blendGlow(vec3 base, vec3 blend) {
    return blendReflect(blend,base);
}

// Overlay
float blendOverlay(float base, float blend) {
    return base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));
}

vec3 blendOverlay(vec3 base, vec3 blend) {
    return vec3(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b));
}

// Hard Light
vec3 blendHardLight(vec3 base, vec3 blend) {
    return blendOverlay(blend,base);
}

// Phoenix
vec3 blendPhoenix(vec3 base, vec3 blend) {
    return min(base,blend)-max(base,blend)+vec3(1.0);
}

// Normal
vec3 blendNormal(vec3 base, vec3 blend) {
    return blend;
}

// Negation
vec3 blendNegation(vec3 base, vec3 blend) {
    return vec3(1.0)-abs(vec3(1.0)-base-blend);
}

// Multiply
vec3 blendMultiply(vec3 base, vec3 blend) {
    return base*blend;
}

// Average
vec3 blendAverage(vec3 base, vec3 blend) {
    return (base+blend)/2.0;
}

// Screen
float blendScreen(float base, float blend) {
    return 1.0-((1.0-base)*(1.0-blend));
}

vec3 blendScreen(vec3 base, vec3 blend) {
    return vec3(blendScreen(base.r,blend.r),blendScreen(base.g,blend.g),blendScreen(base.b,blend.b));
}

// Soft Light
float blendSoftLight(float base, float blend) {
    return (blend<0.5)?(2.0*base*blend+base*base*(1.0-2.0*blend)):(sqrt(base)*(2.0*blend-1.0)+2.0*base*(1.0-blend));
}

vec3 blendSoftLight(vec3 base, vec3 blend) {
    return vec3(blendSoftLight(base.r,blend.r),blendSoftLight(base.g,blend.g),blendSoftLight(base.b,blend.b));
}

// Subtract
float blendSubtract(float base, float blend) {
    return max(base+blend-1.0,0.0);
}

vec3 blendSubtract(vec3 base, vec3 blend) {
    return max(base+blend-vec3(1.0),vec3(0.0));
}

// Exclusion
vec3 blendExclusion(vec3 base, vec3 blend) {
    return base+blend-2.0*base*blend;
}

// Difference
vec3 blendDifference(vec3 base, vec3 blend) {
    return abs(base-blend);
}

// Add
float blendAdd(float base, float blend) {
    return min(base+blend,1.0);
}

vec3 blendAdd(vec3 base, vec3 blend) {
    return min(base+blend,vec3(1.0));
}

vec3 blendMode(int mode, vec3 base, vec3 blend) {
    if (mode == 1) {
        return blendAdd(base, blend);
    }
    if (mode == 2) {
        return blendAverage(base, blend);
    }
    if (mode == 3) {
        return blendColorBurn(base, blend);
    }
    if (mode == 4) {
        return blendColorDodge(base, blend);
    }
    if (mode == 5) {
        return blendDarken(base, blend);
    }
    if (mode == 6) {
        return blendDifference(base, blend);
    }
    if (mode == 7) {
        return blendExclusion(base, blend);
    }
    if (mode == 8) {
        return blendGlow(base, blend);
    }
    if (mode == 9) {
        return blendHardLight(base, blend);
    }
    if (mode == 10) {
        return blendHardMix(base, blend);
    }
    if (mode == 11) {
        return blendLighten(base, blend);
    }
    if (mode == 12) {
        return blendLinearBurn(base, blend);
    }
    if (mode == 13) {
        return blendLinearDodge(base, blend);
    }
    if (mode == 14) {
        return blendLinearLight(base, blend);
    }
    if (mode == 15) {
        return blendMultiply(base, blend);
    }
    if (mode == 16) {
        return blendNegation(base, blend);
    }
    if (mode == 17) {
        return blendNormal(base, blend);
    }
    if (mode == 18) {
        return blendOverlay(base, blend);
    }
    if (mode == 19) {
        return blendPhoenix(base, blend);
    }
    if (mode == 20) {
        return blendPinLight(base, blend);
    }
    if (mode == 21) {
        return blendReflect(base, blend);
    }
    if (mode == 22) {
        return blendScreen(base, blend);
    }
    if (mode == 23) {
        return blendSoftLight(base, blend);
    }
    if (mode == 24) {
        return blendSubtract(base, blend);
    }
    if (mode == 25) {
        return blendVividLight(base, blend);
    }

    return vec3(1., 0., 1.);
}

void main() {
    vec4 base = texture2D(tBase, vUv);
    vec4 blend = texture2D(tBlend, vUv) * opacity;

    if (alpha == 1) {
        //blend.rgb /= blend.a + 0.00001;
    }

    vec3 color = blendMode(mode, base.rgb, blend.rgb / (blend.a + 0.0001));

    gl_FragColor = mix(base, vec4(color, 1.0), blend.a);
}