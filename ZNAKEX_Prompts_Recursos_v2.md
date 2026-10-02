# ZNAKEX — Prompts de recursos gráficos v2

Continúa la numeración de `ZNAKEX_Game_Brief.md` (P1–P24). Estos prompts cubren lo que falta para: objetos especiales, estrellas, tutorial, resumen al morir, misiones, racha diaria, pase y mapa de temporada, vista previa de skins, logros/estadísticas y ajustes nuevos.

Adjunta siempre el logo de ZNAKEX y una pantalla ya aprobada como referencia de estilo. `[STYLE BLOCK]` es el bloque común de la sección 9 del brief (el que empieza por "STYLE – TRANSLUCENT FOREST RELIC"); pégalo tal cual.

## Clasificación de rarezas (por belleza de la ficha)

Los nombres de rareza y sus colores los pone el código; **no deben aparecer dentro de ninguna imagen**.

| Rareza | Color en el juego | Skins |
| --- | --- | --- |
| Normal (12) | gris hueso | Básica ×10 colores, Guardián del Bosque, Escorpión del Desierto |
| Especial (9) | verde | Infernal, Samurái, Fantasma, Sakura, Tóxico, Caballero, Bruja Seta, Vampira, Ídolo de Brasas |
| Mítico (5) | azul | Quetzal de Obsidiana, Cristal, Cyber, Abisal, Umbra |
| Legendario (4) | dorado | Vacío Cósmico, Solar, Kitsune del Vacío, Dragón de Escarcha |

## Orden recomendado de generación

1. P25 objetos especiales (lo necesita el código ya). 2. P26 kit de iconos v3. 3. P27 tutorial. 4. P28 nivel superado y game over v2. 5. P29–P31 misiones, racha y pase. 6. P32–P34 temporada (mapa, nodos y skin). 7. P35 retratos de skins sin rareza. 8. P36 logros y estadísticas. 9. P37 ajustes v2. 10. P38 banners.

---

### P25 · Objetos especiales y efectos (imprescindible)

Fondo negro para mezcla aditiva; el campo de fuerza se dibuja blanco/neutro porque el juego lo tiñe con el color de cada skin.

```text
Create a POWER-UP sprite and VFX sheet for the mobile snake game "ZNAKEX", TRANSLUCENT FOREST RELIC style (painterly, warm natural light, worn carved-relic look). Flat pure black background #000000 for additive blending, organized grid, generous spacing, no labels, no text. Each item in its own square cell, readable at 64 px, top-down.

Row 1 – MAGNET ORB (pickup): carved amber-and-bronze sphere with a small horseshoe-shaped rune, soft honey-gold halo; 6-frame idle loop. Then its ACTIVE EFFECT: a thin translucent honey-gold ring (range indicator) with faint inward-flowing particles, 6-frame loop, ring centered and uniform so it can scale.
Row 2 – RETURN PORTAL ORB (pickup): teal-and-amber swirling vortex sphere with a tiny spiral rune; 6-frame idle loop. Then its ACTIVATION: a vortex opening around a point and closing (8 frames), plus a soft circular safe-zone glow (6-frame loop).
Row 3 – FORCE FIELD ORB (pickup): translucent bubble sphere with a hexagonal vine pattern and a white core glow; 6-frame idle loop. NEUTRAL WHITE/GREY ONLY (no color), because the game tints it per skin.
Row 4 – FORCE FIELD ON THE SNAKE: a large soft white hex-vine bubble shell (loop, 6 frames); HIT 1 (shell cracks with white sparks, 6 frames); HIT 2 (second crack and shatter into shards, 8 frames); shard particles (6 sizes). All neutral white/grey.
Row 5 – GOLDEN STAR ORB (rare pickup): radiant six-pointed golden star-orb with a rotating double ring and light rays, more spectacular than the normal golden orb; 6-frame idle loop; pickup burst (8 frames).
Row 6 – GOLDEN STAR ACTIVE: pure golden glow silhouette aura that follows a snake body (soft, no outline, no border), golden speed streaks, golden sparkle trail particles (loop, 8 frames); expiry warning flicker (4 frames).
Row 7 – PICKUP BURSTS: one burst per item (magnet honey-gold, portal teal, force field white, star gold), 6 frames each.
Row 8 – HUD ICONS: magnet, portal, force field (with 2 pips variant: 2/2, 1/2), star, each as a 128 px flat off-white #F2EFE6 distressed stencil icon, plus a circular countdown ring (full, 3/4, half, 1/4, empty) in amber #E8B04A.

RULES: identical lighting and scale across items, soft glows only (no hard outlines on effects), no watermark, no signature, no text.
```

