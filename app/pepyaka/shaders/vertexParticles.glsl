varying vec2 vUv;
uniform float time;

void main() {
    vUv = uv;

    vec3 p = position;
    p.y +=0.1 * (sin(p.y * 5. + time) * 0.5 + 0.5);
    p.z +=0.05 * (sin(p.y * 10. + time) * 0.5 + 0.5);
    
    vec4 mvPosition = modelViewMatrix *vec4(p, 1.);
    gl_PointSize = 10. *  (1. / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}
