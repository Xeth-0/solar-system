uniform float uTime;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

#include ../../includes/noise/simplex4D

// fractal brownian motion - creates layers of snoise
float fbm(vec4 p, int iters) {
    float noise = 0.0;
    float amplitude = 1.0;
    float scale = 1.0;
    for(int i = 0; i < iters; i++) {
        noise += snoise(p * scale) * amplitude;
        amplitude *= 0.9;
        scale *= 2.0;
    }
    return noise;
}

void main()
{
    // Outer edge Noise
    // float displacement = snoise(vec4(position, uTime * 0.1)) * 0.8;
    // displacement += snoise(vec4(position, uTime * 0.3)) * 0.1;
    // // displacement = smoothstep(-0.3, 0.8, displacement) * 3000.0;

    float displacement = fbm(vec4(position, uTime * 0.005), 8) * 0.15;
    
    // displacement = 0.0;

    vec3 newPosition = position + position * displacement * 0.2;

    // Final Position
    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec3 modelNormal = (modelMatrix * vec4(normal, 0.0)).xyz;
    
    gl_Position = projectionMatrix * viewMatrix * modelPosition;
    
    // Varyings
    vNormal = modelNormal;
    vUv = uv;
    vPosition = modelPosition.xyz;
}