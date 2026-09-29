# ZNAKEX — 20 skins más (31 a 50)

Segunda lista, sigue a las 30 de `ZNAKEX_Prompts_Skins_30.md`. Los **marcos por calidad** son los mismos (están en ese documento).

| Calidad | Cantidad | Nivel de detalle |
| --- | --- | --- |
| **Normal** | 3 | 2–3 colores, patrón simple, sin adornos, cabeza lisa |
| **Especial** | 6 | 3–4 colores, patrón marcado, **un** acento luminoso o accesorio |
| **Mítico** | 6 | 5–6 colores, texturas de material, adornos, **dos** acentos luminosos, **cabeza con silueta propia** |
| **Legendario** | 5 | Máximo detalle, capas, filigrana, luz propia, **cabeza con silueta propia y espectacular** |

## Reglas (v4)

- **Fondo de recorte:** verde `#00FF00`; si la serpiente es verde, **magenta `#FF00FF`** (sin magenta en el diseño). Cada prompt indica su `KEY`.
- **Portada:** la única pieza espectacular (retrato heroico, dinámico, con sus efectos), **sin marco, borde, tarjeta, insignia ni texto**.
- **Todo lo demás** (cabeza, lengua, módulos, cola, efectos): **estrictamente desde arriba**.
- **Cabezas de Míticas y Legendarias distintas entre sí**: cuernos, astas, crestas, coronas, aletas o melena, pero pegados al cráneo y dentro de un tamaño máximo para no romper el juego (reglas dentro de la plantilla).
- Cómo se arma la serpiente en el juego: cabeza → bloque 1 (módulo A) → **bloque 2 (especial)** → bloque 3 (módulo B) → bloque 4 (módulo C) → bloques 5+ (módulo repetible) → cola.
- Nombres de archivo: `SKINS/nuevas/NN_nombre.png` (por ejemplo `SKINS/nuevas/33_cactus.png`).

---

## Plantilla maestra v4 (pégala al principio de cada skin)

Sustituye `[KEY]` por `#00FF00` o `#FF00FF`. Adjunta una ficha aprobada como referencia.

