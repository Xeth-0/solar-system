// The ring texture is a single radial strip: u runs from the inner edge to the outer
// edge and alpha carries the gap structure.

uniform sampler2D uMap;
uniform vec2 uRadii;        // inner, outer, in local units
uniform vec3 uSunDirection;
uniform vec3 uBodyCenter;
uniform float uBodyRadius;
uniform float uOpacity;

varying vec3 vLocal;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    float span = (length(vLocal.xz) - uRadii.x) / (uRadii.y - uRadii.x);
    vec4 sampled = texture(uMap, vec2(span, 0.5));

    float density = sampled.a * uOpacity;
    if (density < 0.004) discard;

    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(cameraPosition - vPosition);

    // Ring particles scatter forward, so the shadowed face still glows faintly when
    // the Sun is behind them -- that is why Saturn's unlit side is not simply black.
    float facing = abs(dot(normal, uSunDirection));
    float sameSide = step(0.0, dot(normal, viewDirection) * dot(normal, uSunDirection));
    float forwardScatter = pow(max(dot(viewDirection, -uSunDirection), 0.0), 3.0);
    float light = mix(0.18 + 0.55 * forwardScatter, 0.5 + 0.5 * facing, sameSide);

    // The planet casts a cylinder of shadow straight down-Sun.
    vec3 local = vPosition - uBodyCenter;
    float alongSun = dot(local, uSunDirection);
    float offAxis = length(local - uSunDirection * alongSun);
    float shadow = alongSun < 0.0
        ? smoothstep(uBodyRadius * 0.96, uBodyRadius * 1.08, offAxis)
        : 1.0;

    gl_FragColor = vec4(sampled.rgb * light * mix(0.1, 1.0, shadow), density);
}
