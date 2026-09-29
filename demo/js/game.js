// Game controller: rules for the four modes, grid movement with smooth
// interpolation, eating, growth, golden boost, combos, death, revive and win.
import { COLS, ROWS, BOTS, DUEL_LAYOUT, skinById } from './data.js';
import { Board, randomFreeCell, mapTheme } from './board.js';
import { drawSnake } from './snakedraw.js';
import { drawOrb, orbSpawnK } from './orbs.js';
import { FX, Ambient } from './fx.js';
import { botThink } from './bot.js';
import { DIRS, OPPOSITE, rand, clamp, lerp, ease, vibrate } from './util.js';

const COMBO_WINDOW = 3;
const BOOST_TIME = 4;
const GOLD_LIFE = 6;

class Snake {
  constructor(skin, spawn, isBot = false) {
    this.skin = skin;
    this.isBot = isBot;
    this.dir = spawn.dir;
    const d = DIRS[spawn.dir];
    this.cells = [];
    for (let i = 0; i < spawn.len; i++) this.cells.push({ x: spawn.x - d.x * i, y: spawn.y - d.y * i });
    this.prev = this.cells.map((c) => ({ ...c }));
    this.queue = [];
    this.grow = 0;
    this.alive = true;
    this.acc = 0;
    this.boostT = 0;
    this.ghostT = 0;
    this.history = [];
    this.orbs = 0;
    this.a = {
      mouth: 0, mouthTarget: 0, blink: 0, blinkT: rand(1.5, 4), tongue: 0, tongueT: rand(1, 3),
      squash: 0, bulges: [], death: 0, appear: 0, trailT: 0,
    };
  }

  snapshot() {
    this.history.push({ cells: this.cells.map((c) => ({ ...c })), dir: this.dir, grow: this.grow });
    if (this.history.length > 6) this.history.shift();
  }
}

export class Game {
  constructor(view, ui, cfg) {
    this.view = view; // {canvas, g, W, H, dpr}
    this.ui = ui;
    this.cfg = cfg; // {mode, level?, difficulty?, skinId, settings}
    this.mode = cfg.mode;
    this.fx = new FX();
    this.t = 0;
    this.timeScale = 1;
    this.state = 'intro';
    this.stateT = 0;
    this.score = 0;
    this.coinsRun = 0;
    this.combo = 1;
    this.lastEat = -10;
    this.orbs = [];
    this.revives = 0;
    this.eaten = 0;
    this.goldEaten = 0;
    this.speedLevel = 0;
    this.timer = this.mode === 'frenzy' ? 60 : 0;
    this.elapsed = 0;
    this.setup();
  }

  // ---------------------------------------------------------------- setup
  setup() {
    const { mode, level } = this.cfg;
    const skin = skinById(this.cfg.skinId);
    let layout = null, theme = 'court', spawn = { x: 5, y: 15, dir: 'up', len: 3 }, opts = {};
    if (mode === 'story') {
      theme = mapTheme(level.mapInfo);
      layout = level.layout;
      spawn = level.spawn;
      this.target = level.target;
      this.baseSpeed = level.speed;
      this.goldChance = level.goldChance;
      opts.spawns = [{ x: spawn.x, y: spawn.y, img: 'tiles/court/rune1.png' }];
    } else if (mode === 'classic') {
      this.baseSpeed = 4.6;
      this.goldChance = 0.14;
      opts.statues = true;
      opts.spawns = [{ x: spawn.x, y: spawn.y, img: 'tiles/court/rune1.png' }];
    } else if (mode === 'frenzy') {
      theme = 'glade';
      spawn = { x: 5, y: 12, dir: 'up', len: 3 };
      this.baseSpeed = 6.4;
      this.goldChance = 1;
      opts.spawns = [{ x: spawn.x, y: spawn.y, img: 'tiles/glade/rune1.png' }];
    } else if (mode === 'duel') {
      theme = 'ritual';
      layout = DUEL_LAYOUT;
      this.botCfg = BOTS[this.cfg.difficulty];
      this.target = this.botCfg.target;
      this.baseSpeed = 4.8;
      this.goldChance = this.cfg.difficulty === 'hard' ? 0.18 : 0.1;
      spawn = { x: 5, y: 15, dir: 'up', len: 3 };
      opts.spawns = [
        { x: 5, y: 15, img: 'tiles/ritual/spawn0.png' },
        { x: 6, y: 2, img: 'tiles/ritual/spawn2.png' },
      ];
    }
    this.board = new Board(theme, layout, opts);
    this.player = new Snake(skin, spawn);
    this.snakes = [this.player];
    if (mode === 'duel') {
      const b = this.botCfg;
      this.bot = new Snake({ ...b, id: b.id }, { x: 6, y: 2, dir: 'down', len: 3 }, true);
      this.bot.speedMult = b.speed;
      this.snakes.push(this.bot);
    }
    const amb = theme === 'glade' ? ['#FFE08A', '#FFF3C0', '#FFC94A'] : theme === 'ritual' ? ['#FFB040', '#FF6A3A', '#FFE0A0'] : ['#E8F5A0', '#FFE7A0', '#B8F0A0'];
    this.ambient = new Ambient(26, amb);
    this.resize();
    // first orbs
    if (mode === 'frenzy') for (let i = 0; i < 5; i++) this.spawnOrb('gold', true);
    else this.spawnOrb('red');
  }