```text
Create a GAME-READY SNAKE SKIN SPRITE SHEET for the mobile game "ZNAKEX", landscape 3:2 (2528x1696). Use the attached approved sheet as the EXACT reference for outline weight, scale, rendering and layout.

BACKGROUND: perfectly flat, uniform chroma-key color [KEY] across the entire image. No gradient, no vignette, no texture, no floor shadow, no glow spilling onto the background. The snake artwork must NOT contain the key color or anything close to it. Every element is separated from the others by at least 80 px of pure key color so it can be cut out cleanly.

STYLE: polished 2D mobile-game illustration, painterly cel-shading, one consistent dark outline (about 6 px, same weight on every piece), soft rim light from the top-left, rich material detail. NO text, NO labels, NO numbers, NO watermark, NO frames, NO borders, NO UI, NO color swatches.

CAMERA RULE (every piece EXCEPT the cover: head, tongue, body modules, special module, repeating module, tail, effects): the camera is directly ABOVE, a pure TOP-DOWN BIRD'S-EYE view (dorsal view). We only see the TOP of the head and the back of the body. NEVER a front view, face-on portrait, side profile, 3/4 or perspective view for these pieces. The snout points straight UP on the page; the eyes sit on the left and right of the skull, seen from above.

LAYOUT (exact, so the pieces can be cut automatically):
ROW 1, left: (1) LIBRARY COVER – THE ONLY IMPACTFUL PIECE, and it is NOT top-down: one square 1:1 illustration (about 640x640), a dramatic dynamic HERO portrait of the snake, striking 3/4 or front view, head reared up toward the viewer, its horns/crown/ornaments and fangs clearly visible, the body coiling behind, cinematic rim light, rich saturated color, strong contrast, the skin's own glows and effects drawn in, maximum detail. Centered with generous padding. ABSOLUTELY NO FRAME, NO BORDER, NO CARD, NO ROUNDED PANEL, NO BADGE, NO RARITY LABEL, NO TEXT: only the snake and its effects directly on the chroma-key background, with clean edges.
ROW 1, right: (2) SKIN EFFECTS – a tidy 4x2 grid of 8 small isolated effect sprites (trail particles, sparks, motes, a small ring, an eye-glow flare), each about 110 px, solid opaque shapes in the skin's accent colors (no soft glows; glows are added in the game).
ROW 2, left: (3) HEAD – ONE single head in strict TOP-DOWN DORSAL VIEW: the top of the head, snout pointing straight UP, eyes on the left and right of the skull, nostrils at the tip, mouth CLOSED, perfectly symmetrical, about 300 px wide (ornaments may widen it, see the head rules). NOT a front view (no face looking at the viewer, no open mouth, no chin), NOT a side profile, NOT 3/4. No neck or body attached. Next to it (3b) the forked TONGUE alone, pointing up, about 40 px wide.
HEAD SILHOUETTE RULES (Mythic and Legendary only): the head may carry horns, antlers, a crest, a crown, side fins or a mane, but ALL of it must be attached to the skull, symmetrical left-to-right, seen from above. The complete head including every ornament must fit inside a box of at most 420 px wide by 380 px long. The snout tip stays the top-most point of the silhouette; horns, antlers and crests sweep sideways and BACKWARD, never forward past the snout. Every ornament is a solid, thick shape (at least 14 px thick) with a clean outline: no hair-thin spikes, no floating or detached pieces, no loose chains or strings, no glow halos as part of the head.
ROW 3: (4) BODY MODULES – three different body modules A, B and C side by side, all EXACTLY the same height (about 250 px) and about 290 px wide, lying horizontally, with straight flat left and right edges so they chain seamlessly; A, B and C share the palette but have different pattern arrangements.
ROW 4, left to right: (5) SPECIAL MODULE – same size as the body modules, horizontal, visibly more ornate (the signature piece of the skin); (6) REPEATING MODULE – a plain, calm, seamlessly repeatable module of the same size (used for the whole rest of the body); (7) TAIL – tapering tail tip pointing RIGHT, same height at its base as the body modules, about 460 px long.

CONSISTENCY: identical scale for head, modules and tail; body thickness equals the tail base and is about 85% of the body-head width (without ornaments) so head, body and tail join cleanly.
```

---

## NORMALES (3)

### 31 · Serpiente Cacao — KEY `#00FF00`
```text
[PLANTILLA v4] KEY = #00FF00
SKIN: "COCOA SERPENT" – a smooth chocolate snake. Palette: cocoa brown #6B3E26, dark chocolate #3A2114, cream #F1DDB8. Body: glossy cocoa scales with a row of small cream dots along the back and a subtle shine. Head: plain rounded head, small dark eyes, no ornaments. Special module: a segment with a big cream swirl. Tail: dark chocolate tip. Cover: hero portrait, head reared up, glossy highlights, a few cocoa beans around. Effects: cocoa beans, brown sparkles, cream dots. Detail level: NORMAL – 3 colors, one motif, plain head.
```
### 32 · Serpiente Menta — KEY `#FF00FF` (es verde)
```text
[PLANTILLA v4] KEY = #FF00FF
SKIN: "MINT SERPENT" – a fresh mint-and-white striped snake. Palette: mint green #7FD8B0, white #F6FBF7, deep teal #2E7A64. Body: diagonal mint and white stripes like a candy cane, clean scales. Head: rounded mint head with a small white forehead stripe, no ornaments. Special module: a segment with a white leaf shape. Tail: white tip. Cover: hero portrait, head reared up, cool fresh glow, mint leaves around. Effects: mint leaves, cool sparkles, bubbles. No magenta in the snake. Detail level: NORMAL – 3 colors, one pattern, plain head.
```
### 33 · Serpiente Ladrillo — KEY `#00FF00`
```text
[PLANTILLA v4] KEY = #00FF00
SKIN: "BRICK SERPENT" – a snake built of red bricks. Palette: brick red #B5482F, mortar cream #D9CBB0, soot #4A3A34. Body: scales shaped like bricks in an offset pattern with mortar lines and a few chips. Head: blocky rounded head with two mortar-line brows, no ornaments. Special module: a segment with a small arched window. Tail: crumbled brick tip. Cover: hero portrait, head reared up with dust and brick chips flying. Effects: brick chips, dust puffs, mortar flakes. Detail level: NORMAL – 3 colors, one pattern, plain head.
```

