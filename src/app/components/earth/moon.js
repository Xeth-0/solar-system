import * as THREE from "three";
import constants from "../constants";
import Experience from "../../experience";

import vertexShader from "../.shaders/earth/moon/vertex.glsl"
import fragmentShader from "../.shaders/earth/moon/fragment.glsl"

export default class Moon {
  constructor(earthSize){
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.time = this.experience.time;

    // Moon orbital parameters
    this.orbitalPeriod = 27.3; // Moon's orbital period in days
    this.orbitalSpeed = (2 * Math.PI) / this.orbitalPeriod; // Angular speed in radians per day
    this.orbitalInclination = THREE.MathUtils.degToRad(5.14); // Moon's orbital inclination in radians
    this.orbitalAngle = 0;

    // Calculate direction to Sun for lighting
    this.sunDirection = new THREE.Vector3(0,0,1);

    this.setTextures();
    this.setMesh(earthSize);
    this.setDebug();
  }

  setTextures(){
    this.textures = {
      moonTexture: this.resources.items.earthMoonTexture,
    };

    this.textures.moonTexture.colorSpace = THREE.SRGBColorSpace;
    // this.textures.moonTexture.anisotropy = 8;

    console.log("Moon Textures: ", this.textures);
  }
  
  setMesh(earthSize){
    this.radius = earthSize * constants.MOON_SCALE_MULTIPLIER;
    this.distance = earthSize * constants.MOON_DISTANCE_MULTIPLER;

    const geometry = new THREE.SphereGeometry(this.radius, 64, 64);
    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        uMoonTexture: new THREE.Uniform(this.textures.moonTexture),
        uSunDirection: new THREE.Uniform(this.sunDirection)
      }
    });

    this.instance = new THREE.Mesh(geometry, material);
    
    // Create a group for the moon's orbit
    this.orbitGroup = new THREE.Group();
    this.orbitGroup.add(this.instance);
    
    // Apply orbital inclination to the moon's orbit
    this.orbitGroup.rotation.x = this.orbitalInclination;
    
    // Create orbital path visualization
    this.createOrbitalPath();
    
    this.scene.add(this.orbitGroup);
    
    // Initial position
    this.updatePosition(0);
  }
  
  createOrbitalPath() {
    // Create a visualization of the moon's orbital path
    const curve = new THREE.EllipseCurve(
      0, 0,                 // Center x, y
      this.distance, this.distance, // xRadius, yRadius (circular orbit)
      0, 2 * Math.PI,       // startAngle, endAngle
      false,                // clockwise
      0                     // rotation
    );
    
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    // Convert 2D points to 3D
    const positions = new Float32Array(points.length * 3);
    for (let i = 0; i < points.length; i++) {
      positions[i * 3] = points[i].x;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = points[i].y;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.LineBasicMaterial({
      color: 0x444444,
      transparent: true,
      opacity: 0.2
    });
    
    this.orbitLine = new THREE.Line(geometry, material);
    this.orbitGroup.add(this.orbitLine);
  }
  
  updatePosition(timeElapsed) {
    // Calculate the moon's orbital position
    this.orbitalAngle = timeElapsed * this.orbitalSpeed; 
    
    // Calculate position (circular orbit for simplicity)
    const x = this.distance * Math.cos(this.orbitalAngle);
    const z = this.distance * Math.sin(this.orbitalAngle);
    
    // Update moon's position
    this.instance.position.set(x, 0, z);
  }
  
  update(earthPosition, sunDirection) {
    // Update the moon's orbit position to follow the Earth
    this.orbitGroup.position.copy(earthPosition);
    
    // Update the moon's position in its orbit
    this.updatePosition(this.time.elapsed);
    
    // Update the sun direction for lighting
    this.sunDirection.copy(sunDirection);
    if (this.instance.material && this.instance.material.uniforms) {
      this.instance.material.uniforms.uSunDirection.value = this.sunDirection;
    }
  }

  setDebug(){
    if (this.experience.debug.active) {
      const folder = this.experience.debug.ui.addFolder("Moon Settings");
      
      folder
        .add(this, 'orbitalSpeed', 0.001, 0.5, 0.001)
        .name('Orbital Speed');
        
      folder
        .add(this, 'orbitalInclination', 0, Math.PI / 2, 0.01)
        .name('Inclination')
        .onChange(() => {
          this.orbitGroup.rotation.x = this.orbitalInclination;
        });
    }
  }
}