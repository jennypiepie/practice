varying vec2 vUv;
uniform float time;
uniform float distortion;


void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix *vec4(position, 1.);
    gl_Position = projectionMatrix * mvPosition;
}
