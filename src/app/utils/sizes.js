import EventEmitter from "./eventEmitter";

export default class Sizes extends EventEmitter {
  constructor() {
    super();

    this.measure();

    window.addEventListener("resize", () => {
      this.measure();
      this.trigger("resize");
    });
  }

  measure() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    // Capped at 1.5: the scene is fragment-bound, and past this the extra pixels buy
    // almost nothing against a mostly black sky.
    this.pixelRatio = Math.min(window.devicePixelRatio, 1.5);
  }
}
