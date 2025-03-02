import GUI from "lil-gui";

let instance = null;

export default class Debug {
  constructor() {
    if (instance) {
      return instance;
    }
    this.active =
      window.location.hash == "#debug" || window.location.hash == "#d";

    if (this.active) {
      console.log("Debug Mode Active!");
      this.ui = new GUI();
      instance = this;
    }
  }
}
