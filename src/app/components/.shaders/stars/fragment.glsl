uniform sampler2D uStarsTexture;
uniform float uTime;

varying vec2 vUv;

#include ../includes/noise/simplex4D

void main() {
  vec2 uv = vUv;
  
  // Sample the star color from the texture
  vec4 color = texture(uStarsTexture, uv);

  // Add some twinkling to the stars (if there are stars at that position)
  float noise = abs(sin(uTime) + snoise(vec4(uv * 10.0, 1.0, uTime * 0.1)));
  
  color.rgb = color.rgb * (color.rgb + vec3(noise));

  gl_FragColor = color;
}