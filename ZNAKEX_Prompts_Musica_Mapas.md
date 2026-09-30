# ZNAKEX — Prompts de música: un tema por mapa del modo Historia

16 temas, uno por mapa, cada uno un **bucle de 15 segundos**. El juego ya está preparado: cuando subas un archivo a `demo/assets/audio/` con su nombre exacto (`mus_map01.ogg` … `mus_map16.ogg`, o `.mp3`), ese mapa lo usa. Mientras falte, suena el tema general de Historia (`mus_story`). La temporada sigue con `mus_season`.

## Cómo pedirlos para que el bucle no se note

- **Duración exacta de 15 s** y un número entero de compases: por eso cada prompt lleva un tempo concreto (80 BPM = 5 compases, 96 = 6, 112 = 7, 128 = 8, 144 = 9, todo en 4/4).
- **Sin intro, sin final y sin fundido**: empieza ya sonando y el último compás lleva al primero (misma armonía al principio y al final).
- **Pulso constante**: con el orbe dorado la música se acelera un 22 % y sube de tono; nada de ritardandos ni silencios.
- **Sin voces.** Estéreo, −14 LUFS.
- Si el generador no da 15 s exactos, pide 30 s y yo recorto el bucle en el punto justo (lo hago con `tools/build_audio.py`, que también iguala volúmenes).

## Bloque de estilo (pégalo al final de cada prompt)

```text
STYLE: ZNAKEX, a bold modern snake arcade game set in a mystical jungle-temple world. Punchy, catchy and energetic but not stressful, clean mobile-game mix that sounds good on phone speakers, clear melodic hook, tight low end, no harsh highs, no distortion, no vocals, no speech, no crowd. Exactly 15 seconds, seamless loop: no intro, no ending, no fade in or out, constant tempo, the last bar leads straight back into the first.
```

## Los 16 temas

### 1 · Emerald Jungle → `mus_map01`

```text
Upbeat jungle adventure loop, 112 BPM (7 bars of 4/4), bright marimba hook over bamboo flute, hand drums, shakers and a bouncy plucked bass, lush tropical and playful, the classic first-level feel. STYLE: ZNAKEX, a bold modern snake arcade game set in a mystical jungle-temple world. Punchy, catchy and energetic but not stressful, clean mobile-game mix that sounds good on phone speakers, clear melodic hook, tight low end, no harsh highs, no distortion, no vocals, no speech, no crowd. Exactly 15 seconds, seamless loop: no intro, no ending, no fade in or out, constant tempo, the last bar leads straight back into the first.
```

### 2 · Sakura Garden → `mus_map02`

```text
Graceful Japanese garden loop, 96 BPM (6 bars of 4/4), koto and shakuhachi melody over soft taiko pulses, light wind chimes and a warm pad, pentatonic, elegant and flowing with gentle momentum. STYLE: ZNAKEX, a bold modern snake arcade game set in a mystical jungle-temple world. Punchy, catchy and energetic but not stressful, clean mobile-game mix that sounds good on phone speakers, clear melodic hook, tight low end, no harsh highs, no distortion, no vocals, no speech, no crowd. Exactly 15 seconds, seamless loop: no intro, no ending, no fade in or out, constant tempo, the last bar leads straight back into the first.
```

### 3 · Lost Greek Ruins → `mus_map03`

```text
Heroic ancient Greek loop, 112 BPM (7 bars of 4/4), lyre and bouzouki arpeggios, bright brass stabs, marching frame drums and pizzicato strings, noble and adventurous, sunlit marble temples. STYLE: ZNAKEX, a bold modern snake arcade game set in a mystical jungle-temple world. Punchy, catchy and energetic but not stressful, clean mobile-game mix that sounds good on phone speakers, clear melodic hook, tight low end, no harsh highs, no distortion, no vocals, no speech, no crowd. Exactly 15 seconds, seamless loop: no intro, no ending, no fade in or out, constant tempo, the last bar leads straight back into the first.
```

### 4 · Mushroom Grove → `mus_map04`

```text
Whimsical enchanted forest loop, 96 BPM (6 bars of 4/4), bubbly pizzicato and celesta melody, bassoon bass line, soft woodblocks and tiny glockenspiel sparkles, quirky, magical and a little mischievous. STYLE: ZNAKEX, a bold modern snake arcade game set in a mystical jungle-temple world. Punchy, catchy and energetic but not stressful, clean mobile-game mix that sounds good on phone speakers, clear melodic hook, tight low end, no harsh highs, no distortion, no vocals, no speech, no crowd. Exactly 15 seconds, seamless loop: no intro, no ending, no fade in or out, constant tempo, the last bar leads straight back into the first.
```

