import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

import Experience from "./experience";

export default class Renderer {
  constructor() {
    this.experience = new Experience();
    this.canvas = this.experience.canvas;
    this.scene = this.experience.scene;
    this.sizes = this.experience.sizes;

    this.setInstance();
    this.setComposer();
  }

  setInstance() {
    this.instance = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.instance.toneMapping = THREE.ACESFilmicToneMapping;
    this.instance.toneMappingExposure = 1.0;
    this.instance.setClearColor("#000000");
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);
  }

  /**
   * The Sun's shader deliberately writes values well above 1. A half-float target
   * keeps that headroom intact so the bloom pass has real highlights to bleed, and
   * the final tone map brings the whole thing back into range.
   *
   * Two MSAA samples rather than four: on shared-memory GPUs a 4x multisampled
   * RGBA16F buffer costs more than everything else in the frame put together, and
   * against a black sky the second sample already does most of the work.
   */
  setComposer() {
    const target = new THREE.WebGLRenderTarget(
      this.sizes.width * this.sizes.pixelRatio,
      this.sizes.height * this.sizes.pixelRatio,
      { type: THREE.HalfFloatType, samples: 2 }
    );

    this.composer = new EffectComposer(this.instance, target);
    this.composer.setPixelRatio(this.sizes.pixelRatio);
    this.composer.setSize(this.sizes.width, this.sizes.height);

    this.composer.addPass(new RenderPass(this.scene, this.experience.camera.instance));

    this.bloom = new UnrealBloomPass(
      new THREE.Vector2(this.sizes.width, this.sizes.height),
      0.62, // strength
      0.55, // radius
      0.7 // luminance threshold
    );
    this.composer.addPass(this.bloom);

    this.composer.addPass(new OutputPass());
  }

  resize() {
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);

    this.composer.setPixelRatio(this.sizes.pixelRatio);
    this.composer.setSize(this.sizes.width, this.sizes.height);
  }

  update() {
    this.composer.render();
  }
}