  resize() {
    const { W, H, dpr } = this.view;
    const pad = this.cfg.settings && this.cfg.settings.controls === 'buttons';
    this.board.layoutIn(W, H, H * 0.118, pad ? H * 0.2 : H * 0.08);
    this.board.prerender(dpr);
    this.ambient.resize(this.board.w, this.board.h);
    this.R = this.board.cell * 0.34;
  }

  // ---------------------------------------------------------------- orbs
  occupiedSet() {
    const occ = new Set();
    for (const s of this.snakes) for (const c of s.cells) occ.add(c.y * COLS + c.x);
    for (const o of this.orbs) occ.add(o.y * COLS + o.x);
    return occ;
  }

  spawnOrb(type, instant = false) {
    const cell = randomFreeCell(this.board, this.occupiedSet(), this.player.cells[0]);
    if (!cell) return;
    const o = { ...cell, type, born: instant ? this.t - 1 : this.t, life: type === 'gold' && this.mode !== 'frenzy' ? GOLD_LIFE : Infinity };
    this.orbs.push(o);
    const x = this.board.cx(o.x), y = this.board.cy(o.y);
    if (!instant) {
      this.fx.burst(x, y, 10, { type: 'dot', color: type === 'gold' ? ['#FFE08A', '#FFC23A'] : ['#FF8A8A', '#FF3A4A'], speed: 90, size: 5, life: 0.5 });
    }
  }

  // ---------------------------------------------------------------- input
  input(dir) {
    const s = this.player;
    if (this.state === 'ready') {
      if (dir === OPPOSITE[s.dir] && s.cells.length > 1) return;
      s.dir = dir;
      s.queue = [];
      s.acc = 0;
      s.ghostT = 2.2;
      this.setState('play');
      this.ui.hideHint();
      return;
    }
    if (this.state !== 'play' && this.state !== 'countdown') return;
    const last = s.queue.length ? s.queue[s.queue.length - 1] : s.dir;
    if (dir === last || dir === OPPOSITE[last]) return;
    if (s.queue.length < 2) s.queue.push(dir);
  }

  // Relative turn (tap controls): left / right of where the snake is heading.
  turn(side) {
    const s = this.player;
    const ref = s.queue.length ? s.queue[s.queue.length - 1] : s.dir;
    const L = { up: 'left', left: 'down', down: 'right', right: 'up' };
    const Rt = { up: 'right', right: 'down', down: 'left', left: 'up' };
    this.input(side === 'left' ? L[ref] : Rt[ref]);
  }

  setState(st) {
    this.state = st;
    this.stateT = 0;
  }

