# ZNAKEX — Identidad visual v2 (logo nuevo): prompts de pantallas, icono de la tienda e iconos

Se mantienen: las tipografías (Bebas Neue, Barlow), los sonidos, los mapas y la pantalla de niveles.
Cambian: los fondos de carga, inicio, menú principal y biblioteca de skins, el icono de Google Play y los iconos de la interfaz.

## Reglas para todo

1. **Fondos y logo van por separado.** Ningún fondo lleva logo ni texto. El logo lo coloca el juego por código, siempre dentro de la zona segura y escalado a cada pantalla, así nunca se corta.
2. **Tamaño de los fondos: 1080 × 2400 (20:9)**, que cubre también los móviles alargados. Lo importante va en la **zona segura central de 1080 × 1920**. Las franjas de arriba y abajo (240 px cada una) son relleno que se puede recortar: cielo, suelo, hojas…
3. **Hueco para el logo:** el tercio superior de cada fondo debe quedar tranquilo (sin la serpiente ni objetos importantes) y algo más oscuro, para que el logo se lea encima.
4. **Hueco para los botones:** el cuarto inferior también tranquilo, porque ahí van JUGAR y la barra de navegación.
5. Sin texto, sin logos, sin botones, sin interfaz y sin marca de agua en los fondos.

## Paleta del logo (úsala en todos los prompts)

| Uso | Color |
| --- | --- |
| Verde oscuro (fondo y contorno) | `#0B2A18` |
| Verde bosque (cuerpo) | `#0F5A2A` |
| Verde marca | `#00A04A` |
| Lima (acento, la "X" y los brillos) | `#B8FF1A` |
| Lima suave (contornos claros) | `#A8F25A` |
| Amarillo lima (centro del degradado) | `#D6E021` |
| Verde azulado (final del degradado) | `#2BB574` |

Bloque de estilo que se pega al final de cada prompt:

```text
STYLE LOCK: bold modern esports-mascot art direction matching the attached ZNAKEX logo: thick clean dark-green outlines (#0B2A18), cel-shaded forms, glossy highlights, palette of deep forest greens (#0B2A18, #0F5A2A, #00A04A) with electric lime accents (#B8FF1A, #A8F25A) and a green-to-yellow-lime-to-teal gradient glow (#00A04A → #D6E021 → #2BB574). High contrast, crisp, readable on a phone. Jungle-temple world (mossy stone, runes, orbs), but more stylized and energetic than realistic. NO text, NO letters, NO logo, NO watermark, NO UI.
```

Adjunta siempre el logo como referencia de estilo ("style reference only, do not draw the logo").

---

## 1 · Logo por separado (lo exporta el diseñador)

Exporta desde tu archivo, en PNG con transparencia, y súbelos a `demo/assets/ui/brand/`:

| Archivo | Versión | Uso en el juego |
| --- | --- | --- |
| `logo_full.png` (≥ 1200 px de ancho) | Serpiente + escudo "ZNAKEX" (tu versión "copia 14") | Pantalla de inicio y de carga |
| `logo_wide.png` (≥ 1200 px de ancho) | Escudo horizontal (tu versión "copia 17 / 14" de abajo) | Menú principal y créditos |
| `logo_mark.png` (≥ 1024 px) | Solo la serpiente-Z, sin escudo ni texto | Icono de la tienda y pantallas pequeñas |
| `studio_logo.png` | Logo de GPUnlock | Intro y créditos |

Los márgenes transparentes, justos (el juego ya añade espacio).

---

## 2 · Icono de Google Play (512 × 512)

Usa **solo el símbolo** (la serpiente-Z) sin la palabra ZNAKEX: a 48 px el texto no se lee.

```text
Mobile game app icon, square 1:1, 1024x1024, full-bleed background, no transparency, no rounded corners. Use the attached ZNAKEX snake-Z emblem as the central subject, redrawn big and bold: the dark-green snake forming a Z with glowing white eyes, lime outline, filling about 70% of the canvas and fully inside the central safe circle (66% of the canvas). BACKGROUND: deep forest green #0B2A18 with a soft radial glow behind the snake using the green-to-yellow-lime-to-teal gradient (#00A04A → #D6E021 → #2BB574), a few small glowing lime orbs and subtle rune patterns fading into the corners. Strong silhouette, readable at 48x48 px.
[STYLE LOCK]
```

Guarda el resultado como `store/icon_512.png` (redúcelo desde 1024).

**Gráfico destacado (1024 × 500):**

```text
Google Play feature graphic background, 1024x500, wide. Right 55%: the dark-green snake with lime outline and glowing white eyes (matching the attached logo mascot) coiling through a stylized jungle temple, chasing a glowing lime orb, with the gradient glow (#00A04A → #D6E021 → #2BB574) behind it. Left 45%: calm dark-green area (#0B2A18 with a soft glow) left EMPTY for the logo, which is added later. Keep everything important 5% away from the edges.
[STYLE LOCK]
```

El logo lo coloco yo encima de este fondo.

---

## 3 · Pantalla de inicio (la de "TOCA PARA JUGAR")

