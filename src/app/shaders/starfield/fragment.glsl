uniform sampler2D uMap;
uniform float uIntensity;

varying vec2 vUv;

void main() {
    gl_FragColor = vec4(texture(uMap, vUv).rgb * uIntensity, 1.0);
}
