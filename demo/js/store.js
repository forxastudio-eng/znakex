// Player progress. Kept in localStorage (demo only), always wrapped in try/catch
// so the game still runs in private windows or when storage is blocked.
import { ECONOMY, SKINS } from './data.js';
import { CONFIG } from './config.js';

const KEY = 'znakex.demo.v1';

const DEFAULTS = () => ({
  coins: ECONOMY.startCoins,
  owned: ['basica'],
  equipped: 'basica',
  diff: 'normal', // selected story difficulty
  progress: { easy: {}, normal: {}, hard: {} }, // highest cleared level per map, per difficulty
  best: { classic: 0, frenzy: 0 },
  duelWins: { day: '', count: 0 },
  wheelDay: '',
  mode: 'story',
  settings: { vibration: true, controls: 'swipe', music: true, sfx: true, lowfx: false, colorblind: false, perfChecked: false },
  tutorialSeen: false,
  stars: { easy: {}, normal: {}, hard: {} }, // best stars per level: stars[diff][map] = [s1..s10]
  stats: { orbs: 0, gold: 0, items: 0, breaks: 0, rescues: 0, deaths: 0, levels: 0, clean: 0, stars: 0, stars3: 0, maxLen: 0, duelWins: 0, duels: 0, playSec: 0, bestClean: 0, curClean: 0 },
  missions: { day: '', daily: [], week: '', weekly: [], claimedWeek: 0, chest: false },
  streak: { last: '', count: 0, best: 0 },
  season: { id: 'season1', xp: 0, premium: false, free: [], prem: [], bonus: false },
  ach: {},
});

let state = DEFAULTS();

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...DEFAULTS(), ...JSON.parse(raw) };
  } catch { /* storage unavailable: keep defaults */ }
  const D = DEFAULTS();
  state.settings = { ...D.settings, ...(state.settings || {}) };
  state.stats = { ...D.stats, ...(state.stats || {}) };
  state.season = { ...D.season, ...(state.season || {}) };
  state.streak = { ...D.streak, ...(state.streak || {}) };
  state.missions = { ...D.missions, ...(state.missions || {}) };
  state.stars = { ...D.stars, ...(state.stars || {}) };
  state.ach = state.ach || {};
  state.progress = { ...DEFAULTS().progress, ...(state.progress || {}) };
  if (state.story) { // progress saved before difficulties existed counts as Normal
    for (const [m, v] of Object.entries(state.story)) state.progress.normal[m] = state.progress.normal[m] || v;
    delete state.story;
  }
  if (!['easy', 'normal', 'hard'].includes(state.diff)) state.diff = 'normal';
  // skins removed in v0.6: forget them and fall back to the starter snake
  state.owned = state.owned.filter((id) => SKINS.some((s) => s.id === id));
  if (!state.owned.includes('basica')) state.owned.unshift('basica');
  if (!SKINS.some((s) => s.id === state.equipped)) state.equipped = 'basica';
  if (CONFIG.tester) {
    // tester build: every skin owned and a large coin balance
    state.owned = SKINS.map((s) => s.id);
    state.season.premium = true;
    state.tutorialSeen = true;
    state.coins = Math.max(state.coins, 999999);
  }
  return state;
}

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

export function reset() {
  state = DEFAULTS();
  save();
  return load();
}

export const S = () => state;

export const today = () => new Date().toISOString().slice(0, 10);

export function addCoins(n) {
  state.coins = Math.max(0, state.coins + n);
  save();
  document.dispatchEvent(new CustomEvent('coins', { detail: state.coins }));
}

export function spend(n) {
  if (state.coins < n) return false;
  addCoins(-n);
  return true;
}

export function clearedLevels(map, diff = state.diff) {
  return (state.progress[diff] && state.progress[diff][map] && state.progress[diff][map].cleared) || 0;
}

// A map opens when the previous one is fully cleared on that difficulty (tester: all open).
export function mapUnlocked(map, diff = state.diff) {
  if (map === 17) return true; // the season map has its own screen
  if (CONFIG.tester || map <= 1) return true;
  return clearedLevels(map - 1, diff) >= 10;
}

// Highest level the player may start on this map (1-based, 0 = locked).
export function unlockedUpTo(map, diff = state.diff) {
  if (CONFIG.tester) return 10;
  if (!mapUnlocked(map, diff)) return 0;
  return Math.min(10, clearedLevels(map, diff) + 1);
}

// Map and level the "PLAY" button continues from.
export function currentStory(diff = state.diff) {
  for (let m = 1; m <= 16; m++) {
    if (!mapUnlocked(m, diff)) return { map: Math.max(1, m - 1), level: 10 };
    if (clearedLevels(m, diff) < 10) return { map: m, level: clearedLevels(m, diff) + 1 };
  }
  return { map: 16, level: 10 };
}

export function totalCleared(diff = state.diff) {
  let t = 0;
  for (let m = 1; m <= 16; m++) t += clearedLevels(m, diff);
  return t;
}

export function markCleared(map, level, diff = state.diff) {
  const cur = clearedLevels(map, diff);
  const first = level > cur;
  if (first) {
    state.progress = { ...state.progress, [diff]: { ...state.progress[diff], [map]: { cleared: level } } };
    save();
  }
  return first;
}

// ---- stars (1-3 per level, best result kept)
export function starsOf(map, level, diff = state.diff) {
  const a = state.stars[diff] && state.stars[diff][map];
  return (a && a[level - 1]) || 0;
}

export function totalStars(diff = state.diff) {
  let t = 0;
  for (const m of Object.values(state.stars[diff] || {})) for (const v of m || []) t += v || 0;
  return t;
}

export function setStars(map, level, n, diff = state.diff) {
  const prev = starsOf(map, level, diff);
  if (n <= prev) return 0;
  const all = { ...state.stars };
  const byMap = { ...(all[diff] || {}) };
  const arr = [...(byMap[map] || [])];
  while (arr.length < level) arr.push(0);
  arr[level - 1] = n;
  byMap[map] = arr;
  all[diff] = byMap;
  state.stars = all;
  save();
  return n - prev;
}

// season map progress lives under "normal"
export function seasonCleared() { return clearedLevels(17, 'normal'); }
