# ZNAKEX — 30 skins nuevas + marcos por calidad

Las skins actuales (las 20 especiales y la de temporada) pasan a ser **solo del APK de tester**. En la versión pública quedan las serpientes básicas (10 colores) y, cuando subas estas hojas, entrarán las 30 nuevas.

Reparto de calidades (30):

| Calidad | Cantidad | Detalle que debe tener la ilustración |
| --- | --- | --- |
| **Normal** | 6 | 2–3 colores, patrón simple y limpio, sin adornos |
| **Especial** | 10 | 3–4 colores, patrón marcado y **un** acento luminoso o accesorio |
| **Mítico** | 8 | 5–6 colores, texturas de material, adornos en cabeza y cola, **dos** acentos luminosos |
| **Legendario** | 6 | Máximo detalle: armadura o plumaje por capas, filigrana, luz propia, corona/adornos y **al menos cuatro** acentos luminosos |

## Reglas de esta versión (v3)

- **Fondo de recorte:** verde croma `#00FF00` por defecto. **Si la serpiente es verde (o lleva mucho verde), el fondo es magenta `#FF00FF`** y la serpiente no lleva nada de magenta. Cada prompt lo indica en `KEY`.
- **La portada NO lleva marco, ni borde, ni tarjeta, ni insignia, ni rareza.** Solo la serpiente sobre el fondo de recorte. El marco de cada calidad lo pongo yo con los marcos del final de este documento.
- Solo se generan las piezas que necesita el juego: portada, efectos, cabeza (+ lengua), 3 módulos de cuerpo, módulo especial, módulo repetible y cola.
- Sin texto, sin etiquetas, sin números, sin muestras de color.

Cómo se arma la serpiente en el juego: cabeza → bloque 1 (módulo A) → **bloque 2 (especial)** → bloque 3 (módulo B) → bloque 4 (módulo C) → bloques 5+ (módulo repetible) → cola.

Nombres de archivo al subirlas: `SKINS/nuevas/NN_nombre.png` (por ejemplo `SKINS/nuevas/07_girasol.png`) y los marcos en `Pantallas/marcos/normal.png`, `especial.png`, `mitico.png`, `legendario.png`, `temporada.png`.

---

## Plantilla maestra v3 (pégala al principio de cada skin)

Sustituye `[KEY]` por `#00FF00` (verde) o `#FF00FF` (magenta) según indique cada skin. Adjunta como referencia una ficha aprobada.

```text
Create a GAME-READY SNAKE SKIN SPRITE SHEET for the mobile game "ZNAKEX", landscape 3:2 (2528x1696). Use the attached approved sheet as the EXACT reference for outline weight, scale, rendering and layout.

BACKGROUND: perfectly flat, uniform chroma-key color [KEY] across the entire image. No gradient, no vignette, no texture, no floor shadow, no glow spilling onto the background. The snake artwork must NOT contain the key color or anything close to it. Every element is separated from the others by at least 80 px of pure key color so it can be cut out cleanly.

STYLE: polished 2D mobile-game illustration, painterly cel-shading, one consistent dark outline (about 6 px, same weight on every piece), soft rim light from the top-left, rich material detail. Everything strictly TOP-DOWN ORTHOGRAPHIC, as if seen from directly above. NO text, NO labels, NO numbers, NO watermark, NO frames, NO borders, NO UI, NO color swatches.

LAYOUT (exact, so the pieces can be cut automatically):
CAMERA RULE (applies to EVERY piece, including the cover and the head): the camera is directly ABOVE the snake, a pure TOP-DOWN BIRD'S-EYE view (dorsal view). We only ever see the TOP of the head and the back of the body. NEVER draw a front view, face-on portrait, side profile, 3/4 view or perspective view of the head. The snout points straight UP on the page; the two eyes sit on the left and right sides of the skull, seen from above.

ROW 1, left: (1) LIBRARY COVER – one square 1:1 illustration (about 640x640) of the snake's head and first coils seen from directly ABOVE (same top-down camera as the head, NOT a front view), the head at the top with the snout pointing up and the body curling below it in a couple of loose coils, centered with generous padding. ABSOLUTELY NO FRAME, NO BORDER, NO CARD, NO ROUNDED PANEL, NO BADGE, NO RARITY LABEL: only the snake directly on the chroma-key background (its soft edges must read cleanly against the key color).
ROW 1, right: (2) SKIN EFFECTS – a tidy 4x2 grid of 8 small isolated effect sprites (trail particles, sparks, motes, a small ring, an eye-glow flare), each about 110 px, drawn as solid opaque shapes in the skin's accent colors (no soft glows; glows are added in the game).
ROW 2, left: (3) HEAD – ONE single head in strict TOP-DOWN DORSAL VIEW (the camera directly above the skull): we see the top of the head, the snout pointing straight UP, the two eyes on the left and right of the skull, the nostrils at the tip, mouth CLOSED, perfectly symmetrical left-to-right, about 300 px wide. It must NOT be a front view (no face looking at the viewer, no visible open mouth or chin), NOT a side profile, NOT 3/4. Do not draw the neck or body attached, only the head. Next to it (3b) the forked TONGUE alone, pointing up, about 40 px wide.
ROW 3: (4) BODY MODULES – three different body modules A, B and C side by side, all EXACTLY the same height (about 250 px) and about 290 px wide, lying horizontally, with straight flat left and right edges so they chain seamlessly; A, B and C share the palette but have different pattern arrangements.
ROW 4, left to right: (5) SPECIAL MODULE – same size as the body modules, horizontal, visibly more ornate (the signature piece of the skin); (6) REPEATING MODULE – a plain, calm, seamlessly repeatable body module of the same size (used for the whole rest of the body); (7) TAIL – tapering tail tip pointing RIGHT, same height at its base as the body modules, about 460 px long.

CONSISTENCY: identical scale for head, modules and tail; body thickness equals the tail base and is about 85% of the head width so head, body and tail join cleanly.
```

