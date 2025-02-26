import * as THREE from "three";
import constants from "../constants";
import Experience from "../../experience";

import vertexShader from "../shaders/earth/vertex.glsl";
import fragmentShader from "../shaders/earth/fragment.glsl";

import atmosphereFragmentShader from "../shaders/planetAtmosphere/fragment.glsl";
import atmosphereVertexShader from "../shaders/planetAtmosphere/vertex.glsl";
import Moon from "./moon";

let instance = null;

export default class Earth {
  /**
   * @param {number} earthSize - The base size used to calculate the Sun's scale and distance
   */
  constructor(earthSize) {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.time = this.experience.time;

    this.radius = earthSize;
    this.sunDistance = constants.SUN_DISTANCE_MULTIPLIER * this.radius;

    // Orbital parameters
    this.orbitalPeriod = 365.25; // Earth's orbital period in days
    this.orbitalSpeed = (2 * Math.PI) / this.orbitalPeriod; // Angular speed in radians per day
    this.orbitalInclination = THREE.MathUtils.degToRad(23.5); // Earth's axial tilt in radians
    this.orbitalEccentricity = 0.0167; // Earth's orbital eccentricity

    // Semi-major axis is the average distance from the Sun
    this.semiMajorAxis = this.sunDistance;

    // Semi-minor axis calculation based on eccentricity
    this.semiMinorAxis =
      this.semiMajorAxis * Math.sqrt(1 - Math.pow(this.orbitalEccentricity, 2));

    // Initial position
    this.orbitalAngle = 0;

    this.setTextures();
    this.setMesh();
    this.setDebug();
  }

  setTextures() {
    this.textures = {
      dayTexture: this.resources.items.earth_day,
      nightTexture: this.resources.items.earth_night,
      specularCloudsTexture: this.resources.items.earth_specular_clouds,
    };

    this.textures.dayTexture.colorSpace = THREE.SRGBColorSpace;
    this.textures.nightTexture.colorSpace = THREE.SRGBColorSpace;

    this.textures.dayTexture.anisotropy = 8;
    this.textures.nightTexture.anisotropy = 8;
    this.textures.specularCloudsTexture.anisotropy = 8;

    console.log(this.textures.dayTexture);
    console.log(this.textures);
  }

  setMesh() {
    const geometry = new THREE.SphereGeometry(this.radius, 64, 64);
    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        uEarthDayTexture: new THREE.Uniform(this.textures.dayTexture),
        uEarthNightTexture: new THREE.Uniform(this.textures.nightTexture),
        uEarthSpecularCloudsTexture: new THREE.Uniform(
          this.textures.specularCloudsTexture
        ),
        uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
        uCloudIntensity: new THREE.Uniform(0.5),
        uAtmosphereDayColor: new THREE.Uniform(
          new THREE.Color(constants.earthAtmosphereDayColor)
        ),
        uAtmosphereTwilightColor: new THREE.Uniform(
          new THREE.Color(constants.earthAtmosphereTwilightColor)
        ),
      },
    });

    const earth = new THREE.Mesh(geometry, material);
    this.earth = earth;

    const atmosphereMaterial = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      transparent: true,
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      uniforms: {
        uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
        uAtmosphereDayColor: new THREE.Uniform(
          new THREE.Color(constants.uAtmosphereDayColor)
        ),
        uAtmosphereTwilightColor: new THREE.Uniform(
          new THREE.Color(constants.earthAtmosphereTwilightColor)
        ),
      },
    });

    const atmosphere = new THREE.Mesh(geometry, atmosphereMaterial);
    atmosphere.scale.set(1.04, 1.04, 1.04);
    this.atmosphere = atmosphere;

    // Moon
    const moon = new Moon(this.radius);
    this.moon = moon;

    this.instance = new THREE.Group();
    this.instance.add(earth);
    this.instance.add(atmosphere);

    // Create an orbital path visualization
    this.createOrbitalPath();

    this.scene.add(this.instance);
    
    // Add a reference to the Earth in the Moon for easier access
    if (this.moon) {
      this.moon.earth = this;
    }
  }

  createOrbitalPath() {
    // Create a visualization of the orbital path
    const orbitCurve = new THREE.EllipseCurve(
      0,
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

    // Orbit along the XZ-plane
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
      color: 0x444444,
      transparent: true,
      opacity: 0.3,
    });

    this.orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
    this.scene.add(this.orbitLine);
  }

  update() {
    // Update Earth's rotation around its axis
    this.earth.rotation.y = this.time.elapsed * 5; // Earth rotates faster than it orbits

    // Calculate the orbital position based on time
    this.orbitalAngle = this.time.elapsed * this.orbitalSpeed;

    // Calculate position using Kepler's laws (simplified elliptical orbit)
    // For an elliptical orbit, we use the parametric equation of an ellipse
    const x = this.semiMajorAxis * Math.cos(this.orbitalAngle);
    const z = this.semiMinorAxis * Math.sin(this.orbitalAngle);

    // Update the new position
    this.instance.position.set(x, 0, z);

    // Calculate the direction to the Sun (at origin) for shading
    const sunDirection = new THREE.Vector3(0, 0, 0)
      .sub(this.instance.position)
      .normalize();

    this.earth.material.uniforms.uSunDirection.value = sunDirection;
    this.atmosphere.material.uniforms.uSunDirection.value = sunDirection;

    // Update the Moon's position and sun direction
    if (this.moon) {
      this.moon.update(this.instance.position, sunDirection);
    }
  }

  setDebug() {
    if (this.experience.debug.active) {
      const folder = this.experience.debug.ui.addFolder("Earth Settings");

    const params = {
      atmosphereDayColor: this.earth.material.uniforms.uAtmosphereDayColor.value.getHex(),
      atmosphereTwilightColor: this.earth.material.uniforms.uAtmosphereTwilightColor.value.getHex(),
      cloudIntensity: this.earth.material.uniforms.uCloudIntensity.value
    };

    folder.addColor(params, 'atmosphereDayColor')
      .name('Day Atmosphere')
      .onChange(value => {
        this.earth.material.uniforms.uAtmosphereDayColor.value.setHex(value);
        this.atmosphere.material.uniforms.uAtmosphereDayColor.value.setHex(value);
      });

    folder.addColor(params, 'atmosphereTwilightColor')
      .name('Twilight Atmosphere')
      .onChange(value => {
        this.earth.material.uniforms.uAtmosphereTwilightColor.value.setHex(value);
        this.atmosphere.material.uniforms.uAtmosphereTwilightColor.value.setHex(value);
      });

    folder.add(this.earth.material.uniforms.uCloudIntensity, 'value', 0, 1)
      .name('Cloud Intensity')
      .step(0.01);

    }
  }
}
