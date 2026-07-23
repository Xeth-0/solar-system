import * as THREE from "three";

import Experience from "../experience";
import { STARFIELD_RADIUS } from "../data/bodies";

import backdropVertexShader from "../shaders/starfield/vertex.glsl";
import backdropFragmentShader from "../shaders/starfield/fragment.glsl";
import starsVertexShader from "../shaders/stars/vertex.glsl";
import starsFragmentShader from "../shaders/stars/fragment.glsl";

const STAR_COUNT = 2500;

// Roughly blackbody, from a hot blue-white O star down to a cool red dwarf, weighted
// the way the real sky is: mostly white, a scattering of colour.
const STAR_COLORS = [
  "#aabfff", "#cad7ff", "#f8f7ff", "#fff4ea",
  "#fff4ea", "#ffd2a1", "#ffcc6f", "#ffffff",
];

/**
 * Two layers: a Milky Way photograph for the diffuse glow of the galactic plane, and
 * a real point cloud on top so individual stars stay crisp at any zoom. Both ride
 * along with the camera, which puts them effectively at infinity.
 */
export default class Starfield {
  constructor() {
    this.experience = new Experience();

    this.group = new THREE.Group();
    this.experience.scene.add(this.group);

    this.setBackdrop();
    this.setStars();
  }

  setBackdrop() {
    const texture = this.experience.resources.get("/stars/milkyway.jpg");

    this.backdrop = new THREE.Mesh(
      new THREE.SphereGeometry(STARFIELD_RADIUS, 64, 32),
      new THREE.ShaderMaterial({
        vertexShader: backdropVertexShader,
        fragmentShader: backdropFragmentShader,
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          uMap: new THREE.Uniform(texture),
          uIntensity: new THREE.Uniform(0.5),
        },
      })
    );
    this.backdrop.renderOrder = -100;

    this.group.add(this.backdrop);
  }

  setStars() {
    const positions = new Float32Array(STAR_COUNT * 3);
    const colors = new Float32Array(STAR_COUNT * 3);
    const sizes = new Float32Array(STAR_COUNT);
    const seeds = new Float32Array(STAR_COUNT);

    const radius = STARFIELD_RADIUS * 0.9;
    const color = new THREE.Color();

    for (let i = 0; i < STAR_COUNT; i++) {
      // Even distribution over the sphere: uniform in cos(latitude), not latitude.
      const theta = Math.random() * Math.PI * 2;
      const cosPhi = Math.random() * 2 - 1;
      const sinPhi = Math.sqrt(1 - cosPhi * cosPhi);

      positions[i * 3] = radius * sinPhi * Math.cos(theta);
      positions[i * 3 + 1] = radius * cosPhi;
      positions[i * 3 + 2] = radius * sinPhi * Math.sin(theta);

      color.set(STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]);
      color.toArray(colors, i * 3);

      // Skewed towards the faint end, as a magnitude distribution should be.
      sizes[i] = 0.7 + Math.pow(Math.random(), 4) * 3.2;
      seeds[i] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

    this.stars = new THREE.Points(
      geometry,
      new THREE.ShaderMaterial({
        vertexShader: starsVertexShader,
        fragmentShader: starsFragmentShader,
        transparent: true,
        depthWrite: false,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: new THREE.Uniform(0),
          uPixelRatio: new THREE.Uniform(this.experience.sizes.pixelRatio),
        },
      })
    );
    this.stars.renderOrder = -99;
    this.stars.frustumCulled = false;

    this.group.add(this.stars);
  }

  resize() {
    this.stars.material.uniforms.uPixelRatio.value = this.experience.sizes.pixelRatio;
  }

  update(elapsed) {
    this.stars.material.uniforms.uTime.value = elapsed;
    this.group.position.copy(this.experience.camera.instance.position);
  }
}
