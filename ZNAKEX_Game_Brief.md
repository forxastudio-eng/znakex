# ZNAKEX — Game Brief

Versión 1.0 · 2026-09-28 · Estado: diseño base aprobado, con preguntas abiertas en la sección 10.

---

## 1. Visión general

ZNAKEX es un Snake premium para Android (Google Play). Es gratis, no tiene anuncios forzados y se monetiza con monedas y con anuncios que el jugador elige ver.

| Campo | Definición |
| --- | --- |
| Género | Snake / arcade casual con progresión |
| Plataforma | Android, vertical 9:16 |
| Público | Casual y mid-core, 13+ (no dirigido a niños) |
| Dificultad global | Media: fácil de aprender, exigente al final de cada mapa |
| Estética | "Forest Relic" translúcida: bosque pintado, luz cálida natural, UI blanca desgastada de alto contraste |
| Moneda | Una sola: monedas |
| Anuncios | Solo con recompensa y opcionales: revivir y ruleta diaria |

### Pilares

1. **Una partida más:** niveles cortos (1–3 min), objetivo claro: recoger X orbes.
2. **Coleccionar:** 20 skins al lanzamiento, cada una valiosa y cara en monedas.
3. **Respeto al jugador:** nunca un anuncio sin que lo pida; la presión viene de la dificultad, no de interrupciones.
4. **Variedad:** 16 mapas, cada uno con un componente propio (lava, portales, hielo…).

### Estética translúcida (regla para todas las pantallas)

- Paneles de vidrio ahumado oscuro `#0E1410` al 40–50 %, con desenfoque solo detrás del panel.
- Siempre se ve la escena de fondo: el arte del bosque en los menús y la partida congelada en las pantallas de juego.
- Iconos y textos en blanco hueso `#F2EFE6` con textura desgastada tipo estarcido, igual que el logo.
- Acento ámbar `#E8B04A` para lo activo o seleccionado.
- Paleta del bosque: verde musgo `#1F2A1C`, oliva `#4A5A2E`, dorado miel `#F5D48A`, marrón corteza `#2B1E14`.
- Prohibido: neón, morado, plástico brillante.

---

## 2. Mecánicas núcleo

La serpiente avanza casilla a casilla sobre un tablero vertical de **12 columnas × 18 filas** (proporción 2:3), centrado en la pantalla.

### Tablero

- 12 × 18 = 216 casillas. En una pantalla de 1080 px de ancho, cada casilla mide ~84 px, el tablero ~1008 × 1512 px y quedan ~400 px para el HUD arriba y abajo.
- Cada mapa se arma con los módulos de su ficha (suelo, muros, obstáculos, peligros) colocados en esa cuadrícula. Los niveles se definen como datos (JSON), no como imágenes.

### Orbes

| Orbe | Crecimiento | Efecto | Puntos | Aparición |
| --- | --- | --- | --- | --- |
| Rojo (normal) | +1 segmento | Ninguno | 10 | Siempre hay 1 en el tablero |
| Dorado | +3 segmentos | Velocidad ×2 durante 4 s (propuesta) | 30 | 10–25 % de probabilidad al comer un rojo; desaparece a los 6 s |

El dorado cuenta como 1 orbe para el objetivo del nivel (propuesta): acelera el crecimiento y el riesgo, no el objetivo.

### Velocidad

- Velocidad base: de 4 casillas/s (mapa 1, nivel 1) a 7 casillas/s (mapa 16, nivel 10).
- Con orbe dorado se duplica temporalmente. Es el momento de más riesgo, el que genera más muertes y, por tanto, más revividas.

### Muerte

- Chocar con un muro, un obstáculo, el propio cuerpo, el bot (en Duelo) o un peligro activo (lava, pinchos, vacío).
- Al morir se congela la partida y aparece la pantalla translúcida de revivir.

### Revivir

- La serpiente conserva longitud, puntos y orbes del objetivo.
- La cabeza retrocede a la última casilla segura y tiene 3 s de invulnerabilidad (parpadeo + escudo de hojas).
- Máximo 2 revividas por partida: la 1.ª con anuncio **o** monedas; la 2.ª solo con monedas y al doble de precio.

### Controles

- Deslizar el dedo (por defecto).
- Botones de 4 direcciones (opcional en Ajustes).
- Búfer de 2 giros para que los giros rápidos no se pierdan.

---

## 3. Modos de juego

Cuatro modos: Historia es el eje de la progresión y de las monedas; los otros tres dan rejugabilidad.

| Modo | Objetivo | Reglas clave | Recompensa (propuesta) | Desbloqueo |
| --- | --- | --- | --- | --- |
| Historia | Recoger X orbes para pasar el nivel | 16 mapas × 10 niveles, componentes propios por mapa | Monedas por nivel superado la 1.ª vez (sección 5) | Desde el inicio |
| Clásico | Sobrevivir y sumar la mayor puntuación | Tablero 12×18 con muros exteriores, sin obstáculos, velocidad que sube cada 10 orbes, orbes rojos y dorados | 1 moneda por cada 5 orbes; récord y clasificación | Desde el inicio |
| Orbes Frenéticos | Máxima puntuación en 60 s | Solo orbes dorados, sin muros (se sale por un borde y se entra por el opuesto), siempre a velocidad ×2 | 1 moneda por cada 3 orbes | Al superar el mapa 1 |
| Duelo | Llegar primero a X orbes o hacer que el bot choque | 1 contra 1 frente a un bot en el mismo tablero; si una cabeza toca el cuerpo del otro, muere quien choca | Fácil 15 · Medio 30 · Difícil 60 monedas por victoria (máx. 5 victorias pagadas al día) | Al superar el mapa 2 |

### Duelo: dificultades del bot

| Dificultad | Rival | Velocidad del bot | Comportamiento | Orbes para ganar |
| --- | --- | --- | --- | --- |
| Fácil | Moss Worm | 80 % de la tuya | Va al orbe más cercano, gira tarde y a veces se equivoca | 10 |
| Medio | Rust Viper | 100 % | Ruta óptima al orbe, esquiva obstáculos, no te busca | 12 |
| Difícil | Crimson Fang | 100 % + usa dorados | Ruta óptima y te corta el paso cuando estás cerca | 15 |

En Duelo también se puede revivir (misma regla), lo que convierte las derrotas ajustadas en momentos de anuncio.

---

## 4. Modo Historia

16 mapas × 10 niveles = **160 niveles**. Cada mapa introduce un componente propio y lo combina con los anteriores. La dificultad sube dentro del mapa y baja un poco al empezar el siguiente (curva en sierra).

### Los 16 mapas (propuesta de nombres y componentes)

| # | Mapa | Componente propio | Cómo afecta al juego |
| --- | --- | --- | --- |
| 1 | Emerald Jungle | Troncos y puentes | Tutorial: obstáculos fijos, puentes que cruzan arroyos (el agua mata) |
| 2 | Mossy Ruins | Pilares y pasillos estrechos | Rutas en laberinto, poco espacio para girar |
| 3 | Mangrove Swamp | Barro | Casillas de barro que reducen la velocidad a la mitad |
| 4 | Desert Tombs | Arenas movedizas | Casillas que te frenan y absorben 1 segmento |
| 5 | Canyon Bridges | Puentes frágiles | Se derrumban 2 s después de cruzarlos: no puedes volver |
| 6 | Frozen Tundra | Hielo | En el hielo no puedes girar hasta salir de él |
| 7 | Crystal Caves | Portales | Pares de portales que te teletransportan |
| 8 | Mushroom Grove | Esporas | Hongos que sueltan esporas venenosas cada pocos segundos |
| 9 | Volcano Core | Lava | Ríos de lava fijos y grietas que entran en erupción por turnos |
| 10 | Storm Peaks | Viento | Rachas que te empujan 1 casilla hacia un lado |
| 11 | Sunken Temple | Trampas de pinchos | Pinchos que suben y bajan con ritmo |
| 12 | Clockwork Ruins | Muros móviles | Bloques que se desplazan en ciclos |
| 13 | Shadow Forest | Oscuridad | Solo ves un radio de 3 casillas alrededor de la cabeza |
| 14 | Bone Wastes | Cráneos rodantes | Obstáculos que patrullan una ruta fija |
| 15 | Sky Gardens | Vacío | Islas flotantes con huecos y portales entre ellas |
| 16 | Serpent Temple Core | Todo combinado | Mapa final con lava, portales, muros móviles y pinchos |

