import * as THREE from "three";
import constants from "../constants";
import Experience from "../../experience";

import vertexShader from "../.shaders/planet/vertex.glsl";
import fragmentShader from "../.shaders/planet/fragment.glsl";

import { createOrbitalPath, getOrbitPosition } from "../orbits";

export default class Saturn {
  /**
   * @param {number} earthRadius
   */
  constructor(earthRadius) {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.time = this.experience.time;

    this.radius = earthRadius * constants.SATURN_SCALE_MULTIPLIER;
    this.distanceFromSun = earthRadius * constants.SATURN_DISTANCE_MULTIPLIER;

    // Orbital parameters
    this.orbitalEccentricity = constants.SATURN_ORBITAL_ECCENTRICITY;
    this.orbitalPeriod = constants.SATURN_ORBITAL_PERIOD;
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
      saturnTexture: this.resources.items.saturnTexture,
    };
    if (!this.textures.saturnTexture) {
      console.warn("Missing Texture: Saturn");
    }

    this.textures.saturnTexture.anisotropy = 8;
    this.textures.saturnTexture.colorSpace = THREE.SRGBColorSpace;
  }

  setMesh() {
    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        uTexture: new THREE.Uniform(this.textures.saturnTexture),
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