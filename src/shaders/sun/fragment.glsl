uniform float uTime;
uniform vec3 uSunColor;


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
    // return vec3(b, max(0.0, 1.0 - (b * 1.5)), max(0.0, 1.0 - (b * 3.0)));
    return (vec3(
        b,
        pow(b, 3.0), 
        pow(b, 5.0)
    ) / 0.25) * 0.6;
}

void main() {
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0, 0.0, 0.0);


    // small bits of noise
    float baseNoise = fbm(vec4(normal, uTime * 0.1), 4) * 0.8;
    float detailNoise = fbm(vec4(normal * 15.0, uTime * 0.3), 6) * 0.4;
    float largeNoise = fbm(vec4(normal, uTime * 0.05), 3) * 10.0;

    float noise = (baseNoise * 0.7 + detailNoise * 0.2 + largeNoise * 0.1);
    noise += 0.2 * smoothstep(0.3, 0.6, largeNoise);

    color = mix(uSunColor, vec3(brightnessToColor(noise)), noise) - 0.1;
    

    // Fresnel
    float fresnel = dot(viewDirection, normal) + 1.0;
    fresnel = pow(fresnel, 2.5);
    // fresnel = smoothstep(0.0, 1.0, fresnel);

    color = mix(color, vec3(0.8, 0.8, 0.0), fresnel);
    
    // Final Color    
    // color = mix(uSunColor, vec3(1.0), fresnel);
    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}