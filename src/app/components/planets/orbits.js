import * as THREE from "three";

/**
 * @param {number} semiMajorAxis
 * @param {number} semiMinorAxis
 * @param {number} orbitalEccentricity
 * @param {boolean} clockwise
 * @returns {THREE.Line}
 */
function createOrbitalPath(
  semiMajorAxis,
  semiMinorAxis,
  orbitalEccentricity,
  clockwise = false,
  orbitCurveColor = "#444444"
) {
  const orbitCurve = new THREE.EllipseCurve(
    -semiMajorAxis * orbitalEccentricity, 0, // Origin x,y
    semiMajorAxis, semiMinorAxis, // xRadius, zRadius
    0,
    2 * Math.PI, // start angle, end angle
    clockwise, // clockwise
    0
  );

  const points = orbitCurve.getPoints(1000);
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const positions = new Float32Array(points.length * 3);
  for (let i = 0; i < points.length; i++) {
    positions[i * 3] = points[i].x;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = points[i].y;
  }

  orbitGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
  const orbitMaterial = new THREE.LineBasicMaterial({
    color: orbitCurveColor,
    transparent: true,
    opacity: 0.3,
  });

  const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
  return orbitLine;
}

/**
 * @param {number} M
 * @param {number} e
 * @param {number} tolerance
 * @returns {number}
 */
function solveKepler(M, e, tolerance = 1e-6) {
  let E = M;
  for (let i = 0; i < 100; i++) {
    const delta = E - e * Math.sin(E) - M;
    if (Math.abs(delta) < tolerance) break;

    E = E - delta / (1 - e * Math.cos(E));
  }
  return E;
}

/**
 * @param {number} timeElapsed
 * @param {number} orbitalPeriod
 * @param {number} orbitalEccentricity
 * @param {number} semiMajorAxis
 * @returns {[number, number]}
 */
function getOrbitPosition(
  timeElapsed,
  orbitalPeriod,
  orbitalEccentricity,
  semiMajorAxis
) {
  const M = (2 * Math.PI * timeElapsed) / orbitalPeriod;
  const E = solveKepler(M, orbitalEccentricity);

  // Calculate the true anomaly (ν)
  const nu =
    2 *
    Math.atan2(
      Math.sqrt(1 + orbitalEccentricity) * Math.sin(E / 2),
      Math.sqrt(1 - orbitalEccentricity) * Math.cos(E / 2)
    );

  // Calculate the distance from the Sun (r)
  const r =
    (semiMajorAxis * (1 - Math.pow(orbitalEccentricity, 2))) /
    (1 + orbitalEccentricity * Math.cos(nu));

  const x = r * Math.cos(nu);
  const z = r * Math.sin(nu);

  return [x, z];
}

export { createOrbitalPath, solveKepler, getOrbitPosition };