## ESPECIALES (6)

### 34 · Serpiente Cactus — KEY `#FF00FF` (es verde)
```text
[PLANTILLA v4] KEY = #FF00FF
SKIN: "CACTUS SERPENT" – a desert cactus snake in bloom. Palette: cactus green #5FA05A, dark green #2E5E34, spine cream #EEDFB0, flower pink #F06AA0 (small accent), sand #D8B98A. Body: ribbed green scales with tiny cream spine dots in rows. Head: rounded head with a small pink flower on top. Special module: a segment with a big blooming pink flower and two small spines. Tail: a small cactus-paddle tip. Cover: hero portrait, head reared up with the flower, sunset rim light. Effects: petals, spine bits, sand grains. No magenta in the snake (the flower is coral-pink #F06AA0, never #FF00FF). Detail level: SPECIAL – 4 colors, one accessory (flower).
```
### 35 · Serpiente Nube — KEY `#00FF00`
```text
[PLANTILLA v4] KEY = #00FF00
SKIN: "COTTON CLOUD SERPENT" – a fluffy pastel cloud snake. Palette: cloud white #F7F5FB, sky blue #A9D4F2, pastel pink #F2B6D0, lavender #C9B8EC. Body: puffy cloud-shaped scales in soft pastel gradients with small star dots. Head: fluffy white head with two tiny cloud puffs like ears, sleepy sky-blue eyes. Special module: a rainbow arc rising from a puffy cloud. Tail: a fluffy cloud puff. Cover: hero portrait, head reared up among clouds, soft dreamy glow. Effects: cloud puffs, stars, pastel sparkles. Detail level: SPECIAL – 4 pastel colors, one accessory (cloud ears).
```
### 36 · Serpiente Arcade — KEY `#00FF00`
```text
[PLANTILLA v4] KEY = #00FF00
SKIN: "ARCADE SERPENT" – a retro pixel-art arcade snake. Palette: black #14141E, neon magenta #FF3AC8, neon cyan #3AE8FF, neon yellow #FFE83A, white #FFFFFF. Body: dark scales made of chunky pixel blocks with glowing neon pixel lines and tiny game icons. Head: pixel-block head with two square glowing eyes. Special module: a segment with a pixel heart and a coin icon. Tail: stepped pixel tip. Cover: hero portrait, head reared up with a neon glow and floating pixel stars. Effects: pixels, neon squares, coin sparkles. Detail level: SPECIAL – 4 colors, one glow accent (neon lines).
```
### 37 · Serpiente Vikinga — KEY `#00FF00`
```text
[PLANTILLA v4] KEY = #00FF00
SKIN: "VIKING SERPENT" – a longship-raider snake. Palette: iron grey #6E7480, wood brown #7A5233, ice blue #9CC8E0, leather tan #B58C58, rune gold #E0B040. Body: overlapping round-shield scales alternating iron and wood with carved knotwork lines. Head: an iron helmet with a nose guard and two small side horn stubs (thick, short). Special module: a round shield with a glowing gold rune. Tail: an axe-blade-shaped tip. Cover: hero portrait, head reared up in a battle roar with frost breath. Effects: rune sparks, ice flakes, iron chips. Detail level: SPECIAL – 5 colors, one accessory (helmet), one glow accent (rune).
```
### 38 · Serpiente Monarca — KEY `#00FF00`
```text
[PLANTILLA v4] KEY = #00FF00
SKIN: "MONARCH SERPENT" – wings of a monarch butterfly. Palette: monarch orange #F08A24, black #1A1614, white #F8F2E6, deep amber #B85A14. Body: scales patterned like monarch wing cells: orange panels separated by thick black veins with white dots along the edges. Head: black head with white dots and two thin, short antenna-like feelers (thick enough, attached). Special module: a small spread butterfly wing pair on the segment. Tail: a wing-tip taper with white dots. Cover: hero portrait, head reared up with translucent wings opening behind. Effects: orange wing dust, tiny butterflies, white dots. Detail level: SPECIAL – 4 colors, one accessory (feelers).
```
### 39 · Serpiente Cebra — KEY `#00FF00`
```text
[PLANTILLA v4] KEY = #00FF00
SKIN: "ZEBRA SERPENT" – bold black-and-white stripes with a mane. Palette: white #F7F5F0, black #16151A, savanna gold #D9B060, soft grey #B9B7B0. Body: bold curved zebra stripes running across the body, crisp and high-contrast. Head: striped head with two rounded ear bumps and a short standing mane of black-and-white bristles down the back of the skull. Special module: a segment with a swirl of stripes and a gold ring. Tail: striped tip with a small bristle tuft. Cover: hero portrait, head reared up in the savanna sun. Effects: dust puffs, grass blades, gold motes. Detail level: SPECIAL – 3 colors plus gold accent, one accessory (mane).
```

