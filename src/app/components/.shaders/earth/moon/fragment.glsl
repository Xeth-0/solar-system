uniform sampler2D uMoonTexture;
uniform vec3 sunDirection;

varying vec2 vUv;
void main (){
  vec3 color = texture(uMoonTexture, vUv).rgb;

  gl_FragColor = vec4(color, 1.0);
}