### Estructura de los 10 niveles de cada mapa

| Niveles | Rol | Qué cambia |
| --- | --- | --- |
| 1–3 | Presentación | Se enseña el componente nuevo con espacio para equivocarse |
| 4–6 | Combinación | El componente se mezcla con obstáculos de mapas anteriores |
| 7–9 | Presión | Menos espacio libre, más orbes objetivo, dorados en zonas peligrosas |
| 10 | Guardián | Nivel exigente: es donde más se revive |

### Parámetros por nivel (m = mapa 1–16, n = nivel 1–10)

- **Orbes objetivo** = redondear(10 + 0,8·(m−1) + 1,2·(n−1)): de 10 (nivel 1-1) a 33 (nivel 16-10).
- **Velocidad** = 4 + 0,15·(m−1) + 0,08·(n−1) casillas/s: de 4,0 a ~7,0.
- **Ocupación de obstáculos:** del 4 % de las casillas (nivel 1) al 14 % (nivel 10).
- **Probabilidad de orbe dorado:** del 10 % (nivel 1) al 25 % (nivel 10), cada vez más cerca de los peligros.

### Tasa objetivo de superación al primer intento (igual en los 16 mapas)

| Nivel | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Tramo | Presentación | Presentación | Presentación | Combinación | Combinación | Combinación | Presión | Presión | Presión | Guardián |
| Superación | 90 % | 85 % | 80 % | 72 % | 68 % | 62 % | 55 % | 50 % | 45 % | 35 % |

Desde el nivel 8, la mitad o más de los jugadores necesita revivir o repetir. El nivel 1 del mapa siguiente vuelve a ~85 %: el jugador respira antes de la nueva subida.

Estas tasas se miden con Firebase Analytics durante la prueba cerrada y se ajustan desde Remote Config sin publicar una actualización.

---

## 5. Economía

Todo el Modo Historia da ~16.000 monedas y las 20 skins cuestan ~110.000. Jugando se consiguen unas pocas skins; el resto se compra o se ahorra durante semanas.

### Recompensa por nivel superado (solo la primera vez)

Recompensa = base del tramo × (1 + 0,10·(mapa − 1)).

| Tramo | Base (mapa 1) | Mapa 8 | Mapa 16 |
| --- | --- | --- | --- |
| Niveles 1–3 | 40 | 68 | 100 |
| Niveles 4–6 | 55 | 94 | 138 |
| Niveles 7–10 | 75 | 128 | 188 |

Un mapa completo da de 585 monedas (mapa 1) a ~1.460 (mapa 16). Repetir un nivel ya superado da 5 monedas, para que no se pueda "granjear".

### Otras fuentes de monedas

- Clásico: 1 moneda por cada 5 orbes.
- Orbes Frenéticos: 1 moneda por cada 3 orbes.
- Duelo: 15 / 30 / 60 por victoria, máximo 5 victorias pagadas al día.
- Ruleta diaria: de 10 a 100 monedas (ver abajo).

### Revivir

| Revivida | Opción A | Opción B |
| --- | --- | --- |
| 1.ª de la partida | Ver anuncio | 100 monedas |
| 2.ª de la partida | — | 200 monedas |

100 monedas equivalen a ~2 niveles del mapa 1. Pagar duele, así que el anuncio es la opción natural, y quien se queda sin monedas acaba comprándolas.

### Precios de skins (20 al lanzamiento)

| Rareza | Cantidad | Precio (monedas) | Equivalente aprox. en dinero |
| --- | --- | --- | --- |
| Inicial (Básica verde) | 1 | Gratis | — |
| Básica en colores | 9 | 250–500 | — |
| Común | 5 | 1.500 | $0,99–1,99 |
| Rara | 6 | 3.000 | $2,99 |
| Épica | 4 | 6.000 | $4,99 |
| Legendaria | 3 | 12.000 | $9,99 |
| Mítica | 1 | 25.000 | $19,99 |

La skin Básica existe en 10 colores (verde gratis; roja, azul, amarilla, morada, naranja, rosa, turquesa, negra y blanca entre 250 y 500 monedas) para que cualquiera pueda personalizarse pronto. La lista real de skins y sus rarezas está en la sección 8. Hoy hay más míticas (3) de las que prevé esta tabla (1); ver pregunta abierta.

### Packs de monedas (compra dentro de la app)

| Pack | Monedas | Precio (USD) | Etiqueta |
| --- | --- | --- | --- |
| Puñado | 1.200 | 0,99 | — |
| Bolsa | 4.000 | 2,99 | — |
| Saco | 7.000 | 4,99 | — |
| Cofre | 15.000 | 9,99 | Popular |
| Arcón | 32.000 | 19,99 | — |
| Tesoro del templo | 90.000 | 49,99 | Mejor valor |
| Pack de inicio (una vez) | 5.000 + skin exclusiva | 1,99 | −80 % |

Google Play muestra cada precio en la moneda local; estos son los niveles de precio base.

### Ruleta de la serpiente (diaria)

- 1 giro gratis al día. Para **reclamar** el premio hay que ver un anuncio; si no se ve, el premio se pierde.
- 8 casillas (el 10 ocupa dos), solo monedas: 10 (30 %), 15 (25 %), 20 (18 %), 30 (12 %), 50 (8 %), 75 (5 %), 100 (2 %). Media: ~24 monedas por día.
- Premio medio bajo a propósito: es un hábito diario, no una fuente de skins.

---

## 6. Monetización y anuncios

Tres fuentes de ingreso: packs de monedas, anuncios con recompensa para revivir y anuncios con recompensa en la ruleta. No hay anuncios intersticiales ni banners.

| Fuente | Cuándo aparece | Regla |
| --- | --- | --- |
| Anuncio para revivir | Al morir, si el jugador pulsa "REVIVE" | 1 por partida; si no carga, solo se ofrece la opción con monedas |
| Anuncio de la ruleta | Al reclamar el premio diario | 1 al día |
| Packs de monedas | Tienda, y al intentar revivir o comprar sin monedas suficientes | Google Play Billing |
| Pack de inicio | Tras superar el nivel 1-3, una sola vez, durante 48 h | Oferta limitada |

### Momentos clave para vender monedas

1. Al revivir sin monedas suficientes: "Te faltan 40 monedas" + acceso directo a la tienda.
2. Al tocar una skin que no puedes pagar: barra "Tienes 4.200 / 6.000" + el pack que cubra la diferencia.
3. En el nivel 10 de cada mapa (Guardián), donde la tasa de muerte es mayor.

### Líneas rojas

- Nunca reproducir un anuncio sin que el jugador lo pida.
- Siempre visible "NO THANKS" en la pantalla de revivir.
- El juego debe poder completarse sin pagar: la dificultad empuja, no bloquea.

### Servicios

- AdMob (anuncios con recompensa).
- Google Play Billing (packs).
- Google Play Games (clasificaciones de Clásico y Frenético, logros, guardado en la nube).
- Firebase Analytics y Remote Config (tasas de superación y ajuste de precios).

---

