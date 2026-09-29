// Retention layer: run statistics, daily / weekly missions, 7-day streak, season pass and achievements.
import * as store from './store.js';
import { CONFIG } from './config.js';
import { SKINS } from './data.js';

const S = () => store.S();
const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);
const weekKey = (d = new Date()) => {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return `${t.getUTCFullYear()}-W${Math.ceil(((t - y0) / 86400000 + 1) / 7)}`;
};

// ------------------------------------------------------------------ missions
const DAILY_POOL = [
  { id: 'gold3', text: 'Come 3 orbes dorados', ev: ['gold'], target: 3, reward: 50 },
  { id: 'orb25', text: 'Come 25 orbes', ev: ['orb', 'gold'], target: 25, reward: 50 },
  { id: 'clean2', text: 'Supera 2 niveles sin morir', ev: ['level_clean'], target: 2, reward: 100 },
  { id: 'item2', text: 'Recoge 2 objetos especiales', ev: ['item'], target: 2, reward: 60 },
  { id: 'star3', text: 'Consigue 3 estrellas en un nivel', ev: ['star3'], target: 1, reward: 120 },
  { id: 'duel1', text: 'Juega un Duelo', ev: ['duelplay'], target: 1, reward: 200 },
  { id: 'break3', text: 'Rompe 3 obstáculos con el campo de fuerza', ev: ['break'], target: 3, reward: 80 },
  { id: 'lv3', text: 'Supera 3 niveles', ev: ['level'], target: 3, reward: 90 },
];
const WEEKLY_POOL = [
  { id: 'wlv10', text: 'Supera 10 niveles', ev: ['level'], target: 10, reward: 300 },
  { id: 'worb150', text: 'Come 150 orbes', ev: ['orb', 'gold'], target: 150, reward: 300 },
  { id: 'wstar8', text: 'Consigue 8 estrellas', ev: ['star'], target: 8, reward: 350 },
  { id: 'wgold20', text: 'Come 20 orbes dorados', ev: ['gold'], target: 20, reward: 300 },
];
export const WEEK_CHEST = { need: 4, coins: 1000 };

