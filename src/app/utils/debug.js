import GUI from "lil-gui";

let instance = null;

export default class Debug {
  constructor() {
    if (instance) {
      return instance;
    }
    this.active =
      window.location.hash == "#debug" || window.location.hash == "#d";


    this.active = true; // for now. TODO: REMOVE

    if (this.active) {
      console.log("Debug Mode Active!");
      this.ui = new GUI();
      instance = this;
    }
  }
}