## 7. Pantallas y assets

Con la visión actual desaparecen las gemas, el pase de batalla y el calendario de recompensas, y aparecen la ruleta, el Duelo y la selección de niveles.

| Pieza | Estado | Qué hacer | Prompt |
| --- | --- | --- | --- |
| Logo ZNAKEX | Hecho (`ZNAKEZ/logos/`) | — | — |
| Skins (fichas) | Hecho: 20 fichas (`SKINS/`) | Confirmar rarezas y pasar precios a monedas | P13 |
| Mapas (fichas) | Hecho: 16 fichas (`MAPAS/`) | Verificar que encajan en el tablero 12×18 y con los orbes | P10 |
| Orbes y efectos de juego | Pendiente | Orbe rojo, dorado, aparición, recogida | P11 |
| Menú principal | Rehacer: el logo dice "ZNAREX", tiene gemas, pase y eventos | Rehacer translúcido, sin gemas | P1 |
| Selección de modo | Pendiente | 4 modos | P2 |
| Selección de mapa | Rehacer: gemas, estrellas, 25 niveles | Rehacer translúcido, 16 mapas | P3 |
| Selección de nivel | Pendiente | 10 niveles por mapa | P4 |
| HUD de partida | Pendiente | Objetivo de orbes, tablero 12×18 | P5 |
| Revivir / Game Over | Pendiente | Translúcido, anuncio o monedas | P6 |
| Nivel superado | Pendiente | Solo monedas | P7 |
| Duelo (dificultad, HUD, resultado) | Pendiente | 3 pantallas | P8 |
| Bots del Duelo | Pendiente | 3 serpientes rivales | P12 |
| Ruleta diaria | Pendiente | Reclamar con anuncio | P9 |
| Tienda | Pendiente | Solo packs de monedas | P13 |
| Skins (pantalla) | Rehacer: gemas, texto "TARL" | Rehacer con precios en monedas | P13 |
| Pausa y Ajustes | Ajustes: corregir con edición (logo "ZNAFEX", opciones sobrantes); Pausa: pendiente | Ver "Correcciones" en la sección 9 | P14 |
| Kit de interfaz | Rehacer: tiene gema, corona y trofeo | Kit v2 con monedas, orbes, modos y peligros | P23 |
| Ficha de Google Play | Pendiente | Icono, imagen destacada, capturas | P15 |
| Pantalla de carga | Pendiente | Arte principal + logo + barra de carga | P16 |
| Tutorial | Pendiente | 4 pasos | P17 |
| Resultados de Clásico y Frenético | Pendiente | Récord y recompensa | P18 |
| Ventanas emergentes | Pendiente | 6 popups: sin monedas, comprar, compra hecha, sin anuncio, salir, sin conexión | P19 |
| Celebraciones | Pendiente | Skin desbloqueada, mapa completado, modo desbloqueado | P20 |
| Arte de fondo de mapas | Pendiente | 16 fondos verticales | P21 |
| Retratos de skins | Pendiente | 20 retratos cuadrados para la tienda | P22 |
| Arenas de Clásico, Frenético y Duelo | Pendiente | 3 fichas de módulos | P24 |
| Pase de batalla, gemas, recompensa diaria | Eliminado | No se usan | — |

---

## 8. Inventario del repositorio

Estado de `forxastudio-eng/znakex` a 2026-09-28.

| Carpeta | Contenido |
| --- | --- |
| `SKINS/` | 20 fichas de skins |
| `MAPAS/` | 16 fichas de mapas (nombres de archivo generados, sin renombrar) |
| `Pantallas/` | Menú principal, mapas, skins, ajustes y kit de interfaz (estética Forest Relic, versión con gemas) |
| `ZNAKEZ/logos/` | Logo blanco, logo negro y 2 variantes |

### Skins en el repositorio

La rareza sale del nombre del archivo; donde el nombre está cortado queda por confirmar.

| # | Skin | Rareza |
| --- | --- | --- |
| 02 | Inferno Serpent | Por confirmar |
| 03 | Frostbite Dragon | Por confirmar |
| 04 | Samurai Serpent | Por confirmar |
| 05 | Ghost Serpent | Épica |
| 06 | Cyber Snake | Legendaria |
| 07 | Forest Guardian | Por confirmar |
| 08 | Crystal Serpent | Por confirmar |
| 10 | Solar Serpent | Mítica |
| 11 | Toxic Mutant | Épica |
| 12 | Sakura Spirit | Épica |
| 13 | Desert Scorpion | Por confirmar |
| 14 | Cosmic Void | Mítica |
| 15 | Abyssal Serpent | Por confirmar |
| 16 | Knight Serpent | Por confirmar |
| 17 | Mushroom Witch | Por confirmar |
| 18 | Vampire Serpent | Por confirmar |
| — | Void Kitsune | Mítica |
| — | 3 fichas sin nombre (`create-a-professional-2d-…`) | Por confirmar |

---

## 9. Prompts para Nano Banana

Cada prompt funciona solo. Adjunta siempre el logo y una pantalla ya aprobada como referencia, y usa relación de aspecto 9:16 salvo que se indique otra.

### P1 · Menú principal (translúcido)

```text
Design the MAIN MENU of the mobile snake game "ZNAKEX", vertical 9:16 (1080x1920), realistic in-game UI mockup of a top-grossing Google Play game. Use the attached logo EXACTLY and the attached screens as style reference.

STYLE – TRANSLUCENT FOREST RELIC: painterly ancient forest, colossal trees and roots, warm golden-green god ray into a mossy clearing, floating pollen and fireflies; palette moss green #1F2A1C, olive #4A5A2E, amber #E8B04A, honey gold #F5D48A, bark brown #2B1E14. UI: frosted smoky dark glass panels (#0E1410 at 40-50% opacity, blur only behind panels, the forest always visible through them), thin worn white borders, small carved corner ornaments; all icons and text worn off-white #F2EFE6 with distressed stencil texture matching the logo; amber glow for active states. Single currency: coins. No neon, no purple, no glossy plastic.

LAYOUT: 1) Top bar: avatar with "LV 12" and thin amber XP bar; coin counter "4,250" with "+" button. 2) Logo "ZNAKEX" large in worn white, serpent eyes glowing amber, light ray behind it. 3) Center: the equipped snake (dark moss-green and bronze scales, amber eyes) coiled in the lit clearing, name tag "ANCIENT WARDEN", chevrons ‹ › to switch skins. 4) Selected mode pill "STORY · MAP 1 · LEVEL 4" with a small "CHANGE" link. 5) Huge translucent "PLAY" button with thick worn white border and warm amber glow. 6) Side icons: left "DAILY SPIN" (snake-shaped wheel icon with amber dot); right "SHOP" (chest). 7) Bottom nav on a translucent strip: "MODES", "MAPS", "HOME" (active), "SKINS", "SETTINGS".

RULES: text perfectly spelled exactly as written in quotes, respect safe areas. No watermark, no artist signature, no device frame, no extra text.
```

### P2 · Selección de modo

