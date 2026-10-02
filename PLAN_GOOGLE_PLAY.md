# ZNAKEX — Qué nos falta para publicar en Google Play

Actualizado: 1 de octubre de 2026 · versión del juego 1.2.2

Cada punto dice **quién lo hace**: **TÚ** (cosas que solo puede hacer el dueño de las cuentas) o **YO** (código, textos y archivos). La **mudanza a otro repositorio de GitHub queda para el final**, como pediste.

> Importante: aunque la mudanza de GitHub sea lo último, las **cuentas de Google** (Play Console, AdMob y Play Juegos) créalas **desde el principio con el Gmail nuevo**. Es su ubicación final y no se pueden mover después.

---

## 1. Dónde estamos

### Ya está hecho ✅

- **El juego completo:**
  - Modos: Historia (16 mapas × 10 niveles × 3 dificultades), Clásico, Frenético, Duelo y Temporada.
  - 64 skins.
  - Misiones, racha, ruleta y logros.
  - 5 idiomas.
- **Identidad de marca:** logo, intro de GPUnlock, vídeos, interfaz y efectos.
- **Sonido:** música y 30 efectos. Las licencias están guardadas en `legal/`.
- **Anuncio cada 10 partidas:** ya funciona (versión 1.2.0).
  - Sale siempre **entre partidas**, nunca mientras juegas.
  - Si el jugador ve un anuncio con recompensa por su cuenta, la cuenta vuelve a cero.
  - **Ahora es una pantalla simulada.** Falta conectar los anuncios reales de AdMob (punto 4.2).
- **Avisos para volver a jugar:** como mucho 1 al día y opcionales.
- **Permisos mínimos.**
- **Icono 512 px y gráfico destacado:** en la carpeta `store/`.

### Falta 🔲

| Qué | Por qué es obligatorio |
| --- | --- |
| Formato **AAB** y **Android 16 (API 36)** | Google ya no acepta APK, ni juegos para Android 14, en apps nuevas |
| **Guardar el progreso con la cuenta de Google** de cada jugador | Lo pediste, y es imprescindible si se venden cosas: quien cambia de móvil no pierde nada |
| **Compras reales** (sistema de pagos de Google) | La tienda actual es simulada y Google no permite precios falsos |
| **Anuncios reales** (AdMob) | Ahora son simulados |
| **Política de privacidad** publicada en internet | Obligatoria siempre |
| Quitar lo que queda de «demo» | Botones que dicen «disponible en la versión final», notas «DEMO» en la tienda y en el pase |
| **Ficha de la tienda** en 5 idiomas y capturas | Obligatoria |
| **Cuestionarios** de Google | Obligatorios: clasificación por edad, seguridad de datos, anuncios y público |
| **Prueba cerrada** de 12 personas durante 14 días | Obligatoria si la cuenta es personal |

---

## 2. Decisiones que necesito de ti (TÚ)

1. **Tipo de cuenta de Google Play:**
   - **Personal:** te verificas con tu documento, pero obliga a la prueba de 12 personas.
   - **Empresa:** necesita una empresa registrada y un número D-U-N-S.
   - **Mi recomendación:** personal.
2. **Nombre interno del juego:** propongo `com.gpunlock.znakex`. **No se puede cambiar nunca después.**
3. **Correo de contacto** que verá la gente en la tienda.
4. **Compras reales desde la primera versión:** mi recomendación es **sí**.
5. **Precios:** propongo mantener los de ahora, y Google los convierte a la moneda de cada país.

| Qué se vende | Precio (US$) |
| --- | --- |
| Packs de monedas | 0,99 / 2,99 / 4,99 / 9,99 / 19,99 / 49,99 |
| Pack de inicio | 1,99 |
| Pase de temporada | precio a decidir |

---

## 3. Lo que tienes que hacer TÚ, paso a paso

### 3.1 Crear la cuenta de desarrollador de Google Play

1. Con el **Gmail nuevo**, entra en **play.google.com/console/signup**.
2. Elige **«Para mí»** (personal) o **«Para una organización»**.
3. Rellena tus datos: nombre legal, dirección y teléfono. Usa los mismos que en tu documento de identidad.
4. Paga los **25 US$** con tarjeta. Es un pago único.
5. **Verifica tu identidad:** Google te pide una foto del documento y, a veces, una selfie. Tarda de unas horas a unos días.
6. **Verifica el teléfono y el correo** con los códigos que te mandan.
7. Cuando esté aprobada, avísame.

### 3.2 Crear el perfil de pagos (para cobrar las compras)

