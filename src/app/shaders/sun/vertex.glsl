uniform float uTime;

varying vec3 vNormal;
varying vec3 vPosition;

#include ../includes/noise.glsl

void main() {
    // A gentle breathing of the photosphere so the limb is never a perfect circle.
    float swell = snoise(vec4(normal * 2.5, uTime * 0.08)) * 0.012;
    vec3 displaced = position * (1.0 + swell);

    vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);

    vNormal = normalize(mat3(modelMatrix) * normal);
    vPosition = worldPosition.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