## MÍTICAS (6) · cabezas con silueta propia

### 40 · Serpiente Ciervo del Bosque — KEY `#FF00FF` (es verde)
```text
[PLANTILLA v4] KEY = #FF00FF
SKIN: "ANTLER SPIRIT SERPENT" – a forest spirit with antlers. Palette: moss green #4E7A3A, bark brown #6B4A2E, leaf light green #9CD26A, cream bone #EFE3C2, glowing spring green #B8FF7A, small flower pink #F4A6C0 (never #FF00FF). Body: mossy bark scales with tiny mushrooms, ferns and flowers growing along the back. Head: HEAD SILHOUETTE: a pair of large branching antlers sweeping backward, wrapped in moss and small flowers; glowing spring-green eyes. Special module: a flowering log segment with a glowing green heart of light. Repeating module: calm mossy bark with a fern sprig. Tail: a curling fern frond. Cover: hero portrait, antlers rearing, fireflies, dappled forest light. Effects: leaves, petals, fireflies, spores. No magenta in the snake. Detail level: MYTHIC – rich texture, ornaments on head and tail, two glow accents (eyes and heart).
```
### 41 · Serpiente Gárgola — KEY `#00FF00`
```text
[PLANTILLA v4] KEY = #00FF00
SKIN: "GARGOYLE SERPENT" – a living cathedral gargoyle. Palette: weathered stone #8A8F98, dark slate #3A3F4A, moss accent #6A8A5A, ember orange #FF8A2A, bone #E6DEC8, rain-dark #262A33. Body: carved stone scales with cracks, small fangs and gothic arches carved along the back. Head: HEAD SILHOUETTE: two thick curled ram-like horns sweeping backward and two short stone bat-wing fins on the sides of the skull; ember-orange glowing eyes. Special module: a stone segment carved with a gothic rose window and a tiny gargoyle face, glowing orange through the cracks. Repeating module: plain carved stone with small cracks. Tail: a stone spearhead. Cover: hero portrait, wings half open, storm clouds behind. Effects: stone chips, embers, dust. Detail level: MYTHIC – heavy texture, ornaments on head and tail, two glow accents (eyes and rose window).
```
### 42 · Serpiente Escarabajo Sagrado — KEY `#00FF00`
```text
[PLANTILLA v4] KEY = #00FF00
SKIN: "SACRED SCARAB SERPENT" – an Egyptian golden serpent. Palette: gold #E0B040, lapis blue #244FA0, turquoise #2FB8B0, carnelian red #B0301E, sand cream #F1E2B8, black kohl #16121A. Body: gold scales inlaid with lapis and turquoise bands and hieroglyph-like (abstract, no readable text) patterns. Head: HEAD SILHOUETTE: a large scarab-beetle crest on the back of the skull with two curved mandible-like horns, and a nemes-style striped headdress flare on both sides; turquoise glowing eyes. Special module: a big winged scarab medallion of lapis and gold with a glowing sun disc. Repeating module: gold with a lapis stripe. Tail: a golden cobra-hood-shaped tip. Cover: hero portrait, head reared like a rising cobra, golden desert light. Effects: gold dust, sand, turquoise sparks. Detail level: MYTHIC – inlays and ornaments, two glow accents (eyes and sun disc).
```
### 43 · Serpiente Cuervo — KEY `#00FF00`
```text
[PLANTILLA v4] KEY = #00FF00
SKIN: "RAVEN WYRM" – a serpent of black feathers. Palette: raven black #16141C, blue-black sheen #2E3A6A, violet gloss #6A4AA0, silver #C4CAD8, blood red #B02636 (eyes), bone #E8E0D0. Body: overlapping glossy black feather-scales with blue and violet iridescence, a few silver-tipped feathers. Head: HEAD SILHOUETTE: a sharp beak-shaped snout with a crest of five thick swept-back black feathers and two short feather tufts on the sides of the skull; blood-red glowing eyes. Special module: a feather-fan medallion with a silver moon and a red gem. Repeating module: calm black feathers with a single blue sheen line. Tail: a fan of long black tail feathers. Cover: hero portrait, wings-like feather mane flaring, moonlit. Effects: feathers, silver sparks, dark mist. Detail level: MYTHIC – layered feather texture, ornaments on head and tail, two glow accents (eyes and moon).
```
### 44 · Serpiente Unicornio Astral — KEY `#00FF00`
```text
[PLANTILLA v4] KEY = #00FF00
SKIN: "ASTRAL UNICORN SERPENT" – a pearl-white serpent with a spiral horn. Palette: pearl white #F8F4FA, soft lilac #C8B4F0, sky blue #9AD0F5, rose #F4B0D0, gold #F0C860, deep night #2A2A5A. Body: pearly scales shimmering in pastel gradients with tiny stars and a soft mane of light along the spine. Head: HEAD SILHOUETTE: one single thick spiral gold-and-pearl horn (shorter than the head) centered on the forehead pointing up-and-back only slightly so the snout stays the top, small pointed ears, a short flowing mane of three thick pastel locks on the back of the skull; glowing lilac eyes. Special module: a crescent-moon-and-star medallion in gold on pearl. Repeating module: pearl with a fine gold line. Tail: a flowing pastel plume. Cover: hero portrait, horn glowing, starry sparkles. Effects: stars, rainbow sparkles, pearl dust. Detail level: MYTHIC – pearly gradients, ornaments on head and tail, two glow accents (eyes and horn).
```
### 45 · Serpiente Oni de Ceniza — KEY `#00FF00`
```text
[PLANTILLA v4] KEY = #00FF00
SKIN: "ASH ONI SERPENT" – a demon-mask serpent risen from ash. Palette: ash grey #6A6670, charcoal #24222A, oni red #C42A2A, ember orange #FF7A2A, bone white #EFE6D6, gold trim #D8A838. Body: charcoal armor scales with glowing ember cracks and bone-white lacquer stripes. Head: HEAD SILHOUETTE: two thick curved oni horns sweeping backward, small bone-white fangs at the snout sides, and a flame-shaped brow crest; ember-orange glowing eyes. Special module: a demon-mask medallion in red and bone with gold trim, glowing eyes. Repeating module: charcoal plates with a thin ember line. Tail: a flame-shaped blade tip. Cover: hero portrait, horns and embers swirling. Effects: ash flakes, embers, sparks. Detail level: MYTHIC – armor texture, ornaments on head and tail, two glow accents (eyes and cracks).
```

