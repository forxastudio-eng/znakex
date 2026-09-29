# ZNAKEX — Skins de temporada (5) · prompts con fondo verde

Pase de temporada **Harvest Moon Hollow**: 2 skins **Especiales** en la vía gratuita y 3 en la de pago (**2 Míticas + 1 Legendaria**). Son 5 prompts (2 + 3). El nivel de detalle sube con la calidad: cuanto más rara, más capas, texturas y brillos.

Cada hoja contiene **solo lo que necesita el juego**, sobre fondo verde croma para recortar sin problemas:

1. Portada de la biblioteca (tarjeta de la tienda)
2. Efectos de la skin (rastro, aura y brillo de ojos)
3. Cabeza (con la lengua aparte)
4. Cuerpo: 3 módulos distintos (bloques 1, 3 y 4) + el módulo repetible (bloque 5 en adelante)
5. **Módulo especial** (siempre es el **bloque 2** del cuerpo)
6. Cola

Cómo se usa en el juego: cabeza → bloque 1 (módulo A) → **bloque 2 (especial)** → bloque 3 (módulo B) → bloque 4 (módulo C) → bloques 5+ (módulo repetible) → cola.

## Plantilla maestra (pégala al principio de cada prompt)

```text
Create a GAME-READY SNAKE SKIN SPRITE SHEET for the mobile game "ZNAKEX", landscape 3:2 (2528x1696). Adjunta una ficha de skin ya aprobada (por ejemplo Solar o Cosmic) como referencia EXACTA de estilo, grosor de contorno, escala y disposición.

BACKGROUND: perfectly flat, uniform chroma-key green #00FF00 across the whole image. No gradient, no vignette, no texture, no floor shadow, no glow spilling onto the background, no green anywhere inside the artwork (use no #00FF00 or similar bright green in the snake). Every element is separated from the others by at least 80 px of pure green so it can be cut out cleanly.

STYLE: polished 2D mobile-game illustration, painterly cel-shading, consistent dark outline (about 6 px, same weight on every piece), soft rim light from the top-left, rich material detail. Everything strictly TOP-DOWN ORTHOGRAPHIC, as if the snake were seen from directly above. NO text, NO labels, NO numbers, NO watermark, NO frames, NO UI, NO color swatches.

LAYOUT (exact, so the pieces can be cut automatically):
CAMERA RULE (applies to EVERY piece EXCEPT the cover: head, tongue, body modules, special module, repeating module, tail and effects): the camera is directly ABOVE, a pure TOP-DOWN BIRD'S-EYE view (dorsal view). We only ever see the TOP of the head and the back of the body. NEVER draw a front view, face-on portrait, side profile, 3/4 view or perspective view for these pieces. The snout points straight UP; the two eyes sit on the left and right of the skull, seen from above.
THE COVER IS THE ONLY IMPACTFUL PIECE, NOT top-down. ROW 1, left: (1) LIBRARY COVER – one square 1:1 illustration (about 640x640): a dramatic, dynamic HERO portrait of the snake, striking 3/4 or front view, head reared up toward the viewer, ornaments/fangs clearly visible, body coiling behind, cinematic rim light, rich saturated color, its own glows and effects drawn in, maximum detail. Centered, generous padding. NO frame, NO border, NO card, NO rarity label, NO text: only the snake on the chroma-key background. ROW 1, right: (2) SKIN EFFECTS – a tidy 4x2 grid of 8 small isolated effect sprites (trail particles, sparks, embers, petals, motes, a small ring and an eye-glow flare), each about 110 px, drawn as solid opaque shapes in the skin's accent colors (no soft glows – glows are added in the game).
ROW 2, left: (3) HEAD – ONE single head in strict TOP-DOWN DORSAL VIEW (camera directly above the skull): the top of the head, snout pointing straight UP, eyes on the left and right of the skull, nostrils at the tip, mouth CLOSED, perfectly symmetrical, about 300 px wide. NOT a front view (no face looking at the viewer, no chin), NOT a side profile, NOT 3/4; no neck or body attached. Next to it (3b) the forked TONGUE alone, pointing up, about 40 px wide, in the skin's tongue color.
ROW 3: (4) BODY MODULES – three different body modules A, B and C side by side, all EXACTLY the same height (about 250 px) and about 290 px wide, lying horizontally, with straight flat left and right edges so they chain seamlessly one after another; A, B and C share the same palette but each has a different pattern arrangement.
ROW 4, left to right: (5) SPECIAL MODULE – same height and width as the body modules, horizontal, visibly more ornate (the signature piece of the skin: extra armor, glowing core, fins, jewels, etc.); (6) REPEATING MODULE – a plain, calm, seamlessly repeatable body module of the same size (this one is used for the whole rest of the body); (7) TAIL – tapering tail tip pointing RIGHT, same height at its base as the body modules, about 460 px long.

CONSISTENCY: identical scale for head, modules and tail; the body modules' thickness must match the tail base and be about 85% of the head width so head, body and tail join cleanly.
```

