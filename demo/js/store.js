// Player progress. Kept in localStorage (demo only), always wrapped in try/catch
// so the game still runs in private windows or when storage is blocked.
import { ECONOMY, SKINS } from './data.js';
import { CONFIG } from './config.js';

export const KEY = 'znakex.demo.v1';

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
  settings: { vibration: true, controls: 'swipe', music: true, sfx: true, musicVol: 0.8, sfxVol: 0.9, lowfx: false, colorblind: false, perfChecked: false, notify: false },
  tutorialSeen: false,
  stars: { easy: {}, normal: {}, hard: {} }, // best stars per level: stars[diff][map] = [s1..s10]
  stats: { orbs: 0, gold: 0, items: 0, breaks: 0, rescues: 0, deaths: 0, levels: 0, clean: 0, stars: 0, stars3: 0, maxLen: 0, duelWins: 0, duels: 0, playSec: 0, bestClean: 0, curClean: 0 },
  missions: { day: '', daily: [], week: '', weekly: [], claimedWeek: 0, chest: false },
  streak: { last: '', count: 0, best: 0 },
  season: { id: 'season1', xp: 0, premium: false, free: [], prem: [], bonus: false },
  ach: {},
  purchases: [], // Google Play purchases already granted: { id, token, t }
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

const saveHooks = [];
export const onSave = (f) => saveHooks.push(f);

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  for (const f of saveHooks) { try { f(); } catch { /* ignore */ } }
}

// how far a save has got: decides which copy keeps its coins when the phone and the cloud differ
function weight(s) {
  let w = 0;
  for (const d of ['easy', 'normal', 'hard']) for (const v of Object.values((s.progress && s.progress[d]) || {})) w += ((v && v.cleared) || 0) * 100;
  w += ((s.owned && s.owned.length) || 0) * 50;
  w += Math.floor(((s.stats && s.stats.playSec) || 0) / 60);
  if (s.season && s.season.premium) w += 200;
  return w;
}

// Merge the copy saved in the player's Google account with this phone's, keeping the most progress:
// levels, stars, records, skins and purchases from both; coins from the copy that has got further.
export function mergeCloud(remote) {
  if (CONFIG.tester || !remote || typeof remote !== 'object') return false;
  const before = JSON.stringify(state);
  const D = DEFAULTS();
  const r = { ...D, ...remote };
  const base = weight(r) > weight(state) ? r : state;
  const other = base === r ? state : r;
  const out = { ...base, settings: state.settings };
  const max = (a, b) => Math.max(a || 0, b || 0);
  out.owned = [...new Set([...(base.owned || []), ...(other.owned || [])])];
  out.progress = {};
  out.stars = {};
  for (const d of ['easy', 'normal', 'hard']) {
    const pa = (base.progress || {})[d] || {}, pb = (other.progress || {})[d] || {};
    out.progress[d] = {};
    for (const m of new Set([...Object.keys(pa), ...Object.keys(pb)])) out.progress[d][m] = { cleared: max(pa[m] && pa[m].cleared, pb[m] && pb[m].cleared) };
    const sa = (base.stars || {})[d] || {}, sb = (other.stars || {})[d] || {};
    out.stars[d] = {};
    for (const m of new Set([...Object.keys(sa), ...Object.keys(sb)])) {
      const a = sa[m] || [], b = sb[m] || [];
      out.stars[d][m] = Array.from({ length: Math.max(a.length, b.length) }, (_, i) => max(a[i], b[i]));
    }
  }
  out.best = { classic: max(base.best && base.best.classic, other.best && other.best.classic), frenzy: max(base.best && base.best.frenzy, other.best && other.best.frenzy) };
  out.stats = { ...D.stats };
  for (const k of Object.keys(out.stats)) out.stats[k] = max(base.stats && base.stats[k], other.stats && other.stats[k]);
  const sea = { ...D.season, ...(base.season || {}) }, seo = { ...D.season, ...(other.season || {}) };
  out.season = sea.id === seo.id ? {
    ...sea, xp: max(sea.xp, seo.xp), premium: !!(sea.premium || seo.premium), bonus: !!(sea.bonus || seo.bonus),
    free: [...new Set([...(sea.free || []), ...(seo.free || [])])], prem: [...new Set([...(sea.prem || []), ...(seo.prem || [])])],
  } : sea;
  out.ach = { ...(other.ach || {}), ...(base.ach || {}) };
  const tokens = new Set();
  out.purchases = [...(base.purchases || []), ...(other.purchases || [])].filter((p) => p && !tokens.has(p.token) && tokens.add(p.token));
  out.tutorialSeen = !!(base.tutorialSeen || other.tutorialSeen);
  out.notifyAsked = !!(base.notifyAsked || other.notifyAsked);
  out.gamesTotal = max(base.gamesTotal, other.gamesTotal);
  state = out;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  load();
  const changed = JSON.stringify(state) !== before;
  if (changed) document.dispatchEvent(new CustomEvent('coins', { detail: state.coins }));
  return changed;
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