1. En Play Console: **Configuración (rueda) → Perfil de pagos → Crear perfil de pagos**.
2. Pon tus datos y los **datos fiscales** que te pida según tu país.
3. En **Pagos**, añade la **cuenta bancaria** donde Google te enviará el dinero. Google hace un pequeño ingreso de prueba que tienes que confirmar.
4. Puede tardar unos días en verificarse. Sin él no se puede vender nada.

### 3.3 Crear la app en Play Console

1. **Inicio → Crear app.**
   - **Nombre:** ZNAKEX.
   - **Idioma:** español.
   - **Tipo:** Juego.
   - **Precio:** Gratis.
   - Marca las casillas de las declaraciones.
2. Con eso queda reservado el sitio. Yo subiré el primer archivo (AAB) cuando lo tenga listo.

### 3.4 Crear la cuenta de AdMob (anuncios)

1. Con el Gmail nuevo, entra en **admob.google.com**. Acepta las condiciones y pon los datos de pago.
2. **Apps → Añadir app → Android →** «¿Está publicada?»: **No** de momento.
   - **Nombre:** ZNAKEX.
3. Dentro de la app, crea **2 bloques de anuncios**:
   - **Intersticial**, con el nombre «Cada 10 partidas».
   - **Bonificado**, con el nombre «Recompensas».
4. **Mándame tres códigos:**
   - el **ID de la app**, que empieza por `ca-app-pub-...~...`;
   - los **dos ID de los bloques**, que empiezan por `ca-app-pub-.../...`.
   - No son secretos.
5. **Privacidad y mensajes → Europa (GDPR) → Crear mensaje.** Es el aviso de consentimiento que AdMob muestra a los jugadores de Europa y el Reino Unido. Publícalo.
6. **No pulses nunca tus propios anuncios reales.** AdMob puede bloquear la cuenta. Para probar uso anuncios de prueba.

### 3.5 Activar Google Play Juegos (guardado con la cuenta de Google y ranking)

1. En Play Console, dentro de ZNAKEX: **Crecer → Servicios de juego de Play → Configuración y gestión → Configuración**. Elige **«No, mi juego no usa las API de Google»**, porque es nuevo, y crea el proyecto.
2. **Propiedades:** activa **«Juegos guardados»**. Es lo que guarda el progreso en la cuenta de Google de cada jugador.
3. **Credenciales:** se crea después de que yo suba el primer AAB, porque necesita la huella (SHA-1) de la firma. Te diré dónde copiarla.
4. **Marcadores (ranking):** crea dos, **«Clásico»** y **«Orbes frenéticos»**. Los dos «más alto es mejor». Mándame sus ID.
5. **Testers:** añade tu Gmail y los de los probadores.
6. Al final: **Publicar** la configuración de los servicios de juego.

### 3.6 Publicar la política de privacidad

1. Yo te paso el texto en 5 idiomas.
2. Ve a **sites.google.com** con el Gmail nuevo, crea un sitio llamado «ZNAKEX — Privacidad», pega el texto y pulsa **Publicar**. Es gratis.
3. **Mándame la dirección** (algo como `sites.google.com/view/znakex-privacidad`).

### 3.7 Conseguir 12 probadores (si la cuenta es personal)

1. Busca **al menos 12 personas** con móvil Android y Gmail. Mejor 15 o 20, por si alguien se sale.
2. Te pediré que añadas sus correos en **Pruebas → Prueba cerrada → Testers** y que les envíes el enlace.
3. Tienen que **aceptar la invitación, instalar el juego y no salirse en 14 días seguidos**.

### 3.8 Guardar la llave de subida

1. Yo crearé la **llave con la que se firma cada versión** y te la enviaré.
2. **Guárdala en dos sitios seguros**, por ejemplo en Google Drive del Gmail nuevo y en un USB. Si se pierde, Google puede cambiarla, pero el trámite es lento.
3. Para que GitHub pueda compilar el juego firmado, tendrás que pegar 4 datos en **GitHub → el repositorio → Settings → Secrets and variables → Actions**. Te diré exactamente cuáles.

### 3.9 Final

1. **Revisar y aprobar** los textos de la ficha que te prepare.
2. Cuando pasen los 14 días: **Panel → Solicitar acceso a producción**. Las respuestas al cuestionario te las preparo yo.
3. Pulsar **«Enviar a revisión»** en la versión de producción.

---

## 4. Lo que voy a hacer YO, paso a paso

### 4.1 Pasar el juego al formato que exige Google

