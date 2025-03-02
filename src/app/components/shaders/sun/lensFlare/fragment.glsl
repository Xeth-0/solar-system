uniform sampler2D map;

varying vec2 vUv;

void main(){
    vec4 texture = texture(map, vUv);
    gl_FragColor = texture;
}