## LEGENDARIAS (5) · cabezas espectaculares y distintas

### 46 · Rey Volcán — KEY `#00FF00`
```text
[PLANTILLA v4] KEY = #00FF00
SKIN: "VOLCANO KING SERPENT" – a molten obsidian serpent monarch. Palette: obsidian black #14100F, basalt #3A302C, magma orange #FF6A1A, lava yellow #FFC63A, ember red #C42A14, ash grey #8A8078, gold #D8A838. Body: heavy obsidian plates split by rivers of glowing magma, small volcanic vents puffing sparks along the spine, gold bands around some plates. Head: HEAD SILHOUETTE: a crown of four thick jagged obsidian horns of different lengths (the outer pair longest, swept backward) with molten cracks and a small vent between them; magma-yellow eyes. Special module: an erupting volcano medallion – obsidian cone with a blazing crater and flowing lava, gold frame. Repeating module: obsidian plates with a thin lava seam. Tail: a molten spearhead dripping sparks. Cover: hero portrait, roaring, horns glowing, lava and ash swirling. Effects: lava drops, embers, ash, sparks, fire ring, eye flare. Detail level: LEGENDARY – layered armor, gold detail, at least four glow accents (eyes, horns, cracks, crater).
```
### 47 · Serafín — KEY `#00FF00`
```text
[PLANTILLA v4] KEY = #00FF00
SKIN: "SERAPH SERPENT" – a winged heavenly guardian. Palette: radiant white #FFFFFF, ivory #F4ECD8, gold #F0C440, sky blue #8CC8F0, soft rose #F0B8B0, deep celestial blue #2C4C9C. Body: ivory armor scales trimmed in gold with soft feathers growing between plates and small blue light runes. Head: HEAD SILHOUETTE: a pair of wing-shaped feathered head fins sweeping backward from the sides of the skull (short, thick, solid), a slim gold circlet on the brow and no horns; glowing white-blue eyes. Special module: a golden six-pointed star medallion with small feathered wings on both sides and a blinding white core. Repeating module: ivory armor with a fine gold line. Tail: a fan of white-and-gold feathers. Cover: hero portrait, huge feathered wings spread behind the head, golden light rays. Effects: feathers, light rays, gold sparks, star dust, ring, eye flare. Detail level: LEGENDARY – layered armor and feathers, gold filigree, at least four glow accents (eyes, circlet, star core, runes).
```
### 48 · Wyrm Lunar — KEY `#00FF00`
```text
[PLANTILLA v4] KEY = #00FF00
SKIN: "LUNAR WYRM" – a moonlit crystal dragon. Palette: moon silver #DCE4F2, night blue #1A2452, ice blue #8CB8F0, pale violet #A89CE8, pearl #F6F8FF, cold gold #E8D8A0. Body: silver crystal-plated scales with craters, constellation lines in pale violet and glowing moon-phase gems down the spine. Head: HEAD SILHOUETTE: two large crescent-moon horns curving outward and backward around the skull (thick, solid), a small crystal shard crown between them; glowing ice-blue eyes. Special module: a full moon medallion with craters set in a silver ring, with tiny orbiting stars. Repeating module: silver plates with one constellation line. Tail: a crescent-blade tail tip. Cover: hero portrait, crescent horns framing a glowing moon behind. Effects: moon dust, stars, crystal shards, ring, eye flare. Detail level: LEGENDARY – layered crystal armor, silver filigree, at least four glow accents (eyes, horns, moon, gems).
```
### 49 · Kraken Abisal — KEY `#00FF00`
```text
[PLANTILLA v4] KEY = #00FF00
SKIN: "KRAKEN SERPENT" – a serpent crowned with tentacles from the deep. Palette: deep ocean #0E2A4A, kraken purple #5A2E7A, teal glow #2FE0D0, coral pink #E8508C, pale sucker cream #E6D8C0, dark ink #100A18. Body: smooth purple-blue scales with rows of glowing teal sucker circles along the back and ink-stain marks. Head: HEAD SILHOUETTE: a crown of six short thick tentacles curling backward around the skull, each with glowing teal suckers, and a bony beak-like snout; huge glowing teal eyes. Special module: a big tentacle knot wrapped around a glowing pearl. Repeating module: purple scales with a row of small suckers. Tail: a curling tentacle tip. Cover: hero portrait, tentacle crown rising from dark water, bioluminescence. Effects: ink clouds, bubbles, teal glow motes, ring, eye flare. Detail level: LEGENDARY – layered organic texture, at least four glow accents (eyes, suckers, pearl, tips).
```
### 50 · Coloso de Bronce — KEY `#00FF00`
```text
[PLANTILLA v4] KEY = #00FF00
SKIN: "BRONZE COLOSSUS SERPENT" – an ancient war-golem serpent. Palette: bronze #B0783A, dark bronze #5A3A1C, verdigris #4FA890, gold #E0B848, blood red plume #B0242C, stone #8A8478, ember glow #FFB03A. Body: heavy riveted bronze plates with verdigris patina in the recesses, engraved war patterns and gold bands. Head: HEAD SILHOUETTE: a bronze war helm with two large curved ram horns swept backward, a tall central crest of red horsehair plumes (thick, solid) and cheek guards; ember-gold glowing eyes in the visor slit. Special module: a huge bronze gorgon-sun medallion with gold rays and a glowing ember core, chains of thick links on both sides. Repeating module: bronze plates with a verdigris line and a rivet. Tail: a massive bronze mace-head tip. Cover: hero portrait, helm and horns towering, forge light and sparks. Effects: forge sparks, bronze chips, ember motes, ring, eye flare. Detail level: LEGENDARY – layered armor, engraving, plume, at least four glow accents (eyes, core, rivets, cracks).
```