```text
Vertical mobile game title-screen background, 1080x2400 (20:9). The ZNAKEX snake mascot (dark forest-green scales, lime outline, glowing white eyes, matching the attached logo) coils around a huge ancient stone pillar in a jungle temple at dusk, its head raised in the middle of the image looking toward the viewer, lime light glowing from carved runes on the pillar, glowing orbs floating around, vines and leaves in the foreground. COMPOSITION: the top third is calm dark canopy with a soft lime glow (empty space for the logo, which is added later); the snake head sits around 45-55% of the height; the bottom quarter is dark mossy ground (space for "tap to play"). Important content only inside the central 1080x1920 area; the top and bottom 240 px are just extra canopy and ground.
[STYLE LOCK]
```

Nombre: `Pantallas/v2/inicio.png`

## 4 · Pantalla de carga

```text
Vertical mobile game loading-screen background, 1080x2400 (20:9), a different scene from the title screen: an underground snake temple at night, a circular stone altar with a giant carved snake-Z sigil glowing lime on the floor, a single glowing lime orb floating above the altar lighting the chamber, the mascot snake's silhouette coiled in the shadows behind with only its white eyes glowing, roots and moss hanging from cracked pillars, drifting lime particles. COMPOSITION: top third calm and dark (logo added later); the altar and orb in the middle band; bottom quarter dark and plain (loading bar and tips). Important content only inside the central 1080x1920 area.
[STYLE LOCK]
```

Nombre: `Pantallas/v2/carga.png`

## 5 · Menú principal

```text
Vertical mobile game main-menu background, 1080x2400 (20:9). A bright, inviting jungle-temple clearing in daylight: mossy stone platform with carved rune tiles in the center, ancient ruins and giant leaves framing the sides, god rays through the canopy tinted with the lime-to-teal gradient, a few glowing orbs (lime and red) resting on the platform. The mascot snake (dark green, lime outline, white glowing eyes) rests coiled on the left side of the platform, relaxed and friendly, head turned toward the center. COMPOSITION: top 30% open canopy and light (space for the logo, added later); middle band the platform and the snake; bottom 27% calm grass and stone (buttons and navigation bar go there). Keep the snake and orbs away from the left and right 6% margins.
[STYLE LOCK]
```

Nombre: `Pantallas/v2/menu.png`

**Vídeo del menú (imagen a vídeo en Magnific, 6–8 s, en bucle, sin sonido):**

```text
Seamless looping animation of this exact image with a locked camera (no zoom, no pan, no cut). The snake breathes slowly and flicks its tongue once; the glowing orbs pulse and bob gently; god rays shimmer; leaves sway in a light breeze; lime particles drift upward. Keep every element, color and the composition exactly the same; nothing new appears; the last frame matches the first. No text, no logo.
```

Nombre: `Pantallas/v2/menu.mp4`

## 6 · Biblioteca de skins (fondo)

La biblioteca muestra encima la serpiente animada, la cuadrícula de portadas y los botones. El fondo tiene que ser sobrio para no competir con los marcos de colores.

```text
Vertical mobile game background for a skins collection screen, 1080x2400 (20:9). The inside of an ancient snake-temple treasure vault: dark forest-green stone walls with rows of carved empty niches, soft lime glow lines along the rune carvings, faint gold dust in the air, a subtle vignette. Very low detail in the center so cards and text can sit on top; slightly more detail at the top and bottom edges. No characters, no snake, no objects in the center.
[STYLE LOCK]
```

Nombre: `Pantallas/v2/skins.png`

---

## 7 · Iconos de la interfaz (en hojas, fondo magenta)

Las hojas van sobre **magenta `#FF00FF`** (así el verde de la marca no se pierde al recortar). Cada icono en su celda, con 80 px de separación, y todos con el mismo grosor de contorno. Los recorto y los pongo en el juego con los mismos nombres de ahora.

Plantilla para cada hoja:

```text
Game UI icon sheet, 2048x2048, a clean grid of [N] separate icons, each about 360x360 px, separated by at least 80 px of flat pure magenta #FF00FF background (no gradient, no shadow on the background, no magenta inside the icons). Each icon: a rounded-square dark-green badge (#0B2A18 to #0F5A2A) with a thick lime outline (#A8F25A) and a bold white or lime symbol in the center, glossy highlight on top, consistent line weight across all icons, readable at 48 px. ICONS, left to right, top to bottom: [LIST]. NO text, NO letters, NO numbers.
[STYLE LOCK]
```

Sustituye `[N]` y `[LIST]` por cada hoja:

1. **Navegación (5):** `open book (modes), folded map with pin (maps), temple house (home), snake scale shirt (skins), gear (settings)`
2. **Modos (6):** `snake coiled in a square (classic), snake head with a book (story), lightning with golden orb (frenzy), two crossed snake heads (duel), trophy podium (leaderboard), prize wheel (spin)`
3. **Acciones (10):** `back arrow, close X, check mark, pause, play triangle, retry circular arrow, door exit (quit), padlock, shopping bag (shop), stacked level steps (levels)`
4. **Economía y recompensas (10):** `single gold coin, stack of gold coins, video camera (ad), x2 badge, x3 badge, closed treasure chest, open treasure chest, gift, flame (streak), calendar`
5. **Logros y progreso (10):** `gold star, empty star outline, gold medal, silver medal, bronze medal, locked medal, rosette, daily scroll, weekly scroll, snake head`
6. **Orbes (2):** `glossy red orb, glossy golden orb` (estos sin placa: solo el orbe, redondo y brillante).

Nombre de cada hoja: `Pantallas/v2/iconos_1.png` … `iconos_6.png`.

Los iconos de peligros de los mapas (`hz_*`) no cambian, porque los mapas se mantienen.