---

# Marcos por calidad (5 prompts)

Un marco por clase para las portadas de la biblioteca. Cada marco es una imagen **cuadrada** con la abertura central **también en color de recorte**, para poder vaciarla.

### Plantilla de marco (pégala al principio de cada marco)

```text
Create a GAME UI CARD FRAME for the mobile game "ZNAKEX", perfectly square 1:1 (1024x1024). The image is ONLY the frame ring: a decorative border whose CENTER OPENING is a rounded square exactly 78% of the image width, centered. Fill the opening AND the whole area outside the frame's outer silhouette with perfectly flat chroma-key color [KEY] (no gradient, no shadow on it, no glow spilling onto it). The frame's outer silhouette has softly rounded corners (about 8% radius). The ring is about 11% of the width all around, symmetrical left-to-right. The frame must NOT contain the key color. STYLE: polished 2D mobile-game UI, painterly cel-shading, consistent dark outer outline about 5 px, top-left rim light, "translucent forest relic" look. NO text, NO icons inside the opening, NO characters, NO watermark.
```

### Marco NORMAL — KEY `#00FF00`

```text
[FRAME TEMPLATE]
QUALITY: NORMAL. Simple worn carved stone-and-wood frame, warm bone-grey stone #C9D2B4 with darker bark-brown #5A4630 inner bevel. Flat, clean, almost no ornament: small rivet dots on the four corners and a thin engraved line along the ring. Matte, no glow, no gems.
```

### Marco ESPECIAL — KEY `#FF00FF`

```text
[FRAME TEMPLATE]
QUALITY: SPECIAL. Polished emerald-green metal frame #6CC24A with a darker forest-green #2F5A28 inner bevel and thin silver edge lines. Small carved leaf shapes curling in each corner, a small round green gem centered at the top edge. A very subtle green inner edge glow. No magenta anywhere in the frame.
```

### Marco MÍTICO — KEY `#00FF00`

```text
[FRAME TEMPLATE]
QUALITY: MYTHIC. Ornate sapphire-blue and polished silver frame (#5FA0E0, #C9D6E8, deep navy #1B2A4A). Engraved rune patterns along the whole ring, four blue sapphire gems in the corners set in silver claws, a larger gem with small wing shapes at the top center, thin blue light lines running through the engravings and a soft blue inner edge glow.
```

### Marco LEGENDARIO — KEY `#00FF00`

```text
[FRAME TEMPLATE]
QUALITY: LEGENDARY. The most ornate frame: antique gold #E8B04A with honey highlights #F5D48A and dark bronze #4A3210 in the recesses. Layered filigree along the ring, four large jewels (ruby, amber, topaz, white diamond) in the corners, a regal crest with spread wings and a small crown at the top center, small flame-like flourishes at the bottom corners, jewels lit from within, a warm golden inner edge glow and tiny sparkle stars on the metal.
```

