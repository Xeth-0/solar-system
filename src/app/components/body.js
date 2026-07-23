import * as THREE from "three";

import Experience from "../experience";
import { createOrbitLine, orbitalPosition } from "./orbit";
import { createBandTexture, createRings } from "./rings";

import vertexShader from "../shaders/body/vertex.glsl";
import fragmentShader from "../shaders/body/fragment.glsl";
import atmosphereVertexShader from "../shaders/atmosphere/vertex.glsl";
import atmosphereFragmentShader from "../shaders/atmosphere/fragment.glsl";

const TAU = Math.PI * 2;
const SEGMENTS = 96;

/**
 * Every planet and moon in the scene. The shape of the body comes entirely from its
 * entry in the body table -- this class only knows how to read that table.
 */
export default class Body {
  /**
   * @param {object} definition - an entry from the body table
   * @param {object} options
   * @param {number} options.orbitScale - scene units per unit of `definition.orbit.a`
   * @param {Body} [options.parent] - the body this one orbits, for moons
   */
  constructor(definition, { orbitScale, parent = null }) {
    this.experience = new Experience();
    this.resources = this.experience.resources;

    this.definition = definition;
    this.id = definition.id;
    this.name = definition.name;
    this.parent = parent;

    this.radius = definition.radius;
    this.elements = { ...definition.orbit, a: definition.orbit.a * orbitScale };
    this.worldPosition = new THREE.Vector3();
    this.sunDirection = new THREE.Vector3(0, 0, 1);

    // How far out the camera has to sit to frame the whole body, rings included.
    this.extent = definition.rings ? this.radius * definition.rings.outer : this.radius;

    this.group = new THREE.Group();
    this.axis = new THREE.Group();
    this.axis.rotation.z = THREE.MathUtils.degToRad(definition.tilt);
    this.group.add(this.axis);

    this.setSurface();
    this.setAtmosphere();
    this.setRings();
    this.setOrbit();

    (parent ? parent.group : this.experience.scene).add(this.group);
  }

  setSurface() {
    const map = this.resources.get(this.definition.surface.map);

    const geometry = new THREE.SphereGeometry(this.radius, SEGMENTS, SEGMENTS / 2);
    if (this.definition.flattening) {
      // Jupiter and Saturn are visibly squashed by their own spin.
      geometry.scale(1, 1 - this.definition.flattening, 1);
    }

    const defines = {};
    const uniforms = {
      uMap: new THREE.Uniform(map),
      uTexel: new THREE.Uniform(new THREE.Vector2(1 / map.image.width, 1 / map.image.height)),
      uSunDirection: new THREE.Uniform(this.sunDirection),
      uRelief: new THREE.Uniform(this.definition.surface.relief ?? 0),
      uAmbient: new THREE.Uniform(this.definition.surface.ambient ?? 0.02),
      uAtmosphereColor: new THREE.Uniform(new THREE.Color("#ffffff")),
      uTwilightColor: new THREE.Uniform(new THREE.Color("#ffffff")),
      uAtmosphereStrength: new THREE.Uniform(0),
    };

    if (this.definition.atmosphere) {
      uniforms.uAtmosphereColor.value.set(this.definition.atmosphere.color);
      uniforms.uTwilightColor.value.set(this.definition.atmosphere.twilight);
      uniforms.uAtmosphereStrength.value = this.definition.atmosphere.strength;
    }

    if (this.definition.surface.nightMap) {
      defines.USE_NIGHT_MAP = "";
      uniforms.uNightMap = new THREE.Uniform(this.resources.get(this.definition.surface.nightMap));
    }

    if (this.definition.surface.specularMap) {
      defines.USE_SPECULAR = "";
      uniforms.uSpecularMap = new THREE.Uniform(
        this.resources.get(this.definition.surface.specularMap)
      );
    }

    if (this.definition.clouds) {
      const clouds = this.resources.get(this.definition.clouds.map);
      clouds.wrapS = THREE.RepeatWrapping;

      defines.USE_CLOUDS = "";
      uniforms.uCloudMap = new THREE.Uniform(clouds);
      uniforms.uCloudOpacity = new THREE.Uniform(this.definition.clouds.opacity);
      uniforms.uCloudContrast = new THREE.Uniform(this.definition.clouds.contrast);
      uniforms.uCloudOffset = new THREE.Uniform(0);
    }

    this.mesh = new THREE.Mesh(
      geometry,
      new THREE.ShaderMaterial({ vertexShader, fragmentShader, defines, uniforms })
    );
    this.mesh.userData.body = this;

    this.axis.add(this.mesh);
  }

  setAtmosphere() {
    const definition = this.definition.atmosphere;
    if (!definition) return;

    const geometry = new THREE.SphereGeometry(
      this.radius * (1 + definition.height),
      48,
      24
    );

    this.atmosphere = new THREE.Mesh(
      geometry,
      new THREE.ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uSunDirection: new THREE.Uniform(this.sunDirection),
          uColor: new THREE.Uniform(new THREE.Color(definition.color)),
          uTwilightColor: new THREE.Uniform(new THREE.Color(definition.twilight)),
          uStrength: new THREE.Uniform(definition.strength),
        },
      })
    );
    this.atmosphere.renderOrder = 2;

    this.group.add(this.atmosphere);
  }

  setRings() {
    const definition = this.definition.rings;
    if (!definition) return;

    const texture = definition.map
      ? this.resources.get(definition.map)
      : createBandTexture(definition.bands);

    this.rings = createRings(definition, this.radius, texture);
    this.axis.add(this.rings);

    // Let the surface shader know where to look for the shadow the rings cast on it.
    const material = this.mesh.material;
    material.defines.USE_RING_SHADOW = "";
    material.uniforms.uRingMap = new THREE.Uniform(texture);
    material.uniforms.uBodyCenter = new THREE.Uniform(this.worldPosition);
    material.uniforms.uRingRadii = new THREE.Uniform(
      new THREE.Vector2(definition.inner * this.radius, definition.outer * this.radius)
    );
    material.uniforms.uRingNormal = new THREE.Uniform(
      new THREE.Vector3(0, 1, 0).applyEuler(this.axis.rotation)
    );
    material.needsUpdate = true;
  }

  setOrbit() {
    this.orbitLine = createOrbitLine(this.elements, this.parent ? "#7f8fa6" : "#5f7a9e");
    (this.parent ? this.parent.group : this.experience.scene).add(this.orbitLine);
  }

  /**
   * @param {number} days - simulated days since the epoch, driving the orbit
   * @param {number} spinDays - the throttled clock that drives rotation (see Time)
   */
  update(days, spinDays) {
    const phase = orbitalPosition(this.elements, days, this.group.position);

    this.worldPosition.copy(this.group.position);
    if (this.parent) this.worldPosition.add(this.parent.worldPosition);

    // The Moon is tidally locked, so its spin has to stay welded to its real orbit
    // rather than to the throttled rotation clock.
    const rotationClock = this.definition.rotationPeriod === this.definition.orbit.period
      ? days
      : spinDays;
    this.mesh.rotation.y = (rotationClock / this.definition.rotationPeriod) * TAU;

    this.sunDirection.copy(this.worldPosition).negate().normalize();
    this.orbitLine.material.uniforms.uPhase.value = phase;

    if (this.definition.clouds) {
      this.mesh.material.uniforms.uCloudOffset.value =
        spinDays / this.definition.clouds.driftPeriod;
    }

    if (this.rings) {
      this.rings.material.uniforms.uSunDirection.value.copy(this.sunDirection);
      this.rings.material.uniforms.uBodyCenter.value.copy(this.worldPosition);
    }
  }
}
