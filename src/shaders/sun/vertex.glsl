uniform float uTime;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
// varying float vDisplacement;

#include ../includes/noise/simplex4D

void main() {
    // Base position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec3 modelNormal = (modelMatrix * vec4(normal, 0.0)).xyz;
    
    // Create ribbon displacement using 4D noise
    float displacement = snoise(vec4(normal * 2.0, uTime * 0.1));
    displacement += 0.5 * snoise(vec4(normal * 8.0, uTime * 0.3));
    displacement = smoothstep(-0.3, 0.8, displacement) * 0.08;
    
    // Offset position along normal
    vec3 newPosition = position + normal * displacement;
    
    // Final position calculations
    modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;

    // Pass varyings
    vUv = uv;
    vNormal = modelNormal;
    vPosition = modelPosition.xyz;
}