  // ---------------------------------------------------------------- update
  update(dtReal) {
    this.timeScale = lerp(this.timeScale, 1, 1 - Math.exp(-dtReal * 2.2));
    const dt = dtReal * this.timeScale;
    this.t += dt;
    this.stateT += dtReal;
    this.fx.update(dt);
    this.ambient.update(dt, this.t);
    for (const s of this.snakes) this.animate(s, dt);

    if (this.state === 'intro') {
      for (const s of this.snakes) s.a.appear = clamp(this.stateT / 0.7, 0, 1);
      if (this.stateT > 0.75) {
        this.setState('countdown');
        this.ui.countdown(() => { if (this.state === 'countdown') this.setState('play'); });
      }
      return;
    }
    if (this.state === 'dying') {
      this.player.a.death = clamp(this.stateT / 0.55, 0, 1);
      if (this.stateT > 0.95 && !this.reviveShown) {
        this.reviveShown = true;
        this.ui.showRevive(this.reviveInfo());
      }
      return;
    }
    if (this.state === 'crumble') {
      if (this.stateT > 1.1 && !this.overShown) {
        this.overShown = true;
        this.finish(false);
      }
      return;
    }
    if (this.state === 'won') {
      if (this.stateT > 1.3 && !this.overShown) {
        this.overShown = true;
        this.finish(true);
      }
      return;
    }
    if (this.state !== 'play') return;

    this.elapsed += dt;
    if (this.mode === 'frenzy') {
      this.timer = Math.max(0, this.timer - dt);
      this.ui.hudTimer(this.timer);
      if (this.timer <= 0) {
        this.timeScale = 0.25;
        this.fx.flash(this.board.cx(5.5), this.board.cy(8.5), '#FFD36A', this.board.w, 0.6);
        this.setState('won');
        return;
      }
    }

    // orb lifetimes
    for (let i = this.orbs.length - 1; i >= 0; i--) {
      const o = this.orbs[i];
      if (this.t - o.born > o.life) {
        this.fx.burst(this.board.cx(o.x), this.board.cy(o.y), 8, { type: 'dust', color: '#FFE08A', speed: 60, size: 10, life: 0.6, add: false });
        this.orbs.splice(i, 1);
      }
    }

    for (const s of this.snakes) {
      if (!s.alive) continue;
      const speed = this.baseSpeed * (s.speedMult || 1) * (s.boostT > 0 ? (this.mode === 'frenzy' ? 1.25 : 1.85) : 1);
      const interval = 1 / speed;
      s.interval = interval;
      s.acc += dt;
      let guard = 0;
      while (s.acc >= interval && s.alive && this.state === 'play' && guard++ < 3) {
        s.acc -= interval;
        this.step(s);
      }
      if (s.boostT > 0) {
        s.boostT -= dt;
        if (s === this.player) this.ui.hudBoost(Math.max(0, s.boostT) / BOOST_TIME);
      }
      if (s.ghostT > 0) s.ghostT -= dt;
    }
  }

  animate(s, dt) {
    const a = s.a;
    a.mouth += (a.mouthTarget - a.mouth) * (1 - Math.exp(-dt * (a.mouthTarget > a.mouth ? 14 : 20)));
    a.squash = Math.max(0, a.squash - dt * 4);
    a.blinkT -= dt;
    if (a.blinkT < 0) { a.blink = 1; a.blinkT = rand(2, 5); }
    a.blink = Math.max(0, a.blink - dt * 7);
    a.tongueT -= dt;
    if (a.tongueT < 0 && a.mouth < 0.05) { a.tongue = 1; a.tongueT = rand(1.8, 4); }
    a.tongue = Math.max(0, a.tongue - dt * 3.2);
    const lenPx = s.cells.length * this.board.cell;
    for (let i = a.bulges.length - 1; i >= 0; i--) {
      const b = a.bulges[i];
      if (b.delay > 0) { b.delay -= dt; continue; }
      b.d += this.board.cell * 5.5 * dt;
      if (b.d > lenPx) a.bulges.splice(i, 1);
    }
    // skin trail particles
    a.trailT -= dt;
    if (a.trailT < 0 && s.alive && this.state !== 'intro') {
      a.trailT = s.boostT > 0 ? 0.025 : 0.35;
      this.emitTrail(s);
    }
  }

