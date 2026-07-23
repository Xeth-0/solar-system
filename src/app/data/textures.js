import { PLANETS } from "./bodies";

/**
 * The texture manifest is derived from the body table rather than maintained beside
 * it, so adding a moon or a ring can never leave a texture unloaded.
 */
function collect(body, paths) {
  paths.add(body.surface.map);

  if (body.surface.nightMap) paths.add(body.surface.nightMap);
  if (body.surface.specularMap) paths.add(body.surface.specularMap);
  if (body.clouds) paths.add(body.clouds.map);
  if (body.rings?.map) paths.add(body.rings.map);

  for (const moon of body.moons ?? []) collect(moon, paths);
}

const paths = new Set(["/stars/milkyway.jpg"]);
for (const planet of PLANETS) collect(planet, paths);

export default [...paths];
