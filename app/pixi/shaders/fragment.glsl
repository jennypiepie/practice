varying vec2 vUv;
uniform sampler2D bg;
uniform sampler2D mask;

uniform vec4 resolution;

void main() {
    // vec2 newUV = (vUv-vec2(0.5))*resolution.zw + vec2(0.5);
    vec4 masky = texture2D(mask,vUv);

    float strength = masky.a+masky.r;
    strength *= 3.;
    strength = min(1., strength);

    vec4 t = texture2D(bg,vUv+(1. - strength)*0.1);
    gl_FragColor = t*strength;
    // gl_FragColor.a *= masky.a;
    // gl_FragColor = mask;
}