  emitTrail(s) {
    const tail = s.cells[s.cells.length - 1];
    const x = this.board.cx(tail.x) + rand(-6, 6), y = this.board.cy(tail.y) + rand(-6, 6);
    if (s.boostT > 0) {
      this.fx.emit({ x, y, vx: rand(-20, 20), vy: rand(-20, 20), type: 'dot', color: '#FFD36A', size: rand(3, 6), life: 0.5 });
      return;
    }
    const c = s.skin.colors || ['#86AE5E', '#D8E88A', '#4E6E34'];
    const slow = { x, y, vx: rand(-10, 10), vy: rand(6, 18), add: false, drag: 0.6, life: 1.6 };
    const spark = { x, y, vx: rand(-10, 10), vy: rand(-10, 10), life: 0.9 };
    switch (s.skin.trail) {
      case 'leaf': this.fx.emit({ ...slow, type: 'leaf', color: c[2], size: 5 }); break;
      case 'maple': this.fx.emit({ ...slow, type: 'leaf', color: '#B8262A', size: 5 }); break;
      case 'feather': this.fx.emit({ ...slow, type: 'leaf', color: '#3F7A52', size: 6 }); break;
      case 'petal': this.fx.emit({ ...slow, type: 'petal', color: '#F7B6C8', size: 5 }); break;
      case 'ember': this.fx.emit({ x, y, vx: rand(-10, 10), vy: rand(-34, -12), type: 'dot', color: c[1], size: 3, life: 1.0 }); break;
      case 'frost': case 'sparkle': case 'star': case 'spirit':
        this.fx.emit({ ...spark, type: 'star', color: c[1], size: 2.6, life: 1.1 }); break;
      case 'toxic': case 'digital': case 'spores': case 'bubble': case 'shadow':
        this.fx.emit({ ...spark, type: 'dot', color: c[1], size: 3.2 }); break;
      case 'metal': this.fx.emit({ ...spark, type: 'spark', color: '#F2F6FF', size: 3, life: 0.4, vx: rand(-80, 80), vy: rand(-80, 80) }); break;
      case 'blood': this.fx.emit({ ...slow, type: 'petal', color: c[1], size: 3 }); break;
      default: if (Math.random() < 0.5) this.fx.emit({ ...spark, type: 'dust', color: c[1], size: 7, add: false });
    }
  }

  step(s) {
    if (s.isBot) {
      s.dir = botThink(s, this.player, this.board, this.orbs, { mistake: this.botCfg.mistake, aggression: this.botCfg.aggression, useGold: this.cfg.difficulty === 'hard' });
    } else if (s.queue.length) {
      const d = s.queue.shift();
      if (d !== OPPOSITE[s.dir]) s.dir = d;
    }
    const d = DIRS[s.dir];
    const h = s.cells[0];
    let nx = h.x + d.x, ny = h.y + d.y;
    const wrap = this.mode === 'frenzy';
    if (wrap) {
      nx = (nx + COLS) % COLS;
      ny = (ny + ROWS) % ROWS;
    }
    // collisions
    let reason = null;
    if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) reason = 'wall';
    else if (this.board.isSolid(nx, ny)) reason = 'obstacle';
    else if (s.ghostT <= 0) {
      const selfLen = s.grow > 0 ? s.cells.length : s.cells.length - 1;
      for (let i = 0; i < selfLen; i++) if (s.cells[i].x === nx && s.cells[i].y === ny) { reason = 'self'; break; }
      if (!reason) {
        for (const o of this.snakes) {
          if (o === s || !o.alive) continue;
          if (o.ghostT > 0) continue;
          for (const c of o.cells) if (c.x === nx && c.y === ny) { reason = 'snake'; break; }
          if (reason) break;
        }
      }
    }
    if (reason) {
      this.die(s, reason, nx, ny);
      return;
    }
    s.snapshot();
    s.prev = s.cells.map((c) => ({ ...c }));
    s.cells.unshift({ x: nx, y: ny });
    if (s.grow > 0) s.grow--;
    else s.cells.pop();
    s.acc = Math.min(s.acc, s.interval || 0.2);

    // eat
    const oi = this.orbs.findIndex((o) => o.x === nx && o.y === ny);
    if (oi >= 0) this.eat(s, this.orbs[oi], oi);