1. Convertir la app Android a un proyecto estándar (Gradle) con **API 36** y salida **AAB**.
2. Compilar con **GitHub Actions**: los servidores de GitHub tienen las herramientas de Android, que desde aquí no puedo descargar.
3. Cambiar el nombre interno al que elijas. Hacer el **icono adaptativo**, el que cada móvil recorta a su forma.
4. Crear la **llave de subida** y dejar la firma automática.

### 4.2 Anuncios reales (AdMob)

1. Conectar el puente que ya tiene el juego con AdMob:
   - el **intersticial** cada 10 partidas;
   - los **bonificados**: revivir, x2 monedas y +1 moneda.
2. Mostrar el **aviso de consentimiento** de Europa antes del primer anuncio.
3. Probar con anuncios de prueba de Google y cambiar a los reales al publicar.

### 4.3 Guardar el progreso con la cuenta de Google

1. **Inicio de sesión automático con Google Play Juegos:** el jugador no tiene que hacer nada, lo hace Android solo.
2. **Guardar en la nube:**
   - qué se guarda: monedas, skins, niveles, estrellas, misiones, racha y temporada;
   - cuándo: al terminar cada partida y al salir de la app.
3. **Al abrir el juego en otro móvil:** carga el progreso de la nube.
4. **Si hay dos versiones** (por ejemplo, dos móviles), se queda la que tenga **más progreso**. Así nunca se pierde nada.
5. **Ranking real** de Clásico y Frenético con los marcadores de Google. Hoy ese botón dice «en la versión final».
6. Ajustes mostrará **«Conectado como …»**. El código de guardado se queda como copia extra.

### 4.4 Compras reales (sistema de pagos de Google)

1. Crear en Play Console los productos:
   - packs de monedas (se pueden comprar varias veces);
   - pack de inicio (una vez);
   - pase de temporada.
2. La tienda mostrará los **precios reales de Google en la moneda de cada país**.
3. **Las compras se guardan en la cuenta de Google** (punto 4.3). Además habrá **«Restaurar compras»** en Ajustes para las skins y el pack de inicio.
4. Se confirma cada compra con Google para que no la devuelva automáticamente.
5. Probar con **cuentas de prueba** que no pagan de verdad.

### 4.5 Quitar lo que queda de «demo»

1. Botones que hoy dicen «disponible en la versión final»:
   - **Conectar Google Play Juegos:** pasa a ser real (4.3).
   - **Privacidad:** abre la política.
   - **Soporte:** abre un correo a tu dirección de contacto.
2. Quitar las notas «DEMO» y «compra simulada» de la tienda, del pase y de la pantalla de anuncios.
3. Revisar que en la versión pública no quede ningún atajo de pruebas.
   - ✅ **Ya corregido en esta versión:** la sección «DEMO» de Ajustes (+5000 monedas, reiniciar ruleta, borrar progreso) **salía también en la versión pública**. Ahora solo sale en la de pruebas.

### 4.6 Textos y materiales de la tienda

1. **Política de privacidad y condiciones de uso** en 5 idiomas, explicando:
   - que el progreso se guarda en la cuenta de Google;
   - que los anuncios de AdMob usan el identificador de publicidad;
   - cómo funcionan las compras y las notificaciones.
2. **Descripción corta** (80 caracteres) y **descripción completa** (4000) en 5 idiomas.
3. **8 capturas** del juego real (1080 × 1920) con una frase encima, usando el fondo de capturas.
4. **Respuestas preparadas** para cada cuestionario:
   - **Clasificación de contenido:** todas las edades / 7+.
   - **Público:** mayores de 13.
   - **Anuncios:** sí.
   - **Compras:** sí.
   - **Seguridad de los datos:**
     - identificadores para publicidad (AdMob);
     - datos del juego guardados en Google Play Juegos;
     - historial de compras (Google);
     - diagnóstico.
   - **Acceso a la app:** no hace falta iniciar sesión.

### 4.7 Pruebas

1. Subir el AAB a la **prueba interna**. Tú lo instalas desde Google Play como un usuario más.
2. Revisión completa en un móvil real: vídeos, sonido, anuncios, compras de prueba, guardado en la nube (desinstalar, reinstalar y que vuelva todo) y notificaciones.
3. Subir la misma versión a la **prueba cerrada** de 12 personas.
4. Arreglar lo que salga durante los 14 días.

### 4.8 Al final: la mudanza a otro repositorio (último paso)

