// First-time guide: short interactive hints that point at one thing at a time (a highlighted button
// and a bubble). They appear little by little as the player progresses (never several in a row):
// play first, then coins, the daily streak, daily missions, the wheel, skins, maps, other modes...,
// and the first time each screen is opened. Tapping the highlighted button does it right away.
// Each hint is shown once; Settings > Guide shows them all again.
import * as store from './store.js';

// how far the player has got: the tutorial counts as the first game
const prog = (S) => (S.gamesTotal || 0) + (S.tutorialSeen ? 1 : 0);

export const STEPS = [
  // home screen, one per visit, in this order
  { id: 'play', screen: 'home', sel: '[data-act=play]', icon: 'play', title: '¡EMPIEZA AQUÍ!', text: 'Toca JUGAR para tu primera partida. Te enseñamos a moverte mientras juegas.', when: (S) => prog(S) === 0 },
  { id: 'coins', screen: 'home', sel: '.topbar .pill', icon: 'coin', title: 'TUS MONEDAS', text: 'Ganas monedas al superar niveles, recogiendo las monedas que aparecen en los mapas, con las misiones, la racha y la ruleta. Úsalas para comprar skins.', when: (S) => prog(S) >= 1 },
  { id: 'streak', screen: 'home', sel: '[data-act=streak]', icon: 'flame', title: 'RACHA DIARIA', text: 'Entra cada día y reclama tu premio. Cuantos más días seguidos, mejor es el premio. ¡Tócalo para verlo!', when: (S) => prog(S) >= 1 },
  { id: 'missions', screen: 'home', sel: '[data-act=missions]', icon: 'scroll_daily', title: 'RETOS DIARIOS', text: 'Cada día hay misiones nuevas. Se cumplen jugando y te dan monedas. Las semanales llenan un cofre.', when: (S) => prog(S) >= 2 },
  { id: 'wheel', screen: 'home', sel: '[data-act=wheel]', icon: 'mode_spin', title: 'RULETA GRATIS', text: 'Una tirada gratis cada día. ¡Pruébala!', when: (S) => prog(S) >= 2 },
  { id: 'skins', screen: 'home', sel: '.nav [data-to=skins]', icon: 'skins', title: 'CAMBIA DE SERPIENTE', text: 'Aquí eliges tu skin y compras otras nuevas con tus monedas.', when: (S) => prog(S) >= 3 },
  { id: 'maps', screen: 'home', sel: '.nav [data-to=maps]', icon: 'maps', title: 'LOS MAPAS', text: '16 mapas con 10 niveles cada uno. Aquí ves tu progreso y repites niveles para conseguir 3 estrellas.', when: (S) => prog(S) >= 3 },
  { id: 'modes', screen: 'home', sel: '.mode-sel', icon: 'modes', title: 'MÁS MODOS', text: 'Cambia de modo con las flechas: Historia, Clásico, Orbes Frenéticos y Duelo.', when: (S) => prog(S) >= 4 },
  { id: 'season', screen: 'home', sel: '[data-act=season]', icon: 'rosette', title: 'TEMPORADA', text: 'Mapa especial y pase de temporada: sube de nivel jugando y gana skins exclusivas.', when: (S) => prog(S) >= 5 },
  { id: 'shop', screen: 'home', sel: '.home-row [data-act=shop]', icon: 'shop', title: 'TIENDA', text: 'Packs de monedas por si quieres ir más rápido. Todo se puede conseguir jugando gratis.', when: (S) => prog(S) >= 6 },
  { id: 'ach', screen: 'home', sel: '[data-act=ach]', icon: 'medal_gold', title: 'LOGROS', text: 'Medallas por tus hazañas. Mira cuáles te faltan.', when: (S) => prog(S) >= 7 },
  // the first time each screen is opened
  { id: 's_skins', screen: 'skins', sel: '.skin-grid .skin-card', icon: 'skins', title: 'TUS SKINS', text: 'Toca una skin para verla en movimiento. Si es tuya, pulsa EQUIPAR. Si tiene candado, cómprala con monedas.' },
  { id: 's_maps', screen: 'maps', sel: '.map-card', icon: 'maps', title: 'ELIGE MAPA', text: 'Supera los 10 niveles de un mapa para abrir el siguiente. Arriba eliges la dificultad: cada una guarda su propio progreso.' },
  { id: 's_modes', screen: 'modes', sel: '.mode-card', icon: 'modes', title: 'MODOS DE JUEGO', text: 'Historia: niveles con objetivo. Clásico: sobrevive y bate tu récord. Frenético: 60 segundos de orbes dorados. Duelo: contra un rival.' },
  { id: 's_missions', screen: 'missions', sel: '.mission', icon: 'scroll_daily', title: 'CÓMO FUNCIONAN', text: 'Juega para avanzar cada misión. Cuando se llene la barra, pulsa RECLAMAR para cobrar tus monedas.' },
  { id: 's_season', screen: 'season', sel: '.tabs', icon: 'rosette', title: 'MAPA Y PASE', text: 'En MAPA juegas los niveles de la temporada. En PASE reclamas premios al subir de nivel.' },
  { id: 's_shop', screen: 'shop', sel: '.pack-grid', icon: 'coins', title: 'MONEDAS', text: 'Aquí puedes comprar monedas, pero también las ganas jugando, con misiones, racha y ruleta.' },
  // after a game
  { id: 'r_x2', screen: 'results', sel: '[data-act=x2]', icon: 'x2kit', title: 'DUPLICA TUS MONEDAS', text: 'Si quieres, mira un vídeo corto y gana el doble de monedas de esta partida. Siempre es opcional.' },
];

const seenMap = () => { const S = store.S(); if (!S.guide || typeof S.guide !== 'object') S.guide = {}; return S.guide; };
export const seen = (id) => !!seenMap()[id];
export function mark(id) { seenMap()[id] = 1; store.save(); }
export function skipAll() { seenMap().__off = 1; store.save(); }
export function reset() { store.S().guide = {}; store.save(); }
export const off = () => !!seenMap().__off;

// the next hint for this screen, if any
export function next(screen) {
  const S = store.S();
  if (off()) return null;
  return STEPS.find((s) => s.screen === screen && !seen(s.id) && (!s.when || s.when(S))) || null;
}
