// basic shader for day/night cycle for planets
uniform sampler2D uTexture;
uniform float uTime;
uniform vec3 uSunDirection;

varying vec2 vUv;
varying vec3 vNormal;

#include ../.includes/noise/simplex4D

void main() {
  vec2 uv = vUv;
  vec3 normal = normalize(vNormal);

  float sunOrientation = dot(uSunDirection, normal);
  float dayMix = smoothstep(-0.35, 0.0, sunOrientation);
  
  // Sample the star color from the texture
  vec3 color = texture(uTexture, uv).rgb;
  vec3 nightColor = vec3(0.2) * color;
  color = mix(nightColor, color, dayMix);

  gl_FragColor = vec4(color, 1.0);
}