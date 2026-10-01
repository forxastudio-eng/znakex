# ZNAKEX — Plan para publicar en Google Play

Fecha: 1 de octubre de 2026. Versión del juego: 1.2.0.

Este plan está pensado para ir **paso a paso**. En cada paso pone **quién lo hace**: **tú** (cosas que solo puede hacer el dueño de la cuenta) o **yo** (código, archivos y textos).

---

## Lo más importante en 5 puntos

1. **Google ya no acepta archivos APK para apps nuevas.** Hay que subir un archivo **AAB** (Android App Bundle). Yo cambio la forma de compilar el juego para generarlo.
2. **El juego debe apuntar a Android 16 (nivel de API 36).** Ahora apunta a Android 14. Es obligatorio desde el 31 de agosto de 2026 (se puede pedir prórroga hasta el 1 de noviembre de 2026). Lo cambio yo.
3. **Ya decidido: el juego llevará anuncios reales (AdMob)** — uno corto cada 10 partidas y los voluntarios con recompensa. La **tienda con precios** sigue simulada: en la primera versión se quita (Google no permite precios que no cobran) y se añade con Google Play Billing en una actualización.
4. **Si la cuenta de desarrollador es personal** (no de empresa), Google obliga a una **prueba cerrada con 12 personas durante 14 días seguidos** antes de poder publicar. Hay que conseguir esas 12 personas.
5. **Hace falta una política de privacidad publicada en internet**, aunque el juego no recoja datos. La redacto yo y la publicamos en una página gratuita.

---

## Paso 0 · Decisiones que tienes que tomar tú (antes de empezar)

| Decisión | Opciones | Mi recomendación |
| --- | --- | --- |
| **Tipo de cuenta de Google Play** | **Personal**: 25 US$, verificas tu identidad con tu documento. Obliga a la prueba de 12 personas y 14 días. **Organización**: 25 US$, necesita una empresa registrada y un número D-U-N-S (gratis, pero tarda días o semanas). No obliga a la prueba. | Personal, salvo que GPUnlock ya sea una empresa registrada. |
| **Nombre del paquete** (el identificador interno del juego) | Ahora es `com.forxastudio.znakex`. **No se puede cambiar nunca después de publicar.** | `com.gpunlock.znakex`, para que vaya con tu marca. |
| **Cómo gana dinero el juego** | ✅ **Decidido:** anuncios reales con AdMob (cuenta gratis de AdMob con el Gmail nuevo). Compras de monedas: en una actualización. | — |
| **Edad del público** | Solo mayores de 13, o también niños. | **13 años o más.** Si incluyes niños, Google aplica las normas de "Familias", que son más estrictas, sobre todo con los anuncios. |
| **Correo de contacto público** | Aparecerá en la ficha de Google Play. | Un correo de GPUnlock (el Gmail nuevo sirve). |
| **Países** | Todos, o solo algunos. | Todos. El juego ya está en 5 idiomas. |

---

## Decisiones ya tomadas (versión 1.2)

### Permisos: los mínimos

Pocos permisos dan confianza y Google lo valora. El juego solo pide:

| Permiso | Para qué | ¿Pregunta al jugador? |
| --- | --- | --- |
| Vibración | Vibrar al comer y al chocar | No (no hace falta) |
| Notificaciones | Los avisos para volver a jugar | Solo si el jugador dice que sí dentro del juego |
| Internet y estado de la red | Cargar los anuncios de AdMob | No (no hace falta) |
| Identificador de publicidad | Lo añade AdMob automáticamente | No |

**No** pide ubicación, cámara, micrófono, contactos, archivos, alarmas exactas ni arrancar al encender el móvil.

### Anuncios: nunca durante la partida

- **Un anuncio corto cada 10 partidas**, siempre **entre partidas** (al empezar la siguiente), nunca encima del mapa.
- **Anuncios voluntarios con recompensa:** revivir, x2 monedas y +1 moneda. Si el jugador ve uno, la cuenta de 10 vuelve a empezar, así que quien ya ve anuncios por gusto casi nunca ve el obligatorio.
- El juego ya tiene preparado el «puente» para AdMob. Mientras no lo conectemos (Paso 2), sale una pantalla simulada.

### Notificaciones: suaves

