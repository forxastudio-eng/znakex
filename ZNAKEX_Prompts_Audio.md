# ZNAKEX — Prompts de audio

Válidos para generadores de efectos y de música (ElevenLabs SFX, Stable Audio, Suno, Udio…). Cada prompt está en inglés, con duración, si es loop y el nombre de archivo que espero en `demo/audio/`.

Formato de entrega: efectos en `.ogg` (mono, 44,1 kHz, sin silencio al inicio, normalizados a −3 dB); música y ambientes en `.ogg` estéreo, loop sin corte audible, −14 LUFS aprox. Si el generador solo da `.mp3` o `.wav`, no pasa nada: yo lo convierto.

## Bloque de estilo (pégalo al final de cada prompt)

```text
STYLE: ZNAKEX – "Translucent Forest Relic": warm, organic, handcrafted. Wood, stone, clay, bamboo, soft bells, leaves and breath; ancient-relic feeling, slightly mystical. Clean mobile-game mix, no harsh highs, no distortion, no vocals, no speech, no reverb tail longer than stated. Short, satisfying, readable on phone speakers.
```

## A. Interfaz (efectos cortos)

| Archivo | Prompt (+ estilo) | Duración |
| --- | --- | --- |
| ui_tap | Soft wooden tap with a tiny stone click, gentle button press | 0.15 s |
| ui_back | Lower-pitched wooden tap, soft closing feel | 0.15 s |
| ui_open | Gentle stone panel sliding open with a soft airy whoosh | 0.4 s |
| ui_close | Same panel sliding closed, softer and lower | 0.35 s |
| ui_toggle_on / off | Small bamboo click rising / falling in pitch | 0.15 s |
| ui_slider | Very short soft tick, repeatable | 0.05 s |
| ui_locked | Dull stone thud with a short muted rattle, "denied" | 0.3 s |
| ui_unlock | Carved stone latch opening plus a warm chime | 0.8 s |
| ui_select_skin | Soft leather-and-scale rustle with a small bell | 0.4 s |
| ui_equip | Confident wooden clunk with a bright short chime | 0.5 s |
| ui_page | Leaves rustling sweep, screen change | 0.4 s |
| ui_toast | Small two-note glass-bell "ding", notification | 0.4 s |

## B. Monedas, tienda y recompensas

| Archivo | Prompt | Duración |
| --- | --- | --- |
| coin_1 | Single worn gold coin clink on stone | 0.3 s |
| coin_gain | 5 coins pouring into a leather pouch, satisfying, bright | 1.0 s |
| coin_big | Large coin pile cascade with a warm rising shimmer | 1.6 s |
| coin_spend | Coins leaving a pouch with a soft ka-ching, short | 0.5 s |
| buy_ok | Warm purchase confirmation, coin clink then two rising bell notes | 0.9 s |
| buy_fail | Soft low wooden "nope" with a muted coin drop | 0.5 s |
| chest_open | Wooden chest creaking open with magical golden shimmer | 1.5 s |
| claim | Bright short reward "pling" plus tiny sparkle burst | 0.7 s |
| star_1 / star_2 / star_3 | One star popping in: rising pitch each time, glassy bell plus soft sparkle (three files, same timbre, notes C-E-G) | 0.6 s |
| stars_full | All three stars completing: golden shimmering chord flourish | 1.4 s |
| ad_reward | Bright cheerful two-note reward jingle | 0.8 s |

## C. Partida: orbes y crecimiento

| Archivo | Prompt | Duración |
| --- | --- | --- |
| eat_red_1 … eat_red_4 | Small juicy "pop" bite with a soft bell sparkle, 4 slightly different variants (pitch and body), pleasant when heard 100 times | 0.25 s |
| eat_red_combo_1 … 5 | Same bite sound rising one semitone each step, 5 files, for chained orbs | 0.3 s |
| eat_gold | Big golden orb chomp with a shimmering swoosh and a rising whoosh of speed | 0.8 s |
| gold_boost_loop | Light fast wind with a subtle golden shimmer, loop while speed x2 is active | 3 s loop |
| gold_boost_end | Wind slowing down with a soft descending shimmer | 0.6 s |
| orb_spawn | Small leaf swirl and soft chime, orb appearing | 0.4 s |
| orb_expire | Quick fading flicker "fzzt", golden orb disappearing | 0.4 s |
| grow | Soft stretchy organic swell, snake getting bigger | 0.3 s |
| tongue | Quick snake tongue flick, tiny "tss" | 0.15 s |
| turn | Extremely subtle scale rustle when turning, one variant | 0.08 s |
| countdown_tick | Wooden block tick for 3, 2, 1 | 0.2 s |
| countdown_go | Stronger tick plus rising bell, "GO" | 0.5 s |
| obstacle_warning | Low soft pulsing alarm with two throbs, not annoying, for the red flash | 5 s (pulsing, fade in and out) |

