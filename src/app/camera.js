import * as THREE from "three";
import Experience from "./experience";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default class Camera {
  constructor() {
    this.experience = new Experience();

    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.canvas = this.experience.canvas;

    // Camera tracking options
    this.target = null;
    this.followTarget = false;
    this.viewMode = "free"; // 'free', 'topDown', 'orbit', 'firstPerson'
    this.offset = new THREE.Vector3(0, 50, 100);
    this.smoothFactor = 0.1; // Lower for smoother camera movement
    this.orbitSpeed = -0.005;

    this.setInstance();
    this.setControls();
    this.setDebug();
  }

  setInstance() {
    const fov = 35;
    const aspectRatio =
      this.experience.sizes.width / this.experience.sizes.height;
    const clippingNear = 0.1;
    const clippingFar = 10000000;

    this.instance = new THREE.PerspectiveCamera(
      fov,
      aspectRatio,
      clippingNear,
      clippingFar
    );
    this.instance.position.set(6, 4, 8);
    this.experience.scene.add(this.instance);
  }

  setControls() {
    const controls = new OrbitControls(this.instance, this.canvas);
    controls.enableDamping = true;

    controls.addEventListener("change", () => {
      if (this.target)
        this.offset.copy(this.instance.position).sub(this.target.position);
    });

    this.controls = controls;
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  update() {
    if (this.target) {
      switch (this.viewMode) {
        case "topDown":
          // Top-down view
          this.instance.position.x = this.target.position.x;
          this.instance.position.z = this.target.position.z;
          this.instance.position.y = this.target.position.y + this.offset.y;
          this.instance.lookAt(this.target.position);
          break;

        case "orbit":
          // Orbit view - camera orbits around the target
          this.offset.applyAxisAngle(
            new THREE.Vector3(0, 1, 0),
            this.orbitSpeed
          );

          this.controls.target.copy(this.target.position).sub(this.offset);
          this.instance.position.copy(this.target.position).add(this.offset);
          break;

        case "firstPerson":
          // First-person view - camera is attached to the target
          const targetPosition = this.target.position.clone();
          const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(
            this.target.quaternion
          );

          this.instance.position.copy(targetPosition);
          this.instance.position.y += 2; // Slight height offset
          this.instance.lookAt(
            targetPosition.add(direction.multiplyScalar(10))
          );
          break;

        default:
          // Free-follow
          this.controls.target.copy(this.target.position);
          // this.instance.position.copy(this.target.position).add(this.offset);
          break;
      }
      if (this.followTarget) {
        this.instance.lookAt(this.target);
      }
    }

    // Called on each tick
    this.controls.update();
  }

  lookAt(mesh) {
    this.target = mesh;

    this.instance.position.copy(mesh.position);
    this.instance.position.z -= mesh.scale.z;
    this.instance.position.x += 30;
    this.instance.lookAt(mesh.position);
    this.controls.target.copy(mesh.position);
  }

  setTarget(target, followImmediately = true) {
    this.target = target;

    if (followImmediately) {
      this.instance.position.copy(target.position.clone().add(this.offset));
      this.controls.target.copy(target.position);
    }
  }

  setViewMode(mode) {
    this.viewMode = mode;

    if (this.target) {
      switch (mode) {
        case "topDown":
          this.offset.set(0, 250, 0);
          break;
        case "orbit":
          this.offset.set(0, 50, 100);
          break;
        case "firstPerson":
          this.offset.set(0, 2, 0);
          break;
        default:
          this.offset.set(0, 50, 100);
          break;
      }

      if (this.followTarget) {
        this.instance.position.copy(
          this.target.position.clone().add(this.offset)
        );
        this.controls.target.copy(this.target.position);
      }
    }
  }

  setDebug() {
    if (this.experience.debug && this.experience.debug.active) {
      const cameraFolder =
        this.experience.debug.ui.addFolder("Camera Settings");

      // // Camera follow toggle
      // cameraFolder
      //   .add(this, "followTarget")
      //   .name("Follow Target")
      //   .onChange((value) => {
      //     if (!value) {
      //       // When disabling follow, keep current position
      //       this.controls.enabled = true;
      //     }
      //   });

      // Camera view mode
      const viewModes = {
        "Free Follow": "free",
        "Top Down": "topDown",
        Orbit: "orbit",
        "First Person": "firstPerson",
      };

      cameraFolder
        .add(this, "viewMode", Object.keys(viewModes))
        .name("View Mode")
        .onChange((value) => {
          this.setViewMode(viewModes[value]);
        });

      // Camera smoothness
      cameraFolder
        .add(this, "smoothFactor", 0.01, 1)
        .name("Smoothness")
        .step(0.01);
    }
  }
}
