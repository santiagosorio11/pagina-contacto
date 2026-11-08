"""Genera los thumbnails de la grilla de modelos y actualiza thumbnailUrl en json/models.json.

Correr después de asignar una foto como thumbnail: python scripts/generate_thumbnails.py
Requiere Pillow. Solo procesa modelos cuyo thumbnailUrl no está en las carpetas de
thumbnails o pasa de MAX_WIDTH de ancho; las fotos originales no se modifican.
"""
import json
from pathlib import Path
from urllib.parse import quote, unquote

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
MODELS = ROOT / "json" / "models.json"
FOLDERS = {"women": "thumbnail women", "men": "thumbnail men"}
TARGET_WIDTH, TARGET_HEIGHT = 400, 600  # La tarjeta es 2:3 y mide hasta 200 px de ancho.
MAX_WIDTH = 600


def needs_thumbnail(url, path):
    if not url.startswith("/assets/thumbnail"):
        return True
    with Image.open(path) as img:
        return img.width > MAX_WIDTH


def new_destination(model):
    # /assets se cachea 7 días como immutable: nunca reutilizar un nombre existente.
    folder = ROOT / "assets" / FOLDERS[model["category"]]
    dest = folder / f"{model['id']}-thumb.webp"
    n = 2
    while dest.exists():
        dest = folder / f"{model['id']}-thumb-{n}.webp"
        n += 1
    return dest


def make_thumbnail(src, dest):
    with Image.open(src) as img:
        icc = img.info.get("icc_profile")
        img = ImageOps.exif_transpose(img).convert("RGB")
        # Cubre la tarjeta 2:3 sin agrandar la foto ni pasar de MAX_WIDTH.
        scale = min(1, max(TARGET_WIDTH / img.width, TARGET_HEIGHT / img.height), MAX_WIDTH / img.width)
        if scale < 1:
            img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
        options = {"icc_profile": icc} if icc else {}
        img.save(dest, "WEBP", quality=88, method=6, **options)


data = json.loads(MODELS.read_text(encoding="utf-8"))
created = 0
for model in data["models"]:
    url = model["thumbnailUrl"]
    path = ROOT / unquote(url).lstrip("/")
    if not path.exists():
        print(f"No existe: {url}")
        continue
    if not needs_thumbnail(url, path):
        continue
    dest = new_destination(model)
    make_thumbnail(path, dest)
    model["thumbnailUrl"] = "/" + quote(dest.relative_to(ROOT).as_posix())
    created += 1
    print(f"{model['id']}: {dest.name}")

if created:
    MODELS.write_text(json.dumps(data, indent=3, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n")
print(f"Thumbnails creados: {created}")
