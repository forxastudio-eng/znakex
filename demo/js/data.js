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
  normal: { label: 'NORMAL', color: '#C9D2B4', price: 1500 },
  especial: { label: 'ESPECIAL', color: '#6CC24A', price: 6000 },
  mitico: { label: 'MÍTICO', color: '#5FA0E0', price: 12000 },
  legendario: { label: 'LEGENDARIO', color: '#E8B04A', price: 25000 },
  temporada: { label: 'TEMPORADA', color: '#E87532', price: 0 },
};

// ------------------------------------------------------------------ skins
// Every skin is drawn with the head / body / tail art cut from its sheet
// (assets/skins2/<art>/). trail = particles left behind, aura = soft glow,
// eyeGlow = glow around the head, colors = crumble particles on defeat.
const sk = (id, name, rarity, trail, colors, extra = {}) => ({ id, name, rarity, trail, colors, fx: colors[1], tongue: '#C7354A', ...extra });

const BASIC = [
  ['rojo', 'Roja', '#C4473E', 250], ['azul', 'Azul', '#4E82C4', 250], ['amarillo', 'Amarilla', '#D9B43A', 300],
  ['morado', 'Morada', '#8A5EC2', 300], ['naranja', 'Naranja', '#DC7A30', 350], ['rosa', 'Rosa', '#DC7FA8', 350],
  ['turquesa', 'Turquesa', '#3FAE9E', 400], ['negro', 'Negra', '#3A3B40', 450], ['blanco', 'Blanca', '#E4E0D4', 500],
];

