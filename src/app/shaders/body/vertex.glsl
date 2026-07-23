varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);

    vUv = uv;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vPosition = worldPosition.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
