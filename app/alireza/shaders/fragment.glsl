varying vec2 vUv;
uniform sampler2D t1;
uniform sampler2D t2;
uniform float progress;
uniform float time;


vec2 mirrored(vec2 v){
    vec2 m = mod(v,2.);
    return mix(m,2.-m, step(1.,m));
}

float tri(float p){
    return mix(p, 1.-p, step(0.5,p))*2.;
}
void main() {
    vec4 txt1 = texture2D(t1,vUv);
    vec4 txt2 = texture2D(t2,vUv);

    float sweep = step(vUv.y,progress);
    vec4 finalTexture = mix(txt1,txt2,sweep);

    // gl_FragColor = vec4(vec3(sweep),1.0);
    gl_FragColor = finalTexture;

    float p = progress;
    vec2 vUv1 = vUv;
    float delayValue = p*7. - vUv.y*2. + vUv.x - 2.;
    delayValue = clamp(delayValue, 0., 1.);
    float accel = 0.1;

    vec2 translateValue = vec2(p)+delayValue*accel;
    vec2 translateValue1 = vec2(-0.5,1.)*translateValue;    
    vec2 translateValue2 = vec2(-0.5,1.)*(translateValue-1.-accel);

    vec2 w = sin(sin(time)*vec2(0,0.3)+vUv.yx*vec2(0,4.))*vec2(0,0.5);
    vec2 xy = w*(tri(p)*0.5+tri(delayValue)*0.5);

    vec2 uv1 = vUv1 +translateValue1+xy;
    vec2 uv2 = vUv1 +translateValue2+xy;

    vec4 rgba1 = texture2D(t1,mirrored(uv1));
    vec4 rgba2 = texture2D(t2,mirrored(uv2));

    vec4 rgba = mix(rgba1,rgba2,delayValue);
    gl_FragColor = rgba;

}