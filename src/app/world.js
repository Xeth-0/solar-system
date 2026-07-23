import * as THREE from "three";

import Experience from "./experience";
import Sun from "./components/sun";
import Body from "./components/body";
import Starfield from "./components/starfield";
import { AU, PLANETS } from "./data/bodies";

const SYSTEM_VIEW_DISTANCE = 11000;
const DRAG_THRESHOLD = 5; // pixels of pointer travel that still counts as a click

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;

    /** Flat, in display order, so the UI and the keyboard shortcuts can index it. */
    this.bodies = [];
    this.byId = {};
    this.selected = null;
    this.orbitsVisible = true;
  }

  build() {
    this.starfield = new Starfield();
    this.sun = new Sun();

    this.register(this.sun);

    for (const definition of PLANETS) {
      const planet = new Body(definition, { orbitScale: AU });
      this.register(planet);

      for (const moonDefinition of definition.moons ?? []) {
        this.register(new Body(moonDefinition, { orbitScale: planet.radius, parent: planet }));
      }
    }

    this.update();
    this.setPicking();
  }

  register(body) {
    this.bodies.push(body);
    this.byId[body.id] = body;
  }

  /** Flies the camera to a body and tells the rest of the UI about it. */
  select(id, options) {
    const body = this.byId[id];
    if (!body) return;

    this.selected = body;
    this.experience.camera.lookAt(body, options);
    this.experience.hud?.onSelect(body);

    for (const other of this.bodies) {
      if (!other.orbitLine) continue;
      other.orbitLine.material.uniforms.uHighlight.value = other === body ? 1 : 0;
    }
  }

  /** Pulls back far enough to hold the whole system in frame. */
  viewSystem() {
    this.select("sun", { distance: SYSTEM_VIEW_DISTANCE });
  }

  setOrbitsVisible(visible) {
    this.orbitsVisible = visible;

    for (const body of this.bodies) {
      if (body.orbitLine) body.orbitLine.visible = visible;
    }
  }

  /** Click a planet to fly to it -- as long as the pointer wasn't being dragged. */
  setPicking() {
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const meshes = this.bodies.map((body) => body.mesh);
    const canvas = this.experience.canvas;

    let origin = null;

    canvas.addEventListener("pointerdown", (event) => {
      origin = { x: event.clientX, y: event.clientY };
    });

    canvas.addEventListener("pointerup", (event) => {
      if (!origin) return;

      const travelled = Math.hypot(event.clientX - origin.x, event.clientY - origin.y);
      origin = null;
      if (travelled > DRAG_THRESHOLD) return;

      pointer.x = (event.clientX / this.experience.sizes.width) * 2 - 1;
      pointer.y = -(event.clientY / this.experience.sizes.height) * 2 + 1;

      raycaster.setFromCamera(pointer, this.experience.camera.instance);

      const hit = raycaster.intersectObjects(meshes, false)[0];
      if (hit) this.select(hit.object.userData.body.id);
    });
  }

  update() {
    const { time } = this.experience;

    this.starfield.update(time.elapsed);
    this.sun.update(time.elapsed, time.spinDays);

    // Parents update before their moons, which the flat list already guarantees.
    for (const body of this.bodies) {
      if (body !== this.sun) body.update(time.days, time.spinDays);
    }
  }
}
