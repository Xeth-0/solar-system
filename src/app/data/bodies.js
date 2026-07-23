/**
 * Every body in the scene is described here. Nothing else in the codebase hard-codes
 * a planet: the world walks this table and builds a `Body` per entry.
 *
 * Orbital elements are the J2000 mean elements, so t = 0 puts the planets roughly
 * where they were on 2000-01-01. Angles are in degrees, periods in days, and a
 * negative rotation period means the body spins retrograde.
 */

// Scene scale. Radii are true relative to each other (Earth = 1); orbital distances
// are compressed by a large constant factor, otherwise every planet is a sub-pixel
// speck. This is the one deliberate lie in the model.
export const AU = 150;
export const EARTH_RADIUS = 1;
// The starfield rides with the camera, so it only has to sit outside Neptune's orbit
// rather than at any "real" distance. Keeping it close buys back depth precision.
export const STARFIELD_RADIUS = 60000;

// Drawn at true size (109 Earth radii) the Sun would reach two thirds of the way to
// Mercury's orbit, so it gets its own compression factor.
const SUN_DISPLAY_SCALE = 0.11;

export const SUN = {
  id: "sun",
  name: "Sun",
  kind: "Star",
  radius: 109.2 * SUN_DISPLAY_SCALE,
  tilt: 7.25,
  rotationPeriod: 25.38,
  blurb:
    "A G-type main sequence star holding 99.86% of the mass in the solar system. Its core fuses 600 million tonnes of hydrogen every second.",
  facts: {
    Diameter: "1 391 400 km",
    Mass: "333 000 Earths",
    Surface: "5 505 °C",
    Core: "15 million °C",
    Rotation: "25.4 days",
    Age: "4.6 billion years",
  },
};

