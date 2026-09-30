# ZNAKEX — Identidad visual v2: TODOS los prompts de recursos

Lista completa de lo que hay que generar para que todo el juego vaya acorde al logo nuevo.

**Se mantienen y no hace falta generarlos:** tipografías (Bebas Neue y Barlow), sonidos y música, los 16 mapas y el de temporada (tableros, suelos, muros y peligros, iconos `hz_*` incluidos), la pantalla de niveles con sus nodos, las 64 skins y los marcos de calidad.

Los marcados con ☆ son opcionales: el juego funciona sin ellos.

---

## 0 · Reglas y estilo común

### Reglas
1. **Fondos sin logo ni texto.** El logo lo coloca el juego por código dentro de la zona segura, así nunca se corta.
2. **Fondos a 1080 × 2400 (20:9).** Lo importante va dentro de la zona segura central de 1080 × 1920. Las franjas de 240 px de arriba y abajo son relleno que se puede recortar.
3. **Tercio superior tranquilo y algo más oscuro** (ahí va el logo). **Cuarto inferior tranquilo** (botones y barra de navegación).
4. **Piezas sueltas** (iconos, botones, paneles, placas) **sobre magenta plano `#FF00FF`**, separadas al menos 80 px y sin magenta dentro. Así las recorto limpias.
5. **Nada de texto dentro de los botones, placas y paneles.** El juego escribe el texto en los 5 idiomas.
6. Adjunta siempre el logo como referencia de estilo, con la frase: *"style reference only, do not draw the logo"*.

### Paleta del logo

| Uso | Color |
| --- | --- |
| Verde oscuro (fondos y contornos) | `#0B2A18` |
| Verde bosque | `#0F5A2A` |
| Verde marca | `#00A04A` |
| Lima (acento) | `#B8FF1A` |
| Lima suave (contornos claros) | `#A8F25A` |
| Amarillo lima (centro del degradado) | `#D6E021` |
| Verde azulado (final del degradado) | `#2BB574` |
| Oro (solo monedas, recompensas y rarezas) | `#E8B04A` |

### STYLE LOCK (pégalo al final de cada prompt)

```text
STYLE LOCK: bold modern esports-mascot art direction matching the attached ZNAKEX logo (style reference only, do not draw the logo): thick clean dark-green outlines (#0B2A18), cel-shaded forms, glossy highlights, deep forest greens (#0B2A18, #0F5A2A, #00A04A) with electric lime accents (#B8FF1A, #A8F25A) and a green-to-yellow-lime-to-teal gradient glow (#00A04A -> #D6E021 -> #2BB574); gold (#E8B04A) only for coins and rewards. Jungle-temple world (mossy stone, carved runes, glowing orbs), stylized and energetic. High contrast, crisp, readable on a phone. NO text, NO letters, NO numbers, NO logo, NO watermark.
```

### Plantilla para hojas de piezas sueltas (magenta)

```text
Game UI asset sheet, 2048x2048, [N] separate items arranged in a clean grid, each isolated with at least 80 px of flat pure magenta #FF00FF around it (uniform background, no gradient, no shadow on the background, no magenta or pink inside the items). Same outline weight, same lighting (top-left) and same scale family for every item. ITEMS, left to right, top to bottom: [LIST].
[STYLE LOCK]
```

---

## 1 · Logos (los exportas tú de tu archivo)

PNG con transparencia, márgenes justos, en `demo/assets/ui/brand/`:

| Archivo | Versión | Uso |
| --- | --- | --- |
| `logo_full.png` (≥ 1200 px de ancho) | Serpiente sobre el escudo "ZNAKEX" | Inicio y carga |
| `logo_wide.png` (≥ 1200 px de ancho) | Escudo horizontal | Menú principal y créditos |
| `logo_mark.png` (≥ 1024 px) | Solo la serpiente-Z | Icono, cabeceras pequeñas |
| `studio_logo.png` (≥ 1024 px) | Logo de GPUnlock | Intro y créditos |

El icono del lanzador de Android (el adaptativo, con sus dos capas) lo preparo yo a partir de `logo_mark.png`.

