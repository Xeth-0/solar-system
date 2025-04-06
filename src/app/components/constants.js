export default {
  // !!! Distances are all wrong for now. otherwise, the planets will be too far and too small to see.
  // To make the scales of the palnets and distances consistent, i'm going to use muliplies on
  // top of the earth's size for everything else. that makes it one adjustable parameter for them all.
  SUN_SCALE_MULTIPLIER: 10.9,
  SUN_DISTANCE_MULTIPLIER: 0, // It's the center
  SUN_ROTATION_PERIOD: 0.04, // Sun rotates once every ~25 days (1/25)

  MERCURY_SCALE_MULTIPLIER: 0.38,
  MERCURY_DISTANCE_MULTIPLIER: 61.8,
  MERCURY_ORBITAL_PERIOD: 88, 
  MERCURY_ORBITAL_ECCENTRICITY: 0.2056,
  MERCURY_ROTATION_PERIOD: 0.017, // Mercury rotates once every ~59 days (1/59)

  VENUS_SCALE_MULTIPLIER: 0.95,
  VENUS_DISTANCE_MULTIPLIER: 115.3,
  VENUS_ORBITAL_PERIOD: 224.7,
  VENUS_ORBITAL_ECCENTRICITY: 0.0068,
  VENUS_ROTATION_PERIOD: 0.004, // Venus rotates once every ~243 days (1/243)

  EARTH_SCALE_MULTIPLIER: 1,
  EARTH_DISTANCE_MULTIPLIER: 149.6,
  EARTH_ORBITAL_PERIOD: 365.25,
  EARTH_ORBITAL_ECCENTRICITY: 0.0167,
  EARTH_ROTATION_PERIOD: 1, // Earth rotates once per day (reference)

  MOON_SCALE_MULTIPLIER: 0.27,
  MOON_DISTANCE_MULTIPLIER: 60, // Moon is ~384,400 km from Earth
  MOON_ORBITAL_PERIOD: 27.3, 
  MOON_ORBITAL_ECCENTRICITY: 0.0549,
  MOON_ROTATION_PERIOD: 0.0366, // Moon rotates once every ~27.3 days (1/27.3)

  MARS_SCALE_MULTIPLIER: 0.53,
  MARS_DISTANCE_MULTIPLIER: 227.9,
  MARS_ORBITAL_PERIOD: 686.97,
  MARS_ORBITAL_ECCENTRICITY: 0.0934,
  MARS_ROTATION_PERIOD: 0.974, // Mars rotates once every ~1.03 days (1/1.03)

  JUPITER_SCALE_MULTIPLIER: 11.21,
  JUPITER_DISTANCE_MULTIPLIER: 778.5,
  JUPITER_ORBITAL_PERIOD: 4332.59,
  JUPITER_ORBITAL_ECCENTRICITY: 0.0489,
  JUPITER_ROTATION_PERIOD: 2.41, // Jupiter rotates once every ~0.41 days (1/0.41)

  SATURN_SCALE_MULTIPLIER: 9.45,
  SATURN_DISTANCE_MULTIPLIER: 1433.5,
  SATURN_ORBITAL_PERIOD: 10759.22, 
  SATURN_ORBITAL_ECCENTRICITY: 0.0565,
  SATURN_ROTATION_PERIOD: 2.25, // Saturn rotates once every ~0.44 days (1/0.44)

  URANUS_SCALE_MULTIPLIER: 4.01,
  URANUS_DISTANCE_MULTIPLIER: 2872.5,
  URANUS_ORBITAL_PERIOD: 30688.5, 
  URANUS_ORBITAL_ECCENTRICITY: 0.0463,
  URANUS_ROTATION_PERIOD: 1.39, // Uranus rotates once every ~0.72 days (1/0.72)

  NEPTUNE_SCALE_MULTIPLIER: 3.88,
  NEPTUNE_DISTANCE_MULTIPLIER: 4495.1,
  NEPTUNE_ORBITAL_PERIOD: 60182, 
  NEPTUNE_ORBITAL_ECCENTRICITY: 0.0086,
  NEPTUNE_ROTATION_PERIOD: 1.49, // Neptune rotates once every ~0.67 days (1/0.67)

  sunColor: "#fc9601",
  earthAtmosphereDayColor: "#00aaff",
  earthAtmosphereTwilightColor: "#ff6600",
};

// export default {
//   // To make the scales of the palnets and distances consistent, i'm going to use muliplies on
//   // top of the earth's size for everything else. that makes it one adjustable parameter for them all.

//   // Scale multipliers relative to Earth's size (Earth = 1)
//   SUN_SCALE_MULTIPLIER: 109, // Sun is ~109 times Earth's diameter
//   SUN_DISTANCE_MULTIPLIER: 0, // Sun is at the center

//   // Planets - sizes relative to Earth, distances from Sun in Earth-radius units
//   MERCURY_SCALE_MULTIPLIER: 0.38,
//   MERCURY_DISTANCE_MULTIPLIER: 778, // Mercury is ~778 Earth radii from Sun
//   MERCURY_ORBITAL_PERIOD: 88,
//   MERCURY_ORBITAL_ECCENTRICITY: 0.2056,

//   VENUS_SCALE_MULTIPLIER: 0.95,
//   VENUS_DISTANCE_MULTIPLIER: 1448, // Venus is ~1448 Earth radii from Sun
//   VENUS_ORBITAL_PERIOD: 224.7,
//   VENUS_ORBITAL_ECCENTRICITY: 0.0068,

//   EARTH_SCALE_MULTIPLIER: 1,
//   EARTH_DISTANCE_MULTIPLIER: 2150, // Earth is ~2150 Earth radii from Sun
//   EARTH_ORBITAL_PERIOD: 365.25,
//   EARTH_ORBITAL_ECCENTRICITY: 0.0167,

//   MARS_SCALE_MULTIPLIER: 0.53,
//   MARS_DISTANCE_MULTIPLIER: 3268, // Mars is ~3268 Earth radii from Sun
//   MARS_ORBITAL_PERIOD: 686.97,
//   MARS_ORBITAL_ECCENTRICITY: 0.0934,

//   JUPITER_SCALE_MULTIPLIER: 11.21,
//   JUPITER_DISTANCE_MULTIPLIER: 11174, // Jupiter is ~11174 Earth radii from Sun
//   JUPITER_ORBITAL_PERIOD: 4332.59,
//   JUPITER_ORBITAL_ECCENTRICITY: 0.0489,

//   SATURN_SCALE_MULTIPLIER: 9.45,
//   SATURN_DISTANCE_MULTIPLIER: 20560, // Saturn is ~20560 Earth radii from Sun
//   SATURN_ORBITAL_PERIOD: 10759.22,
//   SATURN_ORBITAL_ECCENTRICITY: 0.0565,

//   URANUS_SCALE_MULTIPLIER: 4.01,
//   URANUS_DISTANCE_MULTIPLIER: 41120, // Uranus is ~41120 Earth radii from Sun
//   URANUS_ORBITAL_PERIOD: 30688.5,
//   URANUS_ORBITAL_ECCENTRICITY: 0.0463,

//   NEPTUNE_SCALE_MULTIPLIER: 3.88,
//   NEPTUNE_DISTANCE_MULTIPLIER: 64440, // Neptune is ~64440 Earth radii from Sun
//   NEPTUNE_ORBITAL_PERIOD: 60182,
//   NEPTUNE_ORBITAL_ECCENTRICITY: 0.0086,

//   // Earth's Moon - size relative to Earth, distance from Earth in Earth radii
//   MOON_SCALE_MULTIPLIER: 0.27,
//   MOON_DISTANCE_MULTIPLIER: 60, // Moon is ~60 Earth radii from Earth
//   MOON_ORBITAL_PERIOD: 27.3,
//   MOON_ORBITAL_ECCENTRICITY: 0.0549,

//   sunColor: "#fc9601",
//   earthAtmosphereDayColor: "#00aaff",
//   earthAtmosphereTwilightColor: "#ff6600",
// };
