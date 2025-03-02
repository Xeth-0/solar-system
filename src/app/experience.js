import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";

import Camera from "./camera";
import sources from "./sources";
import Renderer from "./renderer";

import Time from "./utils/time";
import World from "./world"
import Sizes from "./utils/sizes";
import Debug from "./utils/debug";
import Resources from "./utils/resources";

// singleton
let instance = null;

export default class Experience {
  constructor(canvas) {
    if (instance) {
      return instance;
    }
    instance = this;

    // Global access
    window.experience = this;

    // Setup
    this.debug = new Debug();
    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);
    
    this.canvas = canvas;
    this.sizes = new Sizes();
    this.time = new Time();
    this.scene = new THREE.Scene();
    this.resources = new Resources(sources);
    this.camera = new Camera();
    this.renderer = new Renderer();
    this.world = new World();

    // Event Emitter events
    this.sizes.on("resize", () => {
      this.resize();
    });

    this.time.on("tick", () => {
      this.update();
    });
    
    // Add debug controls for time
    if (this.debug.active) {
      const timeFolder = this.debug.ui.addFolder('Time Settings');
      
      timeFolder
        .add(this.time, 'timeScale', 0.1, 10.0, 0.1)
        .name('Time Scale')
        .onChange(() => {
          console.log(`Time scale set to ${this.time.timeScale}`);
        });
    }
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
  }

  update() {
    this.camera.update();
    this.world.update();
    this.renderer.update();
    this.stats.update();
  }
}
