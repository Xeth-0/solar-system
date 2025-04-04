import * as THREE from "three";
import constants from "./constants";
import Experience from "../experience";

import vertexShader from "./.shaders/planet/vertex.glsl";
import fragmentShader from "./.shaders/planet/fragment.glsl";

export default class Venus {
  /**
   * @param {number} earthSize
   */
  constructor(earthSize) {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.time = this.experience.time;

    this.radius = earthSize * constants.VENUS_SCALE_MULTIPLIER;
    this.distanceFromSun = earthSize * constants.VENUS_DISTANCE_MULTIPLIER;

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
    // const material = new THREE.MeshBasicMaterial({
    //   map: this.textures.venusTexture,
    // });

    const venus = new THREE.Mesh(geometry, material);
    this.instance = venus;
    this.instance.scale.set(this.radius, this.radius, this.radius);
    this.scene.add(this.instance);

    this.orbitLine = this.createOrbitalPath();
    this.scene.add(this.orbitLine);
  }

  createOrbitalPath() {
    const orbitCurve = new THREE.EllipseCurve(
      -this.semiMajorAxis * this.orbitalEccentricity,
      0,
      this.semiMajorAxis, // xRadius
      this.semiMinorAxis, // zRadius
      0, // start angle
      2 * Math.PI, // end angle
      false, // clockwise
      0 // rotation
    );

    const points = orbitCurve.getPoints(100);
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);

    const positions = new Float32Array(points.length * 3);
    for (let i = 0; i < points.length; i++) {
      positions[i * 3] = points[i].x;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = points[i].y;
    }

    orbitGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const orbitMaterial = new THREE.LineBasicMaterial({
      color: "#444444",
      transparent: true,
      opacity: 0.3,
    });

    const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
    return orbitLine;
  }

  update() {
    this.instance.rotation.y = this.time.elapsed * 5; // Venus rotates faster than it orbits
    const orbitalAngle = this.time.elapsed * this.orbitalSpeed;
    const x = this.semiMajorAxis * Math.cos(orbitalAngle);
    const z = this.semiMinorAxis * Math.sin(orbitalAngle);

    this.instance.position.set(x, 0, z);

    const sunDirection = new THREE.Vector3(0, 0, 0)
      .sub(this.instance.position)
      .normalize();

    this.instance.material.uniforms.uSunDirection.value = sunDirection;
  }
}