### P26 · Kit de interfaz v3 (estrellas, misiones, racha, pase, logros, ajustes)

```text
Using the exact style of the attached ZNAKEX UI kit, create UI KIT v3 on a flat pure black background #000000, organized grid, generous spacing, no labels, no text.

Row 1 – STARS: empty star outline, filled honey-gold star, star with amber glow, big star "pop" burst (4 frames), 3-star row frame (empty) and 3-star row frame (filled).
Row 2 – MISSIONS: daily mission scroll, weekly mission scroll, checklist tick, claim-reward button blank (normal/pressed/disabled), progress bar (empty/fill), refresh icon.
Row 3 – DAILY STREAK: calendar tile for days 1 to 6 (coin pile growing), a big day-7 chest (closed and open), "collected" stamp, "today" amber highlight frame.
Row 4 – SEASON PASS: premium crown-less wax seal, locked reward slot, free reward slot, premium reward slot, big "claim" ribbon, pass progress bar with tiers.
Row 5 – ACHIEVEMENTS & STATS: medal frame (bronze, silver, gold), locked medal silhouette, bar-chart icon, orb counter icon, longest-snake icon, flame streak icon, map-completed icon.
Row 6 – SETTINGS: vibration icon, colorblind (eye with stripes) icon, low graphics (feather) icon, cloud save icon, controls icon, toggle switch on/off.
Row 7 – TIPS & TUTORIAL: lightbulb-leaf "tip" icon, swipe hand pointer (3 frames of a finger swiping), tap hand pointer (2 frames), floating-joystick hand icon, arrows d-pad hand icon, spotlight ring (soft, scalable), dotted arrow pointing right/up/down/left.
Row 8 – ADS & REWARDS: "x2" reward doubler button blank, "+1 coin" small chip, video-ad badge, coin burst (4 frames).

All icons flat monochrome worn off-white #F2EFE6 with distressed stencil texture (except stars and glows), same stroke weight, 128 px; amber #E8B04A only for active states. No gems.
```

### P27 · Tutorial guiado del nivel 0

```text
Design 3 vertical 9:16 (1080x1920) in-game TUTORIAL screens of the mobile snake game "ZNAKEX", the guided "LEVEL 0" on a small calm Emerald Jungle board of exactly 12x18 tiles. Use the attached logo and screens as exact style reference.
Screen 1 – CONTROLS: the serpent at the bottom, a swipe hand pointer with a dotted arrow, a frosted-glass speech panel at the bottom saying "Desliza para girar", a small step indicator "1/4".
Screen 2 – ORBS: a red orb and a golden orb highlighted by soft spotlight rings, panel text "Rojo: +1 · Dorado: +3 y velocidad x2", step "2/4".
Screen 3 – OBSTACLES: obstacles, water and spikes pulsing in red with the banner "EVITA LOS OBSTÁCULOS", panel text "El agua, la lava y los pinchos te eliminan", step "3/4".
Also show for a fourth step "4/4" a small panel "Recoge 5 orbes para terminar" with a progress bar 0/5.
[STYLE BLOCK]
```

### P28 · Nivel superado con estrellas y Game Over con resumen (rehace P6 y P7)

```text
Design 3 vertical 9:16 (1080x1920) overlays of "ZNAKEX", realistic in-game screenshots over a dimmed board. Use the attached logo and screens as exact style reference.
Screen 1 – LEVEL COMPLETE: big worn title "¡NIVEL SUPERADO!", three large honey-gold stars (2 filled, 1 empty) with small captions under each: "Objetivo", "Sin pinchos", "Orbe dorado"; coin reward "+120" with a coin pile; primary button "SIGUIENTE"; secondary "REPETIR"; a video-ad button "x2 MONEDAS" with the ad badge.
Screen 2 – LEVEL COMPLETE, all 3 stars, golden glow burst, new best time chip "NUEVO RÉCORD".
Screen 3 – GAME OVER SUMMARY over the board frozen and desaturated: title "¡CASI!", subtitle "Te faltaron 3 orbes", a tip chip with a lightbulb-leaf icon reading "El agua te elimina. Usa los puentes.", stats row (orbs eaten, time), revive options ("REVIVIR · VER ANUNCIO", "REVIVIR · 100"), a small chip "+1 MONEDA · VER ANUNCIO", button "REINTENTAR".
[STYLE BLOCK]
```

