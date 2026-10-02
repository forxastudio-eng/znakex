// Duel bot: BFS towards the best orb, flood-fill to stay out of dead ends,
// optional aggression (cutting off the player) and random mistakes on easy.
import { COLS, ROWS } from './data.js';
import { DIRS, OPPOSITE } from './util.js';

const ORDER = ['up', 'right', 'down', 'left'];

function blockedGrid(board, snakes, self) {
  const b = new Uint8Array(COLS * ROWS);
  for (let i = 0; i < b.length; i++) b[i] = board.solid[i];
  for (const s of snakes) {
    if (!s.alive) continue;
    // the tail cell frees up next tick unless the snake is growing
    const n = s.grow > 0 ? s.cells.length : s.cells.length - 1;
    for (let i = 0; i < n; i++) b[s.cells[i].y * COLS + s.cells[i].x] = 1;
  }
  // cells right in front of another head are risky
  for (const s of snakes) {
    if (s === self || !s.alive) continue;
    const h = s.cells[0];
    for (const d of ORDER) {
      const nx = h.x + DIRS[d].x, ny = h.y + DIRS[d].y;
      if (nx >= 0 && ny >= 0 && nx < COLS && ny < ROWS) b[ny * COLS + nx] = Math.max(b[ny * COLS + nx], 2);
    }
  }
  return b;
}

function inside(x, y) {
  return x >= 0 && y >= 0 && x < COLS && y < ROWS;
}

function bfs(b, from, targets) {
  const prev = new Int32Array(COLS * ROWS).fill(-1);
  const seen = new Uint8Array(COLS * ROWS);
  const q = [from.y * COLS + from.x];
  seen[q[0]] = 1;
  const tset = new Set(targets.map((t) => t.y * COLS + t.x));
  for (let qi = 0; qi < q.length; qi++) {
    const k = q[qi];
    if (tset.has(k) && k !== q[0]) {
      // walk back to the first step
      let c = k;
      while (prev[c] !== q[0] && prev[c] !== -1) c = prev[c];
      return { first: c, goal: k };
    }
    const x = k % COLS, y = (k / COLS) | 0;
    for (const d of ORDER) {
      const nx = x + DIRS[d].x, ny = y + DIRS[d].y;
      if (!inside(nx, ny)) continue;
      const nk = ny * COLS + nx;
      if (seen[nk] || b[nk] === 1) continue;
      seen[nk] = 1;
      prev[nk] = k;
      q.push(nk);
    }
  }
  return null;
}

function flood(b, start, limit = 120) {
  if (b[start] === 1) return 0;
  const seen = new Uint8Array(COLS * ROWS);
  const q = [start];
  seen[start] = 1;
  for (let qi = 0; qi < q.length && q.length < limit; qi++) {
    const k = q[qi];
    const x = k % COLS, y = (k / COLS) | 0;
    for (const d of ORDER) {
      const nx = x + DIRS[d].x, ny = y + DIRS[d].y;
      if (!inside(nx, ny)) continue;
      const nk = ny * COLS + nx;
      if (seen[nk] || b[nk] === 1) continue;
      seen[nk] = 1;
      q.push(nk);
    }
  }
  return q.length;
}

export function botThink(bot, player, board, orbs, cfg) {
  const snakes = [bot, player];
  const b = blockedGrid(board, snakes, bot);
  const h = bot.cells[0];
  const options = ORDER.filter((d) => d !== OPPOSITE[bot.dir]).map((d) => {
    const nx = h.x + DIRS[d].x, ny = h.y + DIRS[d].y;
    if (!inside(nx, ny)) return { d, ok: false };
    const k = ny * COLS + nx;
    if (b[k] === 1) return { d, ok: false };
    return { d, ok: true, k, space: flood(b, k), risky: b[k] === 2 };
  });
  const safe = options.filter((o) => o.ok);
  if (!safe.length) return bot.dir;
  const need = Math.min(bot.cells.length + 2, 40);
  const roomy = safe.filter((o) => o.space >= need && !o.risky);
  const pool = roomy.length ? roomy : safe.filter((o) => o.space >= need).length ? safe.filter((o) => o.space >= need) : safe;

  // mistakes (easy bot wanders)
  if (Math.random() < cfg.mistake) return pool[Math.floor(Math.random() * pool.length)].d;

  // choose a target: nearest orb, or cut-off cell in front of the player
  let targets = orbs.filter((o) => cfg.useGold || o.type !== 'gold').map((o) => ({ x: o.x, y: o.y }));
  if (!targets.length) targets = orbs.map((o) => ({ x: o.x, y: o.y }));
  if (cfg.aggression && player.alive && Math.random() < cfg.aggression) {
    const ph = player.cells[0];
    const pd = DIRS[player.dir];
    const ahead = { x: ph.x + pd.x * 2, y: ph.y + pd.y * 2 };
    const distBot = Math.abs(ahead.x - h.x) + Math.abs(ahead.y - h.y);
    if (inside(ahead.x, ahead.y) && distBot <= 5 && !board.isSolid(ahead.x, ahead.y)) targets = [ahead, ...targets];
  }
  const path = bfs(b, h, targets);
  if (path) {
    const fx = path.first % COLS, fy = (path.first / COLS) | 0;
    const d = ORDER.find((dd) => h.x + DIRS[dd].x === fx && h.y + DIRS[dd].y === fy);
    const opt = pool.find((o) => o.d === d);
    if (opt) return d;
  }
  // otherwise: go where there is most room
  pool.sort((a, b2) => b2.space - a.space);
  return pool[0].d;
}
