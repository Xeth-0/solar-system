import * as THREE from "three";
import constants from "../constants";
import Experience from "../../experience";

import vertexShader from "../.shaders/earth/vertex.glsl";
import fragmentShader from "../.shaders/earth/fragment.glsl";

import atmosphereFragmentShader from "../.shaders/planetAtmosphere/fragment.glsl";
import atmosphereVertexShader from "../.shaders/planetAtmosphere/vertex.glsl";
import Moon from "./moon";
import { createOrbitalPath, getOrbitPosition } from "../orbits";

export default class Earth {
  /**
   * @param {number} earthRadius - The base size used to calculate the Sun's scale and distance
   */
  constructor(earthRadius) {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.time = this.experience.time;

    this.radius = earthRadius * constants.EARTH_SCALE_MULTIPLIER;
    this.sunDistance = constants.EARTH_DISTANCE_MULTIPLIER * this.radius;

    // Orbital parameters
    this.orbitalPeriod = constants.EARTH_ORBITAL_PERIOD; 
    this.orbitalSpeed = (2 * Math.PI) / this.orbitalPeriod; 
    this.orbitalInclination = THREE.MathUtils.degToRad(23.5);
    this.orbitalEccentricity = constants.EARTH_ORBITAL_ECCENTRICITY; 

    this.semiMajorAxis = this.sunDistance;
    this.semiMinorAxis =
      this.semiMajorAxis * Math.sqrt(1 - Math.pow(this.orbitalEccentricity, 2));

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

    if (!this.textures.dayTexture) {
      console.warn("Missing Texture: Earth Day Texture");
    }
    if (!this.textures.nightTexture) {
      console.warn("Missing Texture: Earth Night Texture");
    }
    if (!this.textures.specularCloudsTexture) {
      console.warn("Missing Texture: Earth Specular Clouds Texture");
    }

    this.textures.dayTexture.colorSpace = THREE.SRGBColorSpace;
    this.textures.nightTexture.colorSpace = THREE.SRGBColorSpace;

    this.textures.dayTexture.anisotropy = 8;
    this.textures.nightTexture.anisotropy = 8;
    this.textures.specularCloudsTexture.anisotropy = 8;
  }

  setMesh() {
    // Defining the geometry here because the planet and the atmosphere have the same geometry.
    const geometry = new THREE.SphereGeometry(this.radius, 64, 64);

    this.earth = this.createEarth(geometry);
    this.atmosphere = this.createAtmosphere(geometry);
    this.atmosphere.scale.set(1.04, 1.04, 1.04);
    this.moon = this.createMoon();

    this.instance = new THREE.Group();
    this.instance.add(this.earth);
    this.instance.add(this.atmosphere);

    this.orbitLine = createOrbitalPath(
      this.semiMajorAxis,
      this.semiMinorAxis,
      this.orbitalEccentricity
    );

    this.scene.add(this.orbitLine);
    this.scene.add(this.instance);

    // Add a reference to the Earth in the Moon for easier access
    if (this.moon) {
      this.moon.earth = this;
    }
  }

  createEarth(geometry) {
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
    return earth;
  }

  createAtmosphere(geometry) {
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
    return atmosphere;
  }

  createMoon() {
    return new Moon(this.radius);
  }

  update() {
    this.earth.rotation.y = this.time.elapsed * 5;

    const [x, z] = getOrbitPosition(
      this.time.elapsed,
      this.orbitalPeriod,
      this.orbitalEccentricity,
      this.semiMajorAxis,
      this.semiMinorAxis
    );
    this.instance.position.set(x, 0, z);

    const sunDirection = new THREE.Vector3(0, 0, 0)
      .sub(this.instance.position)
      .normalize();
    this.earth.material.uniforms.uSunDirection.value = sunDirection;
    this.atmosphere.material.uniforms.uSunDirection.value = sunDirection;

    if (this.moon) {
      this.moon.update(this.instance.position, sunDirection);
    }
  }

  setDebug() {
    if (this.experience.debug.active) {
      const folder = this.experience.debug.ui.addFolder("Earth Settings");

      const params = {
        atmosphereDayColor:
          this.earth.material.uniforms.uAtmosphereDayColor.value.getHex(),
        atmosphereTwilightColor:
          this.earth.material.uniforms.uAtmosphereTwilightColor.value.getHex(),
        cloudIntensity: this.earth.material.uniforms.uCloudIntensity.value,
      };

      folder
        .addColor(params, "atmosphereDayColor")
        .name("Day Atmosphere")
        .onChange((value) => {
          this.earth.material.uniforms.uAtmosphereDayColor.value.setHex(value);
          this.atmosphere.material.uniforms.uAtmosphereDayColor.value.setHex(
            value
          );
        });

      folder
        .addColor(params, "atmosphereTwilightColor")
        .name("Twilight Atmosphere")
        .onChange((value) => {
          this.earth.material.uniforms.uAtmosphereTwilightColor.value.setHex(
            value
          );
          this.atmosphere.material.uniforms.uAtmosphereTwilightColor.value.setHex(
            value
          );
        });

      folder
        .add(this.earth.material.uniforms.uCloudIntensity, "value", 0, 1)
        .name("Cloud Intensity")
        .step(0.01);
    }
  }
}
