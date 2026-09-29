# ZNAKEX — Prompts de audio (versión mínima)

Solo **17 efectos + 3 músicas** (más 4 ambientes opcionales). El resto de sonidos los saca el código de estos mismos archivos cambiando el tono, la velocidad, el volumen o filtrándolos, y encadenándolos.

Formato de entrega: `.ogg` (o `.mp3`/`.wav`, yo convierto). Efectos en mono, sin silencio al inicio. Música y ambientes en estéreo, en loop sin corte audible. Van en `demo/audio/` con el nombre indicado.

## Bloque de estilo (pégalo al final de cada prompt)

```text
STYLE: ZNAKEX – "Translucent Forest Relic": warm, organic, handcrafted. Wood, stone, clay, bamboo, soft bells, leaves and breath; ancient-relic feeling, slightly mystical. Clean mobile-game mix, no harsh highs, no distortion, no vocals, no speech. Short, satisfying, readable on phone speakers.
```

## Efectos (17)

| Archivo | Prompt (+ estilo) | Duración | Lo reutilizo para |
| --- | --- | --- | --- |
| ui_tap | Soft wooden tap with a tiny stone click, gentle button press | 0.15 s | Todos los botones, volver (más grave), interruptores, elegir/equipar skin, "bloqueado" (muy grave), giro, tic de la ruleta |
| ui_open | Gentle stone panel sliding with a soft airy whoosh | 0.4 s | Abrir/cerrar paneles (al revés), cambio de pantalla, fin de boost |
| coin | Single worn gold coin clink on stone, bright | 0.3 s | Monedas ganadas (varias seguidas con tonos al azar), gasto (más grave), compra, montón grande |
| reward_chime | Warm rising three-note bell chime with a small sparkle tail | 0.9 s | Reclamar, misión, racha, logro, pase, desbloqueos, anuncio recompensado, **las 3 estrellas** (mismo sonido subiendo de tono) |
| eat_red | Small juicy "pop" bite with a soft bell sparkle, pleasant when heard 100 times | 0.25 s | Orbe rojo con variación de tono; **combo** subiendo un semitono por orbe; orbe que aparece (suave) |
| eat_gold | Big golden orb chomp with a shimmering swoosh and a rising whoosh of speed | 0.8 s | Orbe dorado y recoger la estrella dorada (más agudo y con eco) |
| boost_loop | Light fast wind with a subtle golden shimmer, seamless loop | 3 s loop | Velocidad x2 y estrella dorada (más rápido y brillante) |
| die_hit | Dull stone impact with a short low thud and a muffled crunch | 0.6 s | Pared, cuerpo, pinchos y deshacerse en hojas |
| die_liquid | Splash plus bubbling gulp | 0.9 s | Agua y lava (filtrado más grave y caliente) |
| countdown_tick | Wooden block tick, clean | 0.2 s | 3, 2, 1; el "¡YA!" es el mismo sonido más agudo y doble |
| item_pick | Soft magical pickup: bell plus airy whoosh | 0.6 s | Imán, portal, escudo (cada uno con tono y filtro distinto), y el zumbido del imán activo en bucle |
| shield_break | Bubble shell shattering into glassy shards with a low thump | 1.0 s | Rotura del escudo; el primer golpe es el mismo recortado y más agudo |
| portal_whoosh | Swirling airy vortex whoosh ending in a soft landing thud | 1.0 s | Portales del mapa y portal de regreso |
| alert_pulse | Low soft pulsing alarm, two throbs, not annoying | 1.0 s | Aviso rojo de obstáculos (repetido 5 s), cambio de mapa (más agudo) |
| map_change | Stone blocks grinding and sliding, deep rumble with a rising alert chime | 2.0 s | Cambio de obstáculos de los niveles 5 y 10 |
| level_win | Triumphant short fanfare with bells, wood flute and soft drums | 3 s | Victoria, guardián (con capa grave), récord nuevo, mapa desbloqueado |
| level_fail | Descending three-note wooden marimba, gentle not harsh | 1.5 s | Nivel fallido, sin anuncio, fin del duelo perdido |

Lo que sale del código sin archivo propio: revivir (sube de tono `reward_chime` + `boost_loop` corto), cofre y racha del día 7 (`coin` en cascada + `reward_chime`), ruleta (`ui_tap` acelerando y frenando), hielo, barro y viento (ruido filtrado sintetizado), crecimiento y lengua (sin sonido).

## Música (3, en loop, sin voces)

| Archivo | Prompt (+ estilo) | Duración | Se usa en |
| --- | --- | --- | --- |
| mus_menu | Warm mystical forest theme, slow, soft wood flute melody, nylon guitar arpeggio, distant soft frame drums, gentle pads, calm and inviting, 80 BPM, seamless loop | 90 s | Menús, tienda, mapas, misiones, pase |
| mus_play | Steady focused groove for gameplay, wooden percussion, pizzicato strings, kalimba, light and driving, subtle and not tiring, 105 BPM, seamless loop | 90 s | Historia, Clásico y tutorial |
| mus_intense | Fast energetic tribal drums, golden shimmering bells, driving bass drum and low plucked strings, exciting and tense, 135 BPM, seamless loop | 60 s | Orbes Frenéticos, Duelo, niveles guardián (5 y 10), temporada |

## Ambientes (4, opcionales, suenan muy bajo debajo de la música)

Cada mapa usa el de su familia; si no los generas, el juego funciona igual.

| Archivo | Prompt (+ estilo, sin melodía) | Duración | Mapas |
| --- | --- | --- | --- |
| amb_forest | Gentle jungle and forest ambience: soft insects, distant birds, rustling leaves, faint stream | 40 s loop | 1, 2, 3, 8, 13 |
| amb_wind | Dry open wind with sand hiss and faint distant chimes | 40 s loop | 4, 5, 10, 14, 15 |
| amb_water_ice | Cold airy hum, slow water drips, glassy resonance and faint icy wind | 40 s loop | 6, 7, 11 |
| amb_fire_stone | Low stone rumble, bubbling lava crackle and slow mechanical ticks | 40 s loop | 9, 12, 16 |

## Orden

1. Los 17 efectos y `mus_menu` + `mus_play` (19 archivos): ya suena completo.
2. `mus_intense` cuando estén el guardián y la temporada.
3. Los ambientes al final, si sobra tiempo.
