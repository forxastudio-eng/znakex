# ZNAKEX — demo jugable

Primera demo del juego: HTML5 + Canvas, empaquetada como APK de Android (WebView), sin dependencias externas y funciona sin conexión.

## Probar

- **Android:** instala `releases/ZNAKEX-tester-1.2.1.apk` (todo desbloqueado: 16 mapas × 3 dificultades, 160 niveles por dificultad, 64 skins, 999.999 monedas) o `releases/ZNAKEX-1.2.1.apk` (progresión normal).
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
- **Nuevo en 0.7:** el juego en 5 idiomas (español, inglés, portugués de Brasil, indonesio y ruso), elegidos por los mercados más grandes de Google Play. Detecta el idioma del móvil y se puede cambiar en Ajustes → Idioma. El español es el texto base (`js/i18n.js`) y cada idioma tiene su diccionario en `js/lang/`. El ruso usa Oswald y Roboto Condensed solo para los caracteres cirílicos, con el mismo estilo. En la galería cada tarjeta muestra el nombre corto de la skin en inglés (igual en todos los idiomas) y el candado si está bloqueada.
- **Nuevo en 0.8:** sonido completo: 30 efectos (Magnific, ElevenLabs Sound Effects) y 6 temas de música, uno por modo, en `assets/audio/` (OGG; se regeneran con `tools/build_audio.py`, que recorta silencios, iguala volúmenes y hace los bucles continuos). La estrella dorada ya no hace desaparecer la serpiente: brillo dorado suave con chispas. Morir en agua, lava o ácido tiene su animación: la cabeza se hunde, salpica, salen ondas y burbujas (chispas y humo en la lava).
- **Nuevo en 0.9:** animación de GPUnlock al arrancar (2,5 s, se salta tocando; usa `assets/ui/studio_logo.png` cuando exista) y créditos en Ajustes. Deslizadores de volumen para música y efectos (en Ajustes y en la pausa). Arreglo: salir de una partida del mapa de temporada ya no deja la pantalla trabada. Prompts de icono, gráfico destacado, pantalla de carga, menú y vídeo en `ZNAKEX_Prompts_Tienda_y_Pantallas.md`.
- **Nuevo en 1.0 (identidad de marca):** todo el juego con la identidad nueva (reparto 60/30/10: piedra carbón y marfil, arte de jungla-templo, lima de marca solo en el botón JUGAR y en lo seleccionado, oro para monedas y recompensas). Logo ZNAKEX en la carga, la pantalla de inicio y el menú; fondos propios para carga, inicio, menú, skins, tienda, temporada y el resto de menús; vídeos en bucle en el inicio y en el menú (se apagan en gráficos bajos). Kit nuevo de paneles, botones, placas e iconos (marfil sin verde). Objetos y efectos nuevos: rayos de luz, estallidos, esquirlas de piedra, estela de la estrella, anillo del imán girando, pausa breve en los impactos y fuegos artificiales al superar un nivel. Intro con el vídeo de GPUnlock y su logo en los créditos. Icono de la app y gráfico destacado de Google Play en `store/`. Recursos en `assets/brand/`, generados desde `Pantallas/v2/` y `gpunlock/` con `tools/build_brand.py`. Se han borrado los recursos de la identidad anterior y las portadas de las skins pasan a WebP (5,5 → 3,6 MB).
- **Nuevo en 1.0.2:** vuelven los vídeos originales tal cual se entregaron (intro de GPUnlock, inicio y menú; sin recortes ni recodificación). La intro es solo el vídeo de GPUnlock, sin animaciones añadidas. Arreglo en la app Android: los MP4 se sirven con su tipo `video/mp4` y con peticiones por rangos (206), y van sin comprimir dentro del APK, que es lo que necesita el reproductor de vídeo del WebView para cargar y repetir en bucle. Los vídeos se reanudan al volver a la app.
- **Nuevo en 1.1 (versión candidata a publicar):** vídeos de fondo con un único reproductor reutilizado (antes se creaba uno nuevo cada vez y Android se quedaba sin decodificadores), vigilante que los reanuda y reanudación al volver a la app. Un solo objeto especial a la vez (no aparece ni se puede coger otro mientras uno está activo), explicado en el tutorial, en la presentación de cada objeto y en los consejos. Cada orbe dorado cuenta 3 para el objetivo del nivel y del duelo. Monedas en todos los mapas: pocas (una cada 11-17 s), duran 5,5 s, giran y parpadean cada vez más rápido antes de desaparecer; se suman al momento y salen en el resumen. Cada 10 s los obstáculos parpadean una vez en rojo y el agua, la lava y el ácido en naranja (el aviso inicial usa los mismos colores). Música del menú desde la pantalla de carga; sonido «¡ya!» al tocar para jugar y en los botones que empiezan partida. Botones y placas ajustan el texto para que quepa en todos los idiomas.
- **Nuevo en 1.2:**
  - **Segundo plano:** al salir de la app se paran la música, los vídeos y los temporizadores.
  - **Avisos fuera del mapa:** durante la partida salen en la franja de debajo del tablero, de uno en uno; el combo va junto a los puntos.
  - **Música por progreso:** 3 velocidades por partida (al llegar a un tercio y a dos tercios del objetivo, de los 60 s en Frenético o cada 10 orbes en Clásico).
  - **Al perder:** la música va más lenta, más grave y más baja.
  - **Anuncios:** uno corto cada 10 partidas, siempre entre partidas; ver uno con recompensa reinicia la cuenta. Puente `window.ZnakexAds` listo para AdMob (`js/ads.js`).
  - **Avisos para volver a jugar** (opcionales, `js/notify.js` y `Reminder.java`): se ofrecen tras 3 partidas, como mucho uno al día por la tarde y solo si no has jugado; se paran tras 3 sin respuesta; interruptor en Ajustes.
  - **Permisos:** solo vibración y notificaciones.
- **Nuevo en 1.2.1:** al superar un nivel (o ganar un duelo o terminar Frenético), la música del nivel acelera en rampa y se apaga, suena la fanfarria y la pantalla de «superado» pone la música del menú hasta que sigues al siguiente nivel o sales.
- Muerte con revivir (anuncio simulado o 100 / 200 monedas), pausa, victoria, resultados y récords.
- 64 skins dibujadas con las piezas reales de cada ficha (cabeza, lengua, módulos A/B/C, módulo especial y cola; se regeneran con `tools/build_v6.py` y los marcos con `tools/frames_v6.py`). Ruleta diaria, tienda de monedas (compras simuladas), ajustes.
- Cada mapa tiene mecánicas propias: agua, lava, arenas movedizas, hielo, portales, según su ficha.
- Progresión: cada nivel se desbloquea al superar el anterior y cada mapa al completar el anterior (el modo tester lo abre todo).

Aún no: anuncios reales (AdMob), compras reales (Play Billing), guardado en la nube.

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
python3 demo/tools/build_brand.py       # identidad v1.0 (requiere Pillow, numpy y scipy)
python3 demo/tools/build_v6.py          # skins
demo/android/build_apk.sh tester        # o: release
```

`build_apk.sh` usa las herramientas de Ubuntu (`aapt`, `dalvik-exchange`, `zipalign`, `apksigner`, `android-sdk-platform-23`).
El APK se firma con `android/debug.keystore`, que es solo para pruebas: para Google Play hay que crear una clave de subida propia y compilar un AAB.
