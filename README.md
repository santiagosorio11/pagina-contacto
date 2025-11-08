# Contacto Básico Web

Sitio estático para la agencia de modelaje Contacto Básico.

## Despliegue en Vercel

1. Crea un nuevo proyecto en [Vercel](https://vercel.com/) importando este repositorio.
2. Selecciona **Framework Preset: Other**.
3. Mantén el comando de build vacío y el directorio de salida como la raíz (`.`); Vercel servirá los archivos estáticos tal cual.
4. Instala el dominio personalizado (`contactobasico.com` u otro) siguiendo las instrucciones de Vercel.

### Cabeceras de caché

`vercel.json` incluye reglas para cachear activos en `assets/` y `fonts/` por 7 días, y archivos en `css/` y `js/` por 1 día. Ajusta los tiempos si introduces *hashing* en los nombres de archivo.

## Google Analytics (GA4)

1. Copia tu **Measurement ID** (formato `G-XXXXXXX`) desde Google Analytics.
2. Sustituye el placeholder `G-XXXXXXXXXX` en las etiquetas `<script src="/js/analytics.js" data-ga-id="...">` de todas las páginas.
   - Alternativamente, puedes definir `window.GA_MEASUREMENT_ID` antes de cargar `analytics.js`.
3. Despliega nuevamente el sitio para empezar a recibir métricas.

`js/analytics.js` carga el snippet de GA de forma diferida y envía un evento `page_view` inicial cuando la librería termina de cargar.

## Optimización de rendimiento

- Todos los scripts principales se cargan con `defer`.
- Las imágenes usan `loading="lazy"` donde aplica.
- Se añadió `preconnect` hacia los dominios de Google Analytics para reducir la latencia en la primera conexión.
- `fetchData` evita recalcular rutas cuando se navega entre páginas bajo `/pages/`.

Para pruebas de rendimiento, utiliza [PageSpeed Insights](https://pagespeed.web.dev/) o `lighthouse` en Chrome DevTools y considera subir los resultados al tablero de Analytics.

