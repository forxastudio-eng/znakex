// Game data: skins, maps, levels, modes and economy (see ZNAKEX_Game_Brief.md).
import { mixHex } from './util.js';

export const COLS = 12;
export const ROWS = 18;

// ------------------------------------------------------------------ economy
export const ECONOMY = {
  startCoins: 2500, // demo only: enough to try the shop and a coin revive
  reviveCoins: [100, 200],
  levelReward: (map, level) => {
    const base = level <= 3 ? 40 : level <= 6 ? 55 : 75;
    return Math.round(base * (1 + 0.1 * (map - 1)));
  },
  replayReward: 5,
  classicCoinsPerOrbs: 5,
  frenzyCoinsPerOrbs: 3,
  duelReward: { easy: 15, medium: 30, hard: 60 },
  duelPaidWinsPerDay: 5,
  wheel: [
    { v: 10, w: 15 }, { v: 15, w: 25 }, { v: 20, w: 18 }, { v: 10, w: 15 },
    { v: 30, w: 12 }, { v: 50, w: 8 }, { v: 75, w: 5 }, { v: 100, w: 2 },
  ],
  packs: [
    { id: 'p1', coins: 1200, price: '0,99 US$', name: 'Puñado', icon: 'coin' },
    { id: 'p2', coins: 4000, price: '2,99 US$', name: 'Bolsa', icon: 'coins' },
    { id: 'p3', coins: 7000, price: '4,99 US$', name: 'Saco', icon: 'coins' },
    { id: 'p4', coins: 15000, price: '9,99 US$', name: 'Cofre', icon: 'coins', tag: 'POPULAR' },
    { id: 'p5', coins: 32000, price: '19,99 US$', name: 'Arcón', icon: 'coins' },
    { id: 'p6', coins: 90000, price: '49,99 US$', name: 'Tesoro del templo', icon: 'coins', tag: 'MEJOR VALOR' },
  ],
};

export const RARITY = {
  inicial: { label: 'INICIAL', color: '#B9C4A6', price: 0 },
  basica: { label: 'BÁSICA', color: '#C9D2B4', price: 300 },
  comun: { label: 'COMÚN', color: '#9AA090', price: 1500 },
  rara: { label: 'RARA', color: '#5FA0E0', price: 3000 },
  epica: { label: 'ÉPICA', color: '#6CC24A', price: 6000 },
  legendaria: { label: 'LEGENDARIA', color: '#E8B04A', price: 12000 },
  mitica: { label: 'MÍTICA', color: '#E9DDB5', price: 25000 },
};

