uniform sampler2D uMoonTexture;
uniform vec3 uSunDirection;

varying vec2 vUv;
varying vec3 vNormal;

void main (){
  vec3 color = texture(uMoonTexture, vUv).rgb;
  vec3 normal = normalize(vNormal);

  float sunOrientation = dot(uSunDirection, normal);
  vec3 nightColor = vec3(0.) * color;
  float dayMix = smoothstep(-0.35, 0.0, sunOrientation);
  color = mix(nightColor, color, dayMix);

  gl_FragColor = vec4(color, 1.0);
}