    // mouth anticipation: an orb within 2 cells straight ahead
    let near = false;
    for (let k = 1; k <= 2; k++) {
      let ax = nx + d.x * k, ay = ny + d.y * k;
      if (wrap) { ax = (ax + COLS) % COLS; ay = (ay + ROWS) % ROWS; }
      if (this.orbs.some((o) => o.x === ax && o.y === ay)) near = true;
    }
    s.a.mouthTarget = near ? 1 : 0;
  }

  eat(s, orb, idx) {
    this.orbs.splice(idx, 1);
    const x = this.board.cx(orb.x), y = this.board.cy(orb.y);
    const gold = orb.type === 'gold';
    const R = this.R;
    s.a.mouth = 1;
    s.a.mouthTarget = 0;
    s.a.squash = 1;
    s.orbs++;

    if (s === this.player) {
      this.eaten++;
      if (this.t - this.lastEat < COMBO_WINDOW) this.combo = Math.min(5, this.combo + 1);
      else this.combo = 1;
      this.lastEat = this.t;
      const pts = (gold ? 30 : 10) * this.combo;
      this.score += pts;
      vibrate(gold ? 30 : 12, this.cfg.settings.vibration);
      this.fx.text(x, y - R, `+${pts}`, gold ? '#FFE08A' : '#FFD0D0', gold ? 46 : 38);
      if (this.combo > 1) this.ui.combo(this.combo);
    }

    if (gold) {
      s.grow += 3;
      s.boostT = BOOST_TIME;
      if (s === this.player) this.goldEaten++;
      for (let i = 0; i < 3; i++) s.a.bulges.push({ d: 0, amp: 0.62, delay: i * 0.16 });
      this.fx.flash(x, y, '#FFD36A', R * 7, 0.45);
      this.fx.ring(x, y, '#FFE08A', R * 5, 0.55, 8);
      this.fx.ring(x, y, '#FFB020', R * 8, 0.8, 4);
      this.fx.burst(x, y, 34, { type: 'spark', color: ['#FFE08A', '#FFC23A', '#FFFFFF'], speed: 520, speedMin: 160, size: 6, life: 0.6, drag: 3.5 });
      this.fx.burst(x, y, 12, { type: 'star', color: '#FFD36A', speed: 220, size: 5, life: 0.9, drag: 2.5 });
      if (s === this.player) {
        this.fx.shake(7, 0.35);
        if (this.mode !== 'frenzy') this.ui.banner('¡VELOCIDAD x2!', 'gold');
        this.ui.goldFlash();
      }
    } else {
      s.grow += 1;
      s.a.bulges.push({ d: 0, amp: 0.46, delay: 0 });
      this.fx.flash(x, y, '#FF4A5A', R * 4.2, 0.3);
      this.fx.ring(x, y, '#FF6A6A', R * 3.6, 0.45, 6);
      this.fx.burst(x, y, 20, { type: 'spark', color: ['#FF6A6A', '#FF2A3A', '#FFC0C0'], speed: 360, speedMin: 120, size: 5, life: 0.45, drag: 3.5 });
      this.fx.burst(x, y, 6, { type: 'dot', color: '#FF8A8A', speed: 120, size: 6, life: 0.5 });
      if (s === this.player) this.fx.shake(2.5, 0.2);
    }

    // respawn rules
    if (this.mode === 'frenzy') {
      this.spawnOrb('gold');
    } else if (!gold) {
      this.spawnOrb('red');
      if (!this.orbs.some((o) => o.type === 'gold') && Math.random() < this.goldChance) this.spawnOrb('gold');
    }

    // mode rules
    if (this.mode === 'classic' && s === this.player) {
      const lvl = Math.floor(this.eaten / 10);
      if (lvl > this.speedLevel && this.baseSpeed < 9) {
        this.speedLevel = lvl;
        this.baseSpeed += 0.35;
        this.ui.banner('¡MÁS RÁPIDO!', 'white');
      }
    }
    this.updateHud();
    if ((this.mode === 'story' || this.mode === 'duel') && s.orbs >= this.target) {
      if (s === this.player) this.win();
      else this.lose('bot');
    }
  }

  updateHud() {
    const h = { score: this.score, mode: this.mode };
    if (this.mode === 'story') h.objective = { cur: Math.min(this.player.orbs, this.target), target: this.target };
    if (this.mode === 'classic') h.length = this.player.cells.length + this.player.grow;
    if (this.mode === 'duel') h.duel = { p: this.player.orbs, b: this.bot.orbs, target: this.target, name: this.botCfg.name };
    this.ui.hud(h);
  }

  die(s, reason, nx, ny) {
    const h = s.cells[0];
    const x = this.board.cx(h.x) + (nx - h.x) * this.board.cell * 0.45;
    const y = this.board.cy(h.y) + (ny - h.y) * this.board.cell * 0.45;
    this.fx.flash(x, y, '#FFFFFF', this.R * 5, 0.3);
    this.fx.burst(x, y, 26, { type: 'dust', color: '#D8C8A0', speed: 200, size: 18, life: 0.9, add: false, drag: 3 });
    this.fx.burst(x, y, 16, { type: 'leaf', color: '#7FAE4E', speed: 240, size: 7, life: 1.3, add: false, drag: 2, grav: 60 });
    this.fx.burst(x, y, 14, { type: 'spark', color: '#FFFFFF', speed: 420, size: 4, life: 0.35 });
    s.a.mouthTarget = 0;
    if (s.isBot) {
      s.alive = false;
      this.crumble(s);
      this.win();
      return;
    }
    s.alive = false;
    this.deathReason = reason;
    this.fx.shake(14, 0.5);
    this.timeScale = 0.3;
    vibrate([40, 30, 60], this.cfg.settings.vibration);
    this.ui.hitFlash();
    this.reviveShown = false;
    this.setState('dying');
  }

  crumble(s) {
    const n = s.cells.length;
    s.cells.forEach((c, i) => {
      const x = this.board.cx(c.x), y = this.board.cy(c.y);
      const col = s.skin.colors || ['#888888'];
      this.fx.burst(x, y, 4, { type: 'leaf', color: col, speed: 110, size: 7, life: 1.2 + (i / n) * 0.6, add: false, drag: 2.2, grav: 40 });
      this.fx.burst(x, y, 2, { type: 'dust', color: '#9A9A88', speed: 60, size: 16, life: 0.9, add: false });
    });
    s.hidden = true;
  }

  reviveInfo() {
    const info = { mode: this.mode, revives: this.revives, score: this.score };
    if (this.mode === 'story') info.left = this.target - this.player.orbs, info.cur = this.player.orbs, info.target = this.target;
    if (this.mode === 'duel') info.cur = this.player.orbs, info.target = this.target;
    return info;
  }

  revive() {
    const s = this.player;
    this.revives++;
    const snap = s.history.length >= 2 ? s.history[s.history.length - 2] : s.history[s.history.length - 1];
    if (snap) {
      s.cells = snap.cells.map((c) => ({ ...c }));
      s.dir = snap.dir;
      s.grow = Math.max(s.grow, snap.grow);
      s.history = [];
    }
    s.prev = s.cells.map((c) => ({ ...c }));
    s.alive = true;
    s.hidden = false;
    s.queue = [];
    s.boostT = 0;
    s.a.death = 0;
    s.acc = 0;
    // clear orbs sitting on the snake
    const occ = new Set(s.cells.map((c) => c.y * COLS + c.x));
    this.orbs = this.orbs.filter((o) => !occ.has(o.y * COLS + o.x));
    if (!this.orbs.some((o) => o.type === 'red') && this.mode !== 'frenzy') this.spawnOrb('red');
    const h = s.cells[0];
    const x = this.board.cx(h.x), y = this.board.cy(h.y);
    this.fx.ring(x, y, '#E8B04A', this.R * 7, 0.8, 6);
    this.fx.burst(x, y, 30, { type: 'star', color: '#FFD36A', speed: 260, size: 4, life: 1 });
    s.ghostT = 99; // until the player swipes
    this.setState('ready');
    this.ui.showHint('DESLIZA PARA CONTINUAR');
  }

  giveUp() {
    this.crumble(this.player);
    this.setState('crumble');
  }

  win() {
    if (this.state === 'won') return;
    this.timeScale = 0.3;
    const h = this.player.cells[0];
    const x = this.board.cx(h.x), y = this.board.cy(h.y);
    this.fx.flash(x, y, '#FFE08A', this.board.cell * 6, 0.8);
    for (let i = 0; i < 3; i++) this.fx.ring(x, y, '#FFE08A', this.board.cell * (4 + i * 3), 0.8 + i * 0.2, 6);
    this.fx.burst(x, y, 60, { type: 'star', color: ['#FFE08A', '#FFFFFF', '#E8B04A'], speed: 520, size: 6, life: 1.4, drag: 1.6 });
    this.fx.burst(x, y, 30, { type: 'leaf', color: ['#9CDA6B', '#E8B04A', '#F7B6C8'], speed: 380, size: 8, life: 2, add: false, drag: 1.4, grav: 50 });
    this.player.boostT = 0.0001;
    vibrate([20, 40, 20], this.cfg.settings.vibration);
    this.setState('won');
  }

  lose(why) {
    this.player.alive = false;
    this.player.a.death = 1;
    this.crumble(this.player);
    this.loseReason = why;
    this.setState('crumble');
  }

  finish(won) {
    this.ui.finish({
      mode: this.mode, won, score: this.score, orbs: this.eaten, gold: this.goldEaten,
      length: this.player.cells.length + this.player.grow, time: this.elapsed,
      level: this.cfg.level, difficulty: this.cfg.difficulty, loseReason: this.loseReason,
      duel: this.bot ? { p: this.player.orbs, b: this.bot.orbs } : null,
    });
  }

  // ---------------------------------------------------------------- render
  snakePoints(s, tInterp) {
    const b = this.board;
    const pts = [];
    const breaks = new Set();
    const n = s.cells.length;
    for (let i = 0; i < n; i++) {
      const c = s.cells[i];
      const p = s.prev[Math.min(i, s.prev.length - 1)];
      let fx = p.x, fy = p.y;
      if (Math.abs(c.x - p.x) > 1) fx = c.x + (c.x > p.x ? 1 : -1);
      if (Math.abs(c.y - p.y) > 1) fy = c.y + (c.y > p.y ? 1 : -1);
      const x = lerp(fx, c.x, tInterp), y = lerp(fy, c.y, tInterp);
      pts.push({ x: b.x + (x + 0.5) * b.cell, y: b.y + (y + 0.5) * b.cell });
      if (i > 0) {
        const q = pts[i - 1];
        if (Math.abs(q.x - pts[i].x) > b.cell * 1.5 || Math.abs(q.y - pts[i].y) > b.cell * 1.5) breaks.add(i - 1);
      }
    }
    return { pts, breaks };
  }

  render() {
    const { g, W, H } = this.view;
    const b = this.board;
    g.clearRect(0, 0, W, H);
    g.save();
    const [sx, sy] = this.fx.shakeOffset();
    g.translate(sx, sy);

    // intro: board rises in
    let k = 1;
    if (this.state === 'intro') k = ease.outCubic(clamp(this.stateT / 0.6, 0, 1));
    g.globalAlpha = k;
    if (k < 1) {
      g.translate(W / 2, b.y + b.h / 2);
      g.scale(0.94 + 0.06 * k, 0.94 + 0.06 * k);
      g.translate(-W / 2, -(b.y + b.h / 2));
    }
    b.drawStatic(g);
    b.drawLive(g, this.t, this.player.boostT > 0 ? 0.3 : 0);

    // orbs
    for (const o of this.orbs) {
      const warn = o.life !== Infinity && this.t - o.born > o.life - 2;
      drawOrb(g, b.cx(o.x), b.cy(o.y), b.cell, o.type, this.t, { spawnK: orbSpawnK(o, this.t), warn });
    }
    this.fx.drawUnder(g);

    // snakes
    const clip = this.mode === 'frenzy' ? { x: b.x - 2, y: b.y - 2, w: b.w + 4, h: b.h + 4 } : null;
    for (const s of [...this.snakes].reverse()) {
      if (s.hidden) continue;
      const moving = this.state === 'play' && s.alive;
      const ti = moving ? clamp(s.acc / (s.interval || 1), 0, 1) : (this.state === 'intro' || this.state === 'countdown' || this.state === 'ready' ? 0 : 1);
      const { pts, breaks } = this.snakePoints(s, ti);
      const len = s.cells.length;
      const fat = 1 + Math.min(0.22, (len - 3) * 0.0055);
      g.save();
      if (s.a.appear < 1) g.globalAlpha = s.a.appear;
      drawSnake(g, pts, s.skin, {
        R: this.R, mouth: s.a.mouth, blink: s.a.blink, tongue: s.a.tongue, squash: s.a.squash,
        bulges: s.a.bulges.filter((q) => q.delay <= 0), glow: s.boostT > 0 ? clamp(s.boostT / 0.6, 0, 1) : 0,
        ghost: s.ghostT > 0 && this.state === 'play', death: s.a.death, t: this.t, breaks, fat, clip,
      });
      g.restore();
    }

    // ambient light motes over the board
    g.save();
    g.translate(b.x, b.y);
    this.ambient.draw(g, this.t, 0.85);
    g.restore();

    this.fx.drawOver(g);
    g.restore();
  }
}
