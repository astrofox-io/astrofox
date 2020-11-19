attribute float size;
attribute vec3 customColor;

varying vec3 vColor;

void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    vColor = customColor;

    gl_PointSize = size * (300.0 / -mvPosition.z);

    gl_Position = projectionMatrix * mvPosition;
}