import * as THREE from "three";
import EventEmitter from "./eventEmitter";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default class Resources extends EventEmitter {
  constructor(sources) {
    super();

    // Options
    this.sources = sources;

    // Setup
    this.items = {};
    this.toLoad = this.sources.length;
    this.loaded = 0;

    // Loaders
    this.setLoaders();

    // Begin Loading
    this.startLoading();
  }

  setLoaders() {
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = (item, loaded, total) => {
      console.log(
        `Loaded ${loaded} of ${total} resources for ${item}`
      );
    };
    loadingManager.onError = (url) => {
      console.warn(`An error happened loading: ${url}`);
    };

    this.loaders = {};
    // this.loaders.gltf = new GLTFLoader();
    this.loaders.textureLoader = new THREE.TextureLoader(loadingManager);
    this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader();
  
    
  }

  startLoading() {
    // Load from each source.
    for (const source of this.sources) {
      if (source.type == "gltfModel") {
        this.loaders.gltf.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
      } else if (source.type == "texture") {
        this.loaders.textureLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
      } else if (source.type == "cubeTexture") {
        this.loaders.cubeTextureLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
      }
    }
  }

  sourceLoaded(source, file) {
    this.items[source.name] = file;
    this.loaded++;

    if (this.loaded == this.toLoad) {
      console.log(`Texture Loaded: ${source.name}`);
      this.trigger("ready");
    }
  }
}