### P29 · Misiones diarias y semanales

```text
Design the MISSIONS screen of "ZNAKEX", vertical 9:16 (1080x1920). Two tabs at the top "DIARIAS" (active) and "SEMANALES". Three daily mission cards ("Come 3 orbes dorados" 2/3, "Supera 2 niveles sin morir" 1/2, "Juega un Duelo" 0/1) each with a progress bar, coin reward and a "RECLAMAR" button (one card completed and glowing), a countdown "Se renueva en 05:12:33", and a big weekly mission chest card at the bottom with a 4-step progress bar. Coin balance chip at the top right, back button top left.
[STYLE BLOCK]
```

### P30 · Racha de conexión de 7 días

```text
Design the DAILY STREAK popup screen of "ZNAKEX", vertical 9:16 (1080x1920). Title "RACHA DIARIA", subtitle "Vuelve cada día para ganar más". A row layout of 7 day tiles (days 1 to 6 in a 3x2 grid with growing coin piles, day 7 as a big wide chest tile with a golden glow); days 1-3 stamped as collected, day 4 highlighted as "HOY" with amber glow, days 5-7 locked. Flame icon with "Racha: 4 días". Button "RECLAMAR" and a small link "Ver anuncio para duplicar".
[STYLE BLOCK]
```

### P31 · Pase de temporada

```text
Design the SEASON PASS screen of "ZNAKEX", vertical 9:16 (1080x1920), for the season "HARVEST MOON HOLLOW". Top: season banner with the season name, countdown "Termina en 21 días", the exclusive snake portrait (attached). Middle: two horizontal reward tracks (FREE and PREMIUM) with 10 tiers each (coins, orbs, a golden star item, the exclusive skin at the last premium tier, and the season map), tier progress bar, current tier highlighted. Bottom: a big button "OBTENER PASE PREMIUM" with price text "4,99 €" and a bullet list "Skin exclusiva · Pack de monedas · Mapa de temporada". Locked premium slots have small lock icons.
[STYLE BLOCK]
```

### P32 · Mapa de temporada (ficha de módulos y arte)

Usa P10 con estos datos (cambia el tema cada mes). Después usa P21 para el arte de fondo con la misma escena.

```text
Create a game-ready MAP MODULE SHEET for the mobile snake game "ZNAKEX", SEASON MAP [HARVEST MOON HOLLOW], in the TRANSLUCENT FOREST RELIC style: stylized painterly 2D mobile game art, warm natural light from the top-left, clean readable shapes, subtle dark outlines on props only. Palette: [deep burnt orange, plum, warm umber, moon-cream, lantern gold, dark teal water].
Theme: [an autumn hollow under a huge harvest moon with pumpkins, hanging lanterns and twisted trees].
Signature component: [LANTERN GATES – paired glowing gates that teleport, and cursed pumpkin patches that are deadly].
(Then continue exactly as in P10: Row 1 floor x4, Row 2 border wall pieces, Row 3 obstacles 1x1/2x1/1x2/2x2, Row 4 signature component with all states, Row 5 decoration, Row 6 12x18 assembled preview.)
Add Row 7 – SEASON BADGE: a circular worn emblem of the season and a small ribbon.
RULES: same as P10; the season map must feel more special and richer than the standard maps but still keep the floor calm so orbs and snake stand out.
```

### P33 · Selección de niveles del mapa de temporada (20 niveles)

```text
Design the LEVEL SELECT screen for the SEASON MAP "HARVEST MOON HOLLOW" of "ZNAKEX", vertical 9:16 (1080x1920). The season key art as full background with a winding path that climbs from bottom to top holding 20 stone level nodes in two chapters; node 10 and node 20 are large "GUARDIAN" nodes with a skull-serpent emblem and red-orange glow; cleared nodes in amber, current node pulsing, locked nodes greyed with padlocks. Top: chapter chips "CAPÍTULO 1 · 1-10" and "CAPÍTULO 2 · 11-20", season timer chip, progress "7/20" and, at the very top of the path, the exclusive skin silhouette with a lock and the caption "Completa los 20 niveles".
[STYLE BLOCK]
```

