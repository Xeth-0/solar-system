import Experience from "../experience";
import Markers from "./markers";

const SPEED_MIN = 0.05; // simulated days per real second
const SPEED_MAX = 500;

// Bodies reachable with the number keys, in order.
const SHORTCUTS = ["sun", "mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"];

const DATE_FORMAT = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const PLAY_ICON = '<svg viewBox="0 0 16 16"><path d="M4 2.5 13 8l-9 5.5z"/></svg>';
const PAUSE_ICON = '<svg viewBox="0 0 16 16"><path d="M4 2.5h3v11H4zM9 2.5h3v11H9z"/></svg>';

const toSpeed = (slider) => SPEED_MIN * Math.pow(SPEED_MAX / SPEED_MIN, slider);
const toSlider = (speed) => Math.log(speed / SPEED_MIN) / Math.log(SPEED_MAX / SPEED_MIN);

function formatRate(daysPerSecond) {
  if (daysPerSecond < 1) return `${(daysPerSecond * 24).toFixed(1)} hours / sec`;
  if (daysPerSecond < 100) return `${daysPerSecond.toFixed(daysPerSecond < 10 ? 1 : 0)} days / sec`;
  return `${(daysPerSecond / 365.25).toFixed(2)} years / sec`;
}

export default class Hud {
  constructor() {
    this.experience = new Experience();

    this.dom = {
      loader: document.querySelector("#loader"),
      loaderFill: document.querySelector("#loader-fill"),
      index: document.querySelector("#index"),
      panel: document.querySelector("#panel"),
      play: document.querySelector("#play"),
      speed: document.querySelector("#speed"),
      rate: document.querySelector("#rate"),
      date: document.querySelector("#date"),
      orbits: document.querySelector("#toggle-orbits"),
      labels: document.querySelector("#toggle-labels"),
      markers: document.querySelector("#markers"),
    };

    this.experience.resources.on("progress", (progress) => {
      this.dom.loaderFill.style.transform = `scaleX(${progress})`;
    });
  }

  /** Called once the world exists and the bodies can be listed. */
  build() {
    const { world } = this.experience;

    this.markers = new Markers(this.dom.markers, world.bodies, (id) => world.select(id));

    this.buildIndex(world.bodies);
    this.bindTransport();
    this.bindKeyboard();

    this.dom.loader.classList.add("loader--done");
    document.body.classList.add("is-ready");
  }

  buildIndex(bodies) {
    const overview = document.createElement("button");
    overview.className = "index__item index__item--overview";
    overview.innerHTML = `<span class="index__key">0</span>Whole system`;
    overview.addEventListener("click", () => this.experience.world.viewSystem());
    this.dom.index.appendChild(overview);

    for (const body of bodies) {
      const shortcut = SHORTCUTS.indexOf(body.id);

      const item = document.createElement("button");
      item.className = `index__item${body.parent ? " index__item--child" : ""}`;
      item.dataset.id = body.id;
      item.innerHTML = `<span class="index__key">${shortcut >= 0 ? shortcut + 1 : ""}</span>${body.name}`;
      item.addEventListener("click", () => this.experience.world.select(body.id));

      this.dom.index.appendChild(item);
    }
  }

  bindTransport() {
    const { time, world } = this.experience;

    this.dom.speed.value = toSlider(time.daysPerSecond);
    this.dom.rate.textContent = formatRate(time.daysPerSecond);
    this.setPaused(false);

    this.dom.play.addEventListener("click", () => this.setPaused(!time.paused));

    this.dom.speed.addEventListener("input", () => {
      time.daysPerSecond = toSpeed(Number(this.dom.speed.value));
      this.dom.rate.textContent = formatRate(time.daysPerSecond);
    });

    this.dom.orbits.addEventListener("click", () => {
      const visible = !world.orbitsVisible;
      world.setOrbitsVisible(visible);
      this.dom.orbits.classList.toggle("is-on", visible);
    });

    this.dom.labels.addEventListener("click", () => {
      const visible = !this.markers.visible;
      this.markers.setVisible(visible);
      this.dom.labels.classList.toggle("is-on", visible);
    });
  }

  bindKeyboard() {
    window.addEventListener("keydown", (event) => {
      if (event.target instanceof HTMLInputElement) return;

      if (event.code === "Space") {
        event.preventDefault();
        this.setPaused(!this.experience.time.paused);
        return;
      }

      if (event.key === "0") {
        this.experience.world.viewSystem();
        return;
      }

      const index = Number(event.key) - 1;
      if (index >= 0 && index < SHORTCUTS.length) {
        this.experience.world.select(SHORTCUTS[index]);
      }
    });
  }

  setPaused(paused) {
    this.experience.time.paused = paused;
    this.dom.play.innerHTML = paused ? PLAY_ICON : PAUSE_ICON;
    this.dom.play.setAttribute("aria-label", paused ? "Resume" : "Pause");
  }

  onSelect(body) {
    for (const item of this.dom.index.children) {
      item.classList.toggle("is-active", item.dataset.id === body.id);
    }

    const facts = Object.entries(body.definition.facts)
      .map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`)
      .join("");

    this.dom.panel.innerHTML = `
      <p class="panel__kind">${body.definition.kind}</p>
      <h2 class="panel__name">${body.name}</h2>
      <p class="panel__blurb">${body.definition.blurb}</p>
      <dl class="panel__facts">${facts}</dl>
    `;
    this.dom.panel.hidden = false;
  }

  update() {
    const { time, camera, sizes } = this.experience;

    this.markers.update(camera.instance, sizes);

    // Formatting a date is far too expensive to redo sixty times a second for a
    // readout that only changes when the simulated day rolls over.
    const date = DATE_FORMAT.format(time.date);
    if (date !== this.shownDate) {
      this.shownDate = date;
      this.dom.date.textContent = date;
    }
  }
}