// ------------------------------------------------------------------ skins
// Procedural palettes that recreate each skin sheet in motion.
// pattern: stripe | bands | spots | cracks | glowline | crystal | stars | petals | plates
export const SKINS = [
  {
    id: 'basica', name: 'Serpiente Básica Verde', rarity: 'inicial', basic: true,
    base: '#86AE5E', light: '#B8D68C', dark: '#4E6E34', outline: '#1B2614',
    pattern: 'stripe', pat: '#D8CC5A', eye: '#F2EFD2', pupil: '#16180F', tongue: '#C7354A',
    head: '#9CC271', fx: '#D8E88A',
    desc: 'La compañera de siempre. Ágil, fiel y lista para crecer.',
  },
  // the same basic snake in nine more colours, cheap on purpose
  ...[
    ['rojo', 'Roja', '#C4473E', 250], ['azul', 'Azul', '#4E82C4', 250], ['amarillo', 'Amarilla', '#D9B43A', 300],
    ['morado', 'Morada', '#8A5EC2', 300], ['naranja', 'Naranja', '#DC7A30', 350], ['rosa', 'Rosa', '#DC7FA8', 350],
    ['turquesa', 'Turquesa', '#3FAE9E', 400], ['negro', 'Negra', '#3A3B40', 450], ['blanco', 'Blanca', '#E4E0D4', 500],
  ].map(([id, nm, base, price]) => ({
    id: 'basica_' + id, name: 'Serpiente Básica ' + nm, rarity: 'basica', price, basic: true,
    base, light: mixHex(base, '#FFFFFF', 0.42), dark: mixHex(base, '#000000', 0.42), outline: mixHex(base, '#000000', 0.82),
    pattern: 'stripe', pat: id === 'amarillo' || id === 'blanco' ? mixHex(base, '#6A5A2A', 0.45) : mixHex(base, '#F6EAA8', 0.62),
    eye: '#F2EFD2', pupil: '#16180F', tongue: '#C7354A', head: mixHex(base, '#FFFFFF', 0.14), fx: mixHex(base, '#FFFFFF', 0.5),
    desc: 'La serpiente básica de siempre, ahora en otro color.',
  })),
  {
    id: 'forest', name: 'Guardián del Bosque', rarity: 'rara',
    base: '#6A5238', light: '#94795A', dark: '#34281B', outline: '#17110B',
    pattern: 'spots', pat: '#6FA548', eye: '#B8FF7A', pupil: '#0F1A08', tongue: '#B8423A', eyeGlow: '#8CFF6A',
    head: '#77603F', fx: '#9CDA6B',
    desc: 'Corteza viva y musgo antiguo. Deja un rastro de hojas.',
  },
  {
    id: 'scorpion', name: 'Escorpión del Desierto', rarity: 'rara',
    base: '#A8743E', light: '#D6A56A', dark: '#5A3A1C', outline: '#22150A',
    pattern: 'plates', pat: '#4A2E16', eye: '#FFC15A', pupil: '#1A0E04', tongue: '#B8423A',
    head: '#9A6A38', fx: '#E8C48A',
    desc: 'Placas de armadura curtidas por mil tormentas de arena.',
  },
  {
    id: 'inferno', name: 'Serpiente Infernal', rarity: 'epica',
    base: '#2F2A2A', light: '#524646', dark: '#141111', outline: '#0A0707',
    pattern: 'cracks', pat: '#FF6A1A', eye: '#FFB030', pupil: '#2A0A00', tongue: '#FF5A2A', eyeGlow: '#FF8A2A', glow: '#FF6A1A',
    head: '#3A3232', fx: '#FF8A2A',
    desc: 'Roca volcánica con lava viva bajo cada escama.',
  },
  {
    id: 'sakura', name: 'Espíritu Sakura', rarity: 'epica',
    base: '#F0DCD8', light: '#FFFFFF', dark: '#C9A3A2', outline: '#4A2A30',
    pattern: 'petals', pat: '#F39AB4', eye: '#E0487E', pupil: '#3A0A1A', tongue: '#D84A6A', eyeGlow: '#FF7AA8',
    head: '#F6E6E3', fx: '#FFB7CB',
    desc: 'Nacida bajo los cerezos. Deja pétalos al pasar.',
  },
  {
    id: 'toxic', name: 'Mutante Tóxico', rarity: 'epica',
    base: '#2C4A24', light: '#4C7A3A', dark: '#142412', outline: '#0A1408',
    pattern: 'glowline', pat: '#8CFF3A', eye: '#C8FF4A', pupil: '#0A1A02', tongue: '#8CFF3A', eyeGlow: '#A8FF4A', glow: '#7CFF3A',
    head: '#355A2C', fx: '#A8FF4A',
    desc: 'Algo salió mal en el pantano. Brilla en la oscuridad.',
  },
  {
    id: 'frost', name: 'Dragón de Escarcha', rarity: 'legendaria',
    base: '#9ED4EE', light: '#E8F8FF', dark: '#4F8DB6', outline: '#12324A',
    pattern: 'crystal', pat: '#FFFFFF', eye: '#3FB2FF', pupil: '#021426', tongue: '#5FC8FF', eyeGlow: '#6FD0FF', glow: '#BDEBFF',
    head: '#B6E2F4', fx: '#CFF2FF',
    desc: 'Escamas de hielo eterno. El aire se congela a su paso.',
  },
  {
    id: 'cyber', name: 'Cyber Serpiente', rarity: 'legendaria',
    base: '#3B424C', light: '#707A86', dark: '#1A1E24', outline: '#07090C',
    pattern: 'glowline', pat: '#1FE6FF', eye: '#1FE6FF', pupil: '#001418', tongue: '#FF3AD2', eyeGlow: '#1FE6FF', glow: '#1FE6FF',
    head: '#454D58', fx: '#5FF0FF',
    desc: 'Aleación negra y núcleo de energía. Tecnología ancestral.',
  },
  {
    id: 'cosmic', name: 'Vacío Cósmico', rarity: 'mitica',
    base: '#231C52', light: '#4A3C9A', dark: '#0C0A22', outline: '#05040F',
    pattern: 'stars', pat: '#FFFFFF', eye: '#C8A6FF', pupil: '#0A0520', tongue: '#B07CFF', eyeGlow: '#B48CFF', glow: '#8E6CFF',
    head: '#2A2260', fx: '#C7B2FF',
    desc: 'Un fragmento del cielo nocturno con forma de serpiente.',
  },
  {
    id: 'kitsune', name: 'Kitsune del Vacío', rarity: 'mitica',
    base: '#1C1428', light: '#3A2A52', dark: '#0B0712', outline: '#040208',
    pattern: 'glowline', pat: '#B45CFF', eye: '#E0B0FF', pupil: '#16041F', tongue: '#B45CFF', eyeGlow: '#C77BFF', glow: '#B45CFF',
    head: '#241A33', fx: '#D6A8FF',
    desc: 'Espíritu zorro atrapado en escamas de medianoche.',
  },
];

