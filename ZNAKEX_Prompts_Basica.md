# ZNAKEX — Serpiente básica (1 modelo base + 10 colores)

La serpiente básica es la que tienen todos los jugadores, así que tiene que ser **muy bonita y muy legible**: brillante, redondeada, simpática, con un brillo suave y un detalle cuidado, pero con pocos colores para que se distinga bien en el tablero.

Flujo: 1) generas el **modelo base** con el prompt A; 2) me lo pasas (o lo dejas en `SKINS/basica_base.png`); 3) generas las **10 variantes** con el prompt B, una por color, adjuntando el modelo base; 4) las subes a `SKINS/basicas/NN_color.png` y yo las recorto.

---

## A · Modelo base (en verde hoja)

Como la serpiente es verde, el **fondo de recorte es magenta `#FF00FF`** y la serpiente no lleva nada de magenta.

```text
Create a GAME-READY SNAKE SKIN SPRITE SHEET for the mobile game "ZNAKEX", landscape 3:2 (2528x1696): the STARTER SNAKE that every player owns, designed to look adorable, glossy and beautiful while staying very readable on a small phone screen.

BACKGROUND: perfectly flat, uniform chroma-key magenta #FF00FF across the entire image. No gradient, no vignette, no texture, no floor shadow, no glow spilling onto the background. The snake must NOT contain magenta, pink-magenta or purple-magenta. Every element is separated from the others by at least 80 px of pure magenta so it can be cut out cleanly.

STYLE: polished 2D mobile-game illustration, painterly cel-shading with smooth soft gradients, one consistent dark outline (about 6 px, same weight on every piece, slightly warm dark green instead of pure black), a soft glossy highlight streak along the back of every piece, gentle rim light from the top-left, a lighter belly-toned edge on both sides of the body. Friendly, rounded, slightly chubby proportions. NO text, NO labels, NO numbers, NO watermark, NO frames, NO borders, NO UI, NO color swatches.

THE SNAKE: leaf-green base #86AE5E with a darker green #4E6E34 for scale edges and shading and a light lime highlight #D8E88A. Small rounded scales arranged in a clean diamond pattern, each scale with a subtle lighter center; a row of soft cream-lime diamonds down the back (#EAF3B0); big warm amber eyes #F2B84B with a dark vertical pupil and two white catch-lights; tiny nostrils; a small rosy-red forked tongue #C7354A. Cute but elegant, NOT scary, NOT realistic.

CAMERA RULE (every piece EXCEPT the cover): directly ABOVE, a pure TOP-DOWN BIRD'S-EYE view (dorsal view). We only see the TOP of the head and the back of the body. NEVER a front view, face-on portrait, side profile, 3/4 or perspective view for these pieces. The snout points straight UP; the two eyes sit on the left and right of the skull, seen from above.

LAYOUT (exact, so the pieces can be cut automatically):
ROW 1, left: (1) LIBRARY COVER – THE ONLY IMPACTFUL PIECE, and it is NOT top-down: one square 1:1 illustration (about 640x640), a charming HERO portrait of the snake, head raised and looking toward the viewer in a friendly 3/4 view, big shiny eyes, a happy little smile, the body coiling in a neat spiral behind it, strong glossy highlights, cinematic soft rim light, a few tiny sparkles. Centered with generous padding. ABSOLUTELY NO FRAME, NO BORDER, NO CARD, NO ROUNDED PANEL, NO BADGE, NO RARITY LABEL, NO TEXT: only the snake and its sparkles directly on the magenta background, with clean edges.
ROW 1, right: (2) SKIN EFFECTS – a tidy 4x2 grid of 8 small isolated effect sprites: 3 small leaf shapes, 2 sparkle stars, 1 small dot cluster, 1 small ring, 1 eye-glow flare; each about 110 px, solid opaque shapes in the snake's palette (no soft glows).
ROW 2, left: (3) HEAD – ONE single head in strict TOP-DOWN DORSAL VIEW: rounded, slightly wide head, snout pointing straight UP, two big eyes on the left and right of the skull, small nostrils, mouth CLOSED, perfectly symmetrical, about 300 px wide, a soft diamond marking on the forehead. NOT a front view, NOT a side profile, NOT 3/4. No neck or body attached. Next to it (3b) the forked TONGUE alone, pointing up, about 40 px wide.
ROW 3: (4) BODY MODULES – three different body modules A, B and C side by side, all EXACTLY the same height (about 250 px) and about 290 px wide, lying horizontally, with straight flat left and right edges so they chain seamlessly; A, B and C share the palette but the cream diamonds are arranged slightly differently in each.
ROW 4, left to right: (5) SPECIAL MODULE – same size, horizontal, a little more decorated: a bigger glossy cream diamond flanked by two tiny leaves; (6) REPEATING MODULE – a plain, calm, seamlessly repeatable module of the same size with the diamond row (used for the whole rest of the body); (7) TAIL – tapering rounded tail tip pointing RIGHT, same height at its base as the body modules, about 460 px long, ending in a small darker tip.

CONSISTENCY: identical scale, outline and light for all pieces; body thickness equals the tail base and is about 85% of the head width so head, body and tail join cleanly.
```