```text
Design the GAME MODES screen of "ZNAKEX", vertical 9:16 (1080x1920), realistic in-game UI mockup. Use the attached logo and screens as exact style reference.

STYLE – TRANSLUCENT FOREST RELIC: painterly forest background with warm golden-green light, visible through frosted smoky dark glass panels (#0E1410 at 40-50%, blur only behind panels), thin worn white borders, carved corners; icons and text worn off-white #F2EFE6 with distressed stencil texture; amber #E8B04A glow for the selected card. Single currency: coins. No neon, no purple, no glossy plastic.

LAYOUT: top bar with back arrow, title "MODES", coins "4,250". Four tall translucent cards stacked vertically, each with a painterly illustration, worn white icon, name, one-line description and a small progress/record line:
1) "STORY" (selected, amber glow): snake winding through jungle ruins. "16 maps · 160 levels" · "MAP 1 · 4/10".
2) "CLASSIC": simple mossy arena with stone walls. "Survive and beat your record" · "BEST 3,580".
3) "GOLDEN FRENZY": snake surrounded by many glowing golden orbs, no walls. "60 seconds · only golden orbs" · "BEST 1,920".
4) "DUEL": two snakes facing each other over a red orb. "Beat the bot" · "EASY · MEDIUM · HARD". Show a lock with "CLEAR MAP 2" on this card.
Bottom nav: "MODES" (active), "MAPS", "HOME", "SKINS", "SETTINGS".

RULES: text perfectly spelled exactly as written in quotes, respect safe areas. No watermark, no artist signature, no device frame, no extra text.
```

### P3 · Selección de mapa (16 mapas)

```text
Design the MAPS screen of "ZNAKEX", vertical 9:16 (1080x1920), realistic in-game UI mockup. Use the attached logo and screens as exact style reference.

STYLE – TRANSLUCENT FOREST RELIC: painterly forest background, frosted smoky dark glass panels (#0E1410 at 40-50%, blur only behind panels), thin worn white borders, carved corners; icons and text worn off-white #F2EFE6, distressed stencil texture; amber #E8B04A glow for selection. Single currency: coins. No neon, no purple, no glossy plastic.

LAYOUT: top bar with back arrow, title "MAPS", coins "4,250". Progress strip "MAPS 1/16 · LEVELS 4/160". Vertical scroll of wide landscape cards (4 visible, the 5th cut), connected by a worn white dotted path:
1) "I · EMERALD JUNGLE" selected, amber border, "4/10", small "PLAY".
2) "II · MOSSY RUINS" locked: darkened ruins with narrow corridors, lock icon, "CLEAR MAP I".
3) "III · MANGROVE SWAMP" locked: dark mud and twisted mangrove roots.
4) "IV · DESERT TOMBS" locked: quicksand and sandstone snake statues.
Each card: painterly thumbnail, Roman numeral, name, 10 small level dots (filled = cleared), and the map's hazard icon (log, pillar, mud, quicksand).
Bottom nav: "MODES", "MAPS" (active), "HOME", "SKINS", "SETTINGS".

RULES: text perfectly spelled exactly as written in quotes, respect safe areas. No watermark, no artist signature, no device frame, no extra text.
```

### P4 · Selección de nivel (10 niveles)

```text
Design the LEVEL SELECT screen for map "I · EMERALD JUNGLE" of "ZNAKEX", vertical 9:16 (1080x1920), realistic in-game UI mockup. Use the attached logo and screens as exact style reference.

STYLE – TRANSLUCENT FOREST RELIC: the jungle map's painterly key art as full background (giant trees, logs over streams, golden light rays), frosted smoky dark glass UI (#0E1410 at 40-50%, blur only behind panels), thin worn white borders; icons and text worn off-white #F2EFE6 with distressed stencil texture; amber #E8B04A for the current level. Single currency: coins. No neon, no purple, no glossy plastic.

LAYOUT: top bar with back arrow, title "EMERALD JUNGLE", coins "4,250". A winding worn white path climbing the screen from bottom to top with 10 carved stone level nodes: 1-3 cleared (white check), 4 current (larger, amber glow, small snake head icon on it), 5-9 locked (dim, lock), 10 a bigger ornate "GUARDIAN" node with a serpent skull emblem. Next to each node a tiny coin reward label: levels 1-3 "40", 4-6 "55", 7-9 "75", 10 "75". Bottom translucent panel for the selected level: "LEVEL 4", objective icon with red orb "COLLECT 14 ORBS", hazard line "LOGS · BRIDGES", reward "+55 coins", big "PLAY" button.

RULES: text perfectly spelled exactly as written in quotes, respect safe areas. No watermark, no artist signature, no device frame, no extra text.
```

### P5 · HUD de partida (tablero 12×18)

```text
Design the IN-GAME HUD of "ZNAKEX" during Story mode, vertical 9:16 (1080x1920), realistic gameplay screenshot. Use the attached logo and screens as exact style reference.

BOARD: a strict top-down board of exactly 12 columns x 18 rows of square tiles, centered horizontally, filling the full width with a small margin (about 1008x1512 px), leaving space above and below for the HUD. Theme "Emerald Jungle": calm low-contrast mossy soil tiles with a very faint grid, a border of vines and mossy stone, 3 fallen logs, a stream crossing the board with one wooden bridge, soft dappled light. A snake of 11 segments (dark moss-green and bronze scales, glowing amber eyes) moving toward one glowing RED orb (bright crimson sphere with a soft red halo and tiny sparks); one GOLDEN orb (radiant gold sphere with rays and a pulsing ring) near the stream.

HUD (translucent, outside the board): top-left pause button; top-center objective "ORBS 9 / 14" with a red orb icon and an amber progress bar; top-right score "1,240" and coins "+12". Below the board: level tag "1-4 · EMERALD JUNGLE" and a speed indicator showing "x2" with a golden timer ring (active gold-orb boost).

STYLE: painterly warm forest tones; UI frosted smoky dark glass (#0E1410 at 40-50%), worn off-white #F2EFE6 icons and text with distressed stencil texture, amber #E8B04A accents. No neon, no purple.

RULES: board must be exactly 12x18 tiles and perfectly aligned; text perfectly spelled exactly as written in quotes. No watermark, no artist signature, no device frame, no extra text.
```

Variantes (adjunta la imagen anterior):

- **Clásico:** `Same layout. Classic mode: no obstacles, only stone border walls, objective replaced by "BEST 3,580".`
- **Orbes Frenéticos:** `Same layout. Golden Frenzy mode: no walls (board edges glow softly to show wrap-around), only golden orbs (6 on the board), timer "00:42" instead of the objective.`

### P6 · Revivir / Game Over (translúcido)

```text
Design the REVIVE / GAME OVER overlay of "ZNAKEX", vertical 9:16 (1080x1920), realistic in-game screenshot. Use the attached logo and screens as exact style reference.

BACKGROUND – THE MATCH THAT JUST ENDED (clearly visible, only 25% darker and 2px blur): the top-down 12x18 Emerald Jungle board frozen at the moment of death. The snake (14 segments) has just crashed into a fallen log: small burst of leaves and dust, eyes dimmed, body turning grey from the tail. Red orb still glowing on the board. Frozen HUD dimmed: "ORBS 11 / 14".

PANEL: frosted smoky dark glass (#0E1410 at 45%, blur only behind it), thin worn white border, carved corners, the board visible through it. Content:
1) "SO CLOSE!" in big distressed worn white logo-style font; subtitle "Only 3 orbs left".
2) Progress bar with red orb icon "11 / 14".
3) MAIN BUTTON (most prominent): thick worn white border, strong amber glow, video icon, "REVIVE", small "WATCH AD"; circular countdown ring with "5".
4) Secondary button: coin icon "REVIVE · 100".
5) Row of small round buttons: "RETRY", "LEVELS", "HOME".
6) Dim link "NO THANKS".

STYLE: painterly warm forest tones; worn off-white #F2EFE6 icons and text with distressed stencil texture; amber #E8B04A accents. Single currency: coins. No neon, no purple, no glossy plastic.
RULES: text perfectly spelled exactly as written in quotes, respect safe areas. No watermark, no artist signature, no device frame, no extra text.
```

Segunda revivida (adjunta la imagen anterior):

```text
Same screen, second death of the run: remove the ad button, show only the coin button "REVIVE · 200" as main action, subtitle "Last chance". If coins are not enough, show under it "NOT ENOUGH COINS" and a small button "GET COINS".
```

