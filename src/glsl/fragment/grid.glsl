/*
 * http://madebyevan.com/shaders/grid/
 */
#extension GL_OES_standard_derivatives : enable

varying vec3 vPos;
uniform sampler2D tDiffuse;
varying vec2 vUv;

vec4 grid_y() {
    // Pick a coordinate to visualize in a grid
    float coord = vPos.y;

    // Compute anti-aliased world-space grid lines
    float line = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);

    // Just visualize the grid lines directly
    vec4 results = vec4(vec3(1.0 - min(line, 1.0)), 1.0);

    return results;
}

vec4 grid_xz() {
    // Pick a coordinate to visualize in a grid
    vec2 coord = vPos.xz;

    // Compute anti-aliased world-space grid lines
    vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
    float line = min(grid.x, grid.y);

    // Just visualize the grid lines directly
    vec4 results = vec4(vec3(1.0 - min(line, 1.0)), 1.0);

    return results;
}

vec4 grid_xyz() {
    // Pick a coordinate to visualize in a grid
    vec3 coord = vPos.xyz;

    // Compute anti-aliased world-space grid lines
    vec3 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
    float line = min(min(grid.x, grid.y), grid.z);

    // Just visualize the grid lines directly
    vec4 results = vec4(vec3(1.0 - min(line, 1.0)), 1.0);

    return results;
}

vec4 grid_length_xz() {
    // Pick a coordinate to visualize in a grid
    float coord = length(vPos.xz);

    // Compute anti-aliased world-space grid lines
    float line = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);

    // Just visualize the grid lines directly
    vec4 results = vec4(vec3(1.0 - min(line, 1.0)), 1.0);

    return results;
}

vec4 grid_web() {
    // Pick a coordinate to visualize in a grid
    const float pi = 3.141592653589793;
    const float scale = 10.0;
    vec2 coord = vec2(length(vPos.xz), atan(vPos.x, vPos.z) * scale / pi);

    // Handling the wrap-around is tricky in this case. The function atan()
    // is not continuous and jumps when it wraps from -pi to pi. The screen-
    // space partial derivative will be huge along that boundary. To avoid
    // this, compute another coordinate that places the jump at a different
    // place, then use the coordinate where the jump is farther away.
    //
    // When doing this, make sure to always evaluate both fwidth() calls even
    // though we only use one. All fragment shader threads in the thread group
    // actually share a single instruction pointer, so threads that diverge
    // down different conditional branches actually cause both branches to be
    // serialized one after the other. Calling fwidth() from a thread next to
    // an inactive thread ends up reading inactive registers with old values
    // in them and you get an undefined value.
    //
    // The conditional uses +/-scale/2 since coord.y has a range of +/-scale.
    // The jump is at +/-scale for coord and at 0 for wrapped.
    vec2 wrapped = vec2(coord.x, fract(coord.y / (2.0 * scale)) * (2.0 * scale));
    vec2 coordWidth = fwidth(coord);
    vec2 wrappedWidth = fwidth(wrapped);
    vec2 width = coord.y < -scale * 0.5 || coord.y > scale * 0.5 ? wrappedWidth : coordWidth;

    // Compute anti-aliased world-space grid lines
    vec2 grid = abs(fract(coord - 0.5) - 0.5) / width;
    float line = min(grid.x, grid.y);

    // Just visualize the grid lines directly
    vec4 results = vec4(vec3(1.0 - min(line, 1.0)), 1.0);

    return results;
}

void main() {
    // Pick a coordinate to visualize in a grid
    vec2 coord = vPos.xz;

    // Compute anti-aliased world-space grid lines
    vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
    float line = min(grid.x, grid.y);

    // Just visualize the grid lines directly
    gl_FragColor = vec4(vec3(1.0 - min(line, 1.0)), 1.0);
}