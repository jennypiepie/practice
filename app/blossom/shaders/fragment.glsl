uniform sampler2D t;
uniform sampler2D ft;
uniform float progress;

varying vec2 vUv;

void main() {
    vec4 ftt = texture2D(ft,vUv);
    vec4 tt = texture2D(t,vUv);

    vec4 finalTexture = mix(tt,ftt,progress);
    gl_FragColor = finalTexture;

    if(gl_FragColor.r<0.1 && gl_FragColor.g<0.1 && tt.b<0.1) discard;
}