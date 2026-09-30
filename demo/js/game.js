// Game controller: rules for the four modes, grid movement with smooth
// interpolation, eating, growth, golden boost, combos, death, revive and win.
import { COLS, ROWS, BOTS, DUEL_LAYOUT, skinById } from './data.js';
import { Board, randomFreeCell } from './board.js';
import { MapBoard } from './mapboard.js';
import { buildLevel, reshuffleObstacles, MAPDEF, T } from './maps.js';
import { PW, MAGNET_RANGE, ITEM_LIFE, SHIELD_CHARGES, drawItem, drawAuras, pwImg, tinted, skinColor } from './powerups.js';
import { track } from './meta.js';
import { CONFIG } from './config.js';
import * as audio from './audio.js';
import { drawSnake } from './snakedraw.js';
import { drawOrb, orbSpawnK } from './orbs.js';
import { FX, Ambient, MapAmbient, glowSprite } from './fx.js';
import { botThink } from './bot.js';
import { DIRS, OPPOSITE, TAU, rand, clamp, lerp, ease, vibrate } from './util.js';

const COMBO_WINDOW = 3;
const BOOST_TIME = 4;
const GOLD_LIFE = 6;
const STAR_CHANCE = CONFIG.tester ? 0.16 : 0.035;

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
      squash: 0, bulges: [], waves: [], death: 0, appear: 0, trailT: 0,
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
    // pickups, effects and run statistics
    this.items = [];
    this.pw = { magnet: 0, portal: 0, shield: 0, star: 0 };
    this.itemClock = 0;
    this.nextShield = 9;
    this.nextUtil = 22;
    this.starDone = false;
    this.deaths = 0;
    this.itemsPicked = 0;
    this.shifted = false;
    this.whiteT = 0;
    this.redLife = Infinity;
    this.goldLife = GOLD_LIFE;
    this.magnetT = 0;
    this.tut = null;
    this.setup();
  }

  // ---------------------------------------------------------------- setup
  setup() {
    const { mode, level } = this.cfg;
    const skin = skinById(this.cfg.skinId);
    let layout = null, theme = 'court', spawn = { x: 5, y: 14, dir: 'up', len: 4 }, opts = {};
    if (mode === 'story') {
      this.lv = buildLevel(level.map, level.n, level.diff);
      spawn = this.lv.spawn;
      this.target = level.target;
      this.baseSpeed = level.speed;
      this.goldChance = level.goldChance;
      this.par = Math.round((this.target * 12) / this.baseSpeed);
      this.eventLevel = !level.tutorial && (level.season ? level.n % 5 === 0 : level.n === 5 || level.n === 10);
      if (level.tutorial) this.tut = { step: 0, turns: 0 };
    } else if (mode === 'classic') {
      this.baseSpeed = 4.6;
      this.goldChance = 0.14;
      opts.statues = true;
      opts.spawns = [{ x: spawn.x, y: spawn.y, img: 'tiles/court/rune1.png' }];
    } else if (mode === 'frenzy') {
      theme = 'glade';
      spawn = { x: 5, y: 12, dir: 'up', len: 4 };
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
      spawn = { x: 5, y: 14, dir: 'up', len: 4 };
      opts.spawns = [
        { x: 5, y: 14, img: 'tiles/ritual/spawn0.png' },
        { x: 6, y: 3, img: 'tiles/ritual/spawn2.png' },
      ];
    }
    this.board = mode === 'story' ? new MapBoard(this.lv) : new Board(theme, layout, opts);
    this.player = new Snake(skin, spawn);
    this.snakes = [this.player];
    if (mode === 'duel') {
      const b = this.botCfg;
      this.bot = new Snake({ ...b, id: b.id }, { x: 6, y: 3, dir: 'down', len: 4 }, true);
      this.bot.speedMult = b.speed;
      this.snakes.push(this.bot);
    }
    const amb = theme === 'glade' ? ['#FFE08A', '#FFF3C0', '#FFC94A'] : theme === 'ritual' ? ['#FFB040', '#FF6A3A', '#FFE0A0'] : ['#E8F5A0', '#FFE7A0', '#B8F0A0'];
    this.low = !!(this.cfg.settings && this.cfg.settings.lowfx);
    this.board.low = this.low;
    this.ambient = mode === 'story' ? new MapAmbient(MAPDEF[level.map].amb.kind, MAPDEF[level.map].amb.colors, this.low ? 10 : 34) : new Ambient(this.low ? 8 : 26, amb);
    if (this.low) this.fx.cap = 220;
    this.resize();
    // first orbs
    if (mode === 'frenzy') for (let i = 0; i < 5; i++) this.spawnOrb('gold', true);
    else this.spawnOrb('red');
  }

  resize() {
    const { W, H, dpr } = this.view;
    const buttons = this.cfg.settings && this.cfg.settings.controls === 'buttons';
    const rem = parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
    // board as high as possible: right under the HUD (pause, objective, score)
    const hud = this.ui.hudEl && this.ui.hudEl.querySelector('.hud');
    const hr = hud && hud.getBoundingClientRect();
    const top = hr && hr.height > 0 ? hr.bottom + 2 : rem * 4.6;
    // room under the board: a strip for the warning banner, then the d-pad (buttons) or the level tag
    const strip = rem * 2.6;
    const padH = buttons ? rem * 8.4 + rem * 1.1 : 0;
    const bottom = buttons ? strip + padH : rem * 2.6;
    this.board.layoutIn(W, H, top, bottom, true);
    this.board.prerender(dpr);
    this.ambient.resize(this.board.w, this.board.h);
    this.R = this.board.cell * 0.34;
    const under = this.board.y + this.board.h + this.board.frame; // first free pixel below the frame
    if (this.ui.placeUnderBoard) this.ui.placeUnderBoard(under, H, strip, this.board.y - this.board.frame);
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
    const o = { ...cell, type, born: instant ? this.t - 1 : this.t, life: type === 'gold' && this.mode !== 'frenzy' ? this.goldLife : type === 'red' ? this.redLife : Infinity };
    this.orbs.push(o);
    const x = this.board.cx(o.x), y = this.board.cy(o.y);
    if (!instant) {
      this.fx.burst(x, y, 10, { type: 'dot', color: type === 'gold' ? ['#FFE08A', '#FFC23A'] : ['#FF8A8A', '#FF3A4A'], speed: 90, size: 5, life: 0.5 });
    }
  }

  // ---------------------------------------------------------------- obstacle warning
  // For the first seconds every dangerous cell (obstacles, water, lava, spikes) pulses red.
  startWarning(silent = false) {
    if (!silent) this.resize(); // the HUD has its final size by now
    const b = this.board, cells = [];
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      const k = y * COLS + x;
      if (b.solid[k] || (b.lethal && b.lethal[k])) cells.push({ x, y });
    }
    this.warnCells = cells;
    this.warnDur = silent ? 3 : 5;
    if (cells.length) {
      this.warnT = this.warnDur;
      for (let i = 0; i < (silent ? 3 : 5); i++) audio.play('alert_pulse', { delay: i * 1.0, vol: 0.6 });
      if (!silent && !this.tut && this.ui.warnBanner) this.ui.warnBanner(this.warnDur);
    }
  }

  drawWarning(g) {
    if (!(this.warnT > 0) || !this.warnCells || !this.warnCells.length) return;
    const b = this.board, s = b.cell;
    const el = this.warnDur - this.warnT;
    const fade = Math.min(1, el / 0.3, this.warnT / 0.6);
    const pulse = 0.5 + 0.5 * Math.sin(el * Math.PI * 2 * 1.7 - Math.PI / 2);
    const a = fade * (0.28 + 0.5 * pulse);
    const cb = !!(this.cfg.settings && this.cfg.settings.colorblind);
    g.save();
    for (const c of this.warnCells) {
      const x = b.x + c.x * s, y = b.y + c.y * s;
      g.globalCompositeOperation = 'source-over';
      g.fillStyle = `rgba(255,30,30,${a * 0.55})`;
      g.fillRect(x, y, s, s);
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = Math.min(1, a * 0.9);
      g.drawImage(glowSprite('#FF3C28', 64), x - s * 0.5, y - s * 0.5, s * 2, s * 2);
      g.globalAlpha = 1;
      g.globalCompositeOperation = 'source-over';
      g.strokeStyle = `rgba(255,80,70,${Math.min(1, a + 0.25)})`;
      g.lineWidth = Math.max(1.5, s * 0.05);
      g.strokeRect(x + 1.5, y + 1.5, s - 3, s - 3);
      if (cb) { // colour-blind mode: white diagonal stripes and an X so the danger never depends on red
        g.save();
        g.beginPath(); g.rect(x + 2, y + 2, s - 4, s - 4); g.clip();
        g.strokeStyle = `rgba(255,255,255,${Math.min(0.95, a + 0.3)})`;
        g.lineWidth = Math.max(2, s * 0.07);
        g.beginPath();
        for (let k = -s; k < s * 2; k += s * 0.3) { g.moveTo(x + k, y + s); g.lineTo(x + k + s, y); }
        g.moveTo(x + s * 0.28, y + s * 0.28); g.lineTo(x + s * 0.72, y + s * 0.72);
        g.moveTo(x + s * 0.72, y + s * 0.28); g.lineTo(x + s * 0.28, y + s * 0.72);
        g.stroke();
        g.restore();
      }
    }
    g.restore();
  }


  // ---------------------------------------------------------------- pickups & effects
  headPixel() {
    if (this.headPx) return this.headPx;
    const h = this.player.cells[0];
    return { x: this.board.cx(h.x), y: this.board.cy(h.y) };
  }

  spawnItem(type, at) {
    if (!this.board.breakCell && type === 'shield') return null; // only story boards have breakable obstacles
    const cell = at || randomFreeCell(this.board, this.occupiedSet(), this.player.cells[0]);
    if (!cell) return null;
    const it = { ...cell, type, born: this.t, life: ITEM_LIFE };
    this.items.push(it);
    const x = this.board.cx(it.x), y = this.board.cy(it.y);
    this.fx.ring(x, y, PW[type].glow, this.R * 4, 0.6, 5);
    this.fx.burst(x, y, 14, { type: 'star', color: PW[type].glow, speed: 150, size: 4, life: 0.7 });
    audio.play('item_spawn', { vol: 0.8 });
    this.introFirst(it);
    return it;
  }

  // the first time each item appears the game stops and the item is explained
  introFirst(it) {
    const seen = this.cfg.settings.itemsSeen || (this.cfg.settings.itemsSeen = {});
    if (seen[it.type] || this.tut) { if (this.tut) seen[it.type] = true; return; }
    seen[it.type] = true;
    this.paused = true;
    this.ui.itemIntro(it.type, this.board.cx(it.x), this.board.cy(it.y), () => { this.paused = false; });
  }

  // items appear on a steady rhythm so the player always has something to play with
  updateItems(dt) {
    if (this.mode !== 'story') return;
    this.itemClock += dt;
    for (let i = this.items.length - 1; i >= 0; i--) {
      if (this.t - this.items[i].born > this.items[i].life) this.items.splice(i, 1);
    }
    if (this.tut) return;
    if (this.itemClock > this.nextShield && !this.items.some((i) => i.type === 'shield')) {
      if (this.pw.shield === 0) this.spawnItem('shield');
      this.nextShield = this.itemClock + 26;
    }
    if (this.itemClock > this.nextUtil && this.items.length < 2) {
      this.spawnItem(Math.random() < 0.5 ? 'magnet' : 'portal');
      this.nextUtil = this.itemClock + 34;
    }
  }

  // streaks behind the head while the golden star or a golden boost is running
  trailFx(dt) {
    const s = this.player;
    if (!s.alive || this.low) return;
    const star = this.pw.star > 0, boost = s.boostT > 0;
    if (!star && !boost) return;
    this.trailT = (this.trailT || 0) - dt;
    if (this.trailT > 0) return;
    this.trailT = star ? 0.07 : 0.11;
    const hp = this.headPixel();
    const R = this.R;
    const ang = { up: -Math.PI / 2, down: Math.PI / 2, left: Math.PI, right: 0 }[s.dir] || 0;
    if (star) this.fx.sprite(hp.x - Math.cos(ang) * R, hp.y - Math.sin(ang) * R, pwImg('star_streak'), R * 3.2, 0.35, ang + Math.PI / 4, 0.8);
    this.fx.burst(hp.x, hp.y, star ? 3 : 2, { type: 'star', color: star ? ['#FFE08A', '#FFFFFF'] : ['#FFD36A', '#B8FF1A'], speed: 60, size: 3.5, life: 0.6, drag: 3 });
  }

  // a burst of fireworks over the board (level cleared)
  fireworks(n) {
    const b = this.board;
    for (let i = 0; i < n; i++) {
      setTimeout(() => {
        if (this.ui.game !== this) return;
        const x = b.cx(1.5 + Math.random() * 9), y = b.cy(2 + Math.random() * 12);
        const gold = i % 2 === 0;
        this.fx.sprite(x, y, pwImg(gold ? 'burst_gold' : 'burst_lime'), this.R * rand(7, 10), 0.8, rand(TAU));
        this.fx.rays(x, y, gold ? '#FFE08A' : '#D8FF6A', this.R * 9, 0.8, 10);
        this.fx.burst(x, y, 24, { type: 'star', color: gold ? ['#FFE08A', '#FFFFFF'] : ['#D8FF6A', '#FFFFFF'], speed: 420, size: 5, life: 1.1, drag: 2, grav: 120 });
        audio.play('star_pop', { rate: 0.9 + Math.random() * 0.4, vol: 0.5 });
      }, 250 + i * 260);
    }
  }

  pickItem(s, it) {
    const def = PW[it.type];
    audio.play('item_pick', { rate: { shield: 1, magnet: 0.9, portal: 1.1, star: 1.25 }[it.type] || 1 });
    if (it.type === 'magnet') audio.loop('magnet_loop', { vol: 0.5 });
    if (it.type === 'star') { audio.loop('star_loop', { vol: 0.6 }); audio.setMusicRate(1.3); }
    this.items.splice(this.items.indexOf(it), 1);
    const x = this.board.cx(it.x), y = this.board.cy(it.y);
    this.itemsPicked++;
    track('item');
    this.fx.flash(x, y, def.glow, this.R * 8, 0.5);
    this.fx.ring(x, y, def.glow, this.R * 6, 0.7, 6);
    this.fx.burst(x, y, 26, { type: 'spark', color: [def.glow, '#FFFFFF'], speed: 380, speedMin: 100, size: 5, life: 0.6, drag: 3 });
    this.fx.rays(x, y, def.glow, this.R * 10, 0.8, 12);
    this.fx.sprite(x, y, pwImg(it.type === 'star' ? 'burst_gold' : 'burst_lime'), this.R * 9, 0.6, rand(TAU));
    this.fx.sprite(x, y, pwImg(def.img), this.R * 3.2, 0.45, 0, 1.6, true);
    this.fx.hitStop(0.05);
    vibrate(25, this.cfg.settings.vibration);
    if (it.type === 'shield') this.pw.shield = SHIELD_CHARGES;
    else this.pw[it.type] = def.dur;
    if (it.type === 'star') {
      this.fx.shake(6, 0.35);
      this.ui.plaque('¡ESTRELLA DORADA!', 2, 2.4);
    } else this.ui.plaque(def.label, 3, 1.8);
    if (it.type === 'magnet') this.magnetT = 0;
    this.ui.pwHud(this.pwState());
    if (this.tut && this.tut.step >= 3) this.tut.gotItem = true;
  }

  pwState() {
    return {
      gold: this.player.boostT > 0 ? this.player.boostT / BOOST_TIME : 0, shield: this.pw.shield, magnet: this.pw.magnet / PW.magnet.dur, portal: this.pw.portal / PW.portal.dur,
      star: this.pw.star / PW.star.dur,
    };
  }

  updateEffects(dt) {
    const s = this.player;
    let changed = false;
    // golden orb: wind loop and faster music while the boost lasts
    const boosting = s.boostT > 0 && s.alive;
    if (boosting !== this.wasBoosting) {
      this.wasBoosting = boosting;
      if (boosting) { audio.loop('boost_loop', { vol: 0.7, rate: 1 }); audio.setMusicRate(1.22); }
      else { audio.stopLoop('boost_loop'); audio.play('boost_end'); audio.setMusicRate(this.shifted ? 1.06 : 1); }
    }
    if (boosting || this.wasBoosting) this.hudFxT = Math.min(this.hudFxT || 0, 0.1);
    this.ui.pwHud(this.pwState());
    this.trailFx(dt);
    for (const k of ['magnet', 'portal', 'star']) {
      if (this.pw[k] > 0) {
        this.pw[k] = Math.max(0, this.pw[k] - dt);
        changed = true;
        if (this.pw[k] === 0) this.effectEnded(k);
      }
    }
    if (this.whiteT > 0) this.whiteT -= dt;
    if (changed) {
      this.hudFxT = (this.hudFxT || 0) - dt;
      if (this.hudFxT <= 0) { this.hudFxT = 0.1; this.ui.pwHud(this.pwState()); }
    }
    // magnet: orbs within range slide one cell towards the head
    if (this.pw.magnet > 0 && s.alive) {
      this.magnetT -= dt;
      if (this.magnetT <= 0) { this.magnetT = 0.2; this.pullOrbs(s); }
    }
  }

  effectEnded(k) {
    this.ui.pwHud(this.pwState());
    if (k === 'magnet') audio.stopLoop('magnet_loop');
    if (k === 'star') { audio.stopLoop('star_loop'); audio.setMusicRate(this.wasBoosting ? 1.22 : 1); }
    const s = this.player;
    if (k === 'star') {
      // never leave the snake inside a rock: if it is on a blocked cell, give it a moment then rescue it
      const h = s.cells[0];
      const bad = this.board.isSolid(h.x, h.y) || (this.board.isLethal && this.board.isLethal(h.x, h.y));
      s.ghostT = Math.max(s.ghostT, 1.2);
      if (bad) { this.starGrace = (this.starGrace || 0) + 1; this.pw.star = 0.6; if (this.starGrace > 5) { this.starGrace = 0; this.pw.star = 0; this.rescueToStart(s, true); } }
      else this.starGrace = 0;
    }
  }

  pullOrbs(s) {
    const h = s.cells[0];
    const occ = new Set(); for (const sn of this.snakes) for (const c of sn.cells) occ.add(c.y * COLS + c.x);
    for (const o of [...this.orbs]) {
      const dx = h.x - o.x, dy = h.y - o.y;
      const d = Math.hypot(dx, dy);
      if (d > MAGNET_RANGE || d < 0.5) continue;
      let sx = 0, sy = 0;
      if (Math.abs(dx) >= Math.abs(dy)) sx = Math.sign(dx); else sy = Math.sign(dy);
      const nx = o.x + sx, ny = o.y + sy;
      if (nx === h.x && ny === h.y) { this.eat(s, o, this.orbs.indexOf(o)); continue; }
      const k = ny * COLS + nx;
      if (this.board.isSolid(nx, ny) || (this.board.isLethal && this.board.isLethal(nx, ny)) || occ.has(k) || this.orbs.some((q) => q.x === nx && q.y === ny)) continue;
      this.fx.burst(this.board.cx(o.x), this.board.cy(o.y), 3, { type: 'dot', color: '#FFC24A', speed: 40, size: 4, life: 0.35 });
      o.x = nx; o.y = ny;
    }
  }

  // Which effect (if any) saves the snake from this crash. Returns true if the crash is cancelled.
  protect(s, reason, nx, ny) {
    if (s !== this.player) return false;
    const cells = this.board.level && this.board.level.cells;
    const t = cells ? cells[ny * COLS + nx] : -1;
    if (this.pw.star > 0) return reason !== 'wall';
    if (this.pw.shield > 0 && (reason === 'obstacle' || (reason === 'hazard' && t === T.SPIKE))) {
      if (this.board.breakCell && this.board.breakCell(nx, ny)) {
        this.pw.shield--;
        audio.play('shield_break', { rate: this.pw.shield ? 1.15 : 1 });
        this.breakFx(nx, ny);
        this.board.prerender(this.view.dpr);
        this.ui.pwHud(this.pwState());
        return true;
      }
    }
    if (this.pw.portal > 0) {
      this.pw.portal = 0;
      this.ui.pwHud(this.pwState());
      this.rescueToStart(s, false);
      return 'rescued';
    }
    return false;
  }

  breakFx(x, y) {
    const cx = this.board.cx(x), cy = this.board.cy(y);
    const col = skinColor(this.player.skin);
    this.fx.flash(cx, cy, col, this.R * 6, 0.4);
    this.fx.ring(cx, cy, col, this.R * 5, 0.6, 6);
    this.fx.burst(cx, cy, 30, { type: 'spark', color: [col, '#FFFFFF'], speed: 460, speedMin: 120, size: 5, life: 0.6, drag: 3 });
    this.fx.burst(cx, cy, 14, { type: 'dust', color: '#B8AA8A', speed: 200, size: 14, life: 0.8, add: false, drag: 3 });
    this.fx.shards(cx, cy, pwImg('shield_shards'), this.low ? 3 : 7, this.R * 1.6, 380, 0.9);
    this.fx.sprite(cx, cy, pwImg('shield_crack2'), this.R * 4, 0.35, 0, 1.3, true);
    this.fx.rays(cx, cy, col, this.R * 7, 0.5, 8);
    this.fx.hitStop(0.07);
    this.fx.shake(8, 0.3);
    vibrate([15, 20, 25], this.cfg.settings.vibration);
    track('break');
  }

  // Portal / star rescue: the snake is put back in the safe start area and waits for a swipe.
  rescueToStart(s, quiet) {
    const path = [[5, 15], [5, 16], [5, 17], [4, 17], [4, 16], [4, 15], [4, 14], [4, 13], [4, 12], [4, 11], [3, 11], [3, 12], [3, 13], [3, 14], [3, 15], [3, 16], [3, 17]];
    const total = s.cells.length + s.grow;
    const m = Math.min(total, path.length);
    const h = s.cells[0];
    const ox = this.board.cx(h.x), oy = this.board.cy(h.y);
    s.cells = path.slice(0, m).map(([x, y]) => ({ x, y }));
    s.prev = s.cells.map((c) => ({ ...c }));
    s.grow = total - m;
    s.dir = 'up';
    s.queue = [];
    s.acc = 0;
    s.boostT = 0;
    s.ghostT = 99;
    const occ = new Set(s.cells.map((c) => c.y * COLS + c.x));
    this.orbs = this.orbs.filter((o) => !occ.has(o.y * COLS + o.x));
    if (!this.orbs.some((o) => o.type === 'red')) this.spawnOrb('red');
    const nx = this.board.cx(5), ny = this.board.cy(15);
    for (const [x, y] of [[ox, oy], [nx, ny]]) {
      this.fx.flash(x, y, '#38E8FF', this.R * 8, 0.5);
      this.fx.ring(x, y, '#38E8FF', this.R * 6, 0.7, 6);
      this.fx.burst(x, y, 30, { type: 'spark', color: ['#38E8FF', '#E8B04A', '#FFFFFF'], speed: 340, size: 5, life: 0.7 });
    }
    vibrate([30, 30, 30], this.cfg.settings.vibration);
    audio.play('portal_whoosh');
    if (!quiet) this.ui.plaque('¡A SALVO!', 3, 1.6);
    track('rescue');
    this.setState('ready');
    this.ui.showHint('DESLIZA PARA CONTINUAR');
  }

  // Level 5 / 10 event: half way through, every obstacle moves, the pace quickens.
  mapShift() {
    this.shifted = true;
    const s = this.player;
    const avoid = new Set();
    const near = (c) => { for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) avoid.add((c.y + j) * COLS + (c.x + i)); };
    for (const sn of this.snakes) for (const c of sn.cells) near(c);
    for (const o of this.orbs) avoid.add(o.y * COLS + o.x);
    for (const it of this.items) avoid.add(it.y * COLS + it.x);
    // old obstacles crumble
    for (const c of this.board.level.obs) {
      const x = this.board.cx(c.x), y = this.board.cy(c.y);
      this.fx.burst(x, y, 8, { type: 'dust', color: '#E8E4D8', speed: 160, size: 14, life: 0.7, add: false, drag: 3 });
    }
    reshuffleObstacles(this.board.level, 1, [...avoid]);
    this.board.applyLevel();
    this.board.low = this.low;
    this.board.prerender(this.view.dpr);
    for (const c of this.board.level.obs) {
      const x = this.board.cx(c.x), y = this.board.cy(c.y);
      this.fx.ring(x, y, '#FFFFFF', this.R * 3, 0.5, 4);
    }
    this.fx.flash(this.board.cx(5.5), this.board.cy(8.5), '#FFFFFF', this.board.w * 0.9, 0.7);
    this.fx.shake(8, 0.4);
    s.ghostT = Math.max(s.ghostT, 3);
    this.whiteT = 3;
    this.baseSpeed *= 1.06;
    this.goldLife = 5;
    this.redLife = 16;
    for (const o of this.orbs) if (o.type === 'red') { o.life = this.redLife; o.born = this.t; }
    audio.play('map_change');
    if (!this.wasBoosting) audio.setMusicRate(1.06);
    this.ui.plaque('¡EL MAPA CAMBIA!', 1, 2.6);
    this.ui.shiftFlash();
    vibrate([20, 30, 20, 30, 40], this.cfg.settings.vibration);
    // let the player see what moved
    this.warnCells = null;
    this.warnDur = 3;
    this.startWarning(true);
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
    if (s.queue.length >= 2) { // buffer full: the newest turn replaces the last one
      const ref = s.queue[0];
      if (dir === ref || dir === OPPOSITE[ref]) return;
      s.queue[1] = dir;
    } else {
      const last = s.queue.length ? s.queue[s.queue.length - 1] : s.dir;
      if (dir === last || dir === OPPOSITE[last]) return;
      s.queue.push(dir);
    }
    if (this.tut) this.tut.turns++;
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
    // hit-stop: a few frames frozen on big impacts (effects keep glowing)
    if (this.fx.stopT > 0) { this.fx.stopT -= dtReal; this.fx.update(dtReal * 0.08); return; }
    this.timeScale = lerp(this.timeScale, 1, 1 - Math.exp(-dtReal * 2.2));
    const dt = dtReal * this.timeScale;
    this.t += dt;
    this.stateT += dtReal;
    this.fx.update(dt);
    this.ambient.update(dt, this.t);
    for (const s of this.snakes) this.animate(s, dt);

    if (this.warnT > 0) this.warnT -= dtReal;
    if (this.state === 'intro') {
      for (const s of this.snakes) s.a.appear = clamp(this.stateT / 0.7, 0, 1);
      if (this.stateT > 0.75) {
        this.setState('countdown');
        this.ui.countdown(() => { if (this.state === 'countdown') this.setState('play'); });
        this.startWarning();
        if (this.tut) this.ui.tutStep(0);
      }
      return;
    }
    if (this.state === 'dying') {
      // sinking: the splash plays in full colour first, then the board greys out
      const d0 = this.sink ? 0.75 : 0;
      this.player.a.death = clamp((this.stateT - d0) / 0.55, 0, 1);
      if (this.sink) this.updateSink();
      if (this.tut && this.stateT > 0.9 + d0) { this.revive(); return; }
      if (this.stateT > 0.95 + d0 && !this.reviveShown) {
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
    this.updateEffects(dt);
    this.updateItems(dt);
    if (this.eventLevel && !this.shifted && this.player.alive && this.player.orbs >= Math.ceil(this.target / 2)) this.mapShift();
    if (this.tut) this.tutorialUpdate();
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
    if (this.mode !== 'frenzy' && !this.orbs.some((o) => o.type === 'red')) this.spawnOrb('red');

    for (const s of this.snakes) {
      if (!s.alive) continue;
      const hd = s.cells[0];
      const bogged = this.board.isSlow && hd && this.board.isSlow(hd.x, hd.y);
      const starOn = s === this.player && this.pw.star > 0;
      const speed = this.baseSpeed * (s.speedMult || 1) * (starOn ? 2 : s.boostT > 0 ? (this.mode === 'frenzy' ? 1.25 : 1.85) : 1) * (bogged ? 0.55 : 1);
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
    for (let i = a.waves.length - 1; i >= 0; i--) { a.waves[i].t += dt / 0.95; if (a.waves[i].t >= 1) a.waves.splice(i, 1); }
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
    if (this.low && Math.random() < 0.5) return;
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
    } else if (s.queue.length && !(this.board.isIce && this.board.isIce(s.cells[0].x, s.cells[0].y))) {
      const d = s.queue.shift();
      if (d !== OPPOSITE[s.dir]) { s.dir = d; if (s === this.player) audio.play('turn', { vol: 0.5 }); }
    }
    const d = DIRS[s.dir];
    const h = s.cells[0];
    let nx = h.x + d.x, ny = h.y + d.y;
    const wrap = this.mode === 'frenzy' || (s === this.player && this.pw.star > 0);
    if (wrap) {
      nx = (nx + COLS) % COLS;
      ny = (ny + ROWS) % ROWS;
    }
    // collisions
    let reason = null;
    if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) reason = 'wall';
    else if (this.board.isSolid(nx, ny)) reason = 'obstacle';
    else if (this.board.isLethal && this.board.isLethal(nx, ny)) reason = 'hazard';
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
      const saved = this.protect(s, reason, nx, ny);
      if (saved === 'rescued') return;
      if (saved) reason = null;
    }
    if (reason) {
      this.die(s, reason, nx, ny);
      return;
    }
    // portals: come out of the twin, still heading the same way
    const portal = this.board.portalAt ? this.board.portalAt(nx, ny) : null;
    if (portal) {
      const fromX = this.board.cx(nx), fromY = this.board.cy(ny);
      const col = portal.pair === 0 ? '#38E8FF' : '#FF5AE8';
      this.fx.flash(fromX, fromY, col, this.R * 6, 0.4);
      this.fx.ring(fromX, fromY, col, this.R * 4, 0.5, 5);
      nx = portal.x; ny = portal.y;
      const tx = this.board.cx(nx), ty = this.board.cy(ny);
      this.fx.flash(tx, ty, col, this.R * 6, 0.45);
      this.fx.ring(tx, ty, col, this.R * 4.5, 0.6, 5);
      this.fx.burst(tx, ty, 16, { type: 'spark', color: col, speed: 260, size: 4, life: 0.5 });
      vibrate(20, this.cfg.settings.vibration);
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
    if (s === this.player) {
      const ii = this.items.findIndex((i) => i.x === nx && i.y === ny);
      if (ii >= 0) this.pickItem(s, this.items[ii]);
    }

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
      track(gold ? 'gold' : 'orb');
      if (!gold && !this.starDone && this.mode === 'story' && !this.tut && s.orbs >= 3 && Math.random() < STAR_CHANCE) {
        this.starDone = true;
        this.spawnItem('star');
      }
    }

    if (s === this.player) audio.play(gold ? 'eat_gold' : 'eat_red', { rate: gold ? 1 : 1 + 0.055 * (this.combo - 1), vol: 0.9 });
    const waveCol = gold ? '#FFD36A' : '#FF4A5A';
    s.a.waves.push({ t: 0, color: waveCol });
    if (s.a.waves.length > 3) s.a.waves.shift();
    if (gold) {
      s.grow += 3;
      s.boostT = BOOST_TIME;
      if (s === this.player) this.goldEaten++;
      this.fx.flash(x, y, '#FFD36A', R * 6, 0.45);
      this.fx.ring(x, y, '#FFF0B0', R * 4.5, 0.5, 7);
      this.fx.ring(x, y, '#FFB020', R * 8, 0.85, 4);
      this.fx.ring(x, y, '#FFE08A', R * 11, 1.1, 2);
      this.fx.sprite(x, y, pwImg('burst_gold'), R * 8.5, 0.6, rand(TAU));
      this.fx.sprite(x, y, pwImg('star_pop'), R * 4.5, 0.5, 0, 0.6);
      this.fx.rays(x, y, '#FFE08A', R * 10, 0.7, 12);
      this.fx.burst(x, y, 30, { type: 'spark', color: ['#FFE08A', '#FFC23A', '#FFFFFF'], speed: 560, speedMin: 160, size: 6, life: 0.65, drag: 3.2 });
      this.fx.burst(x, y, 12, { type: 'star', color: '#FFD36A', speed: 240, size: 5, life: 0.95, drag: 2.4 });
      if (s === this.player) {
        this.fx.shake(6, 0.3);
        if (this.mode !== 'frenzy') this.ui.banner('¡VELOCIDAD x2!', 'gold');
        this.ui.goldFlash();
      }
    } else {
      s.grow += 1;
      this.fx.flash(x, y, '#FF4A5A', R * 4, 0.3);
      this.fx.ring(x, y, '#FF8A8A', R * 3.4, 0.4, 6);
      this.fx.ring(x, y, '#FF3A4A', R * 5.6, 0.65, 3);
      this.fx.sprite(x, y, tinted('burst_gold', '#FF3040'), R * 7, 0.5, rand(TAU));
      if (s === this.player && this.combo >= 3) this.fx.rays(x, y, '#FF8A5A', R * (5 + this.combo), 0.45, 8);
      this.fx.burst(x, y, 18, { type: 'spark', color: ['#FF6A6A', '#FF2A3A', '#FFC0C0'], speed: 380, speedMin: 120, size: 5, life: 0.45, drag: 3.5 });
      this.fx.burst(x, y, 6, { type: 'dot', color: '#FF8A8A', speed: 120, size: 6, life: 0.5 });
      if (s === this.player) this.fx.shake(2, 0.16);
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
    const wet = !s.isBot && reason === 'hazard' && this.board.level && this.board.level.cells[ny * COLS + nx] === T.LETHAL;
    if (wet) {
      // falling into water / lava / acid: the head sinks with a splash instead of crashing
      const hz = this.cfg.level && this.cfg.level.mapInfo && this.cfg.level.mapInfo.hazard;
      this.sink = {
        x: this.board.cx(nx), y: this.board.cy(ny), hx: this.board.cx(h.x), hy: this.board.cy(h.y),
        kind: hz === 'hz_lava' ? 'lava' : hz === 'hz_mud' ? 'acid' : 'water',
        col: this.board.glowColor ? this.board.glowColor() : '#3FD8FF', splashed: false, p: 0,
      };
    } else {
      this.fx.flash(x, y, '#FFFFFF', this.R * 5, 0.3);
      if (!s.isBot) {
        this.fx.sprite(x, y, pwImg('burst_white'), this.R * 8, 0.55, rand(TAU));
        this.fx.rays(x, y, '#FFFFFF', this.R * 9, 0.6, 10);
        this.fx.shards(x, y, pwImg('shield_shards'), this.low ? 2 : 5, this.R * 1.3, 300, 0.8);
        this.fx.hitStop(0.1);
      }
      this.fx.burst(x, y, 26, { type: 'dust', color: '#D8C8A0', speed: 200, size: 18, life: 0.9, add: false, drag: 3 });
      this.fx.burst(x, y, 16, { type: 'leaf', color: '#7FAE4E', speed: 240, size: 7, life: 1.3, add: false, drag: 2, grav: 60 });
      this.fx.burst(x, y, 14, { type: 'spark', color: '#FFFFFF', speed: 420, size: 4, life: 0.35 });
    }
    s.a.mouthTarget = 0;
    if (s.isBot) {
      s.alive = false;
      this.crumble(s);
      this.win();
      return;
    }
    s.alive = false;
    this.deaths++;
    track('death');
    this.deathReason = reason;
    this.deathCell = { x: nx, y: ny };
    audio.stopLoop('boost_loop'); audio.stopLoop('magnet_loop'); audio.stopLoop('star_loop'); audio.setMusicRate(1);
    const liquid = reason === 'hazard' && this.board.level && this.board.level.cells[ny * COLS + nx] === T.LETHAL;
    audio.play(liquid ? 'die_liquid' : 'die_hit');
    this.fx.shake(wet ? 6 : 14, wet ? 0.3 : 0.5);
    this.timeScale = wet ? 0.6 : 0.3;
    vibrate([40, 30, 60], this.cfg.settings.vibration);
    this.ui.hitFlash();
    this.reviveShown = false;
    this.setState('dying');
  }

  crumble(s) {
    audio.play('crumble');
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
    const cellT = this.deathCell && this.board.level ? this.board.level.cells[this.deathCell.y * COLS + this.deathCell.x] : -1;
    const info = { mode: this.mode, revives: this.revives, score: this.score, reason: this.deathReason, cellT, map: this.cfg.level && this.cfg.level.map };
    if (this.mode === 'story') info.left = this.target - this.player.orbs, info.cur = this.player.orbs, info.target = this.target;
    if (this.mode === 'duel') info.cur = this.player.orbs, info.target = this.target;
    return info;
  }

  revive() {
    const s = this.player;
    audio.play('revive');
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
    this.sink = null;
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
    this.fx.rays(x, y, '#FFE08A', this.board.cell * 12, 1.4, 14);
    this.fx.sprite(x, y, pwImg('burst_gold'), this.board.cell * 9, 0.9, rand(TAU));
    this.fireworks(this.low ? 2 : 5);
    this.player.boostT = 0.0001;
    audio.stopLoop('boost_loop'); audio.stopLoop('magnet_loop'); audio.stopLoop('star_loop'); audio.setMusicRate(1);
    audio.play('level_win');
    vibrate([20, 40, 20], this.cfg.settings.vibration);
    this.setState('won');
  }

  lose(why) {
    audio.play('level_fail');
    this.player.alive = false;
    this.player.a.death = 1;
    this.crumble(this.player);
    this.loseReason = why;
    this.setState('crumble');
  }

  finish(won) {
    let stars = 0;
    if (won && this.mode === 'story' && !this.tut) {
      stars = 1;
      if (this.deaths === 0) stars++;
      if (this.elapsed <= this.par) stars++;
    }
    track('len', this.player.cells.length + this.player.grow);
    this.ui.finish({
      stars, par: this.par, deaths: this.deaths, tutorial: !!this.tut, items: this.itemsPicked,
      mode: this.mode, won, score: this.score, orbs: this.eaten, gold: this.goldEaten,
      length: this.player.cells.length + this.player.grow, time: this.elapsed,
      level: this.cfg.level, difficulty: this.cfg.difficulty, loseReason: this.loseReason,
      duel: this.bot ? { p: this.player.orbs, b: this.bot.orbs } : null,
    });
  }

  // ------------------------------------------------------------ sinking death (water, lava, acid)
  updateSink() {
    const k = this.sink;
    k.p = clamp(this.stateT / 0.6, 0, 1);
    if (!k.splashed && k.p > 0.28) {
      k.splashed = true;
      const { x, y, col } = k, C = this.board.cell;
      const light = k.kind === 'lava' ? '#FFD36A' : k.kind === 'acid' ? '#D8FF9A' : '#E8FBFF';
      // droplets thrown up and falling back, two ripples, a soft flash of the liquid's own colour
      this.fx.burst(x, y, 34, { type: 'dot', color: [col, light, '#FFFFFF'], speed: 380, speedMin: 140, size: 6, life: 0.85, add: false, drag: 1.1, grav: 760 });
      this.fx.burst(x, y, 10, { type: 'dot', color: [col, light], speed: 150, size: 8, life: 0.5, add: false, drag: 2, grav: 400 });
      this.fx.ring(x, y, light, C * 1.1, 0.55, 4);
      this.fx.ring(x, y, col, C * 1.8, 0.9, 3);
      this.fx.ring(x, y, light, C * 2.4, 1.3, 2);
      this.fx.flash(x, y, col, C * 1.6, 0.35);
      if (k.kind === 'lava') {
        this.fx.burst(x, y, 16, { type: 'spark', color: ['#FFB030', '#FF5A1A', '#FFE08A'], speed: 360, size: 4, life: 0.8, grav: -60 });
        this.fx.burst(x, y, 6, { type: 'dust', color: '#3A3430', speed: 50, size: 22, life: 1.4, add: false, grav: -40 });
      }
    }
  }

  drawSink(g) {
    const k = this.sink, C = this.board.cell;
    const t = this.stateT;
    g.save();
    // the surface closes over the head: a disc of the liquid's colour that fades in, then settles
    const cover = clamp((k.p - 0.25) / 0.5, 0, 1) * (1 - clamp((t - 1.2) / 0.8, 0, 1));
    if (cover > 0) {
      const gr = g.createRadialGradient(k.x, k.y, 0, k.x, k.y, C * 0.62);
      gr.addColorStop(0, k.col);
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.globalAlpha = 0.75 * cover;
      g.fillStyle = gr;
      g.beginPath(); g.arc(k.x, k.y, C * 0.62, 0, Math.PI * 2); g.fill();
    }
    // bubbles rising and popping after the head goes under
    if (k.splashed) {
      g.globalCompositeOperation = k.kind === 'lava' ? 'lighter' : 'source-over';
      for (let i = 0; i < 7; i++) {
        const life = (t - 0.35 - i * 0.14);
        if (life < 0 || life > 0.7) continue;
        const u = life / 0.7;
        const a = i * 2.4;
        const bx = k.x + Math.cos(a) * C * (0.12 + 0.05 * i), by = k.y + Math.sin(a) * C * 0.14 - u * C * 0.12;
        const r = C * (0.05 + 0.06 * u) * (i % 3 === 0 ? 1.4 : 1);
        g.globalAlpha = 0.9 * (1 - u * u);
        g.strokeStyle = k.kind === 'lava' ? '#FFD36A' : '#FFFFFF';
        g.lineWidth = Math.max(1, C * 0.025);
        g.fillStyle = k.kind === 'lava' ? 'rgba(255,120,30,0.55)' : k.kind === 'acid' ? 'rgba(170,255,90,0.35)' : 'rgba(220,245,255,0.25)';
        g.beginPath(); g.arc(bx, by, r, 0, Math.PI * 2); g.fill(); g.stroke();
      }
    }
    g.restore();
  }

  // twinkling star sparkles running along the body while the golden star is active
  starSparkles(g, pts) {
    const R = this.R;
    g.save();
    g.globalCompositeOperation = 'lighter';
    const sp = glowSprite('#FFF0B0', 32);
    for (let i = 0; i < pts.length; i++) {
      const k = 0.5 + 0.5 * Math.sin(this.t * 7 - i * 1.3);
      if (k < 0.55) continue;
      const a = this.t * 2.2 + i * 2.1;
      const x = pts[i].x + Math.cos(a) * R * 0.7, y = pts[i].y + Math.sin(a) * R * 0.7;
      const s = R * (0.7 + 1.1 * (k - 0.55));
      g.globalAlpha = (k - 0.4) * 0.9;
      g.drawImage(sp, x - s * 2, y - s * 2, s * 4, s * 4);
      g.fillStyle = '#FFFFFF';
      g.beginPath();
      for (let j = 0; j < 8; j++) { const r = j % 2 ? s * 0.22 : s; const q = (j / 8) * Math.PI * 2 + a; g.lineTo(x + Math.cos(q) * r, y + Math.sin(q) * r); }
      g.fill();
    }
    g.restore();
  }

  // The snake shines in one colour (gold star / white map-change immunity), without dark outlines.
  drawTinted(g, pts, skin, o, color, mix = 1) {
    const b = this.board, dpr = this.view.dpr, pad = b.cell * 2;
    const x0 = b.x - pad, y0 = b.y - pad, w = b.w + pad * 2, h = b.h + pad * 2;
    if (!this.tc || this.tc.width !== Math.ceil(w * dpr) || this.tc.height !== Math.ceil(h * dpr)) {
      this.tc = document.createElement('canvas');
      this.tc.width = Math.ceil(w * dpr); this.tc.height = Math.ceil(h * dpr);
    }
    const c = this.tc.getContext('2d');
    // the tint pass below leaves 'source-atop' on this canvas: reset it, or the next snake is drawn onto
    // an empty canvas with source-atop and nothing shows (the snake vanished with the golden star)
    c.globalCompositeOperation = 'source-over';
    c.globalAlpha = 1;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, this.tc.width, this.tc.height);
    c.setTransform(dpr, 0, 0, dpr, -x0 * dpr, -y0 * dpr);
    drawSnake(c, pts, skin, { ...o, shadow: false, glow: 0, ghost: false, clip: null });
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = 'source-atop';
    c.globalAlpha = color === '#FFFFFF' ? 0.85 : 0.72;
    c.fillStyle = color;
    c.fillRect(0, 0, this.tc.width, this.tc.height);
    g.save();
    g.globalCompositeOperation = 'lighter';
    const sp = glowSprite(color, 64);
    g.globalAlpha = (0.34 + 0.08 * Math.sin(this.t * 10)) * mix;
    for (let i = 0; i < pts.length; i += 2) g.drawImage(sp, pts[i].x - this.R * 2.6, pts[i].y - this.R * 2.6, this.R * 5.2, this.R * 5.2);
    g.restore();
    g.save();
    g.globalAlpha = mix;
    g.drawImage(this.tc, x0, y0, w, h);
    g.globalCompositeOperation = 'lighter';
    g.globalAlpha = 0.3 * mix;
    g.drawImage(this.tc, x0, y0, w, h);
    g.restore();
  }

  // Guided level 0: controls -> red orb -> golden orb -> obstacles / force field.
  tutorialUpdate() {
    const t = this.tut, p = this.player;
    if (t.step === 0 && t.turns >= 2) { t.step = 1; this.ui.tutStep(1); }
    else if (t.step === 1 && p.orbs >= 1) {
      t.step = 2;
      this.spawnOrb('gold');
      for (const o of this.orbs) if (o.type === 'gold') o.life = Infinity;
      this.ui.tutStep(2);
    } else if (t.step === 2 && this.goldEaten >= 1) {
      t.step = 3;
      this.startWarning(true);
      this.spawnItem('shield');
      this.ui.tutStep(3);
    }
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
    for (const it of this.items) drawItem(g, it, b.cx(it.x), b.cy(it.y), b.cell, this.t);
    this.fx.drawUnder(g);
    this.drawWarning(g);

    // snakes
    const clip = this.mode === 'frenzy' ? { x: b.x - 2, y: b.y - 2, w: b.w + 4, h: b.h + 4 } : null;
    for (const s of [...this.snakes].reverse()) {
      if (s.hidden) continue;
      const moving = this.state === 'play' && s.alive;
      const ti = moving ? clamp(s.acc / (s.interval || 1), 0, 1) : (this.state === 'intro' || this.state === 'countdown' || this.state === 'ready' ? 0 : 1);
      const { pts, breaks } = this.snakePoints(s, ti);
      const sinkK = s === this.player && this.sink ? this.sink.p : 0;
      if (sinkK > 0) {
        const e = ease.outCubic(clamp(sinkK * 1.4, 0, 1)) * 0.8;
        pts[0] = { x: this.sink.hx + (this.sink.x - this.sink.hx) * e, y: this.sink.hy + (this.sink.y - this.sink.hy) * e };
      }
      const len = s.cells.length;
      const fat = 1;
      g.save();
      if (s.a.appear < 1) g.globalAlpha = s.a.appear;
      if (s === this.player) this.headPx = pts[0];
      const opts = {
        R: this.R, mouth: s.a.mouth, blink: s.a.blink, tongue: s.a.tongue, squash: s.a.squash,
        bulges: [], waves: s.a.waves, glow: s.boostT > 0 ? clamp(s.boostT / 0.6, 0, 1) : 0,
        ghost: s.ghostT > 0 && this.state === 'play', death: s.a.death, t: this.t, breaks, fat, clip, sink: sinkK,
      };
      if (s === this.player && s.alive && this.pw.star > 0) {
        // golden star: the snake stays visible, with a pulsing golden sheen and sparkles over it
        drawSnake(g, pts, s.skin, opts);
        this.drawTinted(g, pts, s.skin, opts, '#FFD36A', 0.28 + 0.1 * Math.sin(this.t * 9));
        this.starSparkles(g, pts);
      }
      else if (s === this.player && s.alive && this.whiteT > 0) { drawSnake(g, pts, s.skin, opts); this.drawTinted(g, pts, s.skin, opts, '#FFFFFF', 0.6); }
      else {
        drawSnake(g, pts, s.skin, opts);
        // golden speed: a translucent gold sheen over the snake (never hides it)
        if (s.boostT > 0 && s.alive) this.drawTinted(g, pts, s.skin, opts, '#FFD36A', 0.4 * clamp(s.boostT / 0.8, 0, 1) * (0.85 + 0.15 * Math.sin(this.t * 12)));
      }
      g.restore();
    }

    drawAuras(g, this, this.t);
    if (this.sink) this.drawSink(g);

    // death: the whole board drains of colour (one blend op instead of a filter per sprite)
    if (this.player.a.death > 0.01) {
      g.save();
      g.globalCompositeOperation = 'saturation';
      g.globalAlpha = this.player.a.death;
      g.fillStyle = '#808080';
      g.fillRect(b.x - b.frame - 4, b.y - b.frame - 4, b.w + b.frame * 2 + 8, b.h + b.frame * 2 + 8);
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
