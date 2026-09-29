// Player progress. Kept in localStorage (demo only), always wrapped in try/catch
// so the game still runs in private windows or when storage is blocked.
import { ECONOMY, SKINS } from './data.js';
import { CONFIG } from './config.js';

const KEY = 'znakex.demo.v1';

const DEFAULTS = () => ({
  coins: ECONOMY.startCoins,
  owned: ['basica'],
  equipped: 'basica',
  story: { 1: { cleared: 0 } }, // highest cleared level per map
  best: { classic: 0, frenzy: 0 },
  duelWins: { day: '', count: 0 },
  wheelDay: '',
  mode: 'story',
  settings: { vibration: true, controls: 'swipe', music: true, sfx: true },
  tutorialSeen: false,
});

let state = DEFAULTS();

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...DEFAULTS(), ...JSON.parse(raw) };
  } catch { /* storage unavailable: keep defaults */ }
  state.settings = { ...DEFAULTS().settings, ...(state.settings || {}) };
  if (CONFIG.tester) {
    // tester build: every skin owned and a large coin balance
    state.owned = SKINS.map((s) => s.id);
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

export function clearedLevels(map) {
  return (state.story[map] && state.story[map].cleared) || 0;
}

// Highest level the player may start on this map (1-based).
export function unlockedUpTo(map) {
  if (CONFIG.tester) return 10;
  return Math.min(10, clearedLevels(map) + 1);
}

export function markCleared(map, level) {
  const cur = clearedLevels(map);
  const first = level > cur;
  if (first) {
    state.story[map] = { cleared: level };
    save();
  }
  return first;
}
