// A slightly oversized sphere drawn back-face only. Everything inside the planet's
// silhouette is rejected by the depth test, so all that survives is the sliver of
// air around the limb -- which is exactly the part you can actually see.

uniform vec3 uSunDirection;
uniform vec3 uColor;
uniform vec3 uTwilightColor;
uniform float uStrength;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(cameraPosition - vPosition);

    // The warm twilight band is narrow in reality -- it only shows where sunlight is
    // grazing the limb, not across the whole lit hemisphere.
    float sunOrientation = dot(normal, uSunDirection);
    vec3 color = mix(uTwilightColor, uColor, smoothstep(-0.3, 0.08, sunOrientation));

    // Thickest where the line of sight is tangent to the shell.
    float thickness = pow(1.0 - abs(dot(viewDirection, normal)), 2.5);
    float lit = smoothstep(-0.35, 0.2, sunOrientation);

    gl_FragColor = vec4(color, clamp(thickness * lit * uStrength, 0.0, 1.0));
}
