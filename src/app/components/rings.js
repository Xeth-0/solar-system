import * as THREE from "three";

import vertexShader from "../shaders/rings/vertex.glsl";
import fragmentShader from "../shaders/rings/fragment.glsl";

const BAND_TEXTURE_WIDTH = 512;

/**
 * Saturn is the only body here with a photographed ring strip. The faint rings of
 * Jupiter, Uranus and Neptune are described as a handful of bands in the body table
 * and baked into an equivalent strip, so both go through the same shader.
 */
export function createBandTexture(bands) {
  const data = new Uint8Array(BAND_TEXTURE_WIDTH * 4);
  const color = new THREE.Color();

  for (const band of bands) {
    color.set(band.color);

    const start = Math.floor(band.from * BAND_TEXTURE_WIDTH);
    const end = Math.ceil(band.to * BAND_TEXTURE_WIDTH);

    for (let i = start; i < end && i < BAND_TEXTURE_WIDTH; i++) {
      // Fade the band edges and rough up the density a little so it doesn't read as a decal.
      const across = (i - start) / Math.max(1, end - start - 1);
      const feather = Math.min(1, Math.sin(across * Math.PI) * 3);
      const grain = 0.75 + 0.25 * Math.sin(i * 12.9898) * Math.sin(i * 4.1414);

      data[i * 4] = color.r * 255;
      data[i * 4 + 1] = color.g * 255;
      data[i * 4 + 2] = color.b * 255;
      data[i * 4 + 3] = band.opacity * feather * grain * 255;
    }
  }

  const texture = new THREE.DataTexture(data, BAND_TEXTURE_WIDTH, 1, THREE.RGBAFormat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  return texture;
}

/**
 * @param {object} definition - the `rings` block from the body table
 * @param {number} bodyRadius - equatorial radius in scene units
 * @param {THREE.Texture} texture - the ring strip
 */
export function createRings(definition, bodyRadius, texture) {
  const inner = definition.inner * bodyRadius;
  const outer = definition.outer * bodyRadius;

  const geometry = new THREE.RingGeometry(inner, outer, 180, 1);
  geometry.rotateX(-Math.PI / 2);

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uMap: new THREE.Uniform(texture),
      uRadii: new THREE.Uniform(new THREE.Vector2(inner, outer)),
      uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
      uBodyCenter: new THREE.Uniform(new THREE.Vector3()),
      uBodyRadius: new THREE.Uniform(bodyRadius),
      uOpacity: new THREE.Uniform(definition.opacity ?? 1),
    },
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.renderOrder = 1;

  return mesh;
}
