import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";

import Camera from "./camera";
import Renderer from "./renderer";
import World from "./world";
import Hud from "./ui/hud";

import Debug from "./utils/debug";
import Sizes from "./utils/sizes";
import Time from "./utils/time";
import Resources from "./utils/resources";
import texturePaths from "./data/textures";

let instance = null;

export default class Experience {
  constructor(canvas) {
    if (instance) return instance;
    instance = this;

    this.canvas = canvas;
    this.ready = false;

    // Handy for poking at the scene from the console.
    window.experience = this;

    this.debug = new Debug();
    this.sizes = new Sizes();
    this.time = new Time();
    this.scene = new THREE.Scene();
    this.resources = new Resources(texturePaths);
    this.camera = new Camera();
    this.renderer = new Renderer();
    this.world = new World();
    this.hud = new Hud();

    this.resources.on("ready", () => {
      this.world.build();
      this.hud.build();
      this.world.select("earth");
      this.ready = true;
    });

    this.sizes.on("resize", () => this.resize());
    this.time.on("tick", () => this.update());

    if (this.debug.active) this.setDebug();
  }

  setDebug() {
    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);

    const render = this.debug.ui.addFolder("Render");
    render.add(this.renderer.bloom, "strength", 0, 2, 0.01).name("Bloom strength");
    render.add(this.renderer.bloom, "radius", 0, 1, 0.01).name("Bloom radius");
    render.add(this.renderer.bloom, "threshold", 0, 1.5, 0.01).name("Bloom threshold");
    render.add(this.renderer.instance, "toneMappingExposure", 0.1, 3, 0.01).name("Exposure");

    this.resources.on("ready", () => {
      const scene = this.debug.ui.addFolder("Scene");
      scene
        .add(this.world.sun.mesh.material.uniforms.uIntensity, "value", 0.5, 6, 0.1)
        .name("Sun intensity");
      scene
        .add(this.world.starfield.backdrop.material.uniforms.uIntensity, "value", 0, 1.5, 0.01)
        .name("Milky Way");
    });
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
    this.world.starfield?.resize();
  }

  update() {
    if (this.ready) this.world.update();

    this.camera.update(this.time.delta);

    if (this.ready) this.hud.update();

    this.renderer.update();
    this.stats?.update();
  }
}