### 5 · Desert Tombs → `mus_map05`

```text
Mysterious desert tomb loop, 112 BPM (7 bars of 4/4), oud and ney flute melody in a Middle Eastern scale, darbuka and riq groove, deep frame drum on the downbeat, dusty and adventurous with a hint of danger. STYLE: ZNAKEX, a bold modern snake arcade game set in a mystical jungle-temple world. Punchy, catchy and energetic but not stressful, clean mobile-game mix that sounds good on phone speakers, clear melodic hook, tight low end, no harsh highs, no distortion, no vocals, no speech, no crowd. Exactly 15 seconds, seamless loop: no intro, no ending, no fade in or out, constant tempo, the last bar leads straight back into the first.
```

### 6 · Toxic Wastes → `mus_map06`

```text
Bubbling toxic swamp loop, 128 BPM (8 bars of 4/4), squelchy acid synth bass, wobbling bubbly arpeggio, punchy electronic drums with a light industrial clank, green and slimy but fun and catchy. STYLE: ZNAKEX, a bold modern snake arcade game set in a mystical jungle-temple world. Punchy, catchy and energetic but not stressful, clean mobile-game mix that sounds good on phone speakers, clear melodic hook, tight low end, no harsh highs, no distortion, no vocals, no speech, no crowd. Exactly 15 seconds, seamless loop: no intro, no ending, no fade in or out, constant tempo, the last bar leads straight back into the first.
```

### 7 · Frozen Tundra → `mus_map07`

```text
Crisp icy tundra loop, 96 BPM (6 bars of 4/4), glassy music-box and glockenspiel melody, shimmering string ostinato, soft sleigh-bell shaker and a deep warm bass, cold, bright and sparkling with steady motion. STYLE: ZNAKEX, a bold modern snake arcade game set in a mystical jungle-temple world. Punchy, catchy and energetic but not stressful, clean mobile-game mix that sounds good on phone speakers, clear melodic hook, tight low end, no harsh highs, no distortion, no vocals, no speech, no crowd. Exactly 15 seconds, seamless loop: no intro, no ending, no fade in or out, constant tempo, the last bar leads straight back into the first.
```

### 8 · Crystal Caves → `mus_map08`

```text
Glittering crystal cave loop, 112 BPM (7 bars of 4/4), echoing mallet and kalimba arpeggios, crystalline bell lead, deep sub bass pulse and soft rimshot groove, mysterious and wondrous, light reflecting on gems. STYLE: ZNAKEX, a bold modern snake arcade game set in a mystical jungle-temple world. Punchy, catchy and energetic but not stressful, clean mobile-game mix that sounds good on phone speakers, clear melodic hook, tight low end, no harsh highs, no distortion, no vocals, no speech, no crowd. Exactly 15 seconds, seamless loop: no intro, no ending, no fade in or out, constant tempo, the last bar leads straight back into the first.
```

### 9 · Sunken Atlantis → `mus_map09`

```text
Underwater Atlantis loop, 96 BPM (6 bars of 4/4), flowing harp and vibraphone arpeggios, warm synth pad like moving water, soft dub bass and gentle brushed percussion, dreamy, aquatic and hypnotic but always moving. STYLE: ZNAKEX, a bold modern snake arcade game set in a mystical jungle-temple world. Punchy, catchy and energetic but not stressful, clean mobile-game mix that sounds good on phone speakers, clear melodic hook, tight low end, no harsh highs, no distortion, no vocals, no speech, no crowd. Exactly 15 seconds, seamless loop: no intro, no ending, no fade in or out, constant tempo, the last bar leads straight back into the first.
```

### 10 · Volcano Core → `mus_map10`

```text
Blazing volcano loop, 128 BPM (8 bars of 4/4), pounding taiko and tribal toms, low brass riff, fiery staccato strings and a rumbling bass, intense and heroic, lava and heat, high energy but not chaotic. STYLE: ZNAKEX, a bold modern snake arcade game set in a mystical jungle-temple world. Punchy, catchy and energetic but not stressful, clean mobile-game mix that sounds good on phone speakers, clear melodic hook, tight low end, no harsh highs, no distortion, no vocals, no speech, no crowd. Exactly 15 seconds, seamless loop: no intro, no ending, no fade in or out, constant tempo, the last bar leads straight back into the first.
```