### Marco TEMPORADA — KEY `#00FF00`

```text
[FRAME TEMPLATE]
QUALITY: SEASONAL (Harvest Moon Hollow). Autumn carved-wood frame in burnt orange #E87532 and umber #5A3418 with a warm lantern-gold #F5C35A inner rim. Small pumpkins in the four corners, curling vines and a few fall leaves along the ring, a tiny hanging lantern at the top center with a warm glow.
```

---

# Las 30 skins

Cada prompt empieza con `[PLANTILLA v3]` (pega la plantilla maestra con el `KEY` indicado).

## NORMALES (6)

### 01 · Serpiente Coral — KEY `#00FF00`
```text
[PLANTILLA v3] KEY = #00FF00
SKIN: "CORAL BANDS" – a classic coral snake. Palette: signal red #C9302C, cream yellow #F2D264, jet black #1A1A1A. Body: clean repeating bands red–yellow–black–yellow–red, glossy but simple scales. Head: rounded black snout with a yellow band behind the eyes, small dark eyes. Special module: a wider band segment with a subtle yellow highlight. Tail: black tip. Cover: head over two loose coils. Effects: small red and yellow dots, tiny sparks, a simple ring. Detail level: NORMAL – 3 flat colors, no ornaments.
```
### 02 · Cobra Arenisca — KEY `#00FF00`
```text
[PLANTILLA v3] KEY = #00FF00
SKIN: "SANDSTONE COBRA" – a desert snake of layered sandstone. Palette: sand #D9B98A, terracotta #B5653A, cream #F1E2BE. Body: horizontal sandstone strata stripes with tiny speckles. Head: broad flat head with a shallow hood mark, dark amber eyes. Special module: a segment with a carved spiral in terracotta. Tail: sandy tip with a darker end. Cover: head with a raised hood. Effects: sand grains, dust puffs, small pebbles. Detail level: NORMAL – 3 colors, simple strata pattern.
```
### 03 · Víbora Pizarra — KEY `#00FF00`
```text
[PLANTILLA v3] KEY = #00FF00
SKIN: "SLATE VIPER" – a compact grey-blue viper. Palette: slate blue-grey #6B7A8C, dark charcoal #2E3742, pale stone #C8CFD6. Body: a dark zig-zag stripe down the back over slate scales. Head: triangular viper head with a small nasal ridge, pale eyes with vertical pupils. Special module: a segment with a double zig-zag and light rim. Tail: charcoal tip. Cover: head seen from above over a coil. Effects: grey sparks, small stone chips, a thin ring. Detail level: NORMAL – 3 colors, one pattern.
```
### 04 · Pitón de la Selva — KEY `#FF00FF` (es verde)
```text
[PLANTILLA v3] KEY = #FF00FF
SKIN: "JUNGLE PYTHON" – a green camouflage python. Palette: leaf green #4E8A3A, dark moss #24421E, tan #C9B27A. Body: irregular dark-moss blotches with tan outlines on a leaf-green base. Head: broad head with a dark stripe through each eye, amber eyes. Special module: a segment with a big diamond blotch. Tail: dark moss tip. Cover: head resting on a coil. Effects: leaf bits, small green motes, a soft ring. No magenta anywhere in the snake. Detail level: NORMAL – 3 colors, simple blotch pattern.
```
### 05 · Serpiente Miel — KEY `#00FF00`
```text
[PLANTILLA v3] KEY = #00FF00
SKIN: "HONEY SERPENT" – amber snake with honeycomb marks. Palette: honey amber #E3A62E, deep brown #6B3F12, cream #F6E2A8. Body: warm amber scales with a row of hexagon (honeycomb) marks along the back. Head: rounded, glossy, warm brown eyes. Special module: a segment with a cluster of glossy honeycomb cells. Tail: brown tip with a single hexagon. Cover: head with a drop of honey on the snout. Effects: honey drops, golden dots, hexagon sparks. Detail level: NORMAL – 3 colors, one motif.
```
### 06 · Boa de Niebla — KEY `#00FF00`
```text
[PLANTILLA v3] KEY = #00FF00
SKIN: "MIST BOA" – a soft misty boa. Palette: pale lavender-grey #BFC3D6, slate violet #6C6F92, white #F2F3FA. Body: soft ring pattern fading like mist, smooth scales. Head: gentle rounded head, pale silver eyes. Special module: a segment with three concentric rings. Tail: fades to white tip. Cover: head over drifting coils. Effects: mist wisps, pale motes, a soft ring. Detail level: NORMAL – 3 pale colors, soft rings only.
```

