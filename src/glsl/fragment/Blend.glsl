varying vec2 vUv;
uniform sampler2D tInputDest;
uniform sampler2D tInputSrc;
uniform vec2 resolution;
uniform vec2 resolution2;
uniform int sizeMode;
uniform float aspectRatio;
uniform float aspectRatio2;
uniform int mode;
uniform float opacity;
uniform int multiplyAlpha;

vec2 vUv2;

float applyOverlayToChannel(float dest, float src) {
	return (dest < 0.5 ? (2.0 * dest * src) : (1.0 - 2.0 * (1.0 - dest) * (1.0 - src)));
}

float applySoftLightToChannel(float dest, float src) {
	return ((src < 0.5) ? (2.0 * dest * src + dest * dest * (1.0 - 2.0 * src)) : (sqrt(dest) * (2.0 * src - 1.0) + 2.0 * dest * (1.0 - src)));
}

float applyColorBurnToChannel(float dest, float src) {
	return ((src == 0.0) ? src : max((1.0 - ((1.0 - dest) / src)), 0.0));
}

float applyColorDodgeToChannel(float dest, float src) {
	return ((src == 1.0) ? src : min(dest / (1.0 - src), 1.0));
}

float applyLinearBurnToChannel(float dest, float src) {
	return max(dest + src - 1., 0.0);
}

float applyLinearDodgeToChannel(float dest, float src) {
	return min(dest + src, 1.);
}

float applyLinearLightToChannel(float dest, float src) {
	return (src < .5) ? applyLinearBurnToChannel(dest, 2. * src) : applyLinearDodgeToChannel(dest, 2. * (src - .5));
}

void main() {
	vUv2 = vUv;
	
	if (sizeMode == 1) {
		if (aspectRatio2 > aspectRatio) {
			vUv2.x = vUv.x * aspectRatio / aspectRatio2;
			vUv2.x += .5 * (1. - aspectRatio / aspectRatio2);	
			vUv2.y = vUv.y;
		}

		if (aspectRatio2 < aspectRatio) {
			vUv2.x = vUv.x;
			vUv2.y = vUv.y * aspectRatio2 / aspectRatio;
			vUv2.y += .5 * (1. - aspectRatio2 / aspectRatio);
		}
	}

	vec4 dest = texture2D(tInputDest, vUv);
	vec4 src = texture2D(tInputSrc, vUv2);

    if (multiplyAlpha == 1) {
        src = vec4(src.rgb * src.a, src.a);
    }

	src = src * opacity;

    // none (*)
    if (mode == 0) {
        gl_FragColor = src;
        return;
    }

    // normal
	if (mode == 1) {
		gl_FragColor = mix(dest, src, src.a);
		return;
	}

	// dissolve (*)
	if (mode == 2) {
        return;
	}

	// darken
	if (mode == 3) {
		gl_FragColor = min(dest, src);
		gl_FragColor = gl_FragColor * opacity + dest * (1. - opacity);
		return;
	}

	// multiply
	if (mode == 4) {
		gl_FragColor = src * dest;
		gl_FragColor = gl_FragColor * opacity + dest * (1. - opacity);
		return;
	}

	// color burn
	if (mode == 5) {
		gl_FragColor = vec4(
			applyColorBurnToChannel(dest.r, src.r),
			applyColorBurnToChannel(dest.g, src.g),
			applyColorBurnToChannel(dest.b, src.b),
			applyColorBurnToChannel(dest.a, src.a)
		);
		gl_FragColor = gl_FragColor * opacity + dest * (1. - opacity);
		return;
	}

	// linear burn == subtract?
	if (mode == 6) {
		gl_FragColor = max(dest + src - 1.0, 0.0);
		gl_FragColor = gl_FragColor * opacity + dest * (1. - opacity);
		return;
	}

	// darker color (*)
	if (mode == 7) {
        return;
	}

	// lighten
	if (mode == 8) {
		gl_FragColor = max(dest, src);
		return;
	}

    // screen
	else if (mode == 9) {
		gl_FragColor = (1.0 - ((1.0 - dest) * (1.0 - src)));
		gl_FragColor = gl_FragColor * opacity + dest * (1. - opacity);
		return;
	}

    // color dodge
	if (mode == 10) {
		gl_FragColor = vec4(
			applyColorDodgeToChannel(dest.r, src.r),
			applyColorDodgeToChannel(dest.g, src.g),
			applyColorDodgeToChannel(dest.b, src.b),
			applyColorDodgeToChannel(dest.a, src.a)
		);
		return;
	}
	// linear dodge == add
	if (mode == 11) {
		gl_FragColor = min(dest + src, 1.0);
		return;
	}

    // lighter color (*)
	if (mode == 12) {
        return;
	}

	// overlay
	if (mode == 13) {
		gl_FragColor = vec4(
			applyOverlayToChannel(dest.r, src.r),
			applyOverlayToChannel(dest.g, src.g),
			applyOverlayToChannel(dest.b, src.b),
			applyOverlayToChannel(dest.a, src.a)
		);
		gl_FragColor = gl_FragColor * opacity + dest * (1. - opacity);
		return;
	}

    // soft light
	if (mode == 14) {
		gl_FragColor = vec4(
			applySoftLightToChannel(dest.r, src.r),
			applySoftLightToChannel(dest.g, src.g),
			applySoftLightToChannel(dest.b, src.b),
			applySoftLightToChannel(dest.a, src.a)
		);
		return;
	}

	// hard light (*)
	if (mode == 15) {
		gl_FragColor = vec4(
			applyOverlayToChannel(src.r, dest.r),
			applyOverlayToChannel(src.g, dest.g),
			applyOverlayToChannel(src.b, dest.b),
			applyOverlayToChannel(src.a, dest.a)
		);
		gl_FragColor = gl_FragColor * opacity + dest * (1. - opacity);
		return;
	}

	// vivid light (*)
	if (mode == 16) {
        return;
	}

	// linear light
	if (mode == 17) {
		gl_FragColor = vec4(
			applyLinearLightToChannel(dest.r, src.r),
			applyLinearLightToChannel(dest.g, src.g),
			applyLinearLightToChannel(dest.b, src.b),
			applyLinearLightToChannel(dest.a, src.a)
		);
		gl_FragColor = gl_FragColor * opacity + dest * (1. - opacity);
		return;
	}

	// pin light (*)
	if (mode == 18) {
        return;
	}
    // hard mix (*)
	if (mode == 19) {
        return;
	}

	// difference
	if (mode == 20) {
		gl_FragColor = abs(dest - src);
		gl_FragColor.a = dest.a + src.b;
		return;
	}

	// exclusion
	if (mode == 21) {
		gl_FragColor = dest + src - 2. * dest * src;
		return;
	}

    // subtract (*)
	if (mode == 22) {
        gl_FragColor = dest - (src * dest);
        return;
	}

    // divide (*)
	if (mode == 23) {
        gl_FragColor = dest / src;
        return;
	}

    // add (**)
	if (mode == 24) {
        gl_FragColor = dest + src * src.a;
        return;
	}

    gl_FragColor = vec4(1., 0., 1., 1.);
}