uniform sampler2D tDiffuse;
uniform vec2 delta;
uniform vec2 resolution;

varying vec2 vUv;

void main() {
    vec4 sum = vec4( 0.0 );
	vec2 inc = delta / resolution;

	sum += texture2D( tDiffuse, ( vUv - inc * 4.0 ) ) * 0.051;
	sum += texture2D( tDiffuse, ( vUv - inc * 3.0 ) ) * 0.0918;
	sum += texture2D( tDiffuse, ( vUv - inc * 2.0 ) ) * 0.12245;
	sum += texture2D( tDiffuse, ( vUv - inc * 1.0 ) ) * 0.1531;
	sum += texture2D( tDiffuse, ( vUv + inc * 0.0 ) ) * 0.1633;
	sum += texture2D( tDiffuse, ( vUv + inc * 1.0 ) ) * 0.1531;
	sum += texture2D( tDiffuse, ( vUv + inc * 2.0 ) ) * 0.12245;
	sum += texture2D( tDiffuse, ( vUv + inc * 3.0 ) ) * 0.0918;
	sum += texture2D( tDiffuse, ( vUv + inc * 4.0 ) ) * 0.051;
    
    gl_FragColor = sum;
}