1. **TÚ:** crea la cuenta de GitHub con el Gmail nuevo.
2. Lo más sencillo es **transferir este mismo repositorio**. Se mantiene todo el historial y la compilación automática.
   - **Dónde:** GitHub → este repositorio → **Settings → General → Transfer ownership**.
   - **A quién:** a la cuenta nueva.
3. **TÚ:** en la cuenta nueva, da acceso a la app de Claude en GitHub para que yo pueda seguir trabajando. Revisa que sigan los 4 secretos de la firma.
4. **YO:** actualizo las direcciones y las instrucciones, y compruebo que todo compila igual.

---

## 5. Orden recomendado y tiempos

| Semana | TÚ | YO |
| --- | --- | --- |
| 1 | Decisiones (2) · cuenta de Play (3.1) · perfil de pagos (3.2) · AdMob (3.4) · política en Google Sites (3.6) | Formato AAB y API 36 (4.1) · quitar lo de «demo» (4.5) · textos legales y de la ficha (4.6) |
| 1–2 | Crear la app (3.3) · Play Juegos (3.5) · secretos de GitHub (3.8) | Guardado en la nube y ranking (4.3) · anuncios reales (4.2) · compras reales (4.4) |
| 2 | Instalar la prueba interna y probar | Revisión en móvil real y arreglos (4.7) |
| 2–4 | 12 probadores durante 14 días (3.7) | Arreglos durante la prueba |
| 4–5 | Acceso a producción y publicar (3.9) | Notas de la versión en 5 idiomas |
| Después | Mudanza de GitHub (4.8) | Mudanza de GitHub (4.8) |

---

## Fuentes

- [Nivel de API obligatorio en Google Play](https://support.google.com/googleplay/android-developer/answer/11926878?hl=es)
- [Prueba de 12 personas y 14 días para cuentas personales](https://support.google.com/googleplay/android-developer/answer/14151465?hl=es)
- [Verificación de desarrolladores y registro de paquetes](https://support.google.com/googleplay/android-developer/answer/16984799?hl=es)
- [Firma de apps y formato AAB](https://developer.android.com/studio/publish/app-signing)
- [Sección de seguridad de los datos](https://support.google.com/googleplay/android-developer/answer/10787469?hl=es)
- [Política de Familias y AdMob](https://support.google.com/admob/answer/6223431?hl=es)

---

## Versión para Google Play (hecho: proyecto Gradle + compilación automática)

- Proyecto en `demo/play` (Android 16 / API 36, formato **AAB**). Se compila solo en GitHub Actions
  (`.github/workflows/android.yml`) y deja descargables: el **.aab** para Play Console y los APK de prueba.
- Nombre de paquete: `com.gpunlock.znakex` (en `demo/play/gradle.properties`, **pendiente de confirmar**: no se puede cambiar después de la primera subida).
- Ya conectado en el juego: anuncios reales de AdMob con aviso de consentimiento (UE), compras reales
  (Google Play Billing 8), progreso guardado en la cuenta de Google (Play Games) y rankings.
  Hasta tener los IDs reales usa los IDs de prueba de Google (no cobran ni pagan).

### Productos que hay que crear en Play Console (Monetizar > Productos integrados), con estos IDs exactos
| ID | Qué da | Tipo |
|---|---|---|
| coins_1200 | 1.200 monedas | consumible |
| coins_4000 | 4.000 monedas | consumible |
| coins_7000 | 7.000 monedas | consumible |
| coins_15000 | 15.000 monedas | consumible |
| coins_32000 | 32.000 monedas | consumible |
| coins_90000 | 90.000 monedas | consumible |
| starter_pack | skin Pirata + 5.000 monedas (una vez) | no consumible |
| season_pass_1 | Pase premium temporada 1 | no consumible |

### Secretos de GitHub (repo > Settings > Secrets and variables > Actions)
| Secreto | De dónde sale |
|---|---|
| ZNAKEX_KEYSTORE_BASE64, ZNAKEX_KEYSTORE_PASSWORD, ZNAKEX_KEY_ALIAS, ZNAKEX_KEY_PASSWORD | clave de subida (la genero yo y te paso los pasos) |
| ADMOB_APP_ID, ADMOB_INTERSTITIAL, ADMOB_REWARDED | AdMob > Apps > ZNAKEX |
| GAMES_PROJECT_ID | Play Console > Play Games Services > Configuración (número del proyecto) |
| LB_CLASSIC, LB_FRENZY | Play Games Services > Marcadores (crear "Clásico" y "Frenético") |

En Play Games Services hay que activar **"Juegos guardados" (Saved Games)**.
