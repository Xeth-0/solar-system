import * as THREE from "three";
import constants from "../constants";
import Experience from "../../experience";

import vertexShader from "../.shaders/planet/vertex.glsl";
import fragmentShader from "../.shaders/planet/fragment.glsl";

import { createOrbitalPath, getOrbitPosition } from "./orbits";

export default class Uranus {
  /**
   * @param {number} earthRadius
   */
  constructor(earthRadius) {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.time = this.experience.time;

    this.radius = earthRadius * constants.URANUS_SCALE_MULTIPLIER;
    this.distanceFromSun = earthRadius * constants.URANUS_DISTANCE_MULTIPLIER;

    // Orbital parameters
    this.orbitalEccentricity = constants.URANUS_ORBITAL_ECCENTRICITY;
    this.orbitalPeriod = constants.URANUS_ORBITAL_PERIOD;
    this.orbitalSpeed = (2 * Math.PI) / this.orbitalPeriod;
    this.orbitalInclination = THREE.MathUtils.degToRad(7.0);

    this.semiMajorAxis = this.distanceFromSun;
    this.semiMinorAxis =
      this.semiMajorAxis * Math.sqrt(1 - Math.pow(this.orbitalEccentricity, 2));

    this.setTextures();
    this.setMesh();
    // this.setDebug();
  }

  setTextures() {
    this.textures = {
      uranusTexture: this.resources.items.uranusTexture,
    };
    if (!this.textures.uranusTexture) {
      console.warn("Missing Texture: Uranus");
    }

    this.textures.uranusTexture.anisotropy = 8;
    this.textures.uranusTexture.colorSpace = THREE.SRGBColorSpace;
  }

  setMesh() {
    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        uTexture: new THREE.Uniform(this.textures.uranusTexture),
        uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
      },
    });
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const mesh = new THREE.Mesh(geometry, material);

    this.instance = mesh;
    this.instance.scale.set(this.radius, this.radius, this.radius);
    this.scene.add(mesh);

    this.orbit = createOrbitalPath(
      this.semiMajorAxis,
      this.semiMinorAxis,
      this.orbitalEccentricity
    );
    this.scene.add(this.orbit);
  }

  update() {
    this.instance.rotation.y = constants.URANUS_ROTATION_PERIOD * this.time.elapsed;

    const [x, z] = getOrbitPosition(
      this.time.elapsed,
      this.orbitalPeriod,
      this.orbitalEccentricity,
      this.semiMajorAxis
    );

    this.instance.position.set(x, 0, z);

    const sunDirection = new THREE.Vector3(0, 0, 0)
      .sub(this.instance.position)
      .normalize();

    this.instance.material.uniforms.uSunDirection.value = sunDirection;
  }
}