---

## 2 · Google Play

### 2.1 Icono (512 × 512) → `store/icon_512.png`

```text
Mobile game app icon, square 1:1, 1024x1024, full-bleed background, no transparency, no rounded corners. The attached ZNAKEX snake-Z emblem as the central subject, redrawn big and bold: the dark-green snake forming a Z, glowing white eyes, lime outline, filling about 70% of the canvas and fully inside the central safe circle (66% of the canvas). Background: deep forest green #0B2A18 with a soft radial glow behind the snake using the green-to-yellow-lime-to-teal gradient, a few small glowing lime orbs and faint rune patterns fading into the corners. Readable at 48x48 px.
[STYLE LOCK]
```

### 2.2 Gráfico destacado (1024 × 500) → `store/feature_1024x500.png`

```text
Google Play feature graphic background, 1024x500. Right 55%: the dark-green mascot snake (lime outline, glowing white eyes) coiling through a stylized jungle temple, chasing a glowing lime orb, gradient glow behind it. Left 45%: calm dark-green area (#0B2A18 with a soft glow) left EMPTY for the logo, which is added later. Everything important 5% away from the edges.
[STYLE LOCK]
```

### 2.3 ☆ Fondo para las capturas de la tienda (1080 × 1920) → `store/screenshot_bg.png`

Las capturas las hago yo del juego real. Este fondo sirve para enmarcarlas con una frase arriba.

```text
Vertical 1080x1920 promotional background for app-store screenshots: deep forest green #0B2A18 with a large soft radial glow of the green-to-yellow-lime-to-teal gradient behind the center, subtle carved rune patterns and a few glowing orbs near the edges, leaves framing the bottom corners. The center 70% is plain and calm (a phone screenshot will be placed there) and the top 18% is plain (a caption will be written there).
[STYLE LOCK]
```

---

## 3 · Fondos de pantalla (1080 × 2400)

### 3.1 Inicio ("toca para jugar") → `Pantallas/v2/inicio.png`

```text
Vertical mobile game title-screen background, 1080x2400 (20:9). The ZNAKEX mascot snake (dark forest-green scales, lime outline, glowing white eyes) coils around a huge ancient stone pillar in a jungle temple at dusk, head raised in the middle of the image looking at the viewer, lime light glowing from carved runes, glowing orbs floating around, vines and leaves in the foreground. Top third: calm dark canopy with a soft lime glow (empty for the logo). Snake head around 45-55% of the height. Bottom quarter: dark mossy ground. Important content only inside the central 1080x1920 area.
[STYLE LOCK]
```

### 3.2 Carga → `Pantallas/v2/carga.png`

```text
Vertical mobile game loading-screen background, 1080x2400 (20:9), a different scene from the title screen: an underground snake temple at night, a circular stone altar with a giant carved snake-Z sigil glowing lime on the floor, a single glowing lime orb floating above the altar lighting the chamber, the mascot snake's silhouette coiled in the shadows with only its white eyes glowing, roots and moss hanging from cracked pillars, drifting lime particles. Top third calm and dark (logo). Bottom quarter dark and plain (loading bar and tips). Important content only inside the central 1080x1920 area.
[STYLE LOCK]
```

### 3.3 Menú principal → `Pantallas/v2/menu.png`

```text
Vertical mobile game main-menu background, 1080x2400 (20:9). Bright jungle-temple clearing in daylight: mossy stone platform with carved rune tiles in the center, ruins and giant leaves framing the sides, god rays tinted with the lime-to-teal gradient, a few glowing orbs (lime and red) resting on the platform. The mascot snake rests coiled on the left side of the platform, friendly, head turned toward the center. Top 30% open canopy and light (logo). Bottom 27% calm grass and stone (buttons and navigation bar). Keep the snake and orbs away from the left and right 6% margins.
[STYLE LOCK]
```

**Vídeo del menú** (imagen a vídeo, 6–8 s, en bucle, sin sonido) → `Pantallas/v2/menu.mp4`