### P7 · Nivel superado

```text
Design the LEVEL COMPLETE overlay of "ZNAKEX", vertical 9:16 (1080x1920), realistic in-game screenshot. Use the attached logo and screens as exact style reference.

BACKGROUND: the top-down 12x18 Emerald Jungle board frozen at the moment of victory, clearly visible (25% darker, light blur), the long snake glowing softly, a golden god ray from above, falling petals.

PANEL: frosted smoky dark glass (#0E1410 at 45%), worn white border, carved corners. Content: "LEVEL COMPLETE" in big distressed worn white font; "1-4 · EMERALD JUNGLE"; objective "14 / 14 ORBS" with a check; score "1,860"; big coin reward "+55" with a pile of worn gold coins and amber sparkle; progress line "MAP 4/10"; buttons: big "NEXT LEVEL" (amber glow), small "RETRY" and "LEVELS".

STYLE: painterly warm forest tones; worn off-white #F2EFE6 icons and text with distressed stencil texture; amber #E8B04A accents. Single currency: coins. No neon, no purple, no glossy plastic.
RULES: text perfectly spelled exactly as written in quotes, respect safe areas. No watermark, no artist signature, no device frame, no extra text.
```

### P8 · Duelo: dificultad, partida y resultado

Relación de aspecto 16:9 (tres pantallas verticales en una imagen).

```text
Design three DUEL mode screens of "ZNAKEX" side by side in one image: three vertical 9:16 phone screens. Use the attached logo and screens as exact style reference.

STYLE – TRANSLUCENT FOREST RELIC: painterly warm forest; frosted smoky dark glass panels (#0E1410 at 40-50%, blur only behind panels), worn white borders, carved corners; icons and text worn off-white #F2EFE6 with distressed stencil texture; amber #E8B04A for the player, muted crimson #B3242E for the bot. Single currency: coins. No neon, no purple, no glossy plastic.

SCREEN 1 – CHOOSE RIVAL: title "DUEL". Three stacked translucent cards, each with a painterly portrait of a rival bot snake: "EASY · MOSS WORM" (small sleepy green snake) reward "+15", "MEDIUM · RUST VIPER" (copper viper) reward "+30", "HARD · CRIMSON FANG" (black and crimson cobra with glowing red eyes) reward "+60" (selected, amber border). Counter "PAID WINS TODAY 2/5". Big button "FIGHT".

SCREEN 2 – DUEL HUD: top-down 12x18 board (mossy arena, a few stone pillars), the player's snake (moss-green, amber eyes) and the bot snake (black and crimson) racing for one red orb. Top HUD split in two: left "YOU 7" with amber bar, right "CRIMSON FANG 8" with crimson bar, center "FIRST TO 15". Small "VS" emblem.

SCREEN 3 – RESULT: the frozen board visible behind a translucent panel; the bot has crashed into the player's body (burst of leaves). Title "VICTORY", subtitle "CRIMSON FANG DEFEATED", reward "+60" coins, buttons "REMATCH" (amber glow) and "MODES".

RULES: text perfectly spelled exactly as written in quotes. No watermark, no artist signature, no device frame, no extra text.
```

### P9 · Ruleta diaria de la serpiente

```text
Design the DAILY SERPENT WHEEL popup of "ZNAKEX", vertical 9:16 (1080x1920), realistic in-game UI mockup. Use the attached logo and screens as exact style reference.

BACKGROUND: the main menu forest visible and slightly blurred behind the popup.

WHEEL: a large circular wheel carved from ancient mossy stone, framed by a coiled serpent whose head at the top acts as the pointer (glowing amber eyes, fangs pointing at the winning slice). 8 slices alternating dark stone and warm wood, each with a worn white coin icon and amount: "10", "15", "20", "10", "30", "50", "75", "100" (the "100" slice with a subtle golden glow). Center hub: small carved serpent-Z emblem. Fireflies and a soft golden light ray on the wheel.

PANEL (frosted smoky dark glass #0E1410 at 45%, worn white border): title "DAILY SPIN", before spin a big button "SPIN" (amber glow). Show the result state: a highlighted slice "50" with sparkle burst and under it "YOU WON 50 COINS", main button with video icon "CLAIM · WATCH AD", dim link "SKIP", and a small line "NEXT SPIN IN 23:59:10".

STYLE: worn off-white #F2EFE6 icons and text with distressed stencil texture, amber #E8B04A accents, painterly warm forest tones. Single currency: coins. No neon, no purple, no glossy plastic.
RULES: text perfectly spelled exactly as written in quotes, respect safe areas. No watermark, no artist signature, no device frame, no extra text.
```

### P10 · Ficha de módulos de mapa (repetir para los 16)

Cambia lo que está entre `[CORCHETES]` con los datos de la tabla de la sección 4. Relación de aspecto 3:2.

```text
Create a game-ready MAP MODULE SHEET for the mobile snake game "ZNAKEX", map [I · EMERALD JUNGLE], in the TRANSLUCENT FOREST RELIC style: stylized painterly 2D mobile game art, warm natural light from the top-left, clean readable shapes, subtle dark outlines on props only. Palette for this map: [moss green, olive, warm earth brown, mossy grey stone, turquoise water, golden sunlight].
Theme: [overgrown jungle with fallen logs, streams and wooden bridges].
Signature component: [WOODEN BRIDGES over deadly streams].

All pieces in STRICT TOP-DOWN ORTHOGRAPHIC VIEW, drawn for a square tile grid, on a flat pure #FF00FF magenta background, organized grid with generous spacing, no labels, no text.

Row 1 – FLOOR (1x1 tiles, seamless, low contrast and calm so orbs and snake stand out): 4 ground variants.
Row 2 – BORDER WALL (1x1): straight horizontal, straight vertical, outer corner, inner corner, T-junction, end cap.
Row 3 – OBSTACLES: 1x1 small obstacle, 2x1 obstacle, 1x2 obstacle, 2x2 big obstacle, [fallen log, broken pillar, boulder, tree stump].
Row 4 – SIGNATURE COMPONENT: [stream tile straight, stream corner, stream end, bridge horizontal, bridge vertical] including all states needed ([intact / cracking / collapsed] or [idle / active]).
Row 5 – DECORATION (non-blocking, very subtle): small grass, flowers, leaves, pebbles.
Row 6 – MAP PREVIEW: one small assembled top-down board of exactly 12 columns x 18 rows using the pieces above, with the border wall, 4 obstacles and the signature component, to show how the level looks.

RULES: every tile exactly the same size and aligned to the grid, identical lighting, walls and hazards instantly readable as dangerous, floor always the calmest element. No watermark, no signature.
```

### P11 · Orbes y efectos de juego

```text
Create a VFX and pickup sprite sheet for the mobile snake game "ZNAKEX", TRANSLUCENT FOREST RELIC style (painterly, warm natural light). Flat pure black background #000000 for additive blending, organized grid, no labels, no text. Each item in its own square cell, top-down readable at 64 px.

Row 1 – RED ORB: glowing crimson sphere with inner light and soft red halo; 6-frame idle pulse loop.
Row 2 – GOLDEN ORB: radiant gold sphere with light rays and a rotating thin ring; 6-frame idle loop; plus a "despawn warning" frame (flickering, faded).
Row 3 – SPAWN: 6 frames of an orb appearing from swirling leaves and light.
Row 4 – COLLECT RED: 6 frames of a small crimson burst with sparks.
Row 5 – COLLECT GOLD: 6 frames of a big golden burst with star flash and "x2" speed streaks.
Row 6 – SPEED BOOST TRAIL: golden wind streaks and sparks (loop, 6 frames).
Row 7 – REVIVE: shield of woven vines and amber light around a point (loop, 6 frames) + snake death crumble into leaves (6 frames).
Row 8 – SINGLE PARTICLES: 3 red sparks, 3 gold sparks, 3 leaves, 2 petals, 2 dust puffs, 1 soft red glow, 1 soft gold glow.
```

