varying vec2 vUv;
uniform float time;
uniform vec3 uMin;
uniform vec3 uMax;
varying float vDebug;
float PI = 3.141592653589793238;
float radius = 0.5;

float mapRange(float value, float inMin, float inMax, float outMin, float outMax){
    return outMin + (outMax-outMin) * (value-inMin) / (inMax-inMin);
}

void main() {
    float x  = mapRange(position.x,uMin.x, uMax.x,-PI, PI);
    vUv = uv;
    vDebug = x;
    vec3 dir = vec3(sin(x), cos(x), 0.);
    vec3 pos = radius * dir + vec3(0., 0., position.z) + dir *  position.y;

    vec4 mvPosition = modelViewMatrix *vec4(pos, 1.);
    gl_Position = projectionMatrix * mvPosition;
}