```text
Seamless looping animation of this exact image with a locked camera (no zoom, no pan, no cut). The snake breathes slowly and flicks its tongue once; the glowing orbs pulse and bob gently; god rays shimmer; leaves sway in a light breeze; lime particles drift upward. Keep every element, color and the composition exactly the same; nothing new appears; the last frame matches the first. No text, no logo.
```

### 3.4 Biblioteca de skins → `Pantallas/v2/skins.png`

```text
Vertical mobile game background for a skins collection screen, 1080x2400 (20:9). Inside an ancient snake-temple treasure vault: dark forest-green stone walls with rows of carved empty niches, soft lime glow lines along the rune carvings, faint gold dust in the air, subtle vignette. Very low detail in the center (cards and text go on top), slightly more detail at the top and bottom edges. No characters, no snake, no objects in the center.
[STYLE LOCK]
```

### 3.5 Fondo general de menús → `Pantallas/v2/interior.png`

Para Modos, Mapas, Misiones, Logros, Ajustes y Duelo. El juego lo difumina un poco para que los paneles se lean encima.

```text
Vertical mobile game background, 1080x2400 (20:9), for secondary menu screens: a calm jungle-temple corridor in soft shade, mossy stone walls with carved snake runes glowing faint lime, hanging vines, a few floating orbs far in the background, gentle lime-teal ambient light from above. Low contrast and low detail overall (panels and lists go on top), slightly darker toward the edges. No characters.
[STYLE LOCK]
```

### 3.6 Tienda → `Pantallas/v2/tienda.png`

```text
Vertical mobile game shop background, 1080x2400 (20:9): a temple treasure room with piles of gold coins and open chests on the far sides and in the lower corners, warm gold light (#E8B04A) mixed with the lime glow of carved runes, dark forest-green stone. The center is dark and calm (coin packs and prices go on top). No characters, no text.
[STYLE LOCK]
```

### 3.7 ☆ Temporada → `Pantallas/v2/temporada.png`

Solo si quieres que la temporada también cambie. Si no, se queda como está.

```text
Vertical mobile game background, 1080x2400 (20:9), for the "Harvest Moon Hollow" season screen: a jungle-temple clearing at night under a huge orange harvest moon, pumpkins and lanterns among the mossy ruins, orange light (#E87532) mixed with the brand lime glow on the runes, fireflies. Top third calm night sky (logo and season title go there), center plain enough for the level path, bottom quarter dark ground.
[STYLE LOCK]
```

---

## 4 · Tarjetas de los modos (vertical 480 × 720)

Una hoja con las tres, en tres columnas sobre magenta. O genéralas por separado, a 3:4.

```text
Three separate vertical game-mode card illustrations, each 3:4 (about 600x800), side by side on flat magenta #FF00FF with 80 px gaps, each one a full rectangular illustration (no frame, no text):
1) CLASSIC: the mascot snake sliding along a long grid-like temple courtyard, stretching toward a red orb, calm focus, green light.
2) FRENZY: the mascot snake speeding through a storm of glowing golden orbs, motion streaks, lime and gold energy, exciting.
3) DUEL: two snakes facing each other on a ritual stone arena, the mascot (green, lime outline) against a rival (dark red with orange eyes), tense, lit by torches and lime runes.
[STYLE LOCK]
```

Nombres: `Pantallas/v2/modo_clasico.png`, `modo_frenetico.png`, `modo_duelo.png`. El modo historia usa el arte de los mapas, así que no necesita tarjeta.

---

## 5 · Kit de interfaz (magenta, sin texto)

### 5.1 Paneles → `Pantallas/v2/kit_paneles.png`

El panel grande se estira al tamaño de cada ventana, así que sus bordes tienen que ser **uniformes** (los adornos solo en las esquinas) y el centro liso.

