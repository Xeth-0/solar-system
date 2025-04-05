import Experience from "./experience";
import Sun from "./components/sun/sun";
import Earth from "./components/planets/earth/earth";
import Environment from "./components/environment";
import Mercury from "./components/planets/mercury";
import Venus from "./components/planets/venus";
import Mars from "./components/planets/mars";
import Jupiter from "./components/planets/jupiter";
import Saturn from "./components/planets/saturn";
import Neptune from "./components/planets/neptune";
import Uranus from "./components/planets/uranus";

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
    this.focusTarget = 'earth'; // Default focus target
    
    // Build the world when the resources(textures, models, ...) are ready
    this.resources.on("ready", () => {
      console.log("Resources loaded.");
      this.setWorld();
      this.setDebug();
    });
  }
  
  setWorld(){
    const earthRadius = 1;
    
    this.sun = new Sun(earthRadius);

    this.mercury = new Mercury(earthRadius);
    this.venus = new Venus(earthRadius);
    this.earth = new Earth(earthRadius);
    this.mars = new Mars(earthRadius);
    this.jupiter = new Jupiter(earthRadius);
    this.saturn = new Saturn(earthRadius);
    this.uranus = new Uranus(earthRadius);
    this.neptune = new Neptune(earthRadius);
    this.environment = new Environment(earthRadius);
    
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
    if (this.mars){
      this.mars.update()
    }
    if (this.jupiter){
      this.jupiter.update()
    }
    if (this.saturn){
      this.saturn.update()
    }
    if (this.uranus){
      this.uranus.update()
    }
    if (this.neptune){
      this.neptune.update()
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