---

## Consejos

- Si el generador no respeta el fondo: añade `Background must be exactly RGB(0,255,0)` (o `RGB(255,0,255)`), plano y de un solo tono.
- Si la cabeza sale de frente o con la boca abierta: repite `HEAD in strict top-down dorsal view, mouth closed, NOT a front view`.
- Si los cuernos salen enormes: `head including horns fits in 420 x 380 px, horns short and thick`.
- Si mezcla piezas, genera dos hojas: `ROW 1–2` (portada, efectos, cabeza) y `ROW 3–4` (cuerpo, especial, cola).
- Sube las hojas a `SKINS/nuevas/` y los marcos a `Pantallas/marcos/`, y avísame para recortarlas y añadirlas a la tienda.

## Proporciones en el juego (v0.6)

La serpiente se dibuja por casillas: cabeza (1) + módulo especial (2) + módulos A, B, C en ciclo (1 cada uno) + cola (1). Al recortar, el grosor real del cuerpo se toma del **módulo repetible**, y los módulos A/B/C se escalan a ese mismo grosor (en las hojas actuales salen dibujados más grandes). Para futuras hojas, si puedes, añade al final del prompt:

```text
All body modules A, B, C, the special module, the repeating module and the tail base share EXACTLY the same body thickness. Modules A, B and C are about 1.3x as long as they are thick; the special module is about 2.6x as long as it is thick; the tail is short, about 3x as long as it is thick at its base.
```

No hace falta generar módulos de giro: el juego los crea doblando los propios módulos de cada skin.