---

## B · Variantes de color (10)

Adjunta el **modelo base** y pega este prompt cambiando solo el bloque `COLOR`. Se recolorea todo, sin cambiar ninguna forma.

```text
Recolor the attached ZNAKEX STARTER SNAKE sprite sheet into a new color version. KEEP EXACTLY the same layout, the same shapes, the same proportions, the same outline weight, the same highlights, the same top-down camera for every piece and the same hero portrait pose for the cover. Change ONLY the colors listed below; do not add, remove or move anything. The snake must stay just as glossy, friendly and beautiful.

BACKGROUND: replace the background with perfectly flat, uniform chroma-key [KEY] across the entire image, no gradient, no shadow. The snake must NOT contain [KEY] or anything close to it.

COLOR:
[COLOR BLOCK]

The cover has NO frame, NO border, NO text. No text anywhere.
```

Sustituye `[KEY]` y `[COLOR BLOCK]` con cada fila:

| # | Color | KEY | Bloque `COLOR` (pégalo tal cual) |
| --- | --- | --- | --- |
| 1 | Verde Hoja | `#FF00FF` | `Body base leaf green #86AE5E, shading #4E6E34, highlight lime #D8E88A, back diamonds cream-lime #EAF3B0, eyes amber #F2B84B, tongue #C7354A.` (es el modelo base) |
| 2 | Rojo Rubí | `#00FF00` | `Body base ruby red #C4473E, shading deep crimson #7A1F1F, highlight coral #F19A8A, back diamonds warm cream #FBE3C8, eyes golden #FFD36A, tongue dark wine #7A0F2A.` |
| 3 | Azul Océano | `#00FF00` | `Body base ocean blue #4E82C4, shading navy #24447A, highlight sky #A9D0F5, back diamonds pale ice #E4F1FF, eyes soft yellow #FFE08A, tongue coral #E8607A.` |
| 4 | Amarillo Sol | `#00FF00` | `Body base sun yellow #D9B43A, shading golden brown #8A6A14, highlight butter #FFF0A0, back diamonds cream white #FFF8DC, eyes dark brown #7A4A1A with amber ring, tongue orange-red #D9482C.` |
| 5 | Morado Amatista | `#00FF00` | `Body base amethyst purple #8A5EC2, shading deep violet #4A2A7A, highlight lavender #D8C0F5, back diamonds pale lilac #F0E4FF, eyes golden #FFD36A, tongue hot pink #E84A8A. Keep it a blue-violet purple, never magenta.` |
| 6 | Naranja Atardecer | `#00FF00` | `Body base sunset orange #DC7A30, shading burnt sienna #8A3E12, highlight peach #FFC890, back diamonds cream #FFF0D0, eyes pale gold #FFF0B0, tongue deep red #B8262A.` |
| 7 | Rosa Chicle | `#00FF00` | `Body base bubblegum pink #DC7FA8, shading raspberry #96305E, highlight blush #FFC8DC, back diamonds white-pink #FFF0F6, eyes plum #6A2A4A with white catch-lights, tongue red #D8384E. Keep it a soft pastel pink, never magenta.` |
| 8 | Turquesa Laguna | `#FF00FF` | `Body base lagoon turquoise #3FAE9E, shading deep teal #1F5A50, highlight aqua #B8F0E0, back diamonds pale mint-white #EAFFF8, eyes warm yellow #FFE08A, tongue coral #E8607A.` |
| 9 | Negro Ónix | `#00FF00` | `Body base onyx charcoal #3A3B40, shading near-black #16171A, highlight cool silver #9AA0AE with a glossy blue-white sheen, back diamonds silver-white #D8DCE8, eyes glowing ice-cyan #8CF0FF, tongue red #C7354A. The outline stays dark warm grey, slightly lighter than the body so the silhouette still reads.` |
| 10 | Blanco Perla | `#00FF00` | `Body base pearl white #E4E0D4, shading warm grey #A8A292, highlight pure white #FFFFFF with faint pink and blue pearly reflections, back diamonds soft champagne #F6EAD0, eyes sky blue #5AA0E0, tongue rosy #E88AA0. The outline is a soft warm grey-brown so the silhouette reads on light floors.` |

Los que van con fondo magenta (`#FF00FF`) son los verdes y turquesas; el resto con verde croma.

## Consejos

- Si el generador cambia formas: repite `same shapes, same pose, same layout, change only the colors`.
- Si el negro o el blanco se pierden sobre el suelo del juego, dímelo y subo el contraste del contorno al recortarlos.
- Nombres al subir: `SKINS/basicas/01_verde.png`, `02_rojo.png`, `03_azul.png`, `04_amarillo.png`, `05_morado.png`, `06_naranja.png`, `07_rosa.png`, `08_turquesa.png`, `09_negro.png`, `10_blanco.png` y el modelo base en `SKINS/basica_base.png`.