export const SKINS = [
  sk('basica', 'Serpiente Básica Verde', 'normal', 'dust', ['#86AE5E', '#D8E88A', '#4E6E34'], { basic: true, price: 0, desc: 'La compañera de siempre. Ágil, fiel y lista para crecer.' }),
  ...BASIC.map(([id, nm, base, price]) => sk('basica_' + id, 'Serpiente Básica ' + nm, 'normal', 'dust',
    [base, mixHex(base, '#FFFFFF', 0.5), mixHex(base, '#000000', 0.4)], { basic: true, price, desc: 'La serpiente básica de siempre, ahora en otro color.' })),
  sk('forest', 'Guardián del Bosque', 'normal', 'leaf', ['#6A5238', '#9CDA6B', '#6FA548'], { eyeGlow: '#8CFF6A', desc: 'Corteza viva y musgo antiguo. Deja un rastro de hojas.' }),
  sk('scorpion', 'Escorpión del Desierto', 'normal', 'dust', ['#5A3A1C', '#E8C48A', '#E0652A'], { desc: 'Placas de armadura curtidas por mil tormentas de arena.' }),
  sk('samurai', 'Serpiente Samurái', 'especial', 'maple', ['#1E1E1E', '#E8C47A', '#B8262A'], { desc: 'Armadura lacada y honor dorado. Caen hojas de arce a su paso.' }),
  sk('inferno', 'Serpiente Infernal', 'especial', 'ember', ['#2F2A2A', '#FF8A2A', '#524646'], { aura: '#FF6A1A', eyeGlow: '#FF8A2A', tongue: '#FF5A2A', desc: 'Roca volcánica con lava viva bajo cada escama.' }),
  sk('ghost', 'Serpiente Fantasma', 'especial', 'spirit', ['#2A3A6A', '#CFEFFF', '#9FD8FF'], { aura: '#9FD8FF', desc: 'Medio materia, medio niebla. Susurra al moverse.' }),
  sk('sakura', 'Espíritu Sakura', 'especial', 'petal', ['#F0DCD8', '#FFB7CB', '#D8B06A'], { tongue: '#D84A6A', desc: 'Nacida bajo los cerezos. Deja pétalos al pasar.' }),
  sk('toxic', 'Mutante Tóxico', 'especial', 'toxic', ['#2C4A24', '#A8FF4A', '#4C7A3A'], { aura: '#7CFF3A', eyeGlow: '#A8FF4A', tongue: '#8CFF3A', desc: 'Algo salió mal en el pantano. Brilla en la oscuridad.' }),
  sk('knight', 'Serpiente Caballero', 'especial', 'metal', ['#8A96A6', '#DDE6F0', '#8A1A2A'], { desc: 'Acero pulido y blasón real. Chispas en cada giro.' }),
  sk('mushroom', 'Bruja Seta', 'especial', 'spores', ['#5A2A4A', '#B88CFF', '#C8423A'], { eyeGlow: '#C77BFF', desc: 'Hechizos, setas y esporas que brillan en la noche.' }),
  sk('vampire', 'Serpiente Vampira', 'especial', 'blood', ['#1E1418', '#B3243A', '#D4B060'], { eyeGlow: '#FF3A5A', desc: 'Aristocracia nocturna con colmillos de marfil.' }),
  sk('frost', 'Dragón de Escarcha', 'legendario', 'frost', ['#9ED4EE', '#CFF2FF', '#4F8DB6'], { aura: '#BDEBFF', tongue: '#5FC8FF', desc: 'Escamas de hielo eterno. El aire se congela a su paso.' }),
  sk('cyber', 'Cyber Serpiente', 'mitico', 'digital', ['#3B424C', '#5FF0FF', '#707A86'], { aura: '#1FE6FF', eyeGlow: '#1FE6FF', tongue: '#FF3AD2', desc: 'Aleación negra y núcleo de energía. Tecnología ancestral.' }),
  sk('crystal', 'Serpiente de Cristal', 'mitico', 'sparkle', ['#8A6ADA', '#E0D0FF', '#5FC8FF'], { aura: '#B48CFF', desc: 'Gemas talladas por la luz de la luna.' }),
  sk('abyssal', 'Serpiente Abisal', 'mitico', 'bubble', ['#1A3A44', '#5FF0F0', '#2A5A6A'], { aura: '#3FE0E0', eyeGlow: '#5FF0F0', desc: 'Del fondo del océano, con luz bioluminiscente.' }),
  sk('quetzal', 'Quetzal de Obsidiana', 'mitico', 'feather', ['#2E5A44', '#E8C05A', '#8A3A2A'], { eyeGlow: '#FFE04A', desc: 'La serpiente emplumada de los templos de jade.' }),
  sk('ember', 'Ídolo de Brasas', 'especial', 'ember', ['#B8B8B0', '#FF8A2A', '#4A4A44'], { aura: '#FF6A1A', desc: 'Una estatua antigua con fuego vivo en sus grietas.' }),
  sk('umbra', 'Serpiente Umbra', 'mitico', 'shadow', ['#16121E', '#C77BFF', '#3A2A52'], { aura: '#8A2BE2', eyeGlow: '#C77BFF', desc: 'Sombra del bosque embrujado con ojos de amatista.' }),
  sk('solar', 'Serpiente Solar', 'legendario', 'ember', ['#1E1A16', '#FFD36A', '#E8B04A'], { aura: '#FFC23A', eyeGlow: '#FFE08A', desc: 'Lleva un sol en el corazón. Mítica y radiante.' }),
  sk('cosmic', 'Vacío Cósmico', 'legendario', 'star', ['#231C52', '#C7B2FF', '#FFFFFF'], { aura: '#8E6CFF', desc: 'Un fragmento del cielo nocturno con forma de serpiente.' }),
  sk('harvest', 'Serpiente de la Luna de Cosecha', 'temporada', 'leaf', ['#B85A32', '#E87532', '#4A2942'], { season: true, aura: '#E87532', eyeGlow: '#FFC24A', desc: 'Exclusiva de la Temporada 1: calabaza, luna y brasas.' }),
  sk('kitsune', 'Kitsune del Vacío', 'legendario', 'star', ['#1C1428', '#D6A8FF', '#8A2A3A'], { aura: '#B45CFF', eyeGlow: '#E0B0FF', desc: 'Espíritu zorro atrapado en escamas de medianoche.' }),
];

export const skinById = (id) => SKINS.find((s) => s.id === id) || SKINS[0];
export const skinPrice = (s) => s.price ?? RARITY[s.rarity].price;

// Duel rivals: each one wears a skin from the collection.
export const BOTS = {
  easy: { ...sk('bot_easy', 'MOSS WORM', 'normal', 'dust', ['#3FAE9E', '#B8F0E0', '#1F5A50']), art: 'basica_turquesa', label: 'FÁCIL', speed: 0.78, mistake: 0.18, aggression: 0, target: 10 },
  medium: { ...sk('bot_medium', 'RUST VIPER', 'normal', 'dust', ['#5A3A1C', '#E8C48A', '#E0652A']), art: 'scorpion', label: 'MEDIO', speed: 0.95, mistake: 0.05, aggression: 0.25, target: 12 },
  hard: { ...sk('bot_hard', 'CRIMSON FANG', 'especial', 'blood', ['#1E1418', '#B3243A', '#D4B060']), art: 'vampire', eyeGlow: '#FF3A5A', label: 'DIFÍCIL', speed: 1.02, mistake: 0, aggression: 0.7, target: 15 },
};

