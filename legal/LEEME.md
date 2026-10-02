# ZNAKEX — Constancia de licencias

Revisión del 30 de septiembre de 2026 de las condiciones con las que se crearon los recursos del juego.
Los términos guardados están en `terminos y licencias usadas.zip` (páginas HTML descargadas por el autor).
Las facturas de las suscripciones las guarda el autor aparte.

## Qué contiene el zip

| Documento | Versión guardada |
| --- | --- |
| Magnific — Terms of Use (incluye los *AI Products Terms*) | AI Products Terms, en vigor desde abril de 2026 |
| Magnific Docs — Usage rights: commercial and products | sin fecha en la página |
| Magnific Docs — AI content and copyright | sin fecha en la página |
| Magnific API — ElevenLabs Sound Effects (Text-to-Audio), en inglés y en español | sin fecha en la página |
| ElevenLabs — Sound Effects Terms | última actualización 12 de febrero de 2026 |
| ElevenLabs — Terms of Service (non-EEA) | última actualización 31 de marzo de 2026 |
| ElevenLabs — Prohibited Use Policy | última actualización 17 de agosto de 2026 |
| ElevenLabs — Commercial Sound Effects (FAQ) | sin fecha en la página |

## Recursos y herramienta con la que se hicieron

| Recurso | Herramienta | Carpeta en el repo |
| --- | --- | --- |
| Skins, mapas, pantallas, marcos, iconos | Magnific (generadores de imagen) | `skins finales/`, `skins de temporada/`, `marcos/`, `MAPAS/`, `Pantallas/`, `SKINS/` |
| 30 efectos de sonido | Magnific, generador de efectos (motor ElevenLabs Sound Effects V2) | `sound effectts/` |
| 6 músicas | Magnific, **el mismo generador de efectos** (no la herramienta de música): los archivos llevan la etiqueta "AI Generated Sound Effects" y duran 30 s, el máximo de ese generador | `musica/` |
| Fuentes | Bebas Neue, Barlow, Oswald, Roboto, Roboto Condensed (SIL OFL 1.1) | `demo/fonts/` (ver `FUENTES.txt`) |
| Código | Propio | `demo/` |

## Qué dicen los términos (lo relevante para ZNAKEX)

1. **Propiedad del resultado (Magnific, AI Products Terms, cláusula 7).** A los usuarios con suscripción de pago, Magnific les cede todos los derechos sobre lo generado: el suscriptor es el propietario exclusivo, a perpetuidad, **siempre que la suscripción estuviera activa en el momento de generarlo**. Los usuarios gratuitos solo tienen una licencia personal y no comercial.
2. **Proveedores externos (cláusula 3).** Los términos de los proveedores de modelos (aquí ElevenLabs) forman parte del contrato de Magnific y hay que cumplirlos.
3. **ElevenLabs, uso comercial (Terms of Service, 1.c y FAQ).** Con plan de pago se permite el uso comercial; con el gratuito, no. Los efectos no pagan regalías y no exigen atribución en planes de pago. No se puede usar lo generado para crear productos que compitan con ElevenLabs.
4. **ElevenLabs, efectos (Sound Effects Terms, 2).** ElevenLabs puede sublicenciar los efectos generados a terceros, por ejemplo mostrarlos a otros usuarios. Por eso **los sonidos no son exclusivos**. Magnific también avisa (cláusula 8) de que no garantiza la exclusividad y de que, según el país, lo generado por IA puede no tener protección de derechos de autor.
5. **Uso dentro de un videojuego.** No hay ninguna restricción para los efectos ni para las imágenes de IA. La restricción de "videojuegos para reventa" de los términos generales de Magnific se refiere a su contenido de stock, no a lo generado con IA (los Docs lo confirman: lo generado por IA puede ser el elemento principal en uso comercial).
6. **Herramienta de música (cláusula 13).** Tiene condiciones propias de ElevenLabs Music: no se puede subir a plataformas de streaming ni vender el audio suelto. **ZNAKEX no la ha usado**: las músicas salen del generador de efectos. Si en el futuro se genera música con esa herramienta, habrá que revisar antes los ElevenLabs Music Terms, que para videojuegos piden un plan Enterprise.
7. **Responsabilidad.** El usuario responde de que lo generado no infrinja derechos de terceros (cláusulas 4 a 6). Magnific no ofrece indemnización en los planes normales.

## Conclusión

Con una suscripción de pago activa en las fechas de generación, las imágenes, los efectos y las músicas se pueden usar comercialmente en ZNAKEX y publicarse en Google Play, sin regalías ni atribución.

## Reglas para mantenerlo en orden

- Generar siempre con la suscripción de pago activa y guardar la factura de ese mes.
- No vender ni publicar los recursos sueltos (packs de sonidos, bancos de imágenes o samples) y mantener el repositorio privado.
- En los prompts no nombrar marcas, juegos, artistas, canciones ni personajes existentes.
- No usar lo generado para entrenar otros modelos de IA (cláusula 6).
- Antes de usar una herramienta nueva de Magnific (sobre todo de música o de voz), revisar su apartado en la cláusula 13 y guardar sus términos aquí.
- Guardar aquí los términos vigentes cada vez que se generen recursos nuevos.