export const PLANETS = [
  {
    id: "mercury",
    name: "Mercury",
    kind: "Terrestrial planet",
    radius: 0.3829,
    tilt: 0.034,
    rotationPeriod: 58.646,
    orbit: { a: 0.38710, e: 0.20563, i: 7.005, node: 48.331, peri: 77.456, epoch: 252.251, period: 87.969 },
    surface: { map: "/mercury/surface.jpg", relief: 1.0, ambient: 0.02 },
    blurb:
      "The smallest planet and the fastest, sprinting around the Sun in 88 days. Three of its days last exactly two of its years.",
    facts: {
      Diameter: "4 879 km",
      Mass: "0.055 Earths",
      Gravity: "3.7 m/s²",
      Day: "58.6 days",
      Year: "88 days",
      Moons: "None",
      Temperature: "−173 to 427 °C",
    },
  },
  {
    id: "venus",
    name: "Venus",
    kind: "Terrestrial planet",
    radius: 0.9499,
    tilt: 177.36,
    rotationPeriod: -243.025,
    orbit: { a: 0.72333, e: 0.00677, i: 3.395, node: 76.680, peri: 131.533, epoch: 181.980, period: 224.701 },
    surface: { map: "/venus/surface.jpg", relief: 0.35, ambient: 0.03 },
    // Venus' cloud deck super-rotates in four days while the ground below takes 243.
    clouds: { map: "/venus/atmosphere.jpg", opacity: 0.94, contrast: 0.0, driftPeriod: -4.07 },
    atmosphere: { color: "#ffdca8", twilight: "#ff7a3d", height: 0.03, strength: 1.1 },
    blurb:
      "Wrapped in a runaway greenhouse of carbon dioxide and sulfuric acid. Hot enough at the surface to melt lead, and it spins backwards.",
    facts: {
      Diameter: "12 104 km",
      Mass: "0.815 Earths",
      Gravity: "8.87 m/s²",
      Day: "243 days (retrograde)",
      Year: "224.7 days",
      Moons: "None",
      Temperature: "464 °C",
    },
  },
  {
    id: "earth",
    name: "Earth",
    kind: "Terrestrial planet",
    radius: 1,
    flattening: 0.00335,
    tilt: 23.44,
    rotationPeriod: 0.99727,
    orbit: { a: 1.00000, e: 0.01671, i: 0.0, node: 0.0, peri: 102.947, epoch: 100.464, period: 365.256 },
    surface: {
      map: "/earth/day.jpg",
      nightMap: "/earth/night.jpg",
      specularMap: "/earth/specular.jpg",
      relief: 0.15,
      ambient: 0.015,
    },
    clouds: { map: "/earth/clouds.jpg", opacity: 0.9, contrast: 1.0, driftPeriod: 30 },
    atmosphere: { color: "#4ba3ff", twilight: "#ff7028", height: 0.025, strength: 1.0 },
    blurb:
      "The only place known to carry life, and the only planet here whose night side glows with someone's city lights.",
    facts: {
      Diameter: "12 756 km",
      Mass: "5.97 × 10²⁴ kg",
      Gravity: "9.81 m/s²",
      Day: "23h 56m",
      Year: "365.25 days",
      Moons: "1",
      Temperature: "15 °C",
    },
    moons: [
      {
        id: "moon",
        name: "Moon",
        kind: "Natural satellite",
        radius: 0.2727,
        tilt: 6.68,
        rotationPeriod: 27.322,
        // Distance is in planet radii here rather than AU: 60 Earth radii, true to life.
        orbit: { a: 60, e: 0.0549, i: 5.145, node: 125.08, peri: 318.15, epoch: 218.32, period: 27.322 },
        surface: { map: "/earth/moon.jpg", relief: 1.0, ambient: 0.012 },
        blurb:
          "Tidally locked, so the same face has watched Earth for four billion years. It drifts 3.8 cm further away each year.",
        facts: {
          Diameter: "3 475 km",
          Mass: "0.0123 Earths",
          Gravity: "1.62 m/s²",
          Day: "27.3 days",
          Orbit: "384 400 km",
          Temperature: "−173 to 127 °C",
        },
      },
    ],
  },
  {
    id: "mars",
    name: "Mars",
    kind: "Terrestrial planet",
    radius: 0.5320,
    flattening: 0.00589,
    tilt: 25.19,
    rotationPeriod: 1.02595,
    orbit: { a: 1.52371, e: 0.09339, i: 1.850, node: 49.559, peri: 336.041, epoch: 355.453, period: 686.980 },
    surface: { map: "/mars/surface.jpg", relief: 0.7, ambient: 0.02 },
    atmosphere: { color: "#e8a878", twilight: "#c25a2a", height: 0.018, strength: 0.45 },
    blurb:
      "Rusted iron gives it the colour. Home to Olympus Mons, a volcano three times the height of Everest, and a canyon that would span the United States.",
    facts: {
      Diameter: "6 792 km",
      Mass: "0.107 Earths",
      Gravity: "3.72 m/s²",
      Day: "24h 37m",
      Year: "687 days",
      Moons: "2",
      Temperature: "−65 °C",
    },
  },
  {
    id: "jupiter",
    name: "Jupiter",
    kind: "Gas giant",
    radius: 11.209,
    flattening: 0.06487,
    tilt: 3.13,
    rotationPeriod: 0.41354,
    orbit: { a: 5.20289, e: 0.04839, i: 1.303, node: 100.474, peri: 14.728, epoch: 34.396, period: 4332.589 },
    surface: { map: "/jupiter/surface.jpg", relief: 0.0, ambient: 0.025 },
    atmosphere: { color: "#f5d9b0", twilight: "#b07038", height: 0.015, strength: 0.5 },
    rings: {
      inner: 1.72,
      outer: 1.81,
      opacity: 0.14,
      bands: [{ from: 0.0, to: 1.0, color: "#8a7a6a", opacity: 1.0 }],
    },
    blurb:
      "Two and a half times the mass of every other planet combined. The Great Red Spot is a storm that has been running for at least 190 years.",
    facts: {
      Diameter: "142 984 km",
      Mass: "317.8 Earths",
      Gravity: "24.79 m/s²",
      Day: "9h 56m",
      Year: "11.86 years",
      Moons: "95 known",
      Temperature: "−110 °C",
    },
  },
  {
    id: "saturn",
    name: "Saturn",
    kind: "Gas giant",
    radius: 9.449,
    flattening: 0.09796,
    tilt: 26.73,
    rotationPeriod: 0.44401,
    orbit: { a: 9.53667, e: 0.05386, i: 2.485, node: 113.663, peri: 92.599, epoch: 49.954, period: 10759.22 },
    surface: { map: "/saturn/surface.jpg", relief: 0.0, ambient: 0.025 },
    atmosphere: { color: "#f0dcb4", twilight: "#b8894a", height: 0.014, strength: 0.45 },
    rings: { map: "/saturn/ring.png", inner: 1.11, outer: 2.32, opacity: 1.0 },
    blurb:
      "The rings span 280 000 km but average ten metres thick — proportionally thinner than a sheet of paper the size of a football field.",
    facts: {
      Diameter: "120 536 km",
      Mass: "95.2 Earths",
      Gravity: "10.44 m/s²",
      Day: "10h 42m",
      Year: "29.45 years",
      Moons: "146 known",
      Temperature: "−140 °C",
    },
  },
  {
    id: "uranus",
    name: "Uranus",
    kind: "Ice giant",
    radius: 4.007,
    flattening: 0.02293,
    tilt: 97.77,
    rotationPeriod: -0.71833,
    orbit: { a: 19.18916, e: 0.04726, i: 0.773, node: 74.017, peri: 170.954, epoch: 313.238, period: 30685.4 },
    surface: { map: "/uranus/surface.jpg", relief: 0.0, ambient: 0.03 },
    atmosphere: { color: "#a8e4e8", twilight: "#4a8fa0", height: 0.02, strength: 0.7 },
    rings: {
      inner: 1.64,
      outer: 2.006,
      opacity: 0.5,
      bands: [
        { from: 0.0, to: 0.62, color: "#5a5a60", opacity: 0.28 },
        { from: 0.66, to: 0.72, color: "#6a6a70", opacity: 0.4 },
        { from: 0.94, to: 1.0, color: "#8a8a90", opacity: 0.9 },
      ],
    },
    blurb:
      "Knocked onto its side by an ancient impact, it rolls around its orbit with its poles facing the Sun. Its rings stand vertical.",
    facts: {
      Diameter: "51 118 km",
      Mass: "14.5 Earths",
      Gravity: "8.87 m/s²",
      Day: "17h 14m (retrograde)",
      Year: "84 years",
      Moons: "28 known",
      Temperature: "−195 °C",
    },
  },
  {
    id: "neptune",
    name: "Neptune",
    kind: "Ice giant",
    radius: 3.883,
    flattening: 0.01708,
    tilt: 28.32,
    rotationPeriod: 0.67125,
    orbit: { a: 30.06992, e: 0.00859, i: 1.770, node: 131.784, peri: 44.964, epoch: 304.880, period: 60189.0 },
    surface: { map: "/neptune/surface.jpg", relief: 0.0, ambient: 0.03 },
    atmosphere: { color: "#6f9fff", twilight: "#2a4a9a", height: 0.022, strength: 0.8 },
    rings: {
      inner: 1.69,
      outer: 2.54,
      opacity: 0.22,
      bands: [
        { from: 0.0, to: 0.45, color: "#4a5a7a", opacity: 0.3 },
        { from: 0.92, to: 1.0, color: "#6a7a9a", opacity: 0.8 },
      ],
    },
    blurb:
      "Found with mathematics before anyone pointed a telescope at it. The fastest winds in the solar system tear across it at 2 100 km/h.",
    facts: {
      Diameter: "49 528 km",
      Mass: "17.1 Earths",
      Gravity: "11.15 m/s²",
      Day: "16h 06m",
      Year: "164.8 years",
      Moons: "16 known",
      Temperature: "−200 °C",
    },
  },
];
