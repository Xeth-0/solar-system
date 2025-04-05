import * as THREE from "three";
import constants from "./constants";
import Experience from "../experience";

import vertexShader from "./.shaders/planet/vertex.glsl";
import fragmentShader from "./.shaders/planet/fragment.glsl";

import { createOrbitalPath, getOrbitPosition } from "./orbits";

export default class Venus {
  /**
   * @param {number} earthRadius
   */
  constructor(earthRadius) {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.time = this.experience.time;

    this.radius = earthRadius * constants.VENUS_SCALE_MULTIPLIER;
    this.distanceFromSun = earthRadius * constants.VENUS_DISTANCE_MULTIPLIER;

    // Orbital parameters
    this.orbitalEccentricity = constants.VENUS_ORBITAL_ECCENTRICITY;
    this.orbitalPeriod = constants.VENUS_ORBITAL_PERIOD;
    this.orbitalSpeed = (2 * Math.PI) / this.orbitalPeriod;
    this.orbitalInclination = THREE.MathUtils.degToRad(7.25);

    this.semiMajorAxis = this.distanceFromSun;
    this.semiMinorAxis =
      this.semiMajorAxis * Math.sqrt(1 - Math.pow(this.orbitalEccentricity, 2));

    this.setTextures();
    this.setMesh();
    // this.setDebug();
  }

  setTextures() {
    this.textures = {
      venusTexture: this.resources.items.venusTexture,
    };
    if (!this.textures.venusTexture) {
      console.warn("Missing Texture: Venus");
    }

    this.textures.venusTexture.colorSpace = THREE.SRGBColorSpace;
  }

  setMesh() {
    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        uTexture: new THREE.Uniform(this.textures.venusTexture),
        uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
      },
    });
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const mesh = new THREE.Mesh(geometry, material);

    this.instance = mesh;
    this.instance.scale.set(this.radius, this.radius, this.radius);
    this.scene.add(this.instance);

    this.orbitLine = createOrbitalPath(
      this.semiMajorAxis,
      this.semiMinorAxis,
      this.orbitalEccentricity
    );
    this.scene.add(this.orbitLine);
  }

  update() {
    this.instance.rotation.y = this.time.elapsed * 5; 

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
