// One shader for every solid body in the scene. The optional features -- night
// lights, clouds, ocean glint, ring shadows -- are compiled in per body via defines,
// so Mercury doesn't pay for Earth's city lights.

uniform sampler2D uMap;
uniform vec2 uTexel;            // 1 / texture size, for the relief derivative
uniform vec3 uSunDirection;     // unit vector from this body towards the Sun
uniform float uRelief;
uniform float uAmbient;
uniform vec3 uAtmosphereColor;
uniform vec3 uTwilightColor;
uniform float uAtmosphereStrength;

#ifdef USE_NIGHT_MAP
uniform sampler2D uNightMap;
#endif

#ifdef USE_SPECULAR
uniform sampler2D uSpecularMap;
#endif

#ifdef USE_CLOUDS
uniform sampler2D uCloudMap;
uniform float uCloudOpacity;
uniform float uCloudContrast;
uniform float uCloudOffset;
#endif

#ifdef USE_RING_SHADOW
uniform sampler2D uRingMap;
uniform vec3 uRingNormal;
uniform vec3 uBodyCenter;
uniform vec2 uRingRadii;
#endif

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

float luminance(vec3 color) {
    return dot(color, vec3(0.2126, 0.7152, 0.0722));
}

/**
 * There are no height maps in the project, but for rocky bodies the albedo map is a
 * decent stand-in for one: crater rims are bright, floors are dark. Taking its
 * gradient and tilting the normal gives Mercury and the Moon real relief at the
 * terminator for the cost of four texture reads.
 */
vec3 applyRelief(vec3 normal, vec2 uv, float strength) {
    float left = luminance(texture(uMap, uv - vec2(uTexel.x, 0.0)).rgb);
    float right = luminance(texture(uMap, uv + vec2(uTexel.x, 0.0)).rgb);
    float down = luminance(texture(uMap, uv - vec2(0.0, uTexel.y)).rgb);
    float up = luminance(texture(uMap, uv + vec2(0.0, uTexel.y)).rgb);

    vec3 tangent = cross(vec3(0.0, 1.0, 0.0), normal);
    float lengthSquared = dot(tangent, tangent);
    if (lengthSquared < 1e-8) return normal; // degenerate at the poles

    tangent *= inversesqrt(lengthSquared);
    vec3 bitangent = cross(normal, tangent);

    return normalize(normal + (tangent * (left - right) + bitangent * (down - up)) * strength * 8.0);
}

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(cameraPosition - vPosition);

    vec3 shadedNormal = uRelief > 0.0 ? applyRelief(normal, vUv, uRelief) : normal;

    float sunOrientation = dot(normal, uSunDirection);
    float dayMix = smoothstep(-0.06, 0.12, sunOrientation);
    float diffuse = max(dot(shadedNormal, uSunDirection), 0.0);

    vec3 color = texture(uMap, vUv).rgb * (diffuse + uAmbient);

    #ifdef USE_SPECULAR
        // The specular map is white over water, black over land.
        float gloss = texture(uSpecularMap, vUv).r;
        vec3 halfway = normalize(uSunDirection + viewDirection);
        float glint = pow(max(dot(normal, halfway), 0.0), 160.0) * gloss;
        color += vec3(1.0, 0.95, 0.85) * glint * 0.45;
    #endif

    #ifdef USE_NIGHT_MAP
        color += texture(uNightMap, vUv).rgb * (1.0 - dayMix) * 0.85;
    #endif

    #ifdef USE_CLOUDS
        vec3 cloud = texture(uCloudMap, vec2(vUv.x + uCloudOffset, vUv.y)).rgb;
        // Contrast 1 pulls the cloud shape out of a greyscale map (Earth); contrast 0
        // treats the whole texture as one opaque deck (Venus).
        float cover = mix(1.0, luminance(cloud), uCloudContrast) * uCloudOpacity;
        color = mix(color, cloud * (max(dot(normal, uSunDirection), 0.0) + uAmbient * 2.0), cover);
    #endif

    #ifdef USE_RING_SHADOW
        // March from this fragment towards the Sun and see if the ring plane is in the way.
        vec3 local = vPosition - uBodyCenter;
        float slope = dot(uSunDirection, uRingNormal);
        if (abs(slope) > 1e-4) {
            float distance = -dot(local, uRingNormal) / slope;
            if (distance > 0.0) {
                float radius = length(local + uSunDirection * distance);
                float span = (radius - uRingRadii.x) / (uRingRadii.y - uRingRadii.x);
                if (span > 0.0 && span < 1.0) {
                    color *= 1.0 - texture(uRingMap, vec2(span, 0.5)).a * 0.8;
                }
            }
        }
    #endif

    // Haze piling up towards the limb, warm where the Sun is grazing it.
    if (uAtmosphereStrength > 0.0) {
        float rim = pow(1.0 - max(dot(normal, viewDirection), 0.0), 3.0);
        vec3 haze = mix(uTwilightColor, uAtmosphereColor, smoothstep(-0.3, 0.6, sunOrientation));
        color = mix(color, haze, rim * uAtmosphereStrength * dayMix * 0.55);
    }

    gl_FragColor = vec4(color, 1.0);
}