export const skinById = (id) => SKINS.find((s) => s.id === id) || SKINS[0];
export const skinPrice = (s) => s.price ?? RARITY[s.rarity].price;

// Duel rivals (bots) use their own palettes.
export const BOTS = {
  easy: {
    id: 'bot_easy', name: 'MOSS WORM', label: 'FÁCIL', speed: 0.78, mistake: 0.18, aggression: 0, target: 10,
    base: '#7E9A4A', light: '#B4CC7A', dark: '#44582A', outline: '#18200E', pattern: 'spots', pat: '#C9D98A',
    eye: '#F5F0C8', pupil: '#1B1A10', tongue: '#C7354A', head: '#8AA656', fx: '#C9D98A',
  },
  medium: {
    id: 'bot_medium', name: 'RUST VIPER', label: 'MEDIO', speed: 0.95, mistake: 0.05, aggression: 0.25, target: 12,
    base: '#9A5A2C', light: '#D08A4E', dark: '#4E2A12', outline: '#1E0F06', pattern: 'plates', pat: '#3A1E0C',
    eye: '#FF9A3A', pupil: '#1A0800', tongue: '#C7354A', head: '#A4622F', fx: '#FFB070',
  },
  hard: {
    id: 'bot_hard', name: 'CRIMSON FANG', label: 'DIFÍCIL', speed: 1.02, mistake: 0, aggression: 0.7, target: 15,
    base: '#1A1416', light: '#3A2A2E', dark: '#080506', outline: '#020101', pattern: 'bands', pat: '#B3242E',
    eye: '#FF3A3A', pupil: '#200000', tongue: '#FF3A3A', eyeGlow: '#FF2A2A', glow: '#FF2A3A', head: '#221A1C', fx: '#FF5A5A',
  },
};

// ------------------------------------------------------------------ maps
export const MAPS = [
  { id: 1, name: 'EMERALD JUNGLE', es: 'Selva Esmeralda', key: 'maps/key08.jpg', hazard: 'hz_pillar', playable: true },
  { id: 2, name: 'SAKURA GARDEN', key: 'maps/key00.jpg', hazard: 'hz_bridge' },
  { id: 3, name: 'LOST GREEK RUINS', key: 'maps/key06.jpg', hazard: 'hz_temple' },
  { id: 4, name: 'MUSHROOM GROVE', key: 'maps/key03.jpg', hazard: 'hz_spores' },
  { id: 5, name: 'DESERT TOMBS', key: 'maps/key10.jpg', hazard: 'hz_quicksand' },
  { id: 6, name: 'TOXIC WASTES', key: 'maps/key05.jpg', hazard: 'hz_mud' },
  { id: 7, name: 'FROZEN TUNDRA', key: 'maps/key07.jpg', hazard: 'hz_ice' },
  { id: 8, name: 'CRYSTAL CAVES', key: 'maps/key14.jpg', hazard: 'hz_portal' },
  { id: 9, name: 'SUNKEN ATLANTIS', key: 'maps/key01.jpg', hazard: 'hz_wind' },
  { id: 10, name: 'VOLCANO CORE', key: 'maps/key04.jpg', hazard: 'hz_lava' },
  { id: 11, name: 'PIRATE COVE', key: 'maps/key13.jpg', hazard: 'hz_block' },
  { id: 12, name: 'MEDIEVAL CASTLE', key: 'maps/key09.jpg', hazard: 'hz_spikes' },
  { id: 13, name: 'SKY GARDENS', key: 'maps/key12.jpg', hazard: 'hz_void' },
  { id: 14, name: 'MOON TEMPLE', key: 'maps/key02.jpg', hazard: 'hz_dark' },
  { id: 15, name: 'HAUNTED GRAVEYARD', key: 'maps/key15.jpg', hazard: 'hz_skull' },
  { id: 16, name: 'CYBER CITY', key: 'maps/key11.jpg', hazard: 'hz_block' },
];

