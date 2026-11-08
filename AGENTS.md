# Instrucciones para agentes

## Fotos de modelos

Cada vez que agregues, cambies, renombres o quites fotos de un modelo (`models/` o `portfolioImages` en `json/models.json`), corre esto antes de hacer commit:

```bash
python scripts/update_image_orientation.py
```

Requiere Pillow (`pip install pillow`). El script actualiza `horizontalImages` en `json/models.json` y avisa con `No existe: ...` si alguna foto del JSON no está en disco; resuélvelo antes de terminar.

Sin ese campo, el portfolio del modelo descarga todas las fotos al abrir. Si queda desactualizado, las fotos horizontales se ordenan mal en el carrusel.

## Thumbnails de modelos

Todo modelo debe tener un thumbnail propio en `assets/thumbnail women` o `assets/thumbnail men`, de 600 px de ancho como máximo (lo ideal es 400). Nunca dejes `thumbnailUrl` apuntando a una foto completa de `models/`: al reducirla tanto en la grilla se ve pixelada.

Al crear un modelo o cambiar su thumbnail, pon en `thumbnailUrl` la foto elegida (normalmente la foto 0) y corre esto antes de hacer commit:

```bash
python scripts/generate_thumbnails.py
```

El script crea el archivo `<id>-thumb.webp` y actualiza `thumbnailUrl`. No borres ni sobrescribas thumbnails existentes para reutilizar su nombre: `/assets` se cachea 7 días como `immutable`.
