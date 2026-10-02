# ZNAKEX — Prompts de audio v2 (30 efectos + música por modo)

Sustituye a la versión anterior. La biblioteca queda en **30 efectos** (los que más se usan) y **6 temas de música** (uno por modo de juego, más menú y temporada). El juego ya tiene el motor de audio conectado: cuando subas los archivos a `demo/assets/audio/` con **exactamente estos nombres** (`.ogg` o `.mp3`), suenan solos.

Formato: efectos en mono, sin silencio al principio, normalizados a −3 dB. Música en estéreo, en bucle sin corte audible, −14 LUFS.

## Bloque de estilo (pégalo al final de cada prompt)

```text
STYLE: ZNAKEX – "Translucent Forest Relic": warm, organic, handcrafted. Wood, stone, clay, bamboo, soft bells, leaves and breath; ancient-relic feeling, slightly mystical. Clean mobile-game mix, punchy on phone speakers, no harsh highs, no distortion, no vocals, no speech.
```

## A. Los 30 efectos

| # | Archivo | Prompt (+ estilo) | Duración | Cuándo suena |
| --- | --- | --- | --- | --- |
| 1 | `ui_tap` | Soft wooden tap with a tiny stone click, gentle button press | 0.15 s | Cualquier botón |
| 2 | `ui_back` | Lower-pitched wooden tap, soft closing feel | 0.15 s | Volver |
| 3 | `ui_open` | Gentle stone panel sliding open with a soft airy whoosh | 0.4 s | Abrir paneles |
| 4 | `ui_locked` | Dull stone thud with a short muted rattle, "denied" | 0.3 s | Botón bloqueado |
| 5 | `coin` | Single worn gold coin clink on stone, bright | 0.3 s | Ganar / gastar monedas |
| 6 | `reward_chime` | Warm rising three-note bell chime with a small sparkle tail | 0.9 s | Recompensas, misiones, compras, logros |
| 7 | `eat_red` | Small juicy "pop" bite with a soft bell sparkle, pleasant when heard 100 times | 0.25 s | Orbe rojo (sube de tono con el combo) |
| 8 | `eat_gold` | Big golden orb chomp with a shimmering swoosh and a rising whoosh of speed | 0.8 s | Orbe dorado |
| 9 | `boost_loop` | Light fast wind with a subtle golden shimmer, seamless loop | 3 s loop | Mientras dura la velocidad x2 |
| 10 | `boost_end` | Wind slowing down with a soft descending shimmer | 0.6 s | Fin de la velocidad x2 |
| 11 | `turn` | Extremely subtle scale rustle when a snake turns | 0.08 s | Cada giro |
| 12 | `countdown_tick` | Wooden block tick, clean | 0.2 s | 3, 2, 1 |
| 13 | `countdown_go` | Stronger tick plus a rising bell, "GO" | 0.5 s | ¡YA! |
| 14 | `die_hit` | Dull stone impact with a low thud and a muffled crunch | 0.6 s | Muerte por muro, obstáculo, pinchos o cola |
| 15 | `die_liquid` | Splash plus bubbling gulp | 0.9 s | Muerte en agua, lava o ácido |
| 16 | `crumble` | Snake dissolving into leaves, dry rustle and falling dust | 1.2 s | Al rendirse / perder |
| 17 | `revive` | Vines weaving and a warm golden burst returning life | 1.2 s | Revivir |
| 18 | `level_win` | Triumphant short fanfare with bells, wood flute and soft drums | 3 s | Nivel superado |
| 19 | `level_fail` | Descending three-note wooden marimba, gentle not harsh | 1.5 s | Nivel fallido / derrota |
| 20 | `star_pop` | Glassy star popping in, bright bell with a soft sparkle | 0.6 s | Cada estrella del resultado (sube de tono) |
| 21 | `item_spawn` | Small leaf swirl and soft chime, item appearing | 0.5 s | Aparece un objeto |
| 22 | `item_pick` | Soft magical pickup: bell plus airy whoosh | 0.6 s | Recoger un objeto |
| 23 | `shield_break` | Bubble shell shattering into glassy shards with a low thump | 1.0 s | Campo de fuerza rompe un obstáculo |
| 24 | `magnet_loop` | Soft pulsing magnetic hum with tiny inward sparkles, seamless loop | 3 s loop | Imán activo |
| 25 | `portal_whoosh` | Swirling airy vortex whoosh ending in a soft landing thud | 1.0 s | Portal / vuelta al inicio |
| 26 | `star_loop` | Radiant fast shimmering loop with airy speed wind, seamless | 4 s loop | Estrella dorada activa |
| 27 | `alert_pulse` | Low soft pulsing alarm, one throb, not annoying | 1.0 s | Aviso rojo de obstáculos |
| 28 | `map_change` | Stone blocks grinding and sliding, deep rumble with a rising alert chime | 2.0 s | Niveles 5 y 10: cambia el mapa |
| 29 | `mission_done` | Wooden checkmark tick plus a bright small chime | 0.6 s | Misión lista / logro |
| 30 | `new_record` | Sparkling rising arpeggio with a shimmer tail | 1.5 s | Nuevo récord |

Reutilizo por código (no necesitan archivo propio): guardián derrotado = `level_win` más grave; racha del día 7 y cofres = `coin` + `reward_chime`; ruleta = `ui_tap` acelerando; compra fallida = `ui_locked`.

## B. Música: un tema por modo (bucle, sin voces)

**Muy importante:** cuando el jugador come un orbe dorado la música se **acelera un 22 %** (y sube de tono). Pide temas con **pulso constante**, sin ritardandos ni pausas largas, y en una tonalidad que aguante subir ~3 semitonos.

| Archivo | Modo | Prompt (+ estilo) | Duración |
| --- | --- | --- | --- |
| `mus_menu` | Menús, tienda, misiones | Warm mystical forest theme, slow, soft wood flute melody, nylon guitar arpeggio, distant soft frame drums, gentle pads, calm and inviting, steady pulse 80 BPM, seamless loop | 90 s |
| `mus_story` | Historia (16 mapas) | Adventurous exploration theme, bamboo flute lead, marimba and kalimba ostinato, hand drums and shakers, warm bass, curious and driving but relaxed, steady pulse 104 BPM, seamless loop | 100 s |
| `mus_classic` | Clásico | Focused hypnotic groove, wooden percussion, pizzicato strings, soft mallet bass, minimal melody that slowly builds, calm concentration, steady pulse 96 BPM, seamless loop | 90 s |
| `mus_frenzy` | Orbes Frenéticos | Fast energetic tribal drums, golden shimmering bells, driving bass drum and low plucked strings, exciting and joyful, steady pulse 138 BPM, seamless loop | 60 s |
| `mus_duel` | Duelo | Tense rivalry theme, low taiko-like drums, plucked dark strings, staccato cello pulses, dark but not scary, competitive, steady pulse 116 BPM, seamless loop | 75 s |
| `mus_season` | Temporada | Autumn harvest-moon festival theme, kalimba and acoustic guitar, warm fiddle-like strings, soft frame drum, slightly spooky-cozy, lanterns and fireflies mood, steady pulse 100 BPM, seamless loop | 90 s |

## C. Orden recomendado

1. Los 30 efectos (o al menos los 1–19) y `mus_menu` + `mus_story`.
2. `mus_classic`, `mus_frenzy`, `mus_duel`.
3. `mus_season`.

Los archivos que falten simplemente no suenan; no hay que tocar código.