// ------------------------------------------------------------------ levels
// Legend: . floor | P pillar | T totem | C column (2 wide, with c) | W wall block
const L = (rows) => rows.map((r) => r.padEnd(12, '.'));

const LAYOUTS = [
  L(['', '', '..P......P..', '', '', '', '', '', '', '', '', '', '', '', '..P......P..', '', '', '']),
  L(['', '', '..P......P..', '', '', '', '', '', '.....T......', '', '', '', '', '', '..P......P..', '', '', '']),
  L(['', '', '.Cc......Cc.', '', '', '....P..P....', '', '', '.Cc......Cc.', '', '', '....P..P....', '', '', '.Cc......Cc.', '', '', '']),
  L(['', '', '..P......P..', '', '', '.....T......', '', '', '...WWWWWW...', '', '', '......T.....', '', '', '..P......P..', '', '', '']),
  L(['', '', '', '', '.WWWW..WWWW.', '', '', '..P......P..', '', '', '..P......P..', '', '', '.WWWW..WWWW.', '', '', '', '']),
  L(['', '', '...W....W...', '...W....W...', '...W....W...', '...W....W...', '', '', '..Cc....Cc..', '', '', '...W....W...', '...W....W...', '...W....W...', '...W....W...', '', '', '']),
  L(['', '', '', '..WWW..WWW..', '..W......W..', '..W......W..', '', '', '....T..T....', '', '', '', '..W......W..', '..W......W..', '..WWW..WWW..', '', '', '']),
  L(['', '', 'WWWWWWWW....', '', '', '....WWWWWWWW', '', '', 'WWWWWWWW....', '', '', '....WWWWWWWW', '', '', 'WWWWWWWW....', '', '', '']),
  L(['', '', '.P..P..P..P.', '', '', '.P..P..P..P.', '', '', '.P..P..P..P.', '', '', '.P..P..P..P.', '', '', '.P..P..P..P.', '', '', '']),
  L(['', '', '.WWW....WWW.', '.W........W.', '.W..T..T..W.', '', '....WWWW....', '', '.Cc..PP..Cc.', '', '....WWWW....', '', '.W..T..T..W.', '.W........W.', '.WWW....WWW.', '', '', '']),
];

const SPAWN_OVERRIDE = { 8: { x: 10, y: 15 } };

export function storyLevel(map, n) {
  const layout = LAYOUTS[(n - 1) % LAYOUTS.length];
  return {
    map, n,
    layout,
    target: Math.round(10 + 0.8 * (map - 1) + 1.2 * (n - 1)),
    speed: 4.2 + 0.15 * (map - 1) + 0.12 * (n - 1),
    goldChance: 0.1 + (0.15 * (n - 1)) / 9,
    reward: ECONOMY.levelReward(map, n),
    spawn: { x: 5, y: 15, dir: 'up', len: 3, ...(SPAWN_OVERRIDE[n] || {}) },
    guardian: n === 10,
  };
}

export const DUEL_LAYOUT = L(['', '', '', '..Cc....Cc..', '', '', '', '', '..P......P..', '..P......P..', '', '', '', '', '..Cc....Cc..', '', '', '']);

export const MODES = [
  { id: 'story', name: 'HISTORIA', icon: 'mode_story', img: 'maps/key08.jpg', desc: '16 mapas · 160 niveles', sub: 'Recoge los orbes y supera cada nivel' },
  { id: 'classic', name: 'CLÁSICO', icon: 'mode_classic', img: 'modes/classic.jpg', desc: 'Sobrevive y bate tu récord', sub: 'La velocidad sube cada 10 orbes' },
  { id: 'frenzy', name: 'ORBES FRENÉTICOS', icon: 'mode_frenzy', img: 'modes/frenzy.jpg', desc: '60 segundos · solo orbes dorados', sub: 'Sin muros: cruza los bordes' },
  { id: 'duel', name: 'DUELO', icon: 'mode_duel', img: 'modes/duel.jpg', desc: 'Vence al rival', sub: 'Fácil · Medio · Difícil' },
];

export const TIPS = [
  'Los orbes dorados te hacen crecer x3, pero vas el doble de rápido.',
  'Encadena orbes en menos de 3 segundos para multiplicar tu puntuación.',
  'En Orbes Frenéticos no hay muros: sal por un borde y entra por el otro.',
  'En el Duelo, si la cabeza del rival toca tu cuerpo, el rival pierde.',
  'El nivel 10 de cada mapa es el Guardián: prepárate.',
];
