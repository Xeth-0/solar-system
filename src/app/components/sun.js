import * as THREE from "three";

import Experience from "../experience";
import { SUN } from "../data/bodies";

import vertexShader from "../shaders/sun/vertex.glsl";
import fragmentShader from "../shaders/sun/fragment.glsl";
import coronaVertexShader from "../shaders/corona/vertex.glsl";
import coronaFragmentShader from "../shaders/corona/fragment.glsl";

const TAU = Math.PI * 2;
const CORONA_SPAN = 4.2; // multiples of the photosphere radius

export default class Sun {
  constructor() {
    this.experience = new Experience();

    this.definition = SUN;
    this.id = SUN.id;
    this.name = SUN.name;
    this.radius = SUN.radius;
    this.extent = SUN.radius;

    // The Sun sits at the origin, so this never moves -- but the rest of the code
    // treats every body the same way and expects it to exist.
    this.worldPosition = new THREE.Vector3();

    this.setPhotosphere();
    this.setCorona();
  }

  setPhotosphere() {
    this.group = new THREE.Group();
    this.group.rotation.z = THREE.MathUtils.degToRad(SUN.tilt);

    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(this.radius, 128, 64),
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: new THREE.Uniform(0),
          uCoreColor: new THREE.Uniform(new THREE.Color("#fff6e2")),
          uEdgeColor: new THREE.Uniform(new THREE.Color("#ff7a1a")),
          uIntensity: new THREE.Uniform(2.6),
        },
      })
    );
    this.mesh.userData.body = this;

    this.group.add(this.mesh);
    this.experience.scene.add(this.group);
  }

  setCorona() {
    this.corona = new THREE.Mesh(
      new THREE.PlaneGeometry(this.radius * CORONA_SPAN * 2, this.radius * CORONA_SPAN * 2),
      new THREE.ShaderMaterial({
        vertexShader: coronaVertexShader,
        fragmentShader: coronaFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: new THREE.Uniform(0),
          uInnerColor: new THREE.Uniform(new THREE.Color("#ffcf7a")),
          uOuterColor: new THREE.Uniform(new THREE.Color("#ff5a1e")),
        },
      })
    );
    this.corona.renderOrder = 3;

    this.experience.scene.add(this.corona);
  }

  /**
   * @param {number} elapsed - wall-clock seconds, so the surface keeps churning while paused
   * @param {number} spinDays - the throttled rotation clock
   */
  update(elapsed, spinDays) {
    this.mesh.material.uniforms.uTime.value = elapsed;
    this.corona.material.uniforms.uTime.value = elapsed;
    this.mesh.rotation.y = (spinDays / SUN.rotationPeriod) * TAU;

    // The corona is a flat card, so it has to keep facing the camera.
    this.corona.quaternion.copy(this.experience.camera.instance.quaternion);
  }
}
