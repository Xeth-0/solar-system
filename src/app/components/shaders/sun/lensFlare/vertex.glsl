uniform sampler2D occlusionMap; // lensflare texture

varying vec2 vUv;

void main() {
    vec2 pos = position.xy;

    // Varyings
    vUv = uv;
}