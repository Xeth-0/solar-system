varying vec2 vUv;
varying vec3 vNormal;

void main(){
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec3 modelNormal = (modelMatrix * vec4(normal, 0.0)).xyz;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;

  // Varyings
  vUv = uv;
  vNormal = modelNormal;
}