### P12 · Serpientes rivales del Duelo

```text
Create a skin sheet for 3 rival bot snakes of the mobile snake game "ZNAKEX", TRANSLUCENT FOREST RELIC style (stylized painterly 2D mobile art, warm natural light, clean silhouettes readable at small size), flat dark background #15181A, grid layout, small labels.
For EACH bot: a 3/4 hero portrait, and strict top-down gameplay pieces facing up (head idle, head mouth open, straight body segment seamless, 90° corner, tail tip), same body width as the player snake.
1) "MOSS WORM" (easy): small, round-headed, sleepy moss-green snake with lichen spots, friendly look.
2) "RUST VIPER" (medium): copper and rust-brown viper with sharp angular scales and orange eyes.
3) "CRIMSON FANG" (hard): black cobra with crimson scale edges, wide hood, glowing red eyes and long fangs, intimidating.
The bots must be clearly distinguishable from the player's moss-green and bronze snake at a glance. No watermark, no signature.
```

### P13 · Tienda y skins (solo monedas)

Relación de aspecto 16:9 (dos pantallas verticales en una imagen).

```text
Design two screens of "ZNAKEX" side by side (two vertical 9:16 phone screens, 16:9 image): SHOP and SKINS. Use the attached logo and screens as exact style reference.

STYLE – TRANSLUCENT FOREST RELIC: painterly warm forest visible behind frosted smoky dark glass panels (#0E1410 at 40-50%, blur only behind panels), worn white borders, carved corners; icons and text worn off-white #F2EFE6 with distressed stencil texture; amber #E8B04A for best offers and selection. Single currency: COINS ONLY (no gems anywhere). No neon, no purple, no glossy plastic.

SHOP: title "SHOP", coins "4,250". Featured banner "STARTER PACK" with an exclusive golden-wood snake skin and a pile of coins: "EXCLUSIVE SKIN + 5,000", ribbon "-80%", timer "47:59:12", button "$1.99". Grid of 6 coin packs with painterly piles growing from a handful to an overflowing temple chest: "1,200" $0.99, "4,000" $2.99, "7,000" $4.99, "15,000" $9.99 tag "POPULAR", "32,000" $19.99, "90,000" $49.99 tag "BEST VALUE" with amber glow. Footer link "RESTORE PURCHASES".

SKINS: title "SKINS", coins "4,250", counter "COLLECTED 3/20". Large preview of the selected skin on a mossy stone pedestal in a light ray: "ROOTBOUND SERPENT" with "EPIC" tag. Rarity filter tabs "ALL", "COMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC". 3-column grid of skin cards with snake head portraits; owned full color, equipped with check, locked darkened with lock and price ("1,500", "3,000", "6,000", "12,000", "25,000"). Bottom: progress bar "4,250 / 6,000" and buttons "BUY · 6,000" (disabled) and "GET COINS" (amber glow).

RULES: text perfectly spelled exactly as written in quotes, respect safe areas. No watermark, no artist signature, no device frame, no extra text.
```

### P14 · Pausa y Ajustes (translúcidos)

Relación de aspecto 16:9 (dos pantallas verticales en una imagen).

```text
Design two screens of "ZNAKEX" side by side (two vertical 9:16 phone screens, 16:9 image): PAUSE and SETTINGS. Use the attached logo and screens as exact style reference.

STYLE – TRANSLUCENT FOREST RELIC: frosted smoky dark glass panels (#0E1410 at 40-50%, blur only behind the panel), worn white borders, carved corners; icons and text worn off-white #F2EFE6 with distressed stencil texture; amber #E8B04A for active states. No neon, no purple, no glossy plastic.

PAUSE: behind the panel, the top-down 12x18 jungle board frozen mid-play and clearly visible (snake alive, full color). Panel: pause emblem, "PAUSED", "1-4 · EMERALD JUNGLE · ORBS 9/14", big "RESUME" (amber glow), buttons "RESTART", "SETTINGS", "LEVELS", and 3 small toggles for music, sound and vibration.

SETTINGS: behind the panel, the forest menu art. Sections: "AUDIO" ("MUSIC" and "SOUND FX" toggles with sliders, "VIBRATION" toggle); "CONTROLS" (segmented "SWIPE" selected / "BUTTONS"); "GAME" ("LANGUAGE · ESPAÑOL", "NOTIFICATIONS" toggle); "ACCOUNT" ("CONNECT GOOGLE PLAY GAMES"); stacked buttons "RESTORE PURCHASES", "PRIVACY POLICY", "SUPPORT"; footer "VERSION 1.0.0".

RULES: text perfectly spelled exactly as written in quotes, respect safe areas. No watermark, no artist signature, no device frame, no extra text.
```

### P15 · Ficha de Google Play

Tres prompts: icono (1:1), imagen destacada (16:9, se recorta a 1024×500) y capturas (9:16).

```text
ICON: App icon for the mobile snake game "ZNAKEX", 1:1, 512x512. The worn off-white serpent-"Z" emblem from the attached logo, centered and large, serpent eyes glowing amber, on a painterly background of a deep mossy forest with a warm golden light ray behind the emblem. Bold, simple, readable at 48 px. No text other than the emblem, no border, no rounded corners (Google Play applies them).
```

```text
FEATURE GRAPHIC: Wide banner 1024x500 for Google Play. Painterly ancient forest with colossal trees and a warm golden god ray; a majestic moss-green and bronze serpent coiled in the light on the right, chasing a glowing red orb and a radiant golden orb; the "ZNAKEX" logo in worn off-white on the left third. Keep the central area free of small details. No other text, no watermark.
```

```text
SCREENSHOT: Google Play screenshot 9:16. Top 25%: a translucent dark glass banner with a short marketing line in bold worn off-white font: "[16 WILD MAPS · 160 LEVELS]". Below: the attached in-game screen [P5 HUD] shown large inside a subtle phone-shaped frame with soft amber glow, over the painterly forest background. No other text, no watermark.
```

Frases para 6 capturas: "16 WILD MAPS · 160 LEVELS" · "CHASE THE GOLDEN ORBS" · "DUEL SMART RIVALS" · "COLLECT LEGENDARY SKINS" · "LAVA, PORTALS, ICE & MORE" · "NO FORCED ADS".

### Bloque de estilo común (P16–P24)

Los prompts P16 a P24 terminan con este bloque. Pégalo tal cual donde dice `[STYLE BLOCK]`.

```text
STYLE – TRANSLUCENT FOREST RELIC: painterly warm forest, natural golden-green light; palette moss green #1F2A1C, olive #4A5A2E, amber #E8B04A, honey gold #F5D48A, bark brown #2B1E14. UI: frosted smoky dark glass panels (#0E1410 at 40-50% opacity, blur only behind the panels, the scene always visible through them), thin worn white borders, small carved corner ornaments; all icons and text worn off-white #F2EFE6 with distressed stencil texture matching the attached "ZNAKEX" logo; amber glow for active states. Single currency: coins (no gems anywhere). No neon, no purple, no glossy plastic.
RULES: the game name is spelled exactly "ZNAKEX"; all text perfectly spelled exactly as written in quotes; respect phone safe areas. No watermark, no artist signature, no device frame, no extra text.
```

### P16 · Pantalla de carga (splash)