function hash(str) { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function pick(pool, n, seed) {
  const a = [...pool];
  let h = hash(seed);
  const out = [];
  while (out.length < n && a.length) { h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; out.push(a.splice(h % a.length, 1)[0]); }
  return out.map((m) => ({ ...m, cur: 0, claimed: false }));
}

export function missions() {
  const M = S().missions;
  const d = dayKey(), w = weekKey();
  if (M.day !== d) { M.day = d; M.daily = pick(DAILY_POOL, 3, d); }
  if (M.week !== w) { M.week = w; M.weekly = pick(WEEKLY_POOL, 2, w); M.claimedWeek = 0; M.chest = false; }
  return M;
}

export function claimMission(id) {
  const M = missions();
  const m = [...M.daily, ...M.weekly].find((x) => x.id === id);
  if (!m || m.claimed || m.cur < m.target) return 0;
  m.claimed = true;
  M.claimedWeek++;
  store.addCoins(m.reward);
  addSeasonXp(20);
  store.save();
  return m.reward;
}

export function claimChest() {
  const M = missions();
  if (M.chest || M.claimedWeek < WEEK_CHEST.need) return 0;
  M.chest = true;
  store.addCoins(WEEK_CHEST.coins);
  store.save();
  return WEEK_CHEST.coins;
}

export function claimableMissions() {
  const M = missions();
  return [...M.daily, ...M.weekly].filter((m) => !m.claimed && m.cur >= m.target).length + (!M.chest && M.claimedWeek >= WEEK_CHEST.need ? 1 : 0);
}

// ------------------------------------------------------------------ streak
export const STREAK_REWARDS = [50, 75, 100, 150, 200, 300, 1000];

export function streakState() {
  const st = S().streak, today = dayKey();
  const y = new Date(Date.now() - 86400000);
  const yesterday = dayKey(y);
  let count = st.count;
  if (st.last && st.last !== today && st.last !== yesterday) count = 0; // missed a day: start over
  const claimedToday = st.last === today;
  // "day" the player is about to claim (1..7)
  const day = claimedToday ? ((count - 1) % 7) + 1 : (count % 7) + 1;
  return { count, claimedToday, day, last: st.last };
}

export function claimStreak(double = false) {
  const info = streakState();
  if (info.claimedToday) return 0;
  const st = S().streak;
  st.count = info.count + 1;
  st.last = dayKey();
  st.best = Math.max(st.best, st.count);
  const coins = STREAK_REWARDS[info.day - 1] * (double ? 2 : 1);
  store.addCoins(coins);
  store.save();
  return coins;
}

// ------------------------------------------------------------------ season
export const SEASON = {
  id: 'season1', name: 'HARVEST MOON HOLLOW', ends: '2026-10-31T23:59:59Z', tiers: 10, xpPerTier: 100,
  price: '4,99 €', bonusCoins: 5000,
  free: [{ c: 50 }, { c: 50 }, { c: 75 }, { c: 75 }, { c: 100 }, { c: 100 }, { c: 150 }, { c: 150 }, { c: 200 }, { c: 300 }],
  prem: [{ c: 150 }, { c: 200 }, { c: 250 }, { c: 300 }, { c: 350 }, { c: 400 }, { c: 450 }, { c: 500 }, { c: 600 }, { skin: 'harvest' }],
};

export function seasonLeft() { return Math.max(0, new Date(SEASON.ends).getTime() - Date.now()); }
export function seasonActive() { return CONFIG.tester || seasonLeft() > 0; }

export function seasonTier() {
  const xp = S().season.xp;
  return Math.min(SEASON.tiers, Math.floor(xp / SEASON.xpPerTier));
}

export function addSeasonXp(n) { S().season.xp += n; store.save(); }

export function claimTier(track, i) {
  const se = S().season;
  const list = track === 'prem' ? se.prem : se.free;
  if (i >= seasonTier() || list.includes(i)) return null;
  if (track === 'prem' && !se.premium) return null;
  const r = (track === 'prem' ? SEASON.prem : SEASON.free)[i];
  list.push(i);
  if (r.c) store.addCoins(r.c);
  if (r.skin) {
    // a skin that is not in the public collection yet pays out coins instead
    if (SKINS.some((s) => s.id === r.skin)) { if (!S().owned.includes(r.skin)) S().owned.push(r.skin); }
    else { store.addCoins(1000); return { c: 1000 }; }
  }
  store.save();
  return r;
}

export function buyPass() {
  const se = S().season;
  if (se.premium) return false;
  se.premium = true;
  if (!se.bonus) { se.bonus = true; store.addCoins(SEASON.bonusCoins); }
  store.save();
  return true;
}

// season map: 5 free levels, the rest need the pass (or tester mode)
export function seasonMapAccess(level) {
  return S().season.premium || CONFIG.tester || level <= 5;
}

export function seasonSkinUnlock() {
  const st = S();
  if (store.seasonCleared() < 20) return false;
  if (SKINS.some((s) => s.id === 'harvest')) {
    if (!st.owned.includes('harvest')) { st.owned.push('harvest'); store.save(); return true; }
    return false;
  }
  if (!st.season.done) { st.season.done = true; store.addCoins(1500); store.save(); return true; } // public build: coins until the season skins arrive
  return false;
}

// ------------------------------------------------------------------ achievements
export const ACHIEVEMENTS = [
  { id: 'first', name: 'Primer bocado', text: 'Come tu primer orbe', icon: 'orb', tier: 'bronze', need: 1, get: (s) => s.stats.orbs },
  { id: 'orbs100', name: 'Cazador de orbes', text: 'Come 100 orbes', icon: 'orb', tier: 'silver', need: 100, get: (s) => s.stats.orbs },
  { id: 'gold25', name: 'Cazador dorado', text: 'Come 25 orbes dorados', icon: 'star_gold', tier: 'gold', need: 25, get: (s) => s.stats.gold },
  { id: 'lv10', name: 'Maestro de niveles', text: 'Supera 10 niveles', icon: 'map', tier: 'silver', need: 10, get: (s) => s.stats.levels },
  { id: 'map1', name: 'Pionero del bosque', text: 'Completa el primer mapa', icon: 'map', tier: 'gold', need: 10, get: () => Math.max(store.clearedLevels(1, 'easy'), store.clearedLevels(1, 'normal'), store.clearedLevels(1, 'hard')) },
  { id: 'clean', name: 'Sin un rasguño', text: 'Supera un nivel sin morir', icon: 'medal_gold', tier: 'bronze', need: 1, get: (s) => s.stats.clean },
  { id: 'star3', name: 'Tres estrellas', text: 'Consigue 3 estrellas en un nivel', icon: 'star_gold', tier: 'silver', need: 1, get: (s) => s.stats.stars3 },
  { id: 'items10', name: 'Coleccionista', text: 'Recoge 10 objetos', icon: 'chest_closed', tier: 'bronze', need: 10, get: (s) => s.stats.items },
  { id: 'break10', name: 'Rompe rocas', text: 'Rompe 10 obstáculos', icon: 'bars', tier: 'silver', need: 10, get: (s) => s.stats.breaks },
  { id: 'len40', name: 'Serpiente gigante', text: 'Alcanza largo 40', icon: 'snake', tier: 'gold', need: 40, get: (s) => s.stats.maxLen },
  { id: 'duel', name: 'Rey del duelo', text: 'Gana un Duelo', icon: 'flame', tier: 'silver', need: 1, get: (s) => s.stats.duelWins },
  { id: 'season', name: 'Luna de cosecha', text: 'Completa la temporada', icon: 'rosette', tier: 'gold', need: 20, get: () => store.seasonCleared() },
];

export function achievementProgress(a) { return Math.min(a.need, a.get(S())); }

function checkAchievements() {
  const st = S(), fresh = [];
  for (const a of ACHIEVEMENTS) {
    if (!st.ach[a.id] && a.get(st) >= a.need) { st.ach[a.id] = dayKey(); fresh.push(a); }
  }
  if (fresh.length) { store.save(); document.dispatchEvent(new CustomEvent('achievement', { detail: fresh })); }
  return fresh;
}

// ------------------------------------------------------------------ tracking
export function track(ev, n = 1) {
  const st = S(), s = st.stats;
  switch (ev) {
    case 'orb': s.orbs += n; break;
    case 'gold': s.gold += n; s.orbs += n; break;
    case 'item': s.items += n; break;
    case 'break': s.breaks += n; break;
    case 'rescue': s.rescues += n; break;
    case 'death': s.deaths += n; s.curClean = 0; break;
    case 'level': s.levels += n; break;
    case 'level_clean': s.clean += n; s.curClean += n; s.bestClean = Math.max(s.bestClean, s.curClean); break;
    case 'star': s.stars += n; break;
    case 'star3': s.stars3 += n; break;
    case 'duelwin': s.duelWins += n; break;
    case 'duelplay': s.duels += n; break;
    case 'len': s.maxLen = Math.max(s.maxLen, n); break;
    default: break;
  }
  // missions
  const M = missions();
  for (const m of [...M.daily, ...M.weekly]) {
    if (m.claimed || !m.ev.includes(ev)) continue;
    const was = m.cur;
    m.cur = Math.min(m.target, m.cur + (ev === 'len' ? 0 : n));
    if (was < m.target && m.cur >= m.target) document.dispatchEvent(new CustomEvent('mission', { detail: m }));
  }
  checkAchievements();
  // saving on every orb would be wasteful: throttle
  const now = Date.now();
  if (now - (track.last || 0) > 4000 || ev !== 'orb') { track.last = now; store.save(); }
}