## ESPECIALES (10)

### 07 · Serpiente Girasol — KEY `#00FF00`
```text
[PLANTILLA v3] KEY = #00FF00
SKIN: "SUNFLOWER SERPENT" – a cheerful snake with a sunflower collar. Palette: sun yellow #F2C231, deep brown #4A2C12, orange #E8862A, leaf tan #B98A3E. Body: yellow scales with brown seed-dot rows along the back. Head: a ring of sunflower petals around the head like a collar, warm brown eyes. Special module: a glossy sunflower disc with spiral seeds and petals to both sides. Tail: ends in a small closed bud. Cover: head framed by petals. Effects: petals, seeds, sun motes, orange sparks. Detail level: SPECIAL – 4 colors, one accessory (petal collar), one glow accent (seed disc).
```
### 08 · Serpiente Arándano — KEY `#00FF00`
```text
[PLANTILLA v3] KEY = #00FF00
SKIN: "BLUEBERRY SERPENT" – indigo snake with berry dots. Palette: deep indigo #2B2F7A, berry blue #4B63C9, dusty powder #A9B4E8, magenta-pink tiny accent #D45BA8. Body: indigo scales dusted with a powdery bloom, rows of round berry dots. Head: round, glossy, bright pink-lit eyes. Special module: a cluster of three plump berries with tiny leaves. Tail: a small berry stem. Cover: head with a berry on the snout. Effects: berry drops, dusty motes, small leaves. Detail level: SPECIAL – 4 colors, one accent (pink eyes).
```
### 09 · Serpiente Pirata — KEY `#00FF00`
```text
[PLANTILLA v3] KEY = #00FF00
SKIN: "PIRATE SERPENT" – a swashbuckling snake. Palette: navy #1E2F52, sail cream #EBDDB8, gold #E0B040, blood red #A4262C, wood brown #6B4423. Body: navy scales with a cream sail-stripe pattern and gold coin scales scattered along the back. Head: a red bandana knotted behind the head and a tiny gold earring, one eye with a slim scar. Special module: a treasure segment with a gold coin, a tiny key and a rope wrap. Tail: rope-wrapped tip with an anchor charm. Cover: head with the bandana. Effects: gold coins, sea spray drops, sparks, ropes. Detail level: SPECIAL – 5 colors, one accessory (bandana), one glow accent (gold).
```
### 10 · Serpiente Robot Retro — KEY `#00FF00`
```text
[PLANTILLA v3] KEY = #00FF00
SKIN: "RETRO ROBOT SERPENT" – a 1950s toy robot snake. Palette: chrome silver #C8CED6, tin blue #4E7FA8, warm red #D0342C, cream #EFE6CF. Body: riveted chrome plates with small blue bolts and panel lines. Head: rounded tin head with a red glowing LED eye strip and a little antenna. Special module: a plate with a round dial gauge and two red buttons. Tail: a key-winding tail (wind-up key) at the end. Cover: head with antenna. Effects: nuts and bolts, red sparks, steam puffs. Detail level: SPECIAL – 4 colors, one glow accent (red LED).
```
### 11 · Serpiente Caramelo — KEY `#00FF00`
```text
[PLANTILLA v3] KEY = #00FF00
SKIN: "CANDY SWIRL SERPENT" – peppermint candy snake. Palette: candy pink #F26A9B, white #FFF7F0, mint #7FD8C4 (small accent), sugar shine white. Body: glossy pink-and-white spiral stripes like a hard candy, sugar sparkle. Head: round candy head with a swirl on the forehead, sweet dark eyes. Special module: a wrapped-candy segment with twisted paper ends. Tail: lollipop-stick tail tip. Cover: head with a candy shine. Effects: sugar sparkles, candy bits, star sprinkles. Detail level: SPECIAL – 3 colors plus shine, one accessory (wrapped candy).
```
### 12 · Serpiente Runa de Musgo — KEY `#FF00FF` (es verde)
```text
[PLANTILLA v3] KEY = #FF00FF
SKIN: "MOSS RUNE SERPENT" – an ancient stone snake overgrown with moss. Palette: stone grey #7C8580, moss green #5E9A48, dark slate #2F3A38, glowing rune green #9CFF7A. Body: carved grey stone scales with patches of moss and hairline cracks. Head: a stone head with moss brows and green glowing eyes. Special module: a stone segment with a large glowing rune circle. Tail: mossy stone spike. Cover: head with glowing eyes. Effects: moss bits, glowing rune dots, stone chips. No magenta in the snake. Detail level: SPECIAL – 4 colors, one glow accent (runes).
```
### 13 · Serpiente Trueno — KEY `#00FF00`
```text
[PLANTILLA v3] KEY = #00FF00
SKIN: "THUNDER SERPENT" – a storm-cloud snake. Palette: storm grey #58637A, dark slate #262C3E, electric yellow #FFE04A, pale blue #BFD4F2. Body: layered cloud-grey scales with jagged yellow lightning veins. Head: angular head with a small lightning-bolt crest, bright yellow eyes. Special module: a segment with a big lightning fork across a dark cloud. Tail: pointed like a bolt. Cover: head with a lightning arc. Effects: lightning zigzags, yellow sparks, rain drops. Detail level: SPECIAL – 4 colors, one glow accent (lightning).
```
### 14 · Serpiente Ola — KEY `#00FF00`
```text
[PLANTILLA v3] KEY = #00FF00
SKIN: "WAVE SERPENT" – an ocean serpent. Palette: deep teal #16606E, sea blue #2E86B8, foam white #EAF6F8, sand #E6D3A4. Body: overlapping wave-scale pattern from deep teal to sea blue with white foam curls. Head: sleek head with a small curling wave crest and pale aqua eyes. Special module: a big curling wave with foam and a tiny shell. Tail: a fluke-like curled tail tip. Cover: head with foam at the snout. Effects: water drops, foam bubbles, ripple ring. Detail level: SPECIAL – 4 colors, one accent (foam highlights).
```
### 15 · Serpiente Panda — KEY `#FF00FF` (lleva bambú verde)
```text
[PLANTILLA v3] KEY = #FF00FF
SKIN: "PANDA SERPENT" – black-and-white snake with bamboo. Palette: soft white #F4F2EC, charcoal #23242A, bamboo green #7DB85A, pink nose #E7A0A8. Body: white scales with big charcoal patches and bamboo-node rings. Head: white head with two round charcoal ears, charcoal eye patches, a small pink nose. Special module: a segment with a bamboo stalk wrapped around it and two leaves. Tail: charcoal tip with a bamboo leaf. Cover: head with ears. Effects: bamboo leaves, tiny hearts, soft motes. No magenta in the snake. Detail level: SPECIAL – 4 colors, one accessory (ears).
```
### 16 · Serpiente Tigre — KEY `#00FF00`
```text
[PLANTILLA v3] KEY = #00FF00
SKIN: "TIGER SERPENT" – striped jungle cat snake. Palette: orange #E8862A, black #1B1A1A, cream #F5E6C8, amber eyes #F2C231. Body: orange scales with bold black tiger stripes and cream belly edges. Head: broad head with cat-like stripes and small rounded ear bumps, fierce amber eyes. Special module: a segment with a claw-mark triple slash glowing amber. Tail: black-ringed tip. Cover: head seen from above with the stripes flowing back over the neck. Effects: claw sparks, orange embers, fur wisps. Detail level: SPECIAL – 4 colors, one glow accent (claw marks).
```