```text
Design the SPLASH / LOADING screen of the mobile snake game "ZNAKEX", vertical 9:16 (1080x1920), full-screen key art. Use the attached logo EXACTLY.

ART: painterly ancient forest cathedral, colossal twisted trees and roots framing the screen, a powerful warm golden-green god ray falling into a mossy clearing. In the clearing a colossal moss-green and bronze serpent with glowing amber eyes coils around a broken temple pillar carved with serpent runes, rearing up into the light. Floating in the beam: one glowing crimson orb and one radiant golden orb, fireflies and white birds.

UI: the "ZNAKEX" logo in worn off-white, large in the upper third, serpent eyes glowing amber. Bottom: thin loading bar with worn white outline and amber fill at 65%, small text above it "LOADING...", tip under it "TIP: Golden orbs make you grow x3, but you move twice as fast!", tiny "v1.0.0" in the corner.

[STYLE BLOCK]
```

### P17 · Tutorial (4 pasos)

Relación de aspecto 16:9 (cuatro pantallas verticales en una imagen).

```text
Design a 4-step TUTORIAL for the mobile snake game "ZNAKEX": four vertical 9:16 phone screens side by side in one image. Each screen shows the top-down 12x18 Emerald Jungle board (calm mossy tiles, faint grid, vine-and-stone border), dimmed 50% except a spotlight area, with a translucent instruction panel at the bottom, step dots "1-4" at the top and a "SKIP" link top-right.

STEP 1 – "SWIPE TO MOVE": short moss-green snake in the center, a big worn white hand icon swiping right with a curved arrow. Panel: "Swipe to guide your serpent."
STEP 2 – "COLLECT RED ORBS": spotlight on a glowing crimson orb, arrow from the snake head, "+1" popup. Panel: "Red orbs make you grow."
STEP 3 – "GOLDEN ORBS": spotlight on a radiant golden orb with "x3" and a speed icon "x2". Panel: "Golden orbs: grow x3, but you move twice as fast!"
STEP 4 – "REACH THE GOAL": spotlight on the HUD objective "ORBS 0 / 10" and on a mossy wall with a worn white "X". Panel: "Collect the orbs. Don't hit walls or your tail!" and a big button "START" with amber glow.

[STYLE BLOCK]
```

### P18 · Resultados de Clásico y Orbes Frenéticos

Relación de aspecto 16:9 (dos pantallas verticales en una imagen).

```text
Design two RESULT screens of the mobile snake game "ZNAKEX" side by side: two vertical 9:16 phone screens. Behind each translucent panel, the frozen top-down 12x18 board of the finished run stays clearly visible (25% darker, light blur).

SCREEN 1 – CLASSIC RESULT: board with stone border walls and a very long snake (40 segments). Panel: "NEW RECORD!" in big distressed worn white font with an amber laurel emblem, score "3,920", previous best "BEST 3,580" crossed out, stats row "ORBS 78 · LENGTH 41 · TIME 04:12", coins "+15", buttons "PLAY AGAIN" (amber glow), "LEADERBOARD" (podium icon) and "HOME".

SCREEN 2 – GOLDEN FRENZY RESULT: board without walls, glowing edges, many golden sparks. Panel: "TIME'S UP!", score "1,740", "BEST 1,920", stats row "GOLDEN ORBS 36 · LENGTH 109", coins "+12", buttons "PLAY AGAIN" (amber glow), "LEADERBOARD" and "HOME".

[STYLE BLOCK]
```

### P19 · Ventanas emergentes (6 popups)

Relación de aspecto 3:2.

```text
Create a sheet of 6 POPUP windows for the mobile snake game "ZNAKEX", arranged in a 3x2 grid over a blurred painterly forest background. Each popup is a translucent card with a worn white border, carved corners and a round "X" close button.

1) "NOT ENOUGH COINS": coin icon with a crack, text "You need 1,800 more coins", buttons "GET COINS" (amber glow) and "LATER".
2) "BUY SKIN?": portrait of a snake skin head, name "ROOTBOUND SERPENT", tag "EPIC", price "6,000" with coin icon, buttons "BUY" (amber glow) and "CANCEL".
3) "PURCHASE COMPLETE": pile of coins with sparkle burst, text "+15,000 COINS", button "GREAT!".
4) "AD NOT AVAILABLE": worn white video icon with a small cloud, text "No ad is ready right now. Try again in a moment.", buttons "REVIVE · 100" and "OK".
5) "QUIT LEVEL?": door icon, text "Your progress in this level will be lost.", buttons "QUIT" and "KEEP PLAYING" (amber glow).
6) "NO CONNECTION": broken signal icon, text "Check your internet to buy coins or watch ads.", button "OK".

[STYLE BLOCK]
```

### P20 · Celebraciones de desbloqueo

Relación de aspecto 16:9 (tres pantallas verticales en una imagen).

```text
Design three CELEBRATION screens of the mobile snake game "ZNAKEX" side by side: three vertical 9:16 phone screens, each with a translucent panel over a painterly forest scene with a burst of golden light rays, falling petals and fireflies.

1) "SKIN UNLOCKED": a newly bought snake skin coiled on a glowing mossy stone pedestal, rarity ribbon "LEGENDARY", name "CYBER SNAKE", buttons "EQUIP" (amber glow) and "CLOSE".
2) "MAP COMPLETE": emblem of the map "I · EMERALD JUNGLE" with a worn white laurel, text "10 / 10 LEVELS", bonus "+200" coins, and below "NEW MAP UNLOCKED" with a thumbnail of "II · MOSSY RUINS" and a button "GO" (amber glow).
3) "NEW MODE UNLOCKED": card of the "DUEL" mode with two snakes facing each other over a crimson orb, text "Challenge smart rivals and win coins", button "TRY IT" (amber glow).

[STYLE BLOCK]
```

### P21 · Arte de fondo de cada mapa (repetir para los 16)

Sirve de fondo de la selección de nivel (P4) y de miniatura en la selección de mapa (P3). Relación de aspecto 9:16. Adjunta la ficha de módulos del mapa correspondiente.

```text
Painterly vertical key art (9:16, 1080x1920) for map [I · EMERALD JUNGLE] of the mobile snake game "ZNAKEX". Scene: [overgrown jungle, fallen logs over deadly streams, wooden bridges, giant trees, golden light rays]. Show the map's signature component clearly: [wooden bridges]. A moss-green and bronze serpent small in the mid-ground, following a winding path that climbs from the bottom to the top of the image (the path will hold the 10 level nodes). Keep the center column calm and slightly darker so UI can sit on top. Warm natural light, atmospheric depth, same painterly style as the attached references. No text, no UI, no watermark, no signature.
```

Datos por mapa para los corchetes:

| # | Mapa | Escena | Componente visible |
| --- | --- | --- | --- |
| 1 | Emerald Jungle | Selva con troncos caídos, arroyos y árboles gigantes | Puentes de madera |
| 2 | Mossy Ruins | Ruinas cubiertas de musgo entre árboles | Pilares y pasillos estrechos |
| 3 | Mangrove Swamp | Manglar oscuro con raíces retorcidas y niebla | Charcas de barro |
| 4 | Desert Tombs | Dunas doradas con tumbas y estatuas de serpiente | Arenas movedizas |
| 5 | Canyon Bridges | Cañón rojizo con abismos | Puentes colgantes rotos |
| 6 | Frozen Tundra | Ruinas heladas bajo auroras suaves | Placas de hielo |
| 7 | Crystal Caves | Cueva con cristales que brillan | Portales de cristal emparejados |
| 8 | Mushroom Grove | Bosque de hongos gigantes | Nubes de esporas |
| 9 | Volcano Core | Rocas negras junto a ríos de lava | Grietas en erupción |
| 10 | Storm Peaks | Cumbres con nubes de tormenta | Rachas de viento con hojas |
| 11 | Sunken Temple | Templo inundado con luz entre columnas | Trampas de pinchos |
| 12 | Clockwork Ruins | Ruinas con engranajes de piedra y bronce | Bloques que se mueven |
| 13 | Shadow Forest | Bosque nocturno con niebla y ojos en la oscuridad | Círculo de luz alrededor de la serpiente |
| 14 | Bone Wastes | Páramo de huesos gigantes | Cráneos rodantes |
| 15 | Sky Gardens | Islas flotantes con jardines colgantes | Huecos al vacío y portales |
| 16 | Serpent Temple Core | Cámara central del templo con una estatua de serpiente colosal | Lava, portales y pinchos juntos |