## D. Muerte, revivir y resultados

| Archivo | Prompt | Duración |
| --- | --- | --- |
| die_wall | Dull stone impact with a short reverberating thud | 0.6 s |
| die_self | Muffled organic crunch and a low thump | 0.5 s |
| die_water | Splash plus bubbling gulp | 0.9 s |
| die_lava | Fiery hiss and bubbling pop | 0.9 s |
| die_spikes | Sharp wooden stake snap with a short pained hiss | 0.5 s |
| crumble | Snake dissolving into leaves, dry rustle and falling dust | 1.2 s |
| revive_offer | Soft hopeful rising pad with a single bell, revive prompt | 1.2 s |
| revive_ok | Vines weaving and a warm golden burst returning life | 1.2 s |
| level_fail | Descending three-note wooden marimba, gentle not harsh | 1.5 s |
| level_win | Triumphant short fanfare with bells, wood flute and soft drums | 3 s |
| guardian_win | Bigger fanfare with deep ceremonial drums and a choir-less pad swell | 4.5 s |
| new_record | Sparkling rising arpeggio with a shimmer tail | 1.5 s |
| map_unlock | Massive stone door grinding open with a warm reveal chord | 2.5 s |

## E. Objetos especiales y eventos

| Archivo | Prompt | Duración |
| --- | --- | --- |
| item_pick | Generic soft magical pickup: bell plus airy whoosh | 0.5 s |
| magnet_on | Low humming pull that rises, magnetic field turning on | 0.8 s |
| magnet_loop | Soft pulsing magnetic hum with tiny inward sparkles | 3 s loop |
| magnet_off | Hum winding down | 0.5 s |
| orb_pull | Tiny suction "pip" for each orb pulled in | 0.15 s |
| portal_pick | Swirling airy vortex sound with a deep wooden resonance | 0.9 s |
| portal_teleport | Whoosh-swirl into a short reverse-cymbal and soft landing thud | 1.0 s |
| portal_end | Soft vortex closing with a small bell | 0.5 s |
| shield_on | Bubble of energy forming, glassy hum with a faint hex crackle | 0.8 s |
| shield_hit_1 | Crystalline crack with a bright ping | 0.5 s |
| shield_break | Shell shattering into glass shards and a low thump | 1.0 s |
| star_pick | Epic golden orb pickup: choir-less shimmer, rising swell and heavy sparkle burst | 1.2 s |
| star_loop | Radiant fast shimmering loop with airy speed wind, invincible mode | 4 s loop |
| star_end | Shimmer fading with a descending sparkle | 0.8 s |
| immunity_flash | Bright white airy flash swoosh with a soft ring, 3 s of immunity starting | 0.7 s |
| map_change | Stone blocks grinding and sliding around, deep rumble plus a rising alert chime | 2.0 s |
| portal_pair | Paired portal hop: two quick vortex swishes, normal map portals | 0.6 s |
| ice_slide | Soft icy scrape, sliding | 0.5 s |
| mud_slow | Thick squelching slow drag | 0.5 s |
| wind_gust | Gust of wind with rustling leaves | 1.0 s |

## F. Retención

| Archivo | Prompt | Duración |
| --- | --- | --- |
| mission_done | Small checkmark: wooden tick plus bright chime | 0.6 s |
| mission_claim | Scroll unrolling then coins rain | 1.2 s |
| streak_day | Warm flame whoosh with a bell, daily streak stamp | 1.0 s |
| streak_day7 | Chest fanfare with golden flames and shimmering coin burst | 2.5 s |
| pass_tier | Ascending stone-step chime, tier unlocked | 0.9 s |
| pass_premium | Grand golden seal press with a deep drum and shimmering swell | 2.0 s |
| achievement | Medal ring: metallic bell with a short triumphant flourish | 1.6 s |
| spin_loop | Wooden wheel ratchet ticking, fast to slow | 4 s |
| spin_result | Big wheel stop thud then celebratory chime | 1.5 s |
| season_start | Epic seasonal reveal: deep horn, wind and rising shimmer | 3 s |

## G. Música (todo en loop, sin voces)