```text
[SHEET TEMPLATE] with N=6, LIST:
1) large window panel 900x600: dark forest-green translucent stone slab (#0B2A18 at 85% opacity feel), thick dark outline, thin lime inner rim light (#A8F25A), small carved snake-rune ornaments ONLY in the four corners, straight uniform edges, completely plain center;
2) item card 640x460: same style, smaller corner ornaments;
3) square slot 360x360: recessed dark socket with a lime inner rim;
4) title plate 880x270: horizontal stone plate with pointed ends and a lime rim, plain center for a title;
5) divider 420x80: thin horizontal ornament with a small snake-Z sigil in the middle, lime and dark green;
6) avatar ring 360x360: round stone frame with a lime rim and a plain hollow center.
```

### 5.2 Botones → `Pantallas/v2/kit_botones.png`

```text
[SHEET TEMPLATE] with N=6, LIST:
1) PRIMARY button 700x300: chunky rounded rectangle, lime gradient (#B8FF1A top to #00A04A bottom), thick dark-green outline, glossy top highlight, small darker bevel at the bottom, plain center;
2) PRIMARY PRESSED: same button 6 px lower, slightly darker, no bottom bevel;
3) SECONDARY button 700x300: dark forest-green stone with a lime rim, plain center;
4) REWARD button 700x300: gold (#E8B04A to #B87A1A) with a dark outline and a warm glossy highlight, plain center;
5) ROUND icon button 300x300: dark green disc with a lime rim and a glossy top, empty center;
6) SMALL pill button 520x170: dark green with a lime rim, plain center.
```

### 5.3 Placas de aviso (900 × 110) → `Pantallas/v2/kit_placas.png`

Los carteles que salen durante la partida ("¡VELOCIDAD x2!", "EVITA LOS OBSTÁCULOS"…). Los extremos pueden llevar adornos, pero el centro tiene que quedar liso y ancho para el texto.

```text
[SHEET TEMPLATE] with N=5, LIST (each a long horizontal banner 1800x220 with pointed or scrolled ends, ornaments only at the ends, wide plain center):
1) DANGER: dark red stone with an orange-red rim;
2) BRAND: dark green with a lime rim;
3) REWARD: gold with warm highlights;
4) INFO: deep teal (#1F6A5A) with a light aqua rim;
5) SPECIAL: deep purple (#3A2352) with a lilac rim.
```

### 5.4 ☆ Esquinas decorativas → `Pantallas/v2/kit_esquinas.png`

```text
[SHEET TEMPLATE] with N=4, LIST: four matching corner ornaments 300x300 (top-left, top-right, bottom-left, bottom-right orientation), carved dark-green stone with a curling vine and a small lime-glowing rune, each filling one corner of its square and fading to transparent-looking magenta toward the opposite corner.
```

---

## 6 · Iconos (hojas de 12, sobre magenta)

Mismo estilo para todos: placa redondeada verde oscuro (`#0B2A18` → `#0F5A2A`) con contorno lima (`#A8F25A`) y un símbolo blanco o lima en el centro. Las excepciones (orbes, monedas, estrellas, medallas y cofres) van sin placa.

```text
Game UI icon sheet, 2048x2048, a 4x3 grid of 12 separate icons, each about 380x380 px, separated by at least 80 px of flat pure magenta #FF00FF (no magenta inside the icons). Default icon style: a rounded-square dark-green badge (#0B2A18 to #0F5A2A) with a thick lime outline (#A8F25A) and a bold white or lime symbol in the center, glossy highlight on top, identical line weight in all icons, readable at 48 px. ICONS in order: [LIST].
[STYLE LOCK]
```

Sustituye `[LIST]` por cada hoja. Entre paréntesis va el nombre de archivo del juego, para que yo sepa dónde va cada uno; no hace falta que lo leas el generador.

