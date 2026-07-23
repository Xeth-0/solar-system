import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import Experience from "./experience";
import { STARFIELD_RADIUS } from "./data/bodies";

const FLIGHT_DURATION = 1.8; // seconds
const FRAMING = 3.4; // how many body radii back the camera settles

const scratchDirection = new THREE.Vector3();
const scratchQuaternion = new THREE.Quaternion();
const fromQuaternion = new THREE.Quaternion();
const toQuaternion = new THREE.Quaternion();
const REFERENCE = new THREE.Vector3(0, 0, 1);

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * An orbit rig that rides along with whichever body is in focus.
 *
 * The trick that makes it feel solid: the controls always work in world space, and
 * every frame the camera and its target are nudged by however far the focused body
 * moved. The user keeps full manual control of the angle and distance, and the body
 * stays pinned in the middle of the screen while it races around the Sun.
 */
export default class Camera {
  constructor() {
    this.experience = new Experience();
    this.sizes = this.experience.sizes;
    this.canvas = this.experience.canvas;

    this.focus = null;
    this.flight = null;
    this.previousFocusPosition = new THREE.Vector3();

    this.setInstance();
    this.setControls();
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(50, this.sizes.width / this.sizes.height, 1, 1e5);
    this.instance.position.set(0, 900, 2600);
    this.experience.scene.add(this.instance);
  }

  setControls() {
    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.rotateSpeed = 0.55;
    this.controls.zoomSpeed = 0.9;
    // Panning would slide the target off the body it is meant to be locked to.
    this.controls.enablePan = false;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 40000;
  }

  /**
   * Flies to a body and locks on.
   *
   * @param {object} body - anything with `worldPosition` and `extent`
   * @param {object} [options]
   * @param {number} [options.distance] - where to settle, in scene units
   * @param {boolean} [options.instant] - skip the flight
   */
  lookAt(body, { distance, instant = false } = {}) {
    const target = distance ?? body.extent * FRAMING;

    // Settle on the sunward side, offset enough that the body shows a terminator
    // rather than a flatly lit disc.
    if (body.worldPosition.lengthSq() > 0) {
      scratchDirection
        .copy(body.worldPosition)
        .normalize()
        .negate()
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * 0.22);
      scratchDirection.y += 0.28;
      scratchDirection.normalize();
    } else {
      scratchDirection.set(0.3, 0.35, 0.9).normalize();
    }

    if (instant) {
      this.focus = body;
      this.flight = null;
      this.controls.target.copy(body.worldPosition);
      this.instance.position.copy(body.worldPosition).addScaledVector(scratchDirection, target);
      this.previousFocusPosition.copy(body.worldPosition);
      this.applyDistanceLimits(body);
      return;
    }

    const startOffset = this.instance.position.clone().sub(this.controls.target);

    this.flight = {
      body,
      elapsed: 0,
      startTarget: this.controls.target.clone(),
      startDistance: Math.max(startOffset.length(), 1e-4),
      startDirection: startOffset.normalize(),
      endDistance: target,
      endDirection: scratchDirection.clone(),
    };

    this.controls.enabled = false;
  }

  applyDistanceLimits(body) {
    this.controls.minDistance = Math.max(body.extent * 1.15, 0.05);
    this.controls.maxDistance = Math.max(body.extent * 4000, 30000);
  }

  advanceFlight(delta) {
    const flight = this.flight;
    flight.elapsed += delta;

    const progress = easeInOutCubic(Math.min(flight.elapsed / FLIGHT_DURATION, 1));

    // Distance moves geometrically -- a straight lerp from 20 000 units down to 3
    // spends almost the whole flight indistinguishable from the start.
    const distance = flight.startDistance * Math.pow(flight.endDistance / flight.startDistance, progress);

    fromQuaternion.setFromUnitVectors(REFERENCE, flight.startDirection);
    toQuaternion.setFromUnitVectors(REFERENCE, flight.endDirection);
    scratchQuaternion.slerpQuaternions(fromQuaternion, toQuaternion, progress);
    scratchDirection.copy(REFERENCE).applyQuaternion(scratchQuaternion);

    this.controls.target.lerpVectors(flight.startTarget, flight.body.worldPosition, progress);
    this.instance.position.copy(this.controls.target).addScaledVector(scratchDirection, distance);

    if (progress >= 1) {
      this.focus = flight.body;
      this.previousFocusPosition.copy(flight.body.worldPosition);
      this.applyDistanceLimits(flight.body);
      this.controls.enabled = true;
      this.flight = null;
    }
  }

  /** Near and far have to track the zoom: this scene spans nine orders of magnitude. */
  updateClipping() {
    const distance = this.instance.position.distanceTo(this.controls.target);

    this.instance.near = THREE.MathUtils.clamp(distance * 0.004, 0.01, 400);
    this.instance.far = STARFIELD_RADIUS * 1.7;
    this.instance.updateProjectionMatrix();
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  update(delta) {
    if (this.flight) {
      this.advanceFlight(delta);
    } else if (this.focus) {
      scratchDirection.copy(this.focus.worldPosition).sub(this.previousFocusPosition);
      this.instance.position.add(scratchDirection);
      this.controls.target.add(scratchDirection);
      this.previousFocusPosition.copy(this.focus.worldPosition);
    }

    this.controls.update();
    this.updateClipping();

    // The screen-space markers project through these matrices later this frame, so
    // they have to be current rather than one frame stale.
    this.instance.updateMatrixWorld();
    this.instance.matrixWorldInverse.copy(this.instance.matrixWorld).invert();
  }
}
