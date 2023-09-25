varying vec2 vUv;
varying vec3 vNormal;

void main() {
    vUv = uv;
    vNormal = normal;
    vec4 mvPosition = modelViewMatrix *vec4(position, 1.);
    gl_Position = projectionMatrix * mvPosition;
}
