# ZNAKEX — demo jugable

Primera demo del juego: HTML5 + Canvas, empaquetada como APK de Android (WebView), sin dependencias externas y funciona sin conexión.

## Probar

- **Android:** instala `releases/ZNAKEX-tester-0.6.1.apk` (todo desbloqueado: 16 mapas × 3 dificultades, 160 niveles por dificultad, 64 skins, 999.999 monedas) o `releases/ZNAKEX-0.6.1.apk` (progresión normal).
  Hay que permitir "instalar apps de origen desconocido". Los dos APK pueden convivir en el móvil.
- **Navegador:** sirve la carpeta `demo/` con cualquier servidor estático (`npx http-server demo`) y abre `index.html`.
  Añade `?tester=1` a la URL para el modo tester.

Controles (Ajustes): deslizar, flechas en pantalla, palanca flotante (aparece donde tocas) o toques izquierda/derecha (giro relativo). En PC: flechas / WASD, `Esc` para pausa.

## Qué incluye

- Modos: Historia con 3 dificultades (Fácil / Normal / Difícil, progreso y recompensas independientes; 16 mapas × 10 niveles; cada mapa con sus propios suelos, muros, terreno peligroso, partículas ambientales y colores extraídos de su ficha; el nivel 10 es el Guardián). Objetivos de 8 a 31 orbes según dificultad y nivel, velocidad moderada, y tableros diseñados con formaciones simétricas, pasillos de al menos 2 casillas y puentes anchos, Clásico, Orbes Frenéticos (60 s, sin muros) y Duelo contra bot (3 dificultades).
- Orbe rojo (+1) y dorado (+3 y velocidad x2), combos, lengua, mordisco, bulto al tragar, engorde progresivo y estela propia de cada skin.
- Al empezar cada partida, los obstáculos, el agua, la lava y los pinchos parpadean en rojo 5 s con el aviso «Evita los obstáculos». El tablero va pegado a la parte alta y las flechas quedan centradas bajo el mapa.
- **Nuevo en 0.4:** tutorial guiado (nivel 0), estrellas 1-3 por nivel (objetivo, sin morir, rápido), resumen al morir con pista, objetos especiales (campo de fuerza x2 golpes del color de la skin, imán 8 s, portal de regreso 8 s, estrella dorada rara con velocidad x2 e invencibilidad), cambio de mapa en los niveles 5 y 10 (obstáculos se mueven, inmunidad 3 s con brillo blanco), misiones diarias/semanales, racha de 7 días, temporada mensual (mapa de 20 niveles, pase con skins y monedas), rarezas (Normal, Especial, Mítico, Legendario), vista previa de skins sobre tablero de prueba, logros y estadísticas, anuncios «x2 monedas» y «+1 moneda», modo daltónico, gráficos bajos (automático si el móvil va lento) y código de guardado.
- **Nuevo en 0.5:** brillo del terreno (agua, lava, ácido) según su color; brillo del color del orbe que recorre la serpiente de la cabeza a la cola (sin engordar); capa dorada translúcida con la velocidad x2; ajustes dentro de la pausa; primera aparición de cada objeto con pausa y explicación; barras de tiempo con icono; textos en las placas del kit de banners; el módulo especial es siempre el bloque 2; motor de audio (30 efectos y una música por modo, que se acelera con el orbe dorado) listo para los archivos de `assets/audio/`.
- **Nuevo en 0.6:** colección nueva de 64 skins (las 49 de `skins finales/`, las 5 de temporada y la básica en 10 colores); las skins antiguas se han eliminado. Estructura por casillas en todas: al empezar cabeza (1) + módulo especial (2) + cola (1); al crecer se añaden los módulos A, B y C en ciclo entre el especial y la cola. Cada pieza conserva sus proporciones reales (los módulos A/B/C se escalan al grosor real del cuerpo y las curvas se generan doblando el propio módulo de cada skin). Portadas 1:1 (512 px), marco por calidad (Normal, Especial, Mítico, Legendario, Temporada) y pestañas de categoría en la galería. Pase de temporada: Maíz y Farol en la vía gratuita; Espantapájaros, Bruja y Calabaza en la de pago.
- Muerte con revivir (anuncio simulado o 100 / 200 monedas), pausa, victoria, resultados y récords.
- 64 skins dibujadas con las piezas reales de cada ficha (cabeza, lengua, módulos A/B/C, módulo especial y cola; se regeneran con `tools/build_v6.py` y los marcos con `tools/frames_v6.py`). Ruleta diaria, tienda de monedas (compras simuladas), ajustes.
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
