# ZNAKEX — demo jugable

Primera demo del juego: HTML5 + Canvas, empaquetada como APK de Android (WebView), sin dependencias externas y funciona sin conexión.

## Probar

- **Android:** instala `releases/ZNAKEX-tester-0.3.2.apk` (todo desbloqueado: 16 mapas × 3 dificultades, 160 niveles por dificultad, 30 skins, 999.999 monedas) o `releases/ZNAKEX-0.3.2.apk` (progresión normal).
  Hay que permitir "instalar apps de origen desconocido". Los dos APK pueden convivir en el móvil.
- **Navegador:** sirve la carpeta `demo/` con cualquier servidor estático (`npx http-server demo`) y abre `index.html`.
  Añade `?tester=1` a la URL para el modo tester.

Controles (Ajustes): deslizar, flechas en pantalla, palanca flotante (aparece donde tocas) o toques izquierda/derecha (giro relativo). En PC: flechas / WASD, `Esc` para pausa.

## Qué incluye

- Modos: Historia con 3 dificultades (Fácil / Normal / Difícil, progreso y recompensas independientes; 16 mapas × 10 niveles; cada mapa con sus propios suelos, muros, terreno peligroso, partículas ambientales y colores extraídos de su ficha; el nivel 10 es el Guardián). Objetivos de 8 a 31 orbes según dificultad y nivel, velocidad moderada, y tableros diseñados con formaciones simétricas, pasillos de al menos 2 casillas y puentes anchos, Clásico, Orbes Frenéticos (60 s, sin muros) y Duelo contra bot (3 dificultades).
- Orbe rojo (+1) y dorado (+3 y velocidad x2), combos, lengua, mordisco, bulto al tragar, engorde progresivo y estela propia de cada skin.
- Al empezar cada partida, los obstáculos, el agua, la lava y los pinchos parpadean en rojo 5 s con el aviso «Evita los obstáculos». El tablero va pegado a la parte alta y las flechas quedan centradas bajo el mapa.
- Muerte con revivir (anuncio simulado o 100 / 200 monedas), pausa, victoria, resultados y récords.
- 30 skins dibujadas con la cabeza, el cuerpo y la cola reales de cada ficha: las 20 especiales de `SKINS/` y la básica en 10 colores (250–500 monedas). Ruleta diaria, tienda de monedas (compras simuladas), ajustes.
- Cada mapa tiene mecánicas propias: agua, lava, arenas movedizas, hielo, portales, según su ficha.
- Progresión: cada nivel se desbloquea al superar el anterior y cada mapa al completar el anterior (el modo tester lo abre todo).

Aún no: sonido y música, anuncios reales (AdMob), compras reales (Play Billing), guardado en la nube.

## Estructura

| Ruta | Contenido |
| --- | --- |
| `index.html`, `css/`, `js/` | El juego (`js/game.js` reglas, `js/snakedraw.js` dibujo de la serpiente con los sprites de cada ficha, `js/input.js` controles, `js/ui.js` pantallas) |
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