### P34 · Ficha de la skin de temporada (mismo formato que las fichas de `SKINS/`)

Adjunta cualquier ficha existente para copiar exactamente la disposición y la vista.

```text
Create a professional 2D SNAKE SKIN SHEET for the mobile snake game "ZNAKEX", exactly the same layout, camera, scale and rendering style as the attached reference sheet. New skin: [HARVEST MOON SERPENT] – a season-exclusive serpent: body of burnt orange and plum scales with cream moon-crescent markings, pumpkin-stem crest on the head, small lantern-gold glowing eyes, warm ember glow between scales.
Include exactly what the reference sheet includes: the HEAD (large, detailed, mouth closed and mouth open with tongue), the repeating BODY module strip with the 3 varying first modules followed by the sequential repeating module, the special segments, the TAIL tip, the color palette swatches and a small in-game preview. Same detail level and outline weight as the reference.
DO NOT write any rarity, price, title text or labels anywhere on the sheet. No watermark, no signature.
```

### P35 · Retratos de skins para la tienda, sin rareza (sustituye a P22)

Las fichas actuales traen la rareza escrita en la imagen. Estos retratos sirven de portada y no llevan texto ni color de rareza; el juego los enmarca y etiqueta. Repetir para las 30 (las 10 básicas se pueden derivar de una sola).

```text
Square shop card portrait (1:1, 512x512) of the snake skin from the attached sheet, for the mobile snake game "ZNAKEX". Close-up 3/4 view of the head and the first coils, looking slightly toward the viewer, centered with even padding. Identical framing, size and light direction for every skin in the collection: soft warm key light from the top-left and a thin rim light. Background: the same neutral dark forest-green vignette #141B15 for every skin, with a very subtle radial glow behind the head in the skin's own accent color. Keep the skin's exact colors and design from the sheet. STRICTLY NO text, no rarity label, no rarity color frame, no border, no icons, no watermark.
```

### P36 · Logros y estadísticas

```text
Design 2 vertical 9:16 (1080x1920) screens of "ZNAKEX".
Screen 1 – ACHIEVEMENTS: 3-column grid of 12 medal cards (bronze, silver, gold frames; 6 unlocked with icons: first orb, 100 orbs, golden orb, 10 levels, first map cleared, no-damage level; 6 locked silhouettes), each with a small progress bar and title text such as "Primer bocado", "Cazador dorado", "Sin un rasguño"; header "LOGROS 6/12" and a share button.
Screen 2 – STATISTICS: a frosted glass list with icons: "Orbes comidos 1.284", "Mejor racha 9 niveles", "Serpiente más larga 47", "Mapas completados 3/16", "Niveles con 3 estrellas 21", "Duelos ganados 5", plus a Google Play Games cloud-save status row "Guardado en la nube · hace 2 min" with a cloud icon, and a button "COMPARTIR".
[STYLE BLOCK]
```

### P37 · Ajustes v2 (rehace P14)

```text
Design the SETTINGS screen of "ZNAKEX", vertical 9:16 (1080x1920), frosted glass sections: CONTROLES (deslizar, flechas, palanca, toques), SONIDO (música, efectos — sliders), JUEGO (vibración on/off, modo daltónico on/off with a small preview of red obstacles switching to striped shapes, gráficos bajos on/off with the caption "Menos partículas para móviles antiguos"), CUENTA (Google Play Games conectado, "Guardar en la nube", "Restaurar compras"), and version text "v0.4". Back button top left.
[STYLE BLOCK]
```

### P38 · Banners y avisos de partida

```text
Create a BANNER KIT for "ZNAKEX" on a flat pure black background #000000, organized grid, generous spacing, no text: 5 wide worn-relic ribbon/plaque frames (about 900x160), each empty in the center with room for one line of text: (1) danger red-orange for "EVITA LOS OBSTÁCULOS", (2) white-silver for "¡EL MAPA CAMBIA!" (with a soft white glow border), (3) honey-gold for "¡BOTÍN!" / "¡2 ESTRELLAS!", (4) teal for "OBJETO ACTIVO", (5) season purple-orange for "TEMPORADA". Also a soft full-screen white flash vignette (edges strong, center transparent) and a soft red pulse vignette. Distressed stencil texture, carved corners, amber accents only where indicated.
```