// ------------------------------------------------------------------ maps
export const MAPS = [
  { id: 1, name: 'EMERALD JUNGLE', sheet: 8, hazard: 'hz_pillar' },
  { id: 2, name: 'SAKURA GARDEN', sheet: 0, hazard: 'hz_bridge', tint: '#5A2A2A' },
  { id: 3, name: 'LOST GREEK RUINS', sheet: 6, hazard: 'hz_temple', tint: '#8A7A5A' },
  { id: 4, name: 'MUSHROOM GROVE', sheet: 3, hazard: 'hz_spores', tint: '#4A2A5A' },
  { id: 5, name: 'DESERT TOMBS', sheet: 10, hazard: 'hz_quicksand', tint: '#9A6A2A' },
  { id: 6, name: 'TOXIC WASTES', sheet: 5, hazard: 'hz_mud', tint: '#3A5A1A' },
  { id: 7, name: 'FROZEN TUNDRA', sheet: 7, hazard: 'hz_ice', tint: '#6A9AC0' },
  { id: 8, name: 'CRYSTAL CAVES', sheet: 14, hazard: 'hz_portal', tint: '#2A4A7A' },
  { id: 9, name: 'SUNKEN ATLANTIS', sheet: 1, hazard: 'hz_wind', tint: '#1A5A6A' },
  { id: 10, name: 'VOLCANO CORE', sheet: 4, hazard: 'hz_lava', tint: '#7A2A10' },
  { id: 11, name: 'PIRATE COVE', sheet: 13, hazard: 'hz_block', tint: '#6A4A2A' },
  { id: 12, name: 'MEDIEVAL CASTLE', sheet: 9, hazard: 'hz_spikes', tint: '#3A3A4A' },
  { id: 13, name: 'SKY GARDENS', sheet: 12, hazard: 'hz_void', tint: '#6A8AA8' },
  { id: 14, name: 'MOON TEMPLE', sheet: 2, hazard: 'hz_dark', tint: '#3A4A8A' },
  { id: 15, name: 'HAUNTED GRAVEYARD', sheet: 15, hazard: 'hz_skull', tint: '#2A2A3A' },
  { id: 16, name: 'CYBER CITY', sheet: 11, hazard: 'hz_block', tint: '#4A1A7A' },
].map((m) => ({ ...m, key: `maps/key${String(m.sheet).padStart(2, '0')}.jpg` }));


// ------------------------------------------------------------------ levels
// Legend for ASCII layouts (duel arena): . floor | P pillar | T totem | C column (2 wide, with c) | W wall block
const L = (rows) => rows.map((r) => r.padEnd(12, '.'));

// Story difficulty presets (used by maps.js for terrain and by storyLevel for pace).
export const DIFFS = {
  easy: { id: 'easy', label: 'FÁCIL', speed: 0.85, target: 1, obst: 0.6, hazard: 0.5, bridges: 1, reward: 0.6, gold: 1.3, color: '#7FD05A' },
  normal: { id: 'normal', label: 'NORMAL', speed: 1, target: 1, obst: 0.9, hazard: 0.8, bridges: 0, reward: 1, gold: 1, color: '#E8B04A' },
  hard: { id: 'hard', label: 'DIFÍCIL', speed: 1.12, target: 1, obst: 1.15, hazard: 1.1, bridges: -1, reward: 1.7, gold: 0.8, color: '#E0524A' },
};

// Orbs needed: easy 8-20, normal 10-26, hard 12-31 (never more than a 216-cell board can comfortably hold)
const TARGET_BASE = { easy: 8, normal: 10, hard: 12 };
const TARGET_MAP = { easy: 0.3, normal: 0.4, hard: 0.5 };
const TARGET_LVL = { easy: 0.9, normal: 1.1, hard: 1.3 };

export function storyLevel(map, n, diff = 'normal') {
  const d = DIFFS[diff] || DIFFS.normal;
  return {
    map, n, diff: d.id, mapInfo: MAPS[map - 1],
    target: Math.round(TARGET_BASE[d.id] + TARGET_MAP[d.id] * (map - 1) + TARGET_LVL[d.id] * (n - 1)),
    speed: (3.7 + 0.05 * (map - 1) + 0.1 * (n - 1)) * d.speed,
    goldChance: Math.min(0.35, (0.08 + (0.1 * (n - 1)) / 9) * d.gold),
    reward: Math.round(ECONOMY.levelReward(map, n) * d.reward),
    spawn: { x: 5, y: 15, dir: 'up', len: 3 },
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
