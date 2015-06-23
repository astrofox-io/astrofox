/*
 * @author thesprite | http://www.clicktorelease.com/code/cross-hatching/
 */

uniform sampler2D hatch1;
uniform sampler2D hatch2;
uniform sampler2D hatch3;
uniform sampler2D hatch4;
uniform sampler2D hatch5;
uniform sampler2D hatch6;
uniform sampler2D paper;
uniform vec2 resolution;
uniform vec2 bkgResolution;
uniform vec3 lightPosition;

vec3 color = vec3( 1., 0., 1. );
vec3 lightColor = vec3( 1. );

varying vec2 vUv;
varying vec3 vNormal;
varying float depth;
varying vec3 vPosition;
varying float nDotVP;
varying vec3 pos;

uniform float ambientWeight;
uniform float diffuseWeight;
uniform float rimWeight;
uniform float specularWeight;
uniform float shininess;
uniform int invertRim;
uniform int solidRender;
uniform float showOutline;
uniform vec4 inkColor;

vec4 shade() {

    float diffuse = nDotVP;
    float specular = 0.;
    float ambient = 1.;

    vec3 n = normalize( vNormal );

    vec3 r = -reflect(lightPosition, n);
    r = normalize(r);
    vec3 v = -vPosition.xyz;
    v = normalize(v);
    float nDotHV = max( 0., dot( r, v ) );

    if( nDotVP != 0. ) specular = pow ( nDotHV, shininess );
    float rim = max( 0., abs( dot( n, normalize( -vPosition.xyz ) ) ) );
    if( invertRim == 1 ) rim = 1. - rim;

    float shading = ambientWeight * ambient + diffuseWeight * diffuse + rimWeight * rim + specularWeight * specular;

    if( solidRender == 1 ) return vec4( shading );

    vec4 c;
    float step = 1. / 6.;
    if( shading <= step ){
        c = mix( texture2D( hatch6, vUv ), texture2D( hatch5, vUv ), 6. * shading );
    }
    if( shading > step && shading <= 2. * step ){
        c = mix( texture2D( hatch5, vUv ), texture2D( hatch4, vUv) , 6. * ( shading - step ) );
    }
    if( shading > 2. * step && shading <= 3. * step ){
        c = mix( texture2D( hatch4, vUv ), texture2D( hatch3, vUv ), 6. * ( shading - 2. * step ) );
    }
    if( shading > 3. * step && shading <= 4. * step ){
        c = mix( texture2D( hatch3, vUv ), texture2D( hatch2, vUv ), 6. * ( shading - 3. * step ) );
    }
    if( shading > 4. * step && shading <= 5. * step ){
        c = mix( texture2D( hatch2, vUv ), texture2D( hatch1, vUv ), 6. * ( shading - 4. * step ) );
    }
    if( shading > 5. * step ){
        c = mix( texture2D( hatch1, vUv ), vec4( 1. ), 6. * ( shading - 5. * step ) );
    }

    vec4 src = mix( mix( inkColor, vec4( 1. ), c.r ), c, .5 );
    //c = 1. - ( 1. - src ) * ( 1. - dst );
    //c = vec4( min( src.r, dst.r ), min( src.g, dst.g ), min( src.b, dst.b ), 1. );

    //c = vec4( gl_FragCoord.x / resolution.x, gl_FragCoord.y / resolution.y, 0., 1. );

    return src;
}

void main() {

    vec2 nUV = vec2( mod( gl_FragCoord.x, bkgResolution.x ) / bkgResolution.x, mod( gl_FragCoord.y, bkgResolution.y ) / bkgResolution.y );
    vec4 dst = vec4( texture2D( paper, nUV ).rgb, 1. );
    vec4 src;

    //if( showOutline == 1 ) src = .5 * inkColor;
    //else src = shade();
    src = ( .5 * inkColor ) * vec4( showOutline ) + vec4( 1. - showOutline ) * shade();

    vec4 c = src * dst;

    gl_FragColor = vec4( c.rgb, 1. );
}