| Archivo | Prompt | Duración |
| --- | --- | --- |
| mus_menu | Warm mystical forest theme, slow, soft wood flute melody, nylon guitar arpeggio, distant soft frame drums, gentle pads, calm and inviting, 80 BPM, seamless loop | 90 s |
| mus_shop | Light playful marimba and kalimba, cozy and bright, 95 BPM | 60 s |
| mus_win | Short warm celebratory bed, marimba, bells, soft strings, 100 BPM | 12 s |
| mus_classic | Steady focused groove, wooden percussion, pizzicato strings, subtle synth-free, 105 BPM, intensity slowly rising | 90 s |
| mus_frenzy | Fast energetic tribal drums, golden shimmering bells, driving bass drum, 140 BPM, exciting | 60 s |
| mus_duel | Tense rivalry, low taiko-like drums, plucked strings, dark but not scary, 118 BPM | 75 s |
| mus_guardian | Boss theme, deep war drums, brass-like low horns, urgent ostinato strings, 130 BPM | 75 s |
| mus_tutorial | Gentle curious pizzicato and glockenspiel, light and friendly, 90 BPM | 45 s |
| mus_season | Autumn festival theme, warm accordion-free folk feel with kalimba, pumpkin-lantern mood, slightly spooky-cozy, 100 BPM | 90 s |

### Música y ambiente de los 16 mapas

Cada mapa lleva dos capas: un **ambiente** (`amb_XX`, 40 s, sin melodía, se mezcla bajo) y una **música** (`mus_map_XX`, 75 s, loop, tema suave para jugar). Pega el bloque de estilo al final.

| # | Mapa | Ambiente | Música (instrumentos y ánimo) |
| --- | --- | --- | --- |
| 01 | Emerald Jungle | Jungle birds, insects, distant stream | Bamboo flute, marimba, light hand drums; curious, 100 BPM |
| 02 | Mossy Ruins | Wind through stone, dripping moss, faint birds | Soft harp, cello drone, wooden chimes; mysterious, 90 BPM |
| 03 | Mangrove Swamp | Frogs, bubbling mud, misty hum | Low didgeridoo-like drone, plucked strings, dripping percussion; murky, 85 BPM |
| 04 | Desert Tombs | Hot wind, sand hiss, faint chimes | Oud-like plucked lute, frame drum, low pads; ancient, 95 BPM |
| 05 | Canyon Bridges | Deep wind, creaking ropes, distant echo | Acoustic guitar, low cello, slow tom drums; vast, 92 BPM |
| 06 | Frozen Tundra | Icy wind, crackling ice | Glockenspiel, soft strings, breathy flute; crystalline, 80 BPM |
| 07 | Crystal Caves | Glassy resonant hum, dripping water | Singing-bowl tones, celesta, soft synth-free pads; magical, 85 BPM |
| 08 | Mushroom Grove | Soft spore puffs, tiny bubbles, night insects | Kalimba, quirky pizzicato, bass marimba; whimsical, 105 BPM |
| 09 | Volcano Core | Low rumble, bubbling lava, hissing steam | Deep taiko, low brass drones, tense strings; intense, 120 BPM |
| 10 | Storm Peaks | Howling wind, distant thunder | Epic strings ostinato, big frame drums, horn; heroic, 125 BPM |
| 11 | Sunken Temple | Underwater muffled ambience, slow drips, echo | Deep harp, watery bells, cello; solemn, 80 BPM |
| 12 | Clockwork Ruins | Ticking gears, stone grinding, steam | Clockwork percussion, plucked bass, glockenspiel; rhythmic, 115 BPM |
| 13 | Shadow Forest | Night wind, owl, whispering leaves | Low flute, dark cello, soft heartbeat drum; eerie, 78 BPM |
| 14 | Bone Wastes | Dry wind, rattling bones, far howl | Bone-and-wood percussion, bowed low strings; desolate, 100 BPM |
| 15 | Sky Gardens | High wind, chimes, distant birds | Harp, bright flute, light strings; airy and uplifting, 95 BPM |
| 16 | Serpent Temple Core | Deep temple hum, lava crackle, whispering | Massive drums, low choir-less pads, urgent strings; final and grand, 125 BPM |

Además, para la **pantalla de carga** un `mus_splash` de 8 s (una entrada solemne con campana y viento, sin loop).

## H. Prioridad si quieres empezar poco a poco

1. **Imprescindibles (40):** A completo, `eat_red_1…4`, `eat_gold`, `gold_boost_loop`, `die_*`, `crumble`, `countdown_*`, `level_win`, `level_fail`, `coin_gain`, `mus_menu`, `mus_classic`.
2. **Objetos y eventos (E)** cuando estén los objetos especiales.
3. **Retención (F)** con misiones, racha y pase.
4. **Música por mapa y ambientes** al final.
