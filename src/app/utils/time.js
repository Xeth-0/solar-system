// Custom Clock
import * as THREE from "three";
import EventEmitter from "./eventEmitter";

export default class Time extends EventEmitter {
  constructor() {
    super();

    // Setup
    
    this.start = Date.now();
    this.current = this.start;
    this.delta = 16;
    this.elapsed = 0;
    this.timeScale = 0.3; // Time scale factor for controlling simulation speed

    window.requestAnimationFrame(() => {
      this.tick();
    });
  }

  tick() {
    const currentTime = Date.now();
    this.delta = currentTime - this.current;
    this.current = currentTime;
    
    // Calculate elapsed time in seconds and apply time scale
    const rawElapsed = (this.current - this.start) / 1000; // Convert to seconds
    this.elapsed = rawElapsed * this.timeScale;
    
    this.trigger("tick");

    window.requestAnimationFrame(() => {
      this.tick();
    });
  }
}
