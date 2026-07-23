attribute float aSize;
attribute float aSeed;

uniform float uTime;
uniform float uPixelRatio;

varying vec3 vColor;
varying float vBrightness;

void main() {
    // Twinkling is driven by wall-clock time, not simulation time, so the sky keeps
    // shimmering while the system is paused.
    float shimmer = 0.72 + 0.28 * sin(uTime * 1.7 + aSeed * 6.2831853);

    vColor = color;
    vBrightness = shimmer;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio * shimmer;
}