- **No se piden al instalar.** Después de 3 partidas, el juego explica cómo funcionan y pregunta. Solo si el jugador dice que sí aparece el permiso de Android.
- **Como mucho una al día**, por la tarde (entre las 18:30 y las 20:30), y **solo si ese día no has jugado**.
- **Sin sonido** (prioridad baja).
- Si el jugador **no abre el juego en 3 avisos seguidos, dejan de llegar** hasta que vuelva a jugar.
- Se pueden quitar en **Ajustes → Avisos para jugar**. Los textos están en los 5 idiomas: racha, ruleta y misiones.

---

## Paso 1 · Mudar el proyecto a la cuenta nueva (tú y yo)

1. **Tú:** crea la cuenta de GitHub con el Gmail nuevo y un repositorio **privado** vacío (por ejemplo `znakex`).
2. **Tú:** instala la app de Claude en esa cuenta de GitHub y dale acceso a ese repositorio, para que yo pueda subir el código.
3. **Yo:** paso al repositorio nuevo solo lo que hace falta para el juego, más las fuentes de los recursos y la carpeta `legal/`. Los APK de prueba viejos y los borradores no se pasan.
4. **Yo:** dejo instrucciones claras en el repositorio nuevo para compilar el juego.

Nota: la cuenta de Google Play se crea con el **mismo Gmail nuevo**, así todo queda en el mismo sitio.

---

## Paso 2 · Preparar el juego para la tienda (yo)

1. **Compilación nueva:** paso de mi script actual a un proyecto Android estándar (Gradle) que genera el **AAB** y apunta a **API 36**.
   - Este entorno no puede descargar el Android SDK. Por eso lo compilaremos con **GitHub Actions**: GitHub compila el juego en sus servidores cada vez que subo cambios, y tú descargas el AAB desde ahí.
2. **Firma del juego:** creo una **clave de subida** nueva solo para Google Play. Tú la guardas en un lugar seguro (por ejemplo, Google Drive del Gmail nuevo); sin ella no se pueden publicar actualizaciones. Activamos la **firma de apps de Google Play**: Google guarda la clave final, así no se puede perder.
3. **Nombre del paquete:** lo cambio al elegido en el Paso 0.
4. **Conectar AdMob:**
   - **Tú:** creas la cuenta de AdMob con el Gmail nuevo y dos «bloques de anuncios»: intersticial y bonificado.
   - **Yo:** los conecto al puente que ya tiene el juego.
   - **Primero, anuncios de prueba:** usamos los anuncios de prueba de Google, porque pulsar tus propios anuncios reales puede bloquear la cuenta de AdMob.
5. **Quitar lo que es «demo»:** los packs de monedas con precio de la tienda y las notas «DEMO». Las monedas se siguen ganando jugando: niveles, misiones, racha, ruleta y monedas del mapa.
6. **Política de privacidad dentro del juego:** el botón «PRIVACIDAD» de Ajustes, que ahora no hace nada, abrirá la política.
7. **Revisión final** en un móvil real con el AAB instalado mediante la prueba interna de Google Play.

---

## Paso 3 · Textos legales (yo redacto, tú revisas)

1. **Política de privacidad** en 5 idiomas:
   - El progreso se guarda solo en el móvil.
   - No hay cuentas.
   - Los anuncios de **AdMob** usan el identificador de publicidad del móvil; se explica cómo desactivar los anuncios personalizados.
   - Las notificaciones son opcionales y se programan en el propio móvil.
2. **Dónde publicarla:** una página gratuita en GitHub Pages del repositorio nuevo, o Google Sites con tu Gmail. Hace falta una dirección web pública.
3. **Licencias:** reviso que todo lo usado tenga licencia comercial y que esté guardado en `legal/`. Eso incluye las fuentes (licencia OFL), las imágenes y vídeos de Magnific y los sonidos de ElevenLabs.

---

## Paso 4 · Cuenta de Google Play Console (tú)

1. Entra en play.google.com/console con el Gmail nuevo y crea la cuenta de desarrollador: personal u organización, según el Paso 0. Se pagan **25 US$ una sola vez**.
2. **Verifica tu identidad:** nombre legal, dirección, teléfono y documento. En organización, además, el número D-U-N-S.
3. **Verificación de desarrolladores de Android (nuevo en 2026):** Google pide registrar el nombre del paquete de cada app a nombre del desarrollador verificado. Lo hacemos al crear la app en la consola.
4. Crea la app «ZNAKEX»: juego, gratuito, idioma principal español.

---

## Paso 5 · Ficha de la tienda (yo preparo, tú subes o revisas)