---

## Skin 1 · Vía gratuita · ESPECIAL — «Serpiente de Maíz» (Corn Snake)

Calidad **Especial**: 3–4 colores, patrón claro, un solo acento luminoso.

```text
[MASTER TEMPLATE]
SKIN: "CORN SERPENT" – harvest-festival corn snake. Palette: warm butter yellow #E8C24A, burnt orange #D9772B, deep brown #5A3418, cream #F3E2B0, small accents of dark red #9A2B1E. Body scales look like rows of corn kernels arranged in a diamond pattern; each module has a husk-leaf stripe down the middle in cream. Head: elongated, kernel-scaled, a small folded corn-husk collar behind the jaw, amber eyes with a subtle warm shine. Special module: a swollen corn-cob segment with visible plump kernels and two small husk leaves curling up at the sides. Tail: ends in a dried tuft of corn silk (golden threads) instead of a plain point. Cover: the head over a few coils on a nest of husks. Effects: falling kernels, husk shreds, golden motes, tiny orange sparks, warm ring, amber eye flare. Detail level: SPECIAL – clean shapes, moderate texture, one accent color, no ornament beyond the husk collar.
```

## Skin 2 · Vía gratuita · ESPECIAL — «Serpiente Farol» (Lantern Snake)

```text
[MASTER TEMPLATE]
SKIN: "LANTERN SERPENT" – a serpent that carries paper lanterns. Palette: midnight teal #1E4650, deep indigo #262C54, lantern gold #F2B84B, warm paper cream #F6E4B8, ember orange #E8752A. Body: dark teal scales with a row of soft glowing paper-lantern windows down the back (rounded rectangles filled with warm gold light), thin gold stitching between them. Head: smooth teal head with a small hanging paper lantern on a tiny hook above the snout, gold eyes. Special module: a bigger lantern segment – a ribbed paper lantern with a bright golden core and small tassels on both sides. Tail: ends in a little lantern tassel. Cover: hero portrait of the head reared up with the lantern glowing brightly beside it, coils below. Effects: rising sparks, floating lantern-paper flakes, gold motes, small round glow ring, warm eye flare. Detail level: SPECIAL – clean, lit windows as the only accent.
```

## Skin 3 · Pase de pago · MÍTICA — «Espantapájaros Encantado» (Haunted Scarecrow Serpent)

Calidad **Mítica**: 5–6 colores, texturas (tela, paja, costuras), varios acentos y adornos.

```text
[MASTER TEMPLATE]
SKIN: "HAUNTED SCARECROW SERPENT" – a patchwork serpent stitched from burlap and old cloth, alive by moonlight. Palette: burlap tan #B58B55, faded plum cloth #6B3A5A, mustard patch #D3A23B, straw yellow #F0D27A, thread black #1A1310, glowing pumpkin-orange #FF8A2A, small moon-cream #F4EBCF. Body modules: patched burlap with visible weave, coarse black cross-stitches, buttons, and small straw tufts escaping through tears; each module A, B, C has different patches and stitch arrangement. Head: a sackcloth scarecrow-snake head with stitched X-shaped seams, two glowing orange eyes stitched in like buttons, a tiny torn hat-brim crest and two black crow feathers behind the head. Special module: a chest patch with a glowing carved-pumpkin heart sewn in, orange light leaking through the stitches, straw exploding at both sides. Repeating module: calm burlap with simple cross-stitch. Tail: frayed straw bundle tied with twine. Cover: hero 3/4 portrait, head reared up with glowing eyes and crow feather, coils and straw below. Effects: straw wisps, crow feathers, orange embers, stitched-thread sparks, button glints, ring, eye flare. Detail level: MYTHIC – rich fabric and straw texture, layered patches, two glow accents (eyes and heart).
```

## Skin 4 · Pase de pago · MÍTICA — «Serpiente Bruja de la Luna» (Moonlit Witch Serpent)

