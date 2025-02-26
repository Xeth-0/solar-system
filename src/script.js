import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "lil-gui";
import { Lensflare, LensflareElement } from "three/addons/objects/Lensflare.js";
import Stats from "three/addons/libs/stats.module.js"
import earthVertexShader from "./shaders/earth/vertex.glsl";
import earthFragmentShader from "./shaders/earth/fragment.glsl";
import atmosphereVertexShader from "./shaders/planetAtmosphere/vertex.glsl";
import atmosphereFragmentShader from "./shaders/planetAtmosphere/fragment.glsl";
import sunAtmosphereVertexShader from "./shaders/sun/sunAtmosphere/vertex.glsl";
import sunAtmosphereFragmentShader from "./shaders/sun/sunAtmosphere/fragment.glsl";
import sunVertexShader from "./shaders/sun/vertex.glsl";
import sunFragmentShader from "./shaders/sun/fragment.glsl";


const SUN_DISTANCE_MULTIPLIER = 117.50; // distance of the sun to the earth based on the size of the earth
const SUN_SCALE_MULTIPLIER = 1.09; // size of the sun based on the size of the earth

/**
 * Base
 */
// Debug
const cameraParameters = {}
cameraParameters.focus = "Earth";

const gui = new GUI();
const stats = new Stats();
document.body.appendChild(stats.dom)

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Loaders
const textureLoader = new THREE.TextureLoader();

/**
 * Earth
 */
// Day and night textures
const earthDayTexture = textureLoader.load("/earth/day.jpg");
const earthNightTexture = textureLoader.load("/earth/night.jpg");
const earthSpecularCloudsTexture = textureLoader.load(
  "/earth/specularClouds.jpg"
);

earthDayTexture.colorSpace = THREE.SRGBColorSpace;
earthNightTexture.colorSpace = THREE.SRGBColorSpace;

earthDayTexture.anisotropy = 8;
earthNightTexture.anisotropy = 8;
earthSpecularCloudsTexture.anisotropy = 8;

console.log(earthDayTexture);

const earthParameters = {};
earthParameters.atmosphereDayColor = "#00aaff";
earthParameters.atmosphereTwilightColor = "#ff6600";
earthParameters.sunColor = "#fc9601"

// Mesh
const earthSize = 2;
const earthGeometry = new THREE.SphereGeometry(earthSize, 64, 64);
const earthMaterial = new THREE.ShaderMaterial({
  vertexShader: earthVertexShader,
  fragmentShader: earthFragmentShader,
  uniforms: {
    uEarthDayTexture: new THREE.Uniform(earthDayTexture),
    uEarthNightTexture: new THREE.Uniform(earthNightTexture),
    uEarthSpecularCloudsTexture: new THREE.Uniform(earthSpecularCloudsTexture),
    uSunDirection: new THREE.Uniform(new THREE.Vector3(0,0,1)),
    uCloudIntensity: new THREE.Uniform(0.5),
    uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereDayColor)),
    uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereTwilightColor)),
  },
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);


// Earth Atmosphere
const earthAtmosphereMaterial = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  transparent: true,
  vertexShader: atmosphereVertexShader,
  fragmentShader: atmosphereFragmentShader,
  uniforms: {
    uSunDirection: new THREE.Uniform(new THREE.Vector3(0,0,1)),
    uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereDayColor)),
    uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereTwilightColor)),
  }
});

const earthAtmosphere = new THREE.Mesh(earthGeometry, earthAtmosphereMaterial);
earthAtmosphere.scale.set(1.04, 1.04, 1.04);
scene.add(earthAtmosphere);

/**
 * Sun
 */
const sunTexture = textureLoader.load("/sun/8k_sun.jpg");
// const sunTexture = textureLoader.load("/sun/2k_sun.jpg")

const sunSpherical = new THREE.Spherical(1, Math.PI * 0.5, 0);
const sunDirection = new THREE.Vector3(0,0,1);
let sunDistance = earthSize * SUN_DISTANCE_MULTIPLIER;
// sunDistance = 0;

