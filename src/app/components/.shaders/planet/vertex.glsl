// basic shader for day/night cycle for planets

varying vec2 vUv;
varying vec3 vNormal;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec3 modelNormal = (modelMatrix * vec4(normal, 0.0)).xyz;

  gl_Position = projectionMatrix * viewMatrix * modelPosition;

  // Varyings
  vUv = uv;
  vNormal = modelNormal;
}