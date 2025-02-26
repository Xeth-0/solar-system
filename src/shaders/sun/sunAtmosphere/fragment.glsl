uniform float uTime;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

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

vec3 brightnessToColor(float b) {
    b *= 0.5;
    // return vec3(b, max(0.0, 1.0 - (b * 1.5)), max(0.0, 1.0 - (b * 3.0)));
    return (vec3(
        pow(b, 1.5),
        pow(b, 3.0) * 0.8,
        pow(b, 5.0) * 0.5
    ) / 0.3) * 0.8;
}

void main() {
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    
    // Enhanced Fresnel calculation
    float fresnel = dot(viewDirection, normal);
    fresnel = pow(fresnel, 30.0);
    // fresnel *= 0.5;
    // fresnel = 1.0 - pow(1.0 - abs(fresnel), 10.0) * 2.0; // More intense edge glow
    fresnel += smoothstep(0.95, 1.0, fresnel);
    fresnel += smoothstep(0.2, 0.9, fresnel);
    // fresnel += smoothstep(0.0, 0.5, fresnel);
    
    
    // Add noise to break up uniformity
    float noise = fbm(vec4(vPosition, uTime * 0.1), 6);
    
    vec3 finalColor = brightnessToColor(fresnel) * 10.;
    // finalColor = vec3(fresnel);


    gl_FragColor = vec4(finalColor, 1.0);

    
    // Three.js mappings
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}