```text
[MASTER TEMPLATE]
SKIN: "MOONLIT WITCH SERPENT" – an elegant witch serpent of velvet and starlight. Palette: deep violet velvet #3A1F5C, midnight blue #1B2350, silver #C9D2E6, moon-cream #F4EBCF, magenta accent #B84AC9, tiny gold #E8C24A. Body modules: dark velvet scales with fine silver moon-phase embroidery (crescents, full moons) and scattered star dots; modules A, B, C have different moon-phase sequences and sweeping silver filigree. Head: sleek head with a curved witch-hat-shaped crest and a small silver crescent between the eyes, magenta glowing eyes with long lashes-like scale ridges. Special module: a large luminous full-moon medallion set in a silver filigree ring, with tiny stars orbiting and a violet halo. Repeating module: calm velvet with a single thin silver line and few stars. Tail: ends in a silver crescent-shaped spike with a dangling star charm. Cover: head with the moon behind it, coils with embroidered stars. Effects: falling stars, moon-dust motes, violet sparks, silver ring, crescent sparkle, eye flare. Detail level: MYTHIC – embroidered silver detail, layered velvet shading, two glow accents (eyes and moon medallion).
```

## Skin 5 · Pase de pago · LEGENDARIA — «Emperador Calabaza» (Jack-o'-Lantern Emperor)

Calidad **Legendaria**: la más detallada de todas: armadura por capas, filigrana de oro, fuego interno y adornos en cabeza y cola.

```text
[MASTER TEMPLATE]
SKIN: "JACK-O'-LANTERN EMPEROR" – the sovereign of Harvest Moon Hollow: an armored obsidian serpent whose scales are cracked open by molten pumpkin fire. Palette: obsidian black #14100F, charred umber #3A2418, molten orange #FF7A1E, hot yellow core #FFD24A, ember red #C9361A, antique gold #D6A83D, bone-cream #F1E4C0, tiny violet shadow #3B2350. Body modules: overlapping obsidian plates with glowing molten cracks in the shape of carved jack-o'-lantern grins and vines; gold filigree along every plate edge; modules A, B, C each carry a different carved face and crack network. Head: a regal, heavily detailed head wearing a crown of curling vines and small pumpkins with gold leaf spikes, a carved pumpkin-face mask over the snout with fire glowing inside the eye sockets, molten orange eyes, gold horn-like ridges. Special module: the most spectacular piece – a full carved jack-o'-lantern chest plate in gold and obsidian, blazing fire inside the grin, small flames licking out at the sides, gold chains and tiny bones hanging. Repeating module: obsidian plates with subtle molten seams and thin gold lines. Tail: a thorned obsidian tail tip with a fiery pumpkin-stem flame at the end and gold rings. Cover: dramatic hero 3/4 portrait, head reared up with crown, fiery eyes and smoke, coils with glowing cracks. Effects: flame licks, rising embers, molten droplets, gold sparks, smoke puffs, fire ring, eye-flare. Detail level: LEGENDARY – maximum: layered armor, gold filigree, internal fire, ornate crown and tail, and at least four different glow accents.
```

---

## Consejos para que salga bien

- Si el generador no respeta el verde, añade al final: `Background must be exactly RGB(0,255,0), flat, with no other tone.`
- Si mezcla las piezas: genera dos hojas por skin, `ROW 1–2` (portada, efectos, cabeza) y `ROW 3–4` (cuerpo, especial, cola).
- Si el módulo sale con la altura distinta, pídelo así: `all body modules exactly 250 px tall, same as the tail base`.
- Cuando tengas las hojas, súbelas al repo (carpeta `SKINS/`) con el nombre de la skin y avísame: las recorto y las añado.

## Proporciones en el juego (v0.6)

La serpiente se dibuja por casillas: cabeza (1) + módulo especial (2) + módulos A, B, C en ciclo (1 cada uno) + cola (1). Al recortar, el grosor real del cuerpo se toma del **módulo repetible**, y los módulos A/B/C se escalan a ese mismo grosor (en las hojas actuales salen dibujados más grandes). Para futuras hojas, si puedes, añade al final del prompt:

```text
All body modules A, B, C, the special module, the repeating module and the tail base share EXACTLY the same body thickness. Modules A, B and C are about 1.3x as long as they are thick; the special module is about 2.6x as long as it is thick; the tail is short, about 3x as long as it is thick at its base.
```

No hace falta generar módulos de giro: el juego los crea doblando los propios módulos de cada skin.
