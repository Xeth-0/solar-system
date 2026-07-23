import * as THREE from "three";

import EventEmitter from "./eventEmitter";

/**
 * Loads every texture the body table asks for, keyed by path. Colour space and
 * filtering are set once here rather than repeated at each call site.
 */
export default class Resources extends EventEmitter {
  constructor(paths) {
    super();

    this.items = {};
    this.total = paths.length;
    this.loaded = 0;

    const loader = new THREE.TextureLoader();

    for (const path of paths) {
      loader.load(
        path,
        (texture) => this.onLoaded(path, texture),
        undefined,
        () => {
          console.warn(`Failed to load texture: ${path}`);
          this.onLoaded(path, null);
        }
      );
    }
  }

  get(path) {
    const texture = this.items[path];
    if (!texture) console.warn(`Texture not loaded: ${path}`);
    return texture;
  }

  onLoaded(path, texture) {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
      this.items[path] = texture;
    }

    this.loaded++;
    this.trigger("progress", [this.loaded / this.total]);

    if (this.loaded === this.total) this.trigger("ready");
  }
}
