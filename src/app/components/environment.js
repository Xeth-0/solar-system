import * as THREE from "three";
import Experience from "../experience";

import vertexShader from "./.shaders/stars/vertex.glsl";
import fragmentShader from "./.shaders/stars/fragment.glsl";

export default class Environment {
  constructor(earthSize) {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.time = this.experience.time;
    this.earthRadius = earthSize;

    this.setTextures();
    this.setEnvironment();
  }

  setTextures() {
    this.textures = {
      starsTexture: this.resources.items.starsTexture,
    };

    // this.textures.starsTexture.wrapS = THREE.RepeatWrapping;
    // this.textures.starsTexture.wrapT = THREE.RepeatWrapping;
    this.textures.starsTexture.colorSpace = THREE.SRGBColorSpace;
    this.textures.starsTexture.mapping = THREE.EquirectangularReflectionMapping;
  }

  setEnvironment() {
    // large sphere with the texture applied to it. this will make it more realistic
    const geometry = new THREE.SphereGeometry(this.earthRadius * 1000, 64, 64);
    // const material = new THREE.MeshBasicMaterial({
    //   map: this.textures.starsTexture,
    //   side: THREE.BackSide,
    // });
    const material = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        uStarsTexture: new THREE.Uniform(this.textures.starsTexture),
        uTime: new THREE.Uniform(0),
      },
    });
    this.instance = new THREE.Mesh(geometry, material);
    this.scene.add(this.instance);
  }

  update() {
    // Update stars
    this.instance.material.uniforms.uTime.value = this.time.elapsed;
  }
}
