uniform float uTime;
uniform vec3 uCoreColor;
uniform vec3 uEdgeColor;
uniform float uIntensity;

varying vec3 vNormal;
varying vec3 vPosition;

#include ../includes/noise.glsl

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(cameraPosition - vPosition);

    // Two scales of convection: broad supergranulation and the fine cell pattern on
    // top. 4D simplex is not cheap, so this is the fewest octaves that still reads
    // as plasma rather than as noise.
    float supergranules = fbm(vec4(normal * 9.0, uTime * 0.04), 3);
    float granules = snoise(vec4(normal * 42.0, uTime * 0.11));
    float activity = supergranules * 0.75 + granules * 0.35;

    // Limb darkening -- near the edge of the disc we look through cooler, shallower plasma.
    float mu = max(dot(normal, viewDirection), 0.0);
    float limb = 0.32 + 0.68 * pow(mu, 0.5);

    float brightness = (1.0 + activity * 0.6) * limb;
    vec3 color = mix(uEdgeColor, uCoreColor, smoothstep(0.2, 1.3, brightness));

    // Deliberately overdriven: the bloom pass is what turns this into a star.
    gl_FragColor = vec4(color * brightness * uIntensity, 1.0);
}
