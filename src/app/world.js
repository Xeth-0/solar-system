import * as THREE from "three";
import Experience from "./experience";
import Sun from "./components/sun/sun";
import Earth from "./components/earth/earth";
import Environment from "./components/environment";
import Mercury from "./components/mercury/mercury";
import Venus from "./components/venus";
// import Environment from "./components/environment";

let instance = null;

export default class World {
  constructor() {
    if (instance){
      return instance;
    }
    instance = this;
    
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    
    // Camera focus options
    this.focusTarget = 'sun'; // Default focus target
    
    // Build the world when the resources(textures, models, ...) are ready
    this.resources.on("ready", () => {
      console.log("Resources loaded.");
      this.setWorld();
      this.setDebug();
    });
  }
  
  setWorld(){
    const earthSize = 1;
    
    this.sun = new Sun(earthSize);
    this.mercury = new Mercury(earthSize);
    this.venus = new Venus(earthSize);
    this.earth = new Earth(earthSize);
    this.environment = new Environment(earthSize);
    
    // Set initial camera position
    this.updateCameraFocus(this.focusTarget);
  }

  update() {
    if (this.sun) {
      this.sun.update();
    }
    if (this.mercury) {
      this.mercury.update();
    }
    if (this.venus) {
      this.venus.update();
    }
    if (this.earth){
      this.earth.update();
    }
    if (this.environment) {
      this.environment.update();
    }
  }

  updateCameraFocus(target) {
    const camera = this.experience.camera;
    
    switch(target) {
      case 'sun':
        camera.setTarget(this.sun.instance);
        camera.setViewMode('orbit');
        break;
        
      case 'earth':
        camera.setTarget(this.earth.instance);
        camera.setViewMode('free');
        break;
        
      case 'moon':
        if (this.earth && this.earth.moon) {
          camera.setTarget(this.earth.moon.orbitGroup);
          camera.setViewMode('free');
        }
        break;
        
      case 'system':
        // View the entire system from above
        camera.setTarget(this.sun.instance);
        camera.setViewMode('topDown');
        break;
        
      default:
        camera.setTarget(this.sun.instance);
        break;
    }
    
    // Enable camera following
    camera.followTarget = true;
  }

  setDebug() {
    if (this.experience.debug && this.experience.debug.active) {
      const worldFolder = this.experience.debug.ui.addFolder('World Settings');
      
      // Focus target selection
      const focusTargets = {
        'Sun': 'sun',
        'Earth': 'earth',
        'Moon': 'moon',
        'Solar System': 'system'
      };
      
      worldFolder
        .add({ focusTarget: this.focusTarget }, 'focusTarget', Object.keys(focusTargets))
        .name('Focus On')
        .onChange((value) => {
          this.focusTarget = focusTargets[value];
          this.updateCameraFocus(this.focusTarget);
        });
    }
  }
}
