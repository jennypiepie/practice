varying vec2 vUv;
uniform sampler2D t1,t2;
uniform vec4 resolution;
uniform float progress;
uniform float time;

void main() {
    vec2 newUV = (vUv-vec2(0.5))*resolution.zw+vec2(0.5);
    vec4 i1 = texture2D(t1,newUV);
    vec4 i2 = texture2D(t2,newUV);
    float dist = distance(i1,i2)/2.;
    // dist = newUV.x+0.1*sin(newUV.y*10.+time);
    float pr = step(dist,progress);
    vec4 final = mix(i1,i2,pr);

    gl_FragColor = final;
}