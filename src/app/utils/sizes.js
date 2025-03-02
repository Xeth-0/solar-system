import EventEmitter from "./eventEmitter.js";

export default class Sizes extends EventEmitter {
  constructor() {
    super();

    // Setup
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);

    // Handle Resize event, only listened to from window.addEventListener here, the rest will respond to the event emitter.
    window.addEventListener('resize', ()=>{
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.pixelRatio = Math.min(window.devicePixelRatio, 2);

      this.trigger('resize'); // Event emitter emission.
    })
  }
}
