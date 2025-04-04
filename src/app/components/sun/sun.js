import * as THREE from "three";
import constants from "../constants";
import Experience from "../../experience";

import vertexShader from "../.shaders/sun/vertex.glsl";
import fragmentShader from "../.shaders/sun/fragment.glsl";

import atmosphereFragmentShader from "../.shaders/sun/sunAtmosphere/fragment.glsl";
import atmosphereVertexShader from "../.shaders/sun/sunAtmosphere/vertex.glsl";

let instance = null;

export default class Sun {
  /**
   * @param {number} earthSize - The base size used to calculate the Sun's scale and distance
   */
  constructor(earthSize) {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.time = this.experience.time;

    this.refSize = earthSize;

    this.setTextures();
    this.setMesh();

    if (this.experience.debug.active){
      this.setDebug();
    }
  }

  setTextures() {
    // console.log(this.resources);
    this.textures = {
      perlin: this.resources.items.perlinTexture,
    };
  }

  setMesh() {
    // Sun
    this.sunSpherical = new THREE.Spherical(1, Math.PI * 0.5, 0);
    this.sunDirection = new THREE.Vector3(0, 0, 1);

    const geometry = new THREE.SphereGeometry(
      this.refSize * constants.SUN_SCALE_MULTIPLIER,
      100,
      100
    );
    const material = new THREE.ShaderMaterial({
      transparent: true,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      // depthWrite: false,
      uniforms: {
        uSunColor: new THREE.Uniform(new THREE.Color(constants.sunColor)),
        uTime: new THREE.Uniform(0),
        // uPerlinTexture: new THREE.Uniform(this.textures.perlin),
      },
    });

    const sun = new THREE.Mesh(geometry, material);
    this.sunMesh = sun;

    const atmosphereMaterial = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        uTime: new THREE.Uniform(0),
      },
    });
    const atmosphere = new THREE.Mesh(geometry, atmosphereMaterial);
    atmosphere.scale.set(2, 2, 2);
    this.atmosphereMesh = atmosphere;

    // this.scene.add(this.sunMesh);
    // this.scene.add(this.atmosphereMesh);

    this.instance = new THREE.Group();
    this.instance.add(this.sunMesh);
    // this.instance.add(this.atmosphereMesh);

    this.scene.add(this.instance);
  }

  update() {
    // Keep the sun at the center of the scene
    this.instance.position.set(0, 0, 0);

    // Update uniforms separately
    this.sunMesh.material.uniforms.uTime.value = this.time.elapsed;
    this.atmosphereMesh.material.uniforms.uTime.value =
      this.time.elapsed;
  }

  setDebug() {
    const folder = this.experience.debug.ui.addFolder("Sun Settings");

    folder
      .add(this.sunSpherical, "phi")
      .min(0)
      .max(Math.PI)
      .onChange(() => {
        this.update();
      })
      .name("Sun Position: phi");

    folder
      .add(this.sunSpherical, "theta")
      .min(0)
      .max(Math.PI)
      .onChange(() => {
        this.update();
      })
      .name("Sun Position: theta");
  }
}