## MÍTICAS (8)

### 17 · Dragón de Jade — KEY `#FF00FF` (es verde)
```text
[PLANTILLA v3] KEY = #FF00FF
SKIN: "JADE DRAGON SERPENT" – a noble eastern dragon-serpent carved from jade. Palette: jade green #3E9A6E, deep emerald #14503A, mint highlight #9CE8C4, gold #E0B040, cream #F4EBCF, red pearl #C9302C. Body: polished jade scales with subtle veins, gold filigree along the spine. Head: dragon head with two gold-tipped antlers, flowing gold whiskers and a glowing red pearl under the chin, glowing emerald eyes. Special module: a jade medallion carved with a swirling cloud pattern, gold-framed, with a glowing pearl. Repeating module: calm jade with a thin gold line. Tail: a fan of gold-tipped jade fins. Cover: head with whiskers and pearl. Effects: cloud puffs, gold motes, mint sparks, pearl glow. No magenta in the snake. Detail level: MYTHIC – rich material shading, ornaments on head and tail, two glow accents (eyes and pearl).
```
### 18 · Serpiente Aurora — KEY `#00FF00`
```text
[PLANTILLA v3] KEY = #00FF00
SKIN: "AURORA SERPENT" – a snake wearing the northern lights. Palette: deep night blue #12203F, aurora teal #3FE0C0, violet #8A5CE0, pink #E86AC8, star white #F4F8FF. Body: dark blue scales with flowing aurora ribbons in teal, violet and pink across the back. Head: sleek head crowned with soft aurora ribbon streamers, glowing teal eyes. Special module: a medallion where a bright aurora curtain arcs over tiny stars. Repeating module: night blue with a thin teal ribbon. Tail: trailing aurora ribbons. Cover: head with ribbons flowing behind. Effects: star dust, ribbon wisps, cold sparks. Detail level: MYTHIC – gradients inside scales, ornaments on head and tail, two glow accents (eyes and ribbons).
```
### 19 · Serpiente Arrecife — KEY `#00FF00`
```text
[PLANTILLA v3] KEY = #00FF00
SKIN: "REEF SERPENT" – a living coral reef. Palette: coral orange #F0784A, magenta-pink coral #E0518F, turquoise #2FB8C4, sand #EFD9A8, deep sea blue #15486A, sunny yellow #F2C231. Body: turquoise scales with small branching corals, anemones and starfish growing along the back. Head: crowned with a small branching coral and tiny anemone tentacles, big bright eyes. Special module: a bursting coral garden with a clownfish-orange anemone. Repeating module: turquoise with a few small coral sprigs. Tail: a fan of coral branches. Cover: head with coral crown. Effects: bubbles, tiny fish silhouettes, sand grains. Detail level: MYTHIC – lots of small colorful details, two glow accents (anemone tips and eyes).
```
### 20 · Serpiente de Ámbar — KEY `#00FF00`
```text
[PLANTILLA v3] KEY = #00FF00
SKIN: "AMBER FOSSIL SERPENT" – snake made of translucent amber. Palette: amber #E5A020, deep honey #A85F10, cream gold #F6DA8A, dark brown #4A2A0E, tiny white bubbles. Body: translucent amber scales with tiny trapped insects, leaves and bubbles, warm inner glow. Head: amber head with a fossilized dragonfly wing crest, glowing golden eyes. Special module: a big amber chunk with a complete fossil beetle and a bright glowing core. Repeating module: calm translucent amber with a few bubbles. Tail: a raw amber crystal tip. Cover: head with warm backlight. Effects: amber drops, bubbles, gold motes. Detail level: MYTHIC – translucency and inclusions, two glow accents (eyes and core).
```
### 21 · Serpiente Vidriera — KEY `#00FF00`
```text
[PLANTILLA v3] KEY = #00FF00
SKIN: "STAINED GLASS SERPENT" – a snake of cathedral glass. Palette: ruby #C22E45, sapphire #2E5FC2, emerald-teal #1FA88A, amber #E8A82E, violet #7A3FB0, dark lead #23202A. Body: scales as glass panes in different colors, outlined with dark lead lines and lit from behind with soft light rays. Head: glass head with a lead-line mask and a rose-window crest, glowing white eyes. Special module: a rose-window medallion with radiating colored petals. Repeating module: alternating two glass colors. Tail: a shard of colored glass. Cover: head backlit. Effects: colored glass shards, light beams, prism sparkles. Detail level: MYTHIC – multi-color glass with lead lines, two glow accents (backlight and eyes).
```
### 22 · Serpiente Mecanismo — KEY `#00FF00`
```text
[PLANTILLA v3] KEY = #00FF00
SKIN: "CLOCKWORK SERPENT" – a steampunk automaton snake. Palette: brass #C89A3C, copper #B0592F, dark iron #2C2A2E, cream dial #F1E6C8, glowing steam cyan #6FE4F0, ruby #B0242E. Body: brass plates with visible gears, rivets and small windows showing turning cogs. Head: brass head with a monocle-like lens eye, tiny chimney puffing steam, a ruby eye. Special module: a big clock face with moving hands and surrounding cogs, lit from within. Repeating module: brass plate with a small cog. Tail: a spring coil ending in a small pendulum. Cover: head with steam. Effects: gears, steam puffs, sparks, tiny screws. Detail level: MYTHIC – intricate mechanical detail, two glow accents (lens and clock).
```
### 23 · Serpiente Sirena — KEY `#00FF00`
```text
[PLANTILLA v3] KEY = #00FF00
SKIN: "SIREN SERPENT" – a pearly sea siren. Palette: pearl white #F4F0F4, aqua #63D0E0, lilac #B78CE0, rose #F09AB8, seafoam #A8E8D6, gold #E0B860. Body: iridescent pearl scales shifting aqua to lilac, delicate fin ridges along the back. Head: a crown made of a scallop shell and pearls, long flowing fin-like ribbons, glowing aqua eyes. Special module: a large open shell revealing a glowing pearl. Repeating module: pearly scales with a thin fin ridge. Tail: a translucent double fin. Cover: head with shell crown. Effects: bubbles, pearl sparkles, water ribbons. Detail level: MYTHIC – iridescent shading, ornaments on head and tail, two glow accents (eyes and pearl).
```
### 24 · Serpiente Origami — KEY `#00FF00`
```text
[PLANTILLA v3] KEY = #00FF00
SKIN: "ORIGAMI SERPENT" – a snake folded from paper. Palette: paper white #F6F1E6, vermilion red #D6382C, gold leaf #E0B040, ink black #1E1B1B, pale grey shadow #C9C3B6. Body: sharp folded triangular facets with visible creases, red-and-white pattern with gold leaf edges. Head: a folded paper crane-like head with a gold beak line and small ink-dot eyes. Special module: a folded red crane sitting on the segment with gold-edged wings. Repeating module: white facets with one red fold. Tail: a folded paper point with a gold stripe. Cover: head with a floating paper crane. Effects: paper scraps, gold flakes, folded stars. Detail level: MYTHIC – precise fold shading, ornaments on head and tail, two accents (gold leaf and red crane).
```