### 11 · Pirate Cove → `mus_map11`

```text
Swashbuckling pirate loop, 112 BPM (7 bars of 4/4), accordion and fiddle sea-shanty melody, plucked banjo, stomping bass drum and tambourine, cheeky and adventurous, treasure-hunting fun. STYLE: ZNAKEX, a bold modern snake arcade game set in a mystical jungle-temple world. Punchy, catchy and energetic but not stressful, clean mobile-game mix that sounds good on phone speakers, clear melodic hook, tight low end, no harsh highs, no distortion, no vocals, no speech, no crowd. Exactly 15 seconds, seamless loop: no intro, no ending, no fade in or out, constant tempo, the last bar leads straight back into the first.
```

### 12 · Medieval Castle → `mus_map12`

```text
Medieval castle quest loop, 112 BPM (7 bars of 4/4), lute and recorder melody, marching snare and field drums, bold horn calls, pizzicato bass, brave knightly adventure with a dungeon edge. STYLE: ZNAKEX, a bold modern snake arcade game set in a mystical jungle-temple world. Punchy, catchy and energetic but not stressful, clean mobile-game mix that sounds good on phone speakers, clear melodic hook, tight low end, no harsh highs, no distortion, no vocals, no speech, no crowd. Exactly 15 seconds, seamless loop: no intro, no ending, no fade in or out, constant tempo, the last bar leads straight back into the first.
```

### 13 · Sky Gardens → `mus_map13`

```text
Floating sky gardens loop, 96 BPM (6 bars of 4/4), airy pan flute and harp melody, light plucked strings, soft claps and a bright ukulele strum, open, breezy and uplifting, islands above the clouds. STYLE: ZNAKEX, a bold modern snake arcade game set in a mystical jungle-temple world. Punchy, catchy and energetic but not stressful, clean mobile-game mix that sounds good on phone speakers, clear melodic hook, tight low end, no harsh highs, no distortion, no vocals, no speech, no crowd. Exactly 15 seconds, seamless loop: no intro, no ending, no fade in or out, constant tempo, the last bar leads straight back into the first.
```

### 14 · Moon Temple → `mus_map14`

```text
Moonlit temple loop, 96 BPM (6 bars of 4/4), mystical gamelan and bell melody, deep gongs on the downbeat, soft tabla groove and a silvery synth pad, night-time, ritual and hypnotic, calm but driving. STYLE: ZNAKEX, a bold modern snake arcade game set in a mystical jungle-temple world. Punchy, catchy and energetic but not stressful, clean mobile-game mix that sounds good on phone speakers, clear melodic hook, tight low end, no harsh highs, no distortion, no vocals, no speech, no crowd. Exactly 15 seconds, seamless loop: no intro, no ending, no fade in or out, constant tempo, the last bar leads straight back into the first.
```

### 15 · Haunted Graveyard → `mus_map15`

```text
Spooky-fun graveyard loop, 112 BPM (7 bars of 4/4), harpsichord and theremin-like lead, walking pizzicato bass, xylophone skeleton rattles and a light swing drum groove, playful Halloween mischief, creepy but cute, never scary. STYLE: ZNAKEX, a bold modern snake arcade game set in a mystical jungle-temple world. Punchy, catchy and energetic but not stressful, clean mobile-game mix that sounds good on phone speakers, clear melodic hook, tight low end, no harsh highs, no distortion, no vocals, no speech, no crowd. Exactly 15 seconds, seamless loop: no intro, no ending, no fade in or out, constant tempo, the last bar leads straight back into the first.
```

### 16 · Cyber City → `mus_map16`

```text
Neon cyber city loop, 128 BPM (8 bars of 4/4), synthwave arpeggios, punchy electronic drums, pulsing sidechained bass and a bright synth lead hook, futuristic, fast and confident, the final-world energy. STYLE: ZNAKEX, a bold modern snake arcade game set in a mystical jungle-temple world. Punchy, catchy and energetic but not stressful, clean mobile-game mix that sounds good on phone speakers, clear melodic hook, tight low end, no harsh highs, no distortion, no vocals, no speech, no crowd. Exactly 15 seconds, seamless loop: no intro, no ending, no fade in or out, constant tempo, the last bar leads straight back into the first.
```

## Licencias

Antes de generar, revisa que la herramienta que uses te dé derechos de uso comercial con tu plan (como hicimos con los efectos). Con la música de Magnific te salió un aviso: guarda sus condiciones en `legal/` junto a las demás si la usas.