| Elemento | Requisito | Estado |
| --- | --- | --- |
| Icono | 512 × 512 PNG | ✅ Listo (`store/icon_512.png`) |
| Gráfico destacado | 1024 × 500, JPG o PNG sin transparencia | ✅ Listo (`store/feature_1024x500.png`) |
| Capturas del móvil | De 2 a 8, por ejemplo 1080 × 1920 | Las hago yo con el juego real |
| Nombre | Máximo 30 caracteres | «ZNAKEX» |
| Descripción corta | Máximo 80 caracteres | La escribo en 5 idiomas |
| Descripción completa | Máximo 4000 caracteres | La escribo en 5 idiomas |
| Categoría | Juegos → Arcade | — |
| Correo de contacto y política de privacidad | Obligatorios | Pasos 0 y 3 |

En **Contenido de la app** de la consola hay que rellenar estos cuestionarios. Te diré exactamente qué marcar en cada uno:

- **Clasificación de contenido (IARC):** es un juego sin violencia real ni contenido para adultos; saldrá para todas las edades o 7+.
- **Público objetivo:** según el Paso 0.
- **Anuncios:** «sí, contiene anuncios».
- **Seguridad de los datos:** marcaremos lo que recoge AdMob:
  - identificadores del dispositivo para publicidad;
  - datos de diagnóstico y de interacción con los anuncios.
  - El juego por sí mismo no recoge nada más.
- **Pedir consentimiento en Europa y el Reino Unido:** AdMob lo gestiona con su mensaje de consentimiento (GDPR); se configura en la cuenta de AdMob.
- **Acceso a la app:** «no hace falta iniciar sesión».

---

## Paso 6 · Prueba cerrada: 12 personas y 14 días (tú y tus probadores)

Solo si la cuenta es **personal**.

1. **Yo:** subo el AAB a la pista de **prueba cerrada**.
2. **Tú:** añades los correos (Gmail) de al menos **12 personas** y les envías el enlace de prueba. Cada una tiene que **aceptar la invitación e instalar** el juego.
3. Las 12 personas tienen que seguir en la prueba **14 días seguidos**. El contador empieza cuando entra la persona número 12. Mejor invitar a 15 o 20 por si alguien se sale.
4. Durante esos días, si encuentran fallos, los arreglo y subo actualizaciones a la misma prueba. Eso no reinicia el contador.
5. Al terminar, **tú** pides el **acceso a producción** desde el panel de la consola. Google pregunta cómo fue la prueba (las respuestas te las preparo yo) y suele responder en unos días.

---

## Paso 7 · Publicar (tú das el botón final)

1. **Yo:** preparo la versión de producción (el mismo AAB probado) con las notas de la versión en 5 idiomas.
2. **Tú:** eliges los países y pulsas «Enviar a revisión».
3. Google revisa la app. Suele tardar entre unas horas y unos días; la primera vez puede tardar más.
4. Publicado. Después: responder reseñas, revisar fallos en la consola y preparar la actualización con anuncios y compras, si los quieres.

---

## Calendario aproximado

| Semana | Qué pasa |
| --- | --- |
| 1 | Decisiones (Paso 0), mudanza (Paso 1), juego listo para la tienda (Paso 2), textos legales (Paso 3), cuenta de Google Play (Paso 4) |
| 1–2 | Ficha de la tienda (Paso 5) y empieza la prueba cerrada (Paso 6) |
| 3–4 | Fin de la prueba de 14 días, solicitud de acceso a producción y publicación (Paso 7) |

Con cuenta de **organización** no hay prueba obligatoria y se puede publicar en 1 o 2 semanas, pero conseguir el número D-U-N-S puede tardar.

---

## Fuentes consultadas

- [Requisitos de nivel de API de Google Play](https://support.google.com/googleplay/android-developer/answer/11926878?hl=es)
- [Requisito de prueba para cuentas personales nuevas (12 probadores, 14 días)](https://support.google.com/googleplay/android-developer/answer/14151465?hl=es)
- [Verificación de desarrolladores de Android: registro de nombres de paquete](https://support.google.com/googleplay/android-developer/answer/16984799?hl=es)
- [Firma de apps y formato AAB](https://developer.android.com/studio/publish/app-signing)
- [Sección de seguridad de los datos](https://support.google.com/googleplay/android-developer/answer/10787469?hl=es)
- [Política de Familias (si el público incluye niños)](https://support.google.com/googleplay/android-developer/answer/9893335?hl=es)
- [Público objetivo y contenido de la app](https://support.google.com/googleplay/android-developer/answer/9867159?hl=es)
- [Cumplir la política de Familias con AdMob](https://support.google.com/admob/answer/6223431?hl=es)
