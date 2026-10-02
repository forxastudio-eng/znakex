# ZNAKEX — Prompts: icono de Google Play, pantallas y logo de GPUnlock

Estilo común de todo el juego: ilustración 2D pintada para móvil, jungla y templo antiguo, piedra con musgo, luz dorada cálida, orbes rojos y dorados brillantes y la serpiente verde básica como protagonista. Adjunta siempre como referencia `demo/assets/ui/logo.png` (el logo ZNAKEX) y una captura del menú actual para mantener el estilo.

Reglas de Google Play que ya cumplen estos prompts: el icono no lleva texto de ranking ni de precio ("#1", "GRATIS", "TOP"), ni logos de otras marcas, ni capturas de la interfaz.

---

## 1 · Icono de Google Play (512 × 512 px)

Formato de Google Play: PNG de 512 × 512, 32 bits, **cuadrado y sin transparencia** (Google recorta las esquinas). Lo importante debe quedar dentro del círculo central (el 66 % del lienzo), porque cada móvil recorta el icono con una forma distinta.

```text
Mobile game app icon for "ZNAKEX", a premium snake arcade game. Square 1:1 composition, 1024x1024, full-bleed background with no transparency and no rounded corners (the store applies the mask).
SUBJECT: the head of a glossy, friendly-but-fierce leaf-green snake (#86AE5E body, cream diamond markings, big amber eyes with a sharp catch-light), seen in a dynamic 3/4 view, bursting forward out of a stone ring engraved with jungle runes, mouth slightly open, a small forked red tongue, one glowing golden orb and one glowing red orb floating beside it.
LOGO: integrate the attached ZNAKEX "Z" emblem (the white angular Z shaped like a snake) as a carved glowing golden sigil in the stone ring behind the head. No other text, no letters, no words.
BACKGROUND: deep jungle-temple green with warm golden rim light from the top-left, soft vignette, subtle leaves and floating light motes.
STYLE: polished painterly 2D mobile-game illustration, thick clean outlines, strong readable silhouette, high contrast, saturated but not neon, reads clearly at 48x48 px. All key elements inside the central 66% safe circle.
NO text, NO "#1", NO price, NO badges, NO UI, NO watermark, NO transparency.
```

Exporta a 1024 y redúcelo a 512 × 512. Guárdalo como `store/icon_512.png`.

**Gráfico destacado de la tienda (1024 × 500, obligatorio en Google Play):**

```text
Google Play feature graphic for the mobile game "ZNAKEX", wide 1024x500 banner. Left half: the attached ZNAKEX logo, large and centered vertically, carved in pale stone with a warm golden glow. Right half: the green hero snake coiling through a jungle temple courtyard, chasing a glowing golden orb, red orbs scattered on mossy stone tiles, sunbeams through the canopy. Painterly 2D mobile-game illustration, warm golden light, rich greens, clean outlines. Keep the logo and the snake head away from the outer 5% margins. NO other text, NO price, NO badges, NO UI buttons.
```

---

## 2 · Pantalla de carga (distinta al menú principal)

Vertical 9:16 (1080 × 1920). La parte de abajo queda más oscura porque ahí el juego pone la barra de carga y los consejos.

```text
Vertical 9:16 mobile game loading screen art, 1080x1920, for "ZNAKEX". A different scene from the main menu: inside an ancient underground snake temple at night, a huge carved stone serpent statue coils around a circular altar, its eyes glowing gold. On the altar a single floating golden orb lights the chamber; red orbs drift slowly in the air like fireflies. Roots and moss hang from cracked pillars, soft blue moonlight falls from an opening above, contrasting with the warm gold of the orb.
COMPOSITION: leave the top 30% calmer (darker ceiling and roots) so the game can place the ZNAKEX logo there; keep the bottom 25% darker and simple (stone floor fading to shadow) for the loading bar and tips. The statue and altar sit in the middle band.
STYLE: painterly 2D mobile-game illustration, same art style as the attached references, clean outlines, cinematic lighting, rich but not neon.
NO text, NO logo, NO UI, NO loading bar, NO watermark.
```

Guárdala como `Pantallas/carga.png`.

---

## 3 · Menú principal (fondo)

Vertical 9:16 (1080 × 1920). El juego pone encima el logo (arriba), los botones (abajo) y la barra de navegación.

```text
Vertical 9:16 mobile game main menu background, 1080x1920, for "ZNAKEX". The heroic moment of the game: the leaf-green hero snake (#86AE5E, cream diamond markings, amber eyes) rises proudly from a sunlit jungle-temple clearing, coiled around a broken mossy stone pillar carved with snake runes, looking toward a glowing golden orb floating at mid height; a few red orbs glow among the ferns. God rays through the canopy, drifting pollen and light motes, butterflies, ancient stone path leading into the jungle.
COMPOSITION: keep the top 28% open (canopy and sky light) for the ZNAKEX logo; the snake and the orb fill the middle 45%; the bottom 27% is calmer ground and grass (slightly darker) where the game places the PLAY button and the navigation bar. Nothing important within 6% of the left and right edges.
STYLE: polished painterly 2D mobile-game illustration, warm golden-green palette, clean outlines, depth of field on the background, same style as the attached references.
NO text, NO logo, NO buttons, NO UI, NO watermark.
```

Guárdala como `Pantallas/menu.png`.

### 3b · Vídeo del menú principal (animar esa misma imagen)

En Magnific, usa la imagen del menú como **primer fotograma** (imagen a vídeo). Duración de 5 a 8 s, en bucle, 9:16 y sin sonido (el juego ya tiene su música).

```text
Subtle seamless looping animation of this exact image, camera completely locked (no zoom, no pan, no cut). The snake breathes slowly, its body gently shifting and its tongue flicking once; the golden orb pulses softly and rotates in place; red orbs bob up and down slightly; god rays shimmer; leaves and ferns sway in a light breeze; pollen and light motes drift upward; a butterfly crosses the background. Keep the composition, the colors, the style and every element exactly as in the image; nothing new appears, nothing leaves the frame. Calm, magical, readable. The last frame must match the first frame for a perfect loop. No text, no logo.
```

Guárdalo como `Pantallas/menu.mp4`. Lo convierto a un bucle ligero para el juego. En móviles lentos se verá la imagen fija.

---

## 4 · Logo de GPUnlock (animación del inicio)

Pásame el logo en PNG con fondo transparente (o sobre verde croma `#00FF00`), de al menos 1024 px de ancho. Si lo tienes en vectorial (SVG), mejor. La animación la hago yo con código: el logo aparece con un brillo, queda 2 s en pantalla y se puede saltar tocando.

Si quieres una versión especial del logo para el juego:

```text
Clean game-studio logo mark for "GPUnlock", a small indie game studio. [DESCRIBE HERE YOUR CURRENT LOGO: symbol, colors, typography]. Adapted as a centered emblem for a game intro screen: bold simple shapes, crisp edges, readable at small size, one accent color with a soft glow, flat solid background of chroma-key green #00FF00 (no green inside the logo). The wordmark "GPUnlock" spelled exactly like this, below the symbol. No other text, no mockup, no 3D scene.
```

Guárdalo como `legal/marca/gpunlock_logo.png` (y el original de tu marca en la misma carpeta).
