uniform sampler2D et;
uniform sampler2D ft;
uniform float progress;

varying vec2 vUv;

void main() {
    vec4 ftt = texture2D(ft,vUv);
    vec4 ett = texture2D(et,vUv);

    vec4 finalTexture = mix(ett,ftt,progress);
    gl_FragColor = finalTexture;

    if(gl_FragColor.r<0.1 && gl_FragColor.g<0.1 && ett.b<0.1) discard;
}