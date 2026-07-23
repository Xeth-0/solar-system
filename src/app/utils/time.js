import EventEmitter from "./eventEmitter";

const MILLISECONDS_PER_DAY = 86400000;
const J2000 = Date.UTC(2000, 0, 1, 12); // the epoch the orbital elements are measured from

/**
 * Above this the rotation clock stops keeping up with the orbit clock. Left alone,
 * winding the simulation up to a hundred days a second turns every planet into a
 * strobing blur; capping it keeps rotation legible while preserving the relative
 * spin rates between bodies. Orbits are never throttled.
 */
const SPIN_LIMIT = 0.6;

export default class Time extends EventEmitter {
  constructor() {
    super();

    this.current = performance.now();
    this.delta = 1 / 60;
    this.elapsed = 0;

    // Start the model where the real solar system is today, not at the epoch.
    this.days = (Date.now() - J2000) / MILLISECONDS_PER_DAY;
    this.spinDays = 0;
    this.daysPerSecond = 4;
    this.paused = false;

    window.requestAnimationFrame(() => this.tick());
  }

  get date() {
    return new Date(J2000 + this.days * MILLISECONDS_PER_DAY);
  }

  tick() {
    const now = performance.now();

    // Clamped so that coming back to a backgrounded tab doesn't teleport the planets.
    this.delta = Math.min((now - this.current) / 1000, 0.1);
    this.current = now;
    this.elapsed += this.delta;

    if (!this.paused) {
      this.days += this.delta * this.daysPerSecond;
      this.spinDays += this.delta * Math.min(this.daysPerSecond, SPIN_LIMIT);
    }

    this.trigger("tick");

    window.requestAnimationFrame(() => this.tick());
  }
}
