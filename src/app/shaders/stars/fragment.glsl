varying vec3 vColor;
varying float vBrightness;

void main() {
    float falloff = 1.0 - smoothstep(0.0, 0.5, length(gl_PointCoord - 0.5));
    if (falloff <= 0.0) discard;

    gl_FragColor = vec4(vColor * vBrightness, falloff * falloff);
}
