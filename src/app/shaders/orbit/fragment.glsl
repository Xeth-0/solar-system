uniform vec3 uColor;
uniform float uPhase;       // where the body currently sits on this path, 0..1
uniform float uOpacity;
uniform float uHighlight;

varying float vPhase;

void main() {
    // How far back along the path this fragment is from the body itself.
    float behind = fract(uPhase - vPhase);
    float trail = pow(1.0 - behind, 9.0);

    // Kept deliberately under the bloom threshold: these are additive one-pixel
    // lines, and any brighter the trail head turns into a searchlight.
    vec3 color = mix(uColor, vec3(0.82, 0.9, 1.0), trail * 0.6);
    float alpha = (0.05 + 0.35 * trail) * uOpacity * mix(0.8, 1.6, uHighlight);

    gl_FragColor = vec4(color, alpha);
}
