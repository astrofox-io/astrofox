uniform sampler2D tDiffuse;
uniform vec2 center;
uniform float size;
uniform vec2 resolution;
varying vec2 vUv;

void main() {
    vec2 tex = (vUv * resolution - center) / size;
    tex.y /= 0.866025404;
    tex.x -= tex.y * 0.5;
    
    vec2 a;
    if (tex.x + tex.y - floor(tex.x) - floor(tex.y) < 1.0) {
        a = vec2(floor(tex.x), floor(tex.y));
    }
    else {
        a = vec2(ceil(tex.x), ceil(tex.y));
    }
    
    vec2 b = vec2(ceil(tex.x), floor(tex.y));
    vec2 c = vec2(floor(tex.x), ceil(tex.y));
    
    vec3 TEX = vec3(tex.x, tex.y, 1.0 - tex.x - tex.y);
    vec3 A = vec3(a.x, a.y, 1.0 - a.x - a.y);
    vec3 B = vec3(b.x, b.y, 1.0 - b.x - b.y);
    vec3 C = vec3(c.x, c.y, 1.0 - c.x - c.y);
    
    float alen = length(TEX - A);
    float blen = length(TEX - B);
    float clen = length(TEX - C);
    
    vec2 choice;
    if (alen < blen) {
        if (alen < clen) choice = a;
        else choice = c;
    } else {
        if (blen < clen) choice = b;
        else choice = c;
    }
    
    choice.x += choice.y * 0.5;
    choice.y *= 0.866025404;
    choice *= size / resolution;
    
    gl_FragColor = texture2D(tDiffuse, choice + center / resolution);
}