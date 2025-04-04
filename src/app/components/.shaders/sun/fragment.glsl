uniform float uTime;
uniform vec3 uSunColor;
uniform sampler2D uPerlinTexture;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

#include ../includes/noise/simplex4D

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
    return vec3(b, min(0.8, pow(b, 3.0)), min(0.5, pow(b, 10.0)));
    // return (vec3(b, pow(b, 8.0), pow(b, 10.0)));
}

void main() {
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0, 0.0, 0.0);

    float baseNoise = snoise(vec4(normal * 15.0, uTime * 0.1)) * 1.5;
    float detailNoise = snoise(vec4(normal * 50.0, uTime * 0.3)) * 1.5;
    float largeNoise = fbm(vec4(normal, uTime * 0.05), 4) * 2.0;

    float noise = (baseNoise * 0.7 + detailNoise * 0.08 + largeNoise);
    noise += 0.2 * smoothstep(0.3, 0.6, largeNoise);

    color = mix(uSunColor, vec3(brightnessToColor(noise)), noise) - 0.1;

    float fresnel = dot(viewDirection, normal) + 1.0;
    fresnel = pow(fresnel, 2.5);

    color = mix(color, vec3(0.8, 0.8, 0.0), fresnel);

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}