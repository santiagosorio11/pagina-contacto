# Instrucciones para agentes

## Fotos de modelos

Cada vez que agregues, cambies, renombres o quites fotos de un modelo (`models/` o `portfolioImages` en `json/models.json`), corre esto antes de hacer commit:

```bash
python scripts/update_image_orientation.py
```

Requiere Pillow (`pip install pillow`). El script actualiza `horizontalImages` en `json/models.json` y avisa con `No existe: ...` si alguna foto del JSON no está en disco; resuélvelo antes de terminar.

Sin ese campo, el portfolio del modelo descarga todas las fotos al abrir. Si queda desactualizado, las fotos horizontales se ordenan mal en el carrusel.
