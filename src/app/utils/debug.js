import GUI from "lil-gui";

let instance = null;

/** Tuning panel, off unless the page is loaded with #debug. */
export default class Debug {
  constructor() {
    if (instance) return instance;
    instance = this;

    this.active = window.location.hash === "#debug";

    if (this.active) {
      this.ui = new GUI({ title: "Tuning", width: 300 });
    }
  }
}
