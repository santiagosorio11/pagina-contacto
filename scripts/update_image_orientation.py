"""Actualiza "horizontalImages" en json/models.json leyendo el tamaño real de cada foto.

Correr después de agregar o cambiar fotos: python scripts/update_image_orientation.py
Requiere Pillow. Sin este campo el portfolio funciona, pero descarga todas las fotos al abrir.
"""
import json
from pathlib import Path
from urllib.parse import unquote

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
MODELS = ROOT / "json" / "models.json"


def is_horizontal(url):
    path = ROOT / unquote(url).lstrip("/")
    if not path.exists():
        print(f"No existe: {url}")
        return False
    with Image.open(path) as img:
        return img.width > img.height


data = json.loads(MODELS.read_text(encoding="utf-8"))
for model in data["models"]:
    if "portfolioImages" in model:
        model["horizontalImages"] = [u for u in model["portfolioImages"] if is_horizontal(u)]
MODELS.write_text(json.dumps(data, indent=3, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n")
