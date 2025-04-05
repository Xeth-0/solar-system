import * as THREE from "three";
import constants from "../constants";
import Experience from "../../experience";

import vertexShader from "../.shaders/earth/moon/vertex.glsl";
import fragmentShader from "../.shaders/earth/moon/fragment.glsl";
import { createOrbitalPath, getOrbitPosition } from "../orbits";

export default class Moon {
  /**
   * @param {number} earthRadius
   */
  constructor(earthRadius) {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.time = this.experience.time;

    this.radius = earthRadius * constants.MOON_SCALE_MULTIPLIER;
    this.distance = earthRadius * constants.MOON_DISTANCE_MULTIPLIER;

    // Moon orbital parameters
    this.orbitalPeriod = constants.MOON_ORBITAL_PERIOD;
    this.orbitalSpeed = (2 * Math.PI) / this.orbitalPeriod;
    this.orbitalInclination = THREE.MathUtils.degToRad(5.14);
    this.orbitalEccentricity = constants.MOON_ORBITAL_ECCENTRICITY;

    this.semiMajorAxis = this.distance * this.orbitalEccentricity;
    this.semiMinorAxis =
      this.semiMajorAxis * Math.sqrt(1 - Math.pow(this.orbitalEccentricity, 2));

    // Calculate direction to Sun for lighting
    this.sunDirection = new THREE.Vector3(0, 0, 0);

    this.setTextures();
    this.setMesh(earthRadius);
    this.setDebug();
  }

  setTextures() {
    this.textures = {
      moonTexture: this.resources.items.earthMoonTexture,
    };

    if (!this.textures.moonTexture) {
      console.warn("Missing Texture: Moon");
    }

    this.textures.moonTexture.colorSpace = THREE.SRGBColorSpace;
    this.textures.moonTexture.anisotropy = 8;
  }

  setMesh(earthRadius) {
    this.radius = earthRadius * constants.MOON_SCALE_MULTIPLIER;
    this.distanceFromEarth = earthRadius * constants.MOON_DISTANCE_MULTIPLER;

    const geometry = new THREE.SphereGeometry(this.radius, 64, 64);
    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        uMoonTexture: new THREE.Uniform(this.textures.moonTexture),
        uSunDirection: new THREE.Uniform(this.sunDirection),
      },
    });
    this.moon = new THREE.Mesh(geometry, material);
    // this.moon.scale.set(this.radius, this.radius, this.radius);

    this.orbitLine = createOrbitalPath(
      this.semiMajorAxis,
      this.semiMinorAxis,
      this.orbitalEccentricity
    );
    this.orbitLine.rotation.x = this.orbitalInclination;

    this.instance = new THREE.Group();
    this.instance.add(this.moon);
    this.instance.add(this.orbitLine);

    this.scene.add(this.instance);
    this.updatePosition(0);
  }

  updatePosition(timeElapsed) {
    const [x, z] = getOrbitPosition(
      timeElapsed,
      this.orbitalPeriod,
      this.orbitalEccentricity,
      this.semiMajorAxis
    );

    // Apply orbital inclination by rotating the position around the x-axis
    this.moon.position
      .set(x, 0, z)
      .applyAxisAngle(new THREE.Vector3(1, 0, 0), this.orbitalInclination);
    // const y = z * Math.sin(this.orbitalInclination);
    // const zTilted = z * Math.cos(this.orbitalInclination);

    // this.moon.position.set(x, y, zTilted);
  }

  update(earthPosition, sunDirection) {
    // Update the moon's orbit position to follow the Earth
    this.instance.position.copy(earthPosition);

    this.updatePosition(this.time.elapsed);

    this.sunDirection.copy(sunDirection);
    if (this.instance.material && this.instance.material.uniforms) {
      this.instance.material.uniforms.uSunDirection.value = this.sunDirection;
    }
  }

  setDebug() {
    if (this.experience.debug.active) {
      // const folder = this.experience.debug.ui.addFolder("Moon Settings");
    }
  }
}
