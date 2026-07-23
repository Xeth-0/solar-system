import * as THREE from "three";

// A marker fades out as the body it points at grows past a handful of pixels: once
// you can see the planet, the reticle is just clutter.
const FADE_START = 7;
const FADE_END = 26;

const scratch = new THREE.Vector3();

/**
 * The screen-space reticles that make the outer planets findable. Without them
 * Neptune is a single dim pixel four thousand units from anything else.
 */
export default class Markers {
  constructor(container, bodies, onSelect) {
    this.container = container;
    this.visible = true;

    this.entries = bodies.map((body) => {
      const element = document.createElement("button");
      element.className = "marker";
      element.type = "button";
      element.innerHTML = `<span class="marker__ring"></span><span class="marker__label">${body.name}</span>`;
      element.addEventListener("click", () => onSelect(body.id));

      container.appendChild(element);

      return { body, element, shown: false };
    });
  }

  setVisible(visible) {
    this.visible = visible;
    this.container.classList.toggle("markers--hidden", !visible);
  }

  update(camera, sizes) {
    if (!this.visible) return;

    // Pixels of screen radius per unit of world radius at one unit of distance.
    const projection = sizes.height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));

    for (const entry of this.entries) {
      scratch.copy(entry.body.worldPosition).applyMatrix4(camera.matrixWorldInverse);

      // Anything at or behind the eye has no meaningful screen position.
      if (scratch.z > -camera.near) {
        this.hide(entry);
        continue;
      }

      const distance = scratch.length();
      const apparent = (entry.body.extent / distance) * projection;
      const opacity = 1 - THREE.MathUtils.smoothstep(apparent, FADE_START, FADE_END);

      if (opacity < 0.03) {
        this.hide(entry);
        continue;
      }

      scratch.applyMatrix4(camera.projectionMatrix);

      const x = (scratch.x * 0.5 + 0.5) * sizes.width;
      const y = (-scratch.y * 0.5 + 0.5) * sizes.height;

      entry.element.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      entry.element.style.opacity = opacity.toFixed(3);

      if (!entry.shown) {
        entry.element.style.display = "";
        entry.shown = true;
      }
    }
  }

  hide(entry) {
    if (!entry.shown) return;

    entry.element.style.display = "none";
    entry.shown = false;
  }
}
