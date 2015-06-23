varying vec3 vNormal;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    vNormal = normalize( normalMatrix * normal );
}