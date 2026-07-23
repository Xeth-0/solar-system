import * as THREE from "three";

import vertexShader from "../shaders/orbit/vertex.glsl";
import fragmentShader from "../shaders/orbit/fragment.glsl";

const DEG = Math.PI / 180;

/**
 * Elements are the J2000 set from the body table, except `a` which callers have
 * already converted from AU (or planet radii, for moons) into scene units.
 */

/** Mean anomaly, in radians, at `days` past the epoch. */
export function meanAnomaly(orbit, days) {
  return (orbit.epoch + (360 * days) / orbit.period - orbit.peri) * DEG;
}

/**
 * Kepler's equation, M = E - e·sin(E), has no closed-form inverse, so Newton-Raphson
 * it is. Four iterations is plenty for the eccentricities in this system.
 */
export function eccentricAnomaly(meanAnomaly, e, tolerance = 1e-8) {
  let E = meanAnomaly;

  for (let i = 0; i < 12; i++) {
    const delta = (E - e * Math.sin(E) - meanAnomaly) / (1 - e * Math.cos(E));
    E -= delta;
    if (Math.abs(delta) < tolerance) break;
  }

  return E;
}

function trueAnomaly(E, e) {
  return (
    2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2))
  );
}

/**
 * Places a point from its in-plane polar coordinates into scene space, rotating it
 * by the argument of periapsis, the inclination and the ascending node in that order.
 * The ecliptic maps onto the XZ plane with north pointing along +Y.
 */
function toScene(radius, trueAnomaly, orbit, target) {
  const node = orbit.node * DEG;
  const inclination = orbit.i * DEG;
  const argument = (orbit.peri - orbit.node) * DEG + trueAnomaly;

  const cosArgument = Math.cos(argument);
  const sinArgument = Math.sin(argument);
  const cosNode = Math.cos(node);
  const sinNode = Math.sin(node);
  const cosInclination = Math.cos(inclination);

  return target.set(
    radius * (cosNode * cosArgument - sinNode * sinArgument * cosInclination),
    radius * (sinArgument * Math.sin(inclination)),
    -radius * (sinNode * cosArgument + cosNode * sinArgument * cosInclination)
  );
}

/**
 * Writes the body's position at `days` into `target` and returns its phase around
 * the orbit (0..1), which the orbit line uses to place its comet tail.
 */
export function orbitalPosition(orbit, days, target) {
  const E = eccentricAnomaly(meanAnomaly(orbit, days), orbit.e);
  const radius = orbit.a * (1 - orbit.e * Math.cos(E));

  toScene(radius, trueAnomaly(E, orbit.e), orbit, target);

  return (((E / (2 * Math.PI)) % 1) + 1) % 1;
}

/**
 * The orbit path, sampled evenly in eccentric anomaly so the phase attribute lines
 * up with what `orbitalPosition` returns.
 */
export function createOrbitLine(orbit, color, segments = 480) {
  const positions = new Float32Array((segments + 1) * 3);
  const phases = new Float32Array(segments + 1);
  const point = new THREE.Vector3();

  for (let i = 0; i <= segments; i++) {
    const E = (i / segments) * Math.PI * 2;
    const radius = orbit.a * (1 - orbit.e * Math.cos(E));

    toScene(radius, trueAnomaly(E, orbit.e), orbit, point).toArray(positions, i * 3);
    phases[i] = i / segments;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: new THREE.Uniform(new THREE.Color(color)),
      uPhase: new THREE.Uniform(0),
      uOpacity: new THREE.Uniform(1),
      uHighlight: new THREE.Uniform(0),
    },
  });

  const line = new THREE.Line(geometry, material);
  line.frustumCulled = false;
  line.renderOrder = -1;

  return line;
}