## LEGENDARIAS (6)

### 25 · Dragón Celestial — KEY `#00FF00`
```text
[PLANTILLA v3] KEY = #00FF00
SKIN: "CELESTIAL DRAGON SERPENT" – a heavenly white-and-gold sky dragon. Palette: pearl white #F6F3EA, gold #F0C440, sky blue #7FC4F0, deep azure #2A5FA8, rose gold #E8A8A0, soft cloud grey #D5DDE8. Body: layered pearl-white armor scales edged in gold, clouds curling around the body, blue lightning veins between the plates. Head: majestic dragon head with a floating golden halo ring, long flowing golden whiskers, swept gold horns, radiant sky-blue eyes. Special module: a magnificent golden sun-and-cloud medallion with a blazing blue core and small orbiting stars. Repeating module: white armor with a fine gold line. Tail: a long flowing fan of gold-tipped cloud plumes. Cover: dramatic top-down view of the head with halo and clouds. Effects: cloud puffs, gold sparks, blue lightning, star dust, halo ring, eye flare. Detail level: LEGENDARY – layered armor, gold filigree, halo, at least four glow accents (eyes, halo, core, lightning).
```
### 26 · Serpiente Fénix — KEY `#00FF00`
```text
[PLANTILLA v3] KEY = #00FF00
SKIN: "PHOENIX SERPENT" – a serpent of living flame and feathers. Palette: crimson #C9261E, flame orange #FF7A1E, gold #FFC83A, white-hot #FFF3C8, charred dark #2A1410, ember pink #F26A5A. Body: overlapping feather-scales in a gradient from crimson to gold, glowing white-hot cracks, small flames licking along the spine. Head: a fiery crest of long flame feathers, a golden beak-like snout, blazing white-yellow eyes. Special module: a huge blazing phoenix-emblem medallion with spread wings, flames pouring out. Repeating module: ember feathers with a soft glow. Tail: a long tail of flame plumes with sparks. Cover: head in flames, feathers swirling. Effects: flame licks, rising embers, feather sparks, smoke, fire ring, eye flare. Detail level: LEGENDARY – layered feathers, internal fire, at least four glow accents.
```
### 27 · Serpiente Eclipse — KEY `#00FF00`
```text
[PLANTILLA v3] KEY = #00FF00
SKIN: "ECLIPSE SERPENT" – born where the moon covers the sun. Palette: void black #0E0C14, corona gold #FFC84A, white-hot ring #FFF6D8, deep violet #3A2A6A, silver #C8CCE0, ember orange #F07A24. Body: black lacquer scales edged with thin corona-gold lines, subtle constellations in violet; the back carries sun-corona flare patterns. Head: a black head with a glowing golden corona ring floating behind it like a halo, silver moon-crescent horns, white-gold eyes. Special module: a spectacular full eclipse medallion – black disc with a blazing white-gold corona and flare arcs. Repeating module: black scales with fine gold line. Tail: a crescent-moon blade tail with a golden edge. Cover: head against the corona ring. Effects: corona flares, gold sparks, silver moon dust, ring, eye flare. Detail level: LEGENDARY – layered armor, gold filigree, corona halo, at least four glow accents.
```
### 28 · Serpiente Prisma — KEY `#00FF00`
```text
[PLANTILLA v3] KEY = #00FF00
SKIN: "PRISM SERPENT" – a snake of living rainbow crystal. Palette: clear crystal white #F2F8FF, and full spectrum refractions: red #F04A5A, orange #F49A3A, yellow #F5E050, aqua #4AD8D0, blue #4A7AF0, violet #9A5AE0; silver edges #C8D2E4. Body: faceted transparent crystal scales that refract a rainbow across each facet, silver setting lines. Head: a faceted crystal head with a tall multicolor crystal crown, prismatic glowing eyes. Special module: a giant faceted gem splitting a beam of white light into a rainbow fan. Repeating module: clear facets with a soft rainbow edge. Tail: a cluster of colorful crystal shards. Cover: head with light beams splitting behind it. Effects: rainbow glints, crystal shards, prism beams, sparkle stars, ring, eye flare. Detail level: LEGENDARY – layered faceted crystal, silver filigree, at least four different glow accents.
```
### 29 · Wyrm de la Tempestad — KEY `#00FF00`
```text
[PLANTILLA v3] KEY = #00FF00
SKIN: "TEMPEST WYRM" – a storm-lord dragon-serpent. Palette: storm indigo #23305A, steel blue #4E6EA8, electric cyan #6FE8FF, lightning white #F4FCFF, dark slate #12182C, silver #B8C4DA. Body: overlapping armored indigo scales with rivers of crackling cyan lightning running between plates, storm-cloud wisps on the back. Head: a horned dragon head with swept-back silver horns and a floating ring of arcing lightning, blazing white-cyan eyes. Special module: a massive storm-eye medallion with a vortex of clouds and a bolt striking its core. Repeating module: armored indigo with a thin cyan line. Tail: a barbed tail ending in a lightning spark. Cover: dramatic head with lightning arcs. Effects: lightning bolts, cyan sparks, rain, cloud puffs, ring, eye flare. Detail level: LEGENDARY – layered armor, silver detail, lightning halo, at least four glow accents.
```
### 30 · Emperador Dorado — KEY `#00FF00`
```text
[PLANTILLA v3] KEY = #00FF00
SKIN: "GOLDEN EMPEROR SERPENT" – the ultimate royal serpent of gold and jewels. Palette: polished gold #F0C038, deep gold #B8862A, bronze shadow #5A3A12, ruby #C4202E, sapphire #2A4FB0, emerald-teal #1F9A78, ivory #F6EED8. Body: heavy gold armor plates with engraved royal patterns, ruby and sapphire jewels set along the back, ivory inlays. Head: a regal head wearing a tall jeweled imperial crown with a large glowing ruby, gold cheek guards, sapphire eyes with a gold glint. Special module: the most lavish piece – a great jeweled royal seal medallion with ruby center, gold wings and hanging chains. Repeating module: gold plates with a fine engraved line and a small gem. Tail: a jeweled scepter-like tail tip with a small crown. Cover: majestic head with crown, jewels catching light. Effects: gold sparks, jewel glints, coin flakes, royal ring, eye flare. Detail level: LEGENDARY – maximum: layered gold armor, jewels, crown, at least four glow accents.
```

---

## Consejos

- Si el generador no respeta el color de fondo, añade al final: `Background must be exactly RGB(0,255,0)` (o `RGB(255,0,255)`), plano y sin ningún otro tono.
- Si mezcla piezas, genera dos hojas: `ROW 1–2` (portada, efectos, cabeza) y `ROW 3–4` (cuerpo, especial, cola).
- Si los módulos salen de alturas distintas: `all body modules exactly 250 px tall, same as the tail base`.
- Cuando tengas las hojas y los 5 marcos, súbelos al repo y avísame: los recorto, los añado a la tienda por calidad y les pongo su marco.
