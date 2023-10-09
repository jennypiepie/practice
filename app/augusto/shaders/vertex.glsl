varying vec2 vUv;
uniform float time;
attribute float aRandom;

void main() {
    vUv = uv;
    vec3 pos = position;
    // pos.x += aRandom * sin((uv.y+uv.x+time)*10.0)*0.1;
    pos += aRandom*(0.5*sin(time)+0.5)*normal;
    gl_Position = projectionMatrix * modelViewMatrix *vec4(pos, 1.);
}
