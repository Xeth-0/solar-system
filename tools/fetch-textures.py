"""
Fetches planet textures from solarsystemscope.com (CC BY 4.0) and downscales them
to the resolutions the scene actually uses.

    python tools/fetch-textures.py

Re-running skips files that already exist. Pass --force to refetch everything.
"""

import io
import sys
import urllib.request
from pathlib import Path

from PIL import Image

Image.MAX_IMAGE_PIXELS = None

BASE_URL = "https://www.solarsystemscope.com/textures/download/"
STATIC = Path(__file__).resolve().parent.parent / "static"

# (remote file, local path, target width). 2k everywhere: on a sphere that never
# fills more than a fraction of the screen, anything larger is wasted bandwidth, and
# integrated GPUs feel it immediately.
TEXTURES = [
    ("8k_stars_milky_way.jpg", "stars/milkyway.jpg", 2048),
    ("8k_earth_daymap.jpg", "earth/day.jpg", 2048),
    ("8k_earth_nightmap.jpg", "earth/night.jpg", 2048),
    ("8k_earth_clouds.jpg", "earth/clouds.jpg", 2048),
    ("2k_earth_specular_map.tif", "earth/specular.jpg", 2048),
    ("8k_moon.jpg", "earth/moon.jpg", 2048),
    ("8k_mercury.jpg", "mercury/surface.jpg", 2048),
    ("8k_venus_surface.jpg", "venus/surface.jpg", 2048),
    ("4k_venus_atmosphere.jpg", "venus/atmosphere.jpg", 2048),
    ("8k_mars.jpg", "mars/surface.jpg", 2048),
    ("8k_jupiter.jpg", "jupiter/surface.jpg", 2048),
    ("8k_saturn.jpg", "saturn/surface.jpg", 2048),
    ("8k_saturn_ring_alpha.png", "saturn/ring.png", 2048),
    ("2k_uranus.jpg", "uranus/surface.jpg", 2048),
    ("2k_neptune.jpg", "neptune/surface.jpg", 2048),
]


def fetch(remote):
    request = urllib.request.Request(BASE_URL + remote, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=180) as response:
        return response.read()


def convert(raw, destination, width):
    image = Image.open(io.BytesIO(raw))

    if image.width > width:
        image = image.resize((width, max(1, round(image.height * width / image.width))), Image.LANCZOS)

    destination.parent.mkdir(parents=True, exist_ok=True)

    if destination.suffix == ".png":
        image.convert("RGBA").save(destination, optimize=True)
    else:
        image.convert("RGB").save(destination, quality=90, optimize=True)

    return image.size


def main():
    force = "--force" in sys.argv
    failed = []

    for remote, local, width in TEXTURES:
        destination = STATIC / local

        if destination.exists() and not force:
            print(f"  skip  {local}")
            continue

        try:
            size = convert(fetch(remote), destination, width)
        except Exception as error:  # noqa: BLE001 - report and keep going
            print(f"  FAIL  {local}: {error}")
            failed.append(local)
            continue

        print(f"  ok    {local}  {size[0]}x{size[1]}  {destination.stat().st_size // 1024} KB")

    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