const sunGeometry = new THREE.SphereGeometry(earthSize * SUN_SCALE_MULTIPLIER, 100, 100);
const sunMaterial = new THREE.ShaderMaterial({
  transparent: true,
  vertexShader: sunVertexShader,
  fragmentShader: sunFragmentShader,
  uniforms: {
    uSunColor: new THREE.Uniform(new THREE.Color(earthParameters.sunColor)),
    uTime: new THREE.Uniform(0),
    uSunTexture: new THREE.Uniform(sunTexture),
  }
})
const sun = new THREE.Mesh(sunGeometry, sunMaterial);

scene.add(sun);

// Sun Atmosphere
const sunAtmosphereMaterial = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  transparent: true,
  depthWrite: false,
  vertexShader: sunAtmosphereVertexShader,
  fragmentShader: sunAtmosphereFragmentShader,
  blending: THREE.AdditiveBlending,
  uniforms: {
    uTime: new THREE.Uniform(0)
  }
});

const sunAtmosphere = new THREE.Mesh(sunGeometry, sunAtmosphereMaterial);
sunAtmosphere.scale.set(5., 5., 5.);
sun.add(sunAtmosphere);

// Update
const updateSun = () => {
  // All this gymnastics just to set it's values using spherical coordinates. kinda worth it tho ngl
  sunDirection.setFromSpherical(sunSpherical);
  
  // Debug
  sun.position.copy(sunDirection).multiplyScalar(sunDistance);

  // Update sun
  earth.material.uniforms.uSunDirection.value.copy(sunDirection);
  earthAtmosphere.material.uniforms.uSunDirection.value.copy(sunDirection);

};

const lookAtSun = () => {
  camera.position.copy(sun.position);
  camera.position.z += 40
  camera.position.x += 12
  camera.lookAt(sun.position);
  controls.target.copy(sun.position)
}

const lookAtEarth = () => {
  camera.position.copy(earth.position);
  camera.position.z -= 5;
  camera.position.x += 30;
  camera.lookAt(earth.position);
  controls.target.copy(earth.position)
}


updateSun();

/**
 * Sizes
*/
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRatio);
});

/**
 * Camera
*/
// Base camera
const camera = new THREE.PerspectiveCamera(
  25,
  sizes.width / sizes.height,
  0.1,
  100000000000
);
camera.position.x = 12;
camera.position.y = 5;
camera.position.z = 4;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

camera.lookAt(sun);

/**
 * Renderer
*/
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
renderer.setClearColor("#000011");

/**
 * Animate
*/
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  stats.update()
  
  // Update meshes and materials
  earth.rotation.y = elapsedTime * 0.1;
  sun.material.uniforms.uTime.value = elapsedTime;
  sunAtmosphere.material.uniforms.uTime.value = elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();


// Debug
gui
.add(sunSpherical, 'phi')
  .min(0)
  .max(Math.PI)
  .onChange(updateSun)
  .name("Sun Position: phi");

gui
  .add(sunSpherical, 'theta')
  .min(0)
  .max(Math.PI)
  .onChange(updateSun)
  .name("Sun Position: theta");

gui
  .add(earthMaterial.uniforms.uCloudIntensity, 'value')
  .min(0)
  .max(1)
  .step(0.01)
  .name("Earth: Cloud Intensity");
  
gui
  .addColor(earthParameters, "atmosphereDayColor")
  .onChange(()=>{
    earthMaterial.uniforms.uAtmosphereDayColor.value.set(earthParameters.atmosphereDayColor);
    earthAtmosphereMaterial.uniforms.uAtmosphereDayColor.value.set(earthParameters.atmosphereDayColor);
  });
  
gui
  .addColor(earthParameters, "atmosphereTwilightColor")
  .onChange(()=>{
    earthAtmosphereMaterial.uniforms.uAtmosphereTwilightColor.value.set(earthParameters.atmosphereTwilightColor);
    earthMaterial.uniforms.uAtmosphereTwilightColor.value.set(earthParameters.atmosphereTwilightColor);
  });
  
gui
  .addColor(earthParameters, "sunColor")
  .onChange(()=>{  
  });

gui
.add(cameraParameters, "focus")
.options(["Earth", "Sun"]).onChange((val) => {
  if (val === "Sun") {
    lookAtSun();
  } else if (val == "Earth") {
    lookAtEarth();
  }
});

// lookAtSun()