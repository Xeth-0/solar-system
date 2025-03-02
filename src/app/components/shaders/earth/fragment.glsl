uniform vec3 uSunDirection;
uniform float uCloudIntensity;
uniform sampler2D uEarthDayTexture;
uniform sampler2D uEarthNightTexture;
uniform sampler2D uEarthSpecularCloudsTexture;

uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0, 0.0, 0.0);

    // Sun (Directional Light)
    float sunOrientation = dot(uSunDirection, normal); // facing the fragment or not.

    // Pick Day / Night textures based on the sun orientation and direction
    float dayMix = smoothstep(-0.35, 0.0, sunOrientation);
    vec3 dayColor = texture(uEarthDayTexture, vUv).rgb;
    vec3 nightColor = texture(uEarthNightTexture, vUv).rgb;
    color = mix(nightColor, dayColor, dayMix);

    // Clouds Texture
    vec2 specularCloudsColor = texture(uEarthSpecularCloudsTexture, vUv).rg;

    // Clouds
    vec3 cloudColor = mix(vec3(0.01), vec3(1.0), dayMix); // darker clouds on darker side of the planet
    cloudColor *= smoothstep(-0.3, 1.0, dayMix);

    float cloudMix = specularCloudsColor.g;
    cloudMix = smoothstep(1.0 - uCloudIntensity, 1.0, cloudMix);
    color = mix(color, cloudColor, cloudMix);

    // Atmosphere
    float uFresnelIntensity = 2.0;
    float atmosphereDayMix = smoothstep(-0.5, 1.0, sunOrientation);
    vec3 atmosphereColor = mix(uAtmosphereTwilightColor, uAtmosphereDayColor, atmosphereDayMix);
    float fresnel = dot(viewDirection, normal) + 1.0;
    fresnel = pow(fresnel, uFresnelIntensity);

    color = mix(color, atmosphereColor, fresnel * atmosphereDayMix);

    // Specular
    vec3 reflection = reflect(-uSunDirection, normal);
    float specular = -dot(reflection, viewDirection);
    specular = max(specular, 0.0);
    specular = pow(specular, 32.0);
    specular *= specularCloudsColor.r/2.0 + 0.1;
    vec3 specularColor = mix(vec3(1.0), atmosphereColor, fresnel);

    color += specularColor * specular;

    // Final color
    gl_FragColor = vec4(color, 1.0);
    // Three.js mappings
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}