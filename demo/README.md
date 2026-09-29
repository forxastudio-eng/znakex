# ZNAKEX — demo jugable

Primera demo del juego: HTML5 + Canvas, empaquetada como APK de Android (WebView), sin dependencias externas y funciona sin conexión.

## Probar

- **Android:** instala `releases/ZNAKEX-tester-0.1.0.apk` (todo desbloqueado: 10 niveles, 19 skins, 999.999 monedas) o `releases/ZNAKEX-0.1.0.apk` (progresión normal).
  Hay que permitir "instalar apps de origen desconocido". Los dos APK pueden convivir en el móvil.
- **Navegador:** sirve la carpeta `demo/` con cualquier servidor estático (`npx http-server demo`) y abre `index.html`.
  Añade `?tester=1` a la URL para el modo tester.

Controles: deslizar el dedo (o botones en Ajustes). En PC: flechas / WASD, `Esc` para pausa.

## Qué incluye

- Modos: Historia (mapa I, 10 niveles con obstáculos y nivel Guardián), Clásico, Orbes Frenéticos (60 s, sin muros) y Duelo contra bot (3 dificultades).
- Orbe rojo (+1) y dorado (+3 y velocidad x2), combos, animaciones de boca, bulto al tragar, engorde progresivo, parpadeo, lengua, estelas por skin.
- Muerte con revivir (anuncio simulado o 100 / 200 monedas), pausa, victoria, resultados y récords.
- 19 skins: la básica en 10 colores (250–500 monedas) y 9 especiales. Ruleta diaria, tienda de monedas (compras simuladas), ajustes.
- Progresión: cada nivel se desbloquea al superar el anterior (el modo tester lo abre todo).

Aún no: sonido y música, mapas II–XVI jugables, anuncios reales (AdMob), compras reales (Play Billing), guardado en la nube.

## Estructura

| Ruta | Contenido |
| --- | --- |
| `index.html`, `css/`, `js/` | El juego (`js/game.js` reglas, `js/snakedraw.js` dibujo de la serpiente, `js/ui.js` pantallas) |
| `assets/` | Recursos extraídos de las fichas del repo (se regeneran con `tools/build_assets.py`) |
| `fonts/` | Bebas Neue, Barlow y Barlow Condensed (licencia OFL) |
| `android/` | App Android mínima (WebView) y `build_apk.sh` |
| `releases/` | APK compilados |

## Regenerar

```bash
python3 demo/tools/build_assets.py      # requiere Pillow, numpy y scipy
demo/android/build_apk.sh tester        # o: release
```

`build_apk.sh` usa las herramientas de Ubuntu (`aapt`, `dalvik-exchange`, `zipalign`, `apksigner`, `android-sdk-platform-23`).
El APK se firma con `android/debug.keystore`, que es solo para pruebas: para Google Play hay que crear una clave de subida propia y compilar un AAB.
