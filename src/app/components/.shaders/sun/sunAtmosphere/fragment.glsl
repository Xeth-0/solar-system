uniform float uTime;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

#include ../../.includes/noise/simplex4D

// TODO: THIS NEEDS WORK

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
    // b *= 0.5;
    // return vec3(b, max(0.0, 1.0 - (b * 1.5)), max(0.0, 1.0 - (b * 3.0)));
    return (vec3(pow(b, 1.5), pow(b, 3.0) * 0.6, pow(b, 5.0)) / 0.3) * 0.8;
}

void main() {
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    float viewDistance = length(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);

    float fresnel = abs(dot(viewDirection, normal)) + 0.01; 

    // Add noise to break up uniformity
    // float noise = fbm(vec4(vPosition, uTime * 0.1), 6);

    fresnel *= pow(fresnel, 10.0);
    fresnel *= (1.0 - fresnel);
    fresnel *= 1.5;
    vec3 finalColor = brightnessToColor(fresnel);
    // finalColor = vec3(fresnel);

    float alpha = smoothstep(-0.5, 0.8, fresnel);

    gl_FragColor = vec4(finalColor, alpha);

    // Three.js mappings
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}