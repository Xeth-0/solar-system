// A camera-facing quad centred on the Sun. Fragments inside the photosphere fail the
// depth test against the Sun mesh itself, so only the halo beyond the disc survives --
// and anything that passes in front still occludes it correctly.

uniform float uTime;
uniform vec3 uInnerColor;
uniform vec3 uOuterColor;

varying vec2 vUv;

#include ../includes/noise.glsl

void main() {
    vec2 offset = vUv * 2.0 - 1.0;
    float radius = length(offset);
    if (radius > 1.0) discard;

    // Streamers, sampled around the ring so they wrap seamlessly.
    float angle = atan(offset.y, offset.x);
    float streamers = fbm(vec4(cos(angle) * 2.0, sin(angle) * 2.0, radius * 2.5, uTime * 0.05), 2);
    float warped = radius * (1.0 + streamers * 0.14);

    float core = pow(max(0.0, 1.0 - warped), 3.5);
    float halo = pow(max(0.0, 1.0 - warped), 1.1) * 0.22;

    vec3 color = mix(uOuterColor, uInnerColor, core);

    gl_FragColor = vec4(color * (core * 2.2 + halo), 1.0);
}