1. **Navegación y modos** → `iconos_1.png`: `open book (modes), folded map with a pin (maps), temple house (home), snake-scale shirt (skins), gear (settings), shopping bag (shop), snake head over an open book (mode_story), snake coiled in a square (mode_classic), lightning bolt with a golden orb (mode_frenzy), two snake heads facing each other (mode_duel), trophy on a podium (mode_leaderboard), prize wheel (mode_spin)`
2. **Acciones** → `iconos_2.png`: `left arrow (back), X cross (close), check mark (check), pause bars (pause), play triangle (play), circular arrow (retry), door with an exit arrow (quit), padlock (lock), stacked steps (levels), two circular arrows (refresh), video camera (ad), play button inside a film frame (video)`
3. **Economía** (sin placa: objetos sueltos) → `iconos_3.png`: `single gold coin with a snake-Z emblem (coin), small stack of gold coins (coins), big pile of gold coins (coins_a), gold coin with a small plus sign (plus1), "x2" multiplier badge in lime (x2), "x3" multiplier badge in gold (x3), closed treasure chest (chest_closed), open treasure chest glowing (chest_open), gift box in a slot (slot_gift), locked slot with a padlock (slot_locked), "collected" round stamp with a check (collected), wax seal with the snake-Z (wax_seal)`
4. **Progreso y logros** (sin placa) → `iconos_4.png`: `gold star (star_gold), empty star outline (star_empty), glowing gold star with rays (star_glow), star bursting with sparkles (star_pop), gold medal (medal_gold), silver medal (medal_silver), bronze medal (medal_bronze), grey locked medal (medal_locked), rosette ribbon (rosette), rolled daily scroll with a lime ribbon (scroll_daily), rolled weekly scroll with a gold ribbon (scroll_weekly), calendar page (calendar)`
5. **Ajustes y varios** → `iconos_5.png`: `flame (flame), ascending bars (bars), light bulb (bulb), cloud with an up arrow (cloud), eye (eye), feather (feather), gamepad (gamepad), joystick (joystick), directional pad (dpad), phone vibrating (vibration), snake head (snake), map scroll (map)`
6. **Gestos y orbes** → `iconos_6.png`: `hand swiping with an arrow (swipe), hand swiping in the other direction (swipe2), finger tapping (tap), tap ripple ring (tap_ring), two little people with a flame (streak_people), glossy red orb without a badge (orb_red), glossy golden orb without a badge (orb_gold), glossy lime orb without a badge (orb), checkbox with a check (check_box), "x2" coin badge (x2 kit), and two empty spare slots`

---

## 7 · ☆ Objetos especiales (dentro de la partida)

Ahora son dorados y azules. Si quieres que sigan la marca, genera estas dos hojas. Si no, se quedan como están.

### 7.1 Objetos e iconos del marcador → `Pantallas/v2/objetos.png`

```text
[SHEET TEMPLATE] with N=7, LIST (each 400x400, glossy, readable at 40 px, NO badge behind them):
1) force-field item: a glowing hexagonal shield crystal, lime and white (shield);
2) magnet item: a horseshoe magnet with lime-tipped poles (magnet);
3) return-portal item: a swirling teal-lime ring portal (portal);
4) golden star item: a chunky five-point gold star with a lime inner glow (star);
5) small flat HUD icon of the magnet (hud_magnet);
6) small flat HUD icon of the portal (hud_portal);
7) small flat HUD icon of the star (hud_star).
```

### 7.2 Efectos de los objetos → `Pantallas/v2/objetos_fx.png`

```text
[SHEET TEMPLATE] with N=12, LIST (each 400x400, as solid shapes with soft glowy edges, no background glow spilling beyond each cell): shield bubble (round translucent lime-white sphere), shield crack stage 1, shield crack stage 2, shield shards flying out, magnet pull ring (dotted lime ring), portal glow disc, portal vortex spiral, burst of gold particles, burst of lime particles, burst of white particles, star pop flash, star speed streak.
```

---

## 8 · Orden recomendado

1. Logos (sección 1): con ellos ya monto la intro, el inicio y el menú.
2. Icono y gráfico destacado (sección 2).
3. Fondos 3.1 a 3.6.
4. Kit de botones y paneles (5.1 y 5.2): es lo que más cambia el aspecto de la interfaz.
5. Iconos (sección 6).
6. Placas, tarjetas de modos y opcionales.

Súbelo todo a `Pantallas/v2/` (y a `store/` lo de la tienda). Yo lo recorto, lo integro y ajusto los colores de la interfaz (interruptores, barras, pestañas y texto dorado) al lima de la marca.