### P22 · Retratos de skins para la tienda (repetir para las 20)

Relación de aspecto 1:1. Adjunta la ficha de la skin (`SKINS/`) como referencia.

```text
Square shop card portrait (1:1, 512x512) of the snake skin from the attached sheet, for the mobile snake game "ZNAKEX". Close-up 3/4 view of the head and the first coils, looking slightly toward the viewer, centered with even padding. Identical framing, size and light direction for every skin in the collection: soft warm key light from the top-left and a thin rim light. Background: a flat dark vignette tinted by rarity — common grey #6B6F66, rare blue #3E6E9E, epic green #4F8A3C, legendary gold #C99A2E, mythic white-gold #E9DDB5 — with a very subtle radial glow behind the head. Keep the skin's exact colors and design from the sheet. No frame, no text, no watermark.
```

### P23 · Kit de interfaz v2 (sin gemas)

Relación de aspecto 9:16.

```text
Using the exact style of the attached ZNAKEX UI kit, create UI KIT v2 on a flat pure black background #000000, organized grid, generous spacing, no labels.

Row 1 – CURRENCY & PICKUPS: worn gold coin icon, stack of coins, coin pile (3 sizes), red orb icon, golden orb icon, "x2" speed icon, "x3" growth icon.
Row 2 – MODES: story (open book with serpent), classic (grid square), golden frenzy (golden orb with rays), duel (two crossed fangs), daily spin (snake-shaped wheel), leaderboard (podium).
Row 3 – HAZARDS (one per map, 16 icons, same size): log, pillar, mud, quicksand, broken bridge, ice, portal, spores, lava, wind, spikes, moving block, darkness eye, rolling skull, void gap, temple core.
Row 4 – NAVIGATION & ACTIONS: modes, maps, home, skins, settings, shop, pause, play, retry, levels, quit door, video ad, lock, check, close, back.
Row 5 – LEVEL NODES: stone level node in states cleared, current (amber glow), locked, and the large "GUARDIAN" node with serpent skull.
Row 6 – BLANK BUTTONS: large primary in normal/pressed/disabled, secondary, coin-price button, ad button with video icon, countdown ring (full, half, empty).

All icons flat monochrome worn off-white #F2EFE6 with distressed stencil texture, same stroke weight, 128px; amber glow only for active states. No gem icons, no crown, no trophy.
```

### P24 · Arenas de Clásico, Orbes Frenéticos y Duelo

Usa P10 con estos datos en los corchetes:

- **Clásico:** mapa `[CLASSIC ARENA]`, tema `[ancient stone courtyard in the forest with mossy flagstones]`, componente `[none: only the border wall]`.
- **Orbes Frenéticos:** mapa `[GOLDEN FRENZY ARENA]`, tema `[glowing golden clearing at dusk, no walls; board edges shown as a soft golden light line that marks the wrap-around]`, componente `[edge glow tiles in 4 directions]`.
- **Duelo:** mapa `[DUEL ARENA]`, tema `[circular ritual arena of carved stone with serpent runes, two stone pillars]`, componente `[player spawn marker in amber, bot spawn marker in crimson]`.

### Correcciones a las pantallas que ya existen

- **Menú principal** (`Pantallas/…main-me…`): el logo dice "ZNAREX" en vez de "ZNAKEX", y todavía muestra gemas, "ARENA", "EVENTS" y "PASS". Rehacer con P1.
- **Skins** (`Pantallas/…skins-screen…`): muestra gemas, el texto "TARL" (debería ser "TAIL") y las pestañas "TRAILS"/"EFFECTS", que no están en el diseño. Rehacer con P13.
- **Mapas** (`Pantallas/…maps-world-sel…`): usa gemas, estrellas, 25 niveles por mundo y un evento limitado. Rehacer con P3.
- **Ajustes** (`Pantallas/…settings-scree…`): se puede corregir con una edición. Adjunta la imagen y usa:

```text
Keep everything identical except: the small logo text in the footer must read exactly "ZNAKEX"; the control type selector has only two options, "SWIPE" (selected) and "BUTTONS"; remove the rows "SENSITIVITY", "LEFT-HANDED MODE" and "GRAPHICS"; remove the duplicated orange text "CONNECT GOOGLE PLAY GAMES" under the account button. Make the main panel translucent (40-50% opacity) so the forest is visible through it.
```

- **Kit de interfaz** (`Pantallas/…forest-re…`): tiene icono de gema, corona y trofeo. Sustituir por P23.

---

## 10. Preguntas abiertas

Cada pregunta lleva la propuesta que ya usa este brief. Márcala cuando la confirmes o la cambies.

### Mecánica

- [ ] ¿Cuánto dura la velocidad ×2 del orbe dorado? Propuesta: 4 s.
- [ ] ¿El orbe dorado cuenta como 1 orbe para el objetivo, o como 3? Propuesta: 1.
- [ ] ¿Se permiten 2 revividas por partida (anuncio o 100 monedas, luego 200 monedas) o solo 1?
- [ ] ¿Controles: solo deslizar, o también botones de 4 direcciones?
- [ ] ¿Estrellas por nivel (por ejemplo, sin revivir, en menos de X segundos) o solo "superado / no superado"? Propuesta: sin estrellas en la versión 1.

### Progresión y economía

- [ ] Confirmar el significado de los tramos: ¿los niveles 1–3 dan menos y los 7–10 más (propuesta: 40 / 55 / 75), o al revés?
- [ ] ¿Repetir un nivel da algo? Propuesta: 5 monedas.
- [ ] ¿Hay sistema de energía o vidas? Propuesta: no, se juega sin límite.
- [ ] ¿El Pack de inicio puede incluir una skin exclusiva que no se compra con monedas?
- [ ] ¿Todas las skins solo con monedas, o algunas se ganan (por ejemplo, al terminar un mapa o con 10 victorias en Duelo difícil)?
- [ ] ¿La ruleta da un segundo giro con otro anuncio? Propuesta: no, 1 al día.
- [ ] ¿Se quiere un botón "x2 monedas con anuncio" al superar nivel? Hoy está fuera por la regla de "anuncios solo para revivir".
- [ ] Rarezas de las 20 skins del repositorio: hoy hay 3 míticas (Solar Serpent, Cosmic Void, Void Kitsune) y la tabla de precios prevé 1. ¿Se ajusta la tabla o las rarezas? ¿Cuál es la skin inicial gratis?

### Modos

- [ ] Duelo: ¿el bot también puede revivir? ¿El tablero del Duelo usa mapas de Historia o una arena propia?
- [ ] Clásico y Frenético: ¿clasificaciones de Google Play Games (global y entre amigos)?
- [ ] ¿Nombre final del modo: "Golden Frenzy" / "Orbes Frenéticos"?

### Técnico y publicación

- [ ] Motor: Unity o Godot.
- [ ] Idiomas del lanzamiento: ¿español e inglés?
- [ ] ¿Se necesita jugar sin conexión? Propuesta: sí, excepto anuncios y compras.
- [ ] Público objetivo declarado en Play Console: 13+ (si incluye niños, aplican reglas de familias y anuncios más estrictas).
- [ ] Confirmar los 16 nombres y componentes de mapa de la sección 4, y a qué ficha de `MAPAS/` corresponde cada uno.
