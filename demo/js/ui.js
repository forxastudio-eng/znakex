// Screens, overlays and HUD (DOM layer over the canvases).
import { MODES, MAPS, SKINS, RARITY, BOTS, ECONOMY, TIPS, skinById, skinPrice, storyLevel } from './data.js';
import * as store from './store.js';
import { url } from './assets.js';
import { drawSnake, pathPoints } from './snakedraw.js';
import { fmt, TAU, ease, clamp, rand } from './util.js';
import { Game } from './game.js';
import { CONFIG } from './config.js';
import { CONTROL_INFO } from './input.js';

const icon = (n) => url(`ui/icons/${n}.png`);
const $ = (root, sel) => root.querySelector(sel);

function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI'];
const stag = (i) => `style="--i:${i}"`;

export class UI {
  constructor(app, view) {
    this.app = app;
    this.view = view; // shared game canvas info
    this.screensEl = $(app, '#screens');
    this.overEl = $(app, '#overlays');
    this.cur = null;
    this.game = null;
    this.timers = [];
    document.addEventListener('coins', () => this.refreshCoins(true));
  }

  S() { return store.S(); }

  setBg(kind, art) {
    this.app.dataset.bg = kind;
    if (art) this.app.style.setProperty('--art', `url("${new URL(url(art), location.href).href}")`);
    else this.app.style.removeProperty('--art');
  }

  // ------------------------------------------------------------ navigation
  go(name, params = {}) {
    const fn = this['scr_' + name];
    if (!fn) return;
    this.closeOverlays();
    const prev = this.cur;
    if (prev) {
      prev.el.classList.remove('active');
      prev.el.classList.add('leave');
      prev.destroy && prev.destroy();
      setTimeout(() => prev.el.remove(), 420);
    }
    const scr = fn.call(this, params) || {};
    scr.name = name;
    scr.el.classList.add('screen');
    this.screensEl.appendChild(scr.el);
    requestAnimationFrame(() => requestAnimationFrame(() => scr.el.classList.add('active')));
    this.cur = scr;
    this.refreshCoins(false);
  }

  refreshCoins(bump) {
    const c = this.S().coins;
    document.querySelectorAll('[data-coin-view]').forEach((n) => {
      n.textContent = fmt(c);
      if (bump) {
        const p = n.closest('.pill');
        if (p) { p.classList.remove('bump'); void p.offsetWidth; p.classList.add('bump'); }
      }
    });
  }

  coinPill() {
    return `<button class="pill" data-act="shop"><img src="${icon('coin')}" alt=""><span data-coin-view>${fmt(this.S().coins)}</span><span class="plus">+</span></button>`;
  }

  topbar(title, back = 'home') {
    return `<div class="topbar">
      <button class="icon-btn" data-act="back" data-to="${back}"><img src="${icon('back')}" alt="Atrás"></button>
      <div class="title t-display worn">${title}</div>
      ${this.coinPill()}
    </div>`;
  }

  nav(active) {
    const items = [['modes', 'modes', 'MODOS'], ['maps', 'maps', 'MAPAS'], ['home', 'home', 'INICIO'], ['skins', 'skins', 'SKINS'], ['settings', 'settings', 'AJUSTES']];
    return `<nav class="nav">${items.map(([k, ic, l]) => `<button data-act="nav" data-to="${k}" class="${k === active ? 'on' : ''}"><img src="${icon(ic)}" alt="">${l}</button>`).join('')}</nav>`;
  }

  // common clicks available on every screen
  wire(root, handlers = {}) {
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]');
      if (!b || !root.contains(b)) return;
      const act = b.dataset.act;
      if (handlers[act]) return handlers[act](b, e);
      if (act === 'nav' || act === 'back') this.go(b.dataset.to || 'home');
      else if (act === 'shop') this.go('shop', { back: this.cur ? this.cur.name : 'home' });
    });
  }

  toast(msg) {
    const t = el(`<div class="toast">${msg}</div>`);
    this.app.appendChild(t);
    setTimeout(() => t.remove(), 1900);
  }

  // ------------------------------------------------------------ splash
  scr_splash() {
    this.setBg('splash');
    const e = el(`<section>
      <div class="splash-bottom">
        <div class="panel" style="width:100%"><div class="inner pad" style="display:flex;flex-direction:column;align-items:center;gap:.6rem">
          <div class="t-label" id="ldt">CARGANDO...</div>
          <div class="loadbar"><i id="ldb"></i></div>
          <div class="demo-note" id="ldtip">${TIPS[0]}</div>
        </div></div>
      </div>
    </section>`);
    return {
      el: e,
      progress: (p) => { $(e, '#ldb').style.width = Math.round(p * 100) + '%'; },
      ready: (onTap) => {
        $(e, '#ldt').outerHTML = '<div class="tap">TOCA PARA JUGAR</div>';
        $(e, '#ldb').parentElement.style.display = 'none';
        e.addEventListener('pointerup', onTap, { once: true });
      },
    };
  }

  // ------------------------------------------------------------ home
  scr_home() {
    this.setBg('menu');
    const S = this.S();
    const modeIdx = Math.max(0, MODES.findIndex((m) => m.id === S.mode));
    const wheelReady = S.wheelDay !== store.today();
    const e = el(`<section>
      <div class="topbar">
        <button class="avatar" data-act="nav" data-to="skins"><img src="${url('skins/' + S.equipped + '.jpg')}" alt=""></button>
        ${CONFIG.tester ? '<span class="rarity" style="background:var(--amber)">MODO TESTER</span>' : ''}
        ${this.coinPill()}
      </div>
      <div class="home-mid stagger">
        <div class="mode-sel" ${stag(0)}>
          <button class="arrow" data-act="mode" data-d="-1">‹</button>
          <div class="mode-chip"><div class="n worn" id="mn"></div><div class="s" id="ms"></div></div>
          <button class="arrow" data-act="mode" data-d="1">›</button>
        </div>
        <div class="home-row" ${stag(1)}>
          <button class="icon-btn" data-act="wheel"><img src="${icon('mode_spin')}" alt=""><span class="lbl">RULETA</span>${wheelReady ? '<i class="dot"></i>' : ''}</button>
          <button class="btn-primary" data-act="play"><span class="worn">JUGAR</span><i class="tri"></i></button>
          <button class="icon-btn" data-act="shop"><img src="${icon('shop')}" alt=""><span class="lbl">TIENDA</span></button>
        </div>
        <div style="height:.6rem"></div>
      </div>
      ${this.nav('home')}
    </section>`);
    let idx = modeIdx;
    const paint = () => {
      const m = MODES[idx];
      $(e, '#mn').textContent = m.name;
      const cs = store.currentStory();
      $(e, '#ms').textContent = m.id === 'story' ? `MAPA ${ROMAN[cs.map - 1]} · NIVEL ${cs.level}`
        : m.id === 'classic' ? `RÉCORD ${fmt(S.best.classic)}`
          : m.id === 'frenzy' ? `RÉCORD ${fmt(S.best.frenzy)}` : 'FÁCIL · MEDIO · DIFÍCIL';
      S.mode = m.id;
      store.save();
    };
    paint();
    this.wire(e, {
      mode: (b) => { idx = (idx + Number(b.dataset.d) + MODES.length) % MODES.length; paint(); },
      play: () => this.playMode(MODES[idx].id),
      wheel: () => this.openWheel(),
    });
    return { el: e };
  }

  playMode(id) {
    if (id === 'story') {
      const cs = store.currentStory();
      this.startGame({ mode: 'story', level: storyLevel(cs.map, cs.level) });
    } else if (id === 'duel') this.go('duel');
    else this.startGame({ mode: id });
  }

  // ------------------------------------------------------------ modes
  scr_modes() {
    this.setBg('deep');
    const S = this.S();
    const rec = { story: `PROGRESO ${store.totalCleared()}/160`, classic: `RÉCORD ${fmt(S.best.classic)}`, frenzy: `RÉCORD ${fmt(S.best.frenzy)}`, duel: 'RIVALES: 3' };
    const e = el(`<section>
      ${this.topbar('MODOS')}
      <div class="scroll stagger">
        ${MODES.map((m, i) => `<button class="mode-card btn ${S.mode === m.id ? 'sel' : ''}" data-act="pick" data-id="${m.id}" ${stag(i)}>
          <div class="thumb" style="background-image:url(${url(m.img)})"></div>
          <div><div class="nm worn"><img src="${icon(m.icon)}" alt="">${m.name}</div>
          <div class="ds">${m.desc}</div><div class="sb">${m.sub}</div><div class="rec glow-amber">${rec[m.id]}</div></div>
        </button>`).join('')}
        <div class="demo-note">DEMO: todos los modos están desbloqueados para probarlos.</div>
      </div>
      ${this.nav('modes')}
    </section>`);
    this.wire(e, {
      pick: (b) => {
        S.mode = b.dataset.id; store.save();
        if (b.dataset.id === 'story') this.go('maps');
        else this.playMode(b.dataset.id);
      },
    });
    return { el: e };
  }

  // ------------------------------------------------------------ maps
  scr_maps() {
    this.setBg('deep');
    const e = el(`<section>
      ${this.topbar('MAPAS')}
      <div class="t-label dim" style="text-align:center;font-size:.9rem;margin:.2rem 0 .5rem">NIVELES ${store.totalCleared()}/160${CONFIG.tester ? ' · MODO TESTER' : ''}</div>
      <div class="scroll stagger">
        ${MAPS.map((m, i) => {
          const open = store.mapUnlocked(m.id);
          const cl = store.clearedLevels(m.id);
          return `<button class="map-card ${open ? '' : 'locked'} ${open && cl < 10 && store.currentStory().map === m.id ? 'sel' : ''}" data-act="${open ? 'open' : 'locked'}" data-map="${m.id}" style="background-image:url(${url(m.key)});--i:${Math.min(i, 6)}">
          <img class="hz" src="${icon(m.hazard)}" alt="">
          ${open ? '' : `<div class="lock"><img src="${icon('lock')}" alt=""></div>`}
          <div class="info"><div><div class="nm worn">${ROMAN[i]} · ${m.name}</div>
            ${open ? `<div class="dots">${Array.from({ length: 10 }, (_, k) => `<i class="${k < cl ? 'on' : ''}"></i>`).join('')}</div>` : `<div class="t-label dim" style="font-size:.8rem">SUPERA EL MAPA ${ROMAN[i - 1]}</div>`}
          </div>${open ? `<span class="btn small">${cl >= 10 ? 'REPETIR' : cl ? 'SEGUIR' : 'JUGAR'}</span>` : ''}</div>
        </button>`;
        }).join('')}
      </div>
      ${this.nav('maps')}
    </section>`);
    this.wire(e, {
      open: (b) => this.go('levels', { map: Number(b.dataset.map) }),
      locked: () => this.toast('Completa los 10 niveles del mapa anterior'),
    });
    return { el: e };
  }

  // ------------------------------------------------------------ level select
  scr_levels({ map = 1, sel }) {
    this.setBg('deep');
    const cl = store.clearedLevels(map);
    const open = store.unlockedUpTo(map);
    let selected = sel || Math.min(10, cl + 1);
    const P = [[50, 93], [74, 84], [52, 75], [26, 66], [48, 57], [74, 48], [52, 39], [26, 30], [46, 21], [58, 9]];
    const e = el(`<section style="background:url(${url(MAPS[map - 1].key)}) center/cover">
      <div style="position:absolute;inset:0;background:linear-gradient(to bottom, rgba(6,9,6,.55), rgba(6,9,6,.2) 30%, rgba(6,9,6,.35) 70%, rgba(6,9,6,.9))"></div>
      ${this.topbar(MAPS[map - 1].name, 'maps')}
      <div class="levels-wrap" id="lw">
        <svg class="path" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline points="${P.map((p) => p.join(',')).join(' ')}" fill="none" stroke="rgba(242,239,230,.55)" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
        </svg>
        ${P.map(([x, y], i) => {
          const n = i + 1;
          const st = n <= cl ? 'cleared' : n === cl + 1 ? 'current' : n <= open ? 'cleared' : 'locked';
          const img = n === 10 ? (st === 'locked' ? 'locked' : 'guardian') : st;
          const rw = storyLevel(map, n).reward;
          return `<button class="level-node ${st} ${n === 10 ? 'guardian' : ''}" data-act="lv" data-n="${n}" style="left:${x}%;top:${y}%">
            <img src="${url('ui/nodes/' + img + '.png')}" alt="">${n === 10 ? '' : `<span class="num">${n}</span>`}
            <span class="rw"><img src="${icon('coin')}" alt="">${rw}</span></button>`;
        }).join('')}
      </div>
      <div class="panel" id="lp" style="margin-bottom:.4rem"></div>
    </section>`);
    const paint = () => {
      e.querySelectorAll('.level-node').forEach((n) => n.classList.toggle('sel', Number(n.dataset.n) === selected));
      const L = storyLevel(map, selected);
      const locked = selected > open;
      $(e, '#lp').innerHTML = `<div class="inner level-panel">
        <div>
          <div class="t-display worn" style="font-size:2.1rem">${selected === 10 ? 'GUARDIÁN · ' : ''}NIVEL ${map}-${selected}</div>
          <div class="obj"><img src="${icon('orb_red')}" alt="">RECOGE ${L.target} ORBES</div>
          <div class="obj dim"><img src="${icon('coin')}" alt="">${selected <= cl ? `REPETIR: +${ECONOMY.replayReward}` : `RECOMPENSA: +${L.reward}`}</div>
        </div>
        <button class="btn-primary" data-act="play" style="min-height:4rem;font-size:2.1rem;padding:0 1.4rem" ${locked ? 'disabled' : ''}>${locked ? '<img src="' + icon('lock') + '" style="width:2rem;border-radius:.2rem">' : '<span class="worn">JUGAR</span>'}</button>
      </div>`;
    };
    paint();
    this.wire(e, {
      lv: (b) => { selected = Number(b.dataset.n); paint(); },
      play: () => {
        if (selected > open) return this.toast('Supera el nivel anterior para desbloquearlo');
        this.startGame({ mode: 'story', level: storyLevel(map, selected) });
      },
    });
    return { el: e };
  }

  // ------------------------------------------------------------ duel select
  scr_duel() {
    this.setBg('deep');
    const S = this.S();
    const wins = S.duelWins.day === store.today() ? S.duelWins.count : 0;
    let diff = 'hard';
    const keys = ['easy', 'medium', 'hard'];
    const e = el(`<section>
      ${this.topbar('DUELO', 'modes')}
      <div class="scroll stagger">
        ${keys.map((k, i) => {
          const b = BOTS[k];
          return `<button class="mode-card btn ${k === diff ? 'sel' : ''}" data-act="diff" data-k="${k}" ${stag(i)}>
            <canvas class="thumb" data-bot="${k}" width="220" height="220" style="background:radial-gradient(circle, rgba(60,50,40,.6), rgba(10,12,10,.8))"></canvas>
            <div><div class="nm worn">${b.label} · ${b.name}</div>
            <div class="ds">PRIMERO A ${b.target} ORBES</div>
            <div class="sb">${k === 'easy' ? 'Lento y despistado.' : k === 'medium' ? 'Va directo a por los orbes.' : 'Usa orbes dorados y te corta el paso.'}</div>
            <div class="rec glow-amber"><img src="${icon('coin')}" style="width:1rem;vertical-align:-.15rem;border-radius:50%"> +${ECONOMY.duelReward[k]} POR VICTORIA</div></div>
          </button>`;
        }).join('')}
        <div class="demo-note">VICTORIAS PAGADAS HOY: ${wins}/${ECONOMY.duelPaidWinsPerDay}</div>
      </div>
      <button class="btn-primary" data-act="fight" style="margin:.4rem 0 .8rem"><span class="worn">LUCHAR</span><i class="tri"></i></button>
    </section>`);
    // static coiled previews of each rival
    e.querySelectorAll('canvas[data-bot]').forEach((c) => {
      const g = c.getContext('2d');
      const pts = pathPoints(110, 112, 62, 48, 5.3, 4.6, 36, 'circle');
      drawSnake(g, pts, BOTS[c.dataset.bot], { R: 17, t: 1, tongue: 0.8 });
    });
    this.wire(e, {
      diff: (b) => {
        diff = b.dataset.k;
        e.querySelectorAll('.mode-card').forEach((c) => c.classList.toggle('sel', c.dataset.k === diff));
      },
      fight: () => this.startGame({ mode: 'duel', difficulty: diff }),
    });
    return { el: e };
  }

  // ------------------------------------------------------------ skins
  scr_skins() {
    this.setBg('deep');
    const S = this.S();
    let sel = S.equipped;
    const e = el(`<section>
      ${this.topbar('SKINS')}
      <div class="skin-stage"><canvas id="stage"></canvas></div>
      <div class="skin-name" id="sn"></div>
      <div class="scroll" style="margin-top:.4rem">
        <div class="t-label dim" style="text-align:center;font-size:.85rem;margin-bottom:.5rem" id="col"></div>
        <div class="skin-grid stagger" id="grid"></div>
      </div>
      <div id="act" style="padding:.5rem 0 .2rem"></div>
      ${this.nav('skins')}
    </section>`);
    const grid = $(e, '#grid');
    const paintGrid = () => {
      $(e, '#col').textContent = `COLECCIÓN ${S.owned.length}/${SKINS.length} · DEMO`;
      const card = (s, i) => {
        const own = S.owned.includes(s.id);
        const rc = RARITY[s.rarity].color;
        return `<button class="skin-card ${own ? '' : 'locked'} ${s.id === sel ? 'sel' : ''}" data-act="sk" data-id="${s.id}" style="--rc:${rc};--i:${i}">
          <img class="pt" src="${url('skins/' + s.id + '.jpg')}" alt="">
          ${own ? '' : `<img class="lk" src="${icon('lock')}" alt="">`}
          ${S.equipped === s.id ? `<img class="eq" src="${icon('check')}" alt="">` : ''}
          <div class="foot">${own ? (S.equipped === s.id ? 'EQUIPADA' : 'TUYA') : `<img src="${icon('coin')}" alt="">${fmt(skinPrice(s))}`}</div>
        </button>`;
      };
      const basics = SKINS.filter((s) => s.basic), specials = SKINS.filter((s) => !s.basic);
      grid.innerHTML = `<div class="grid-head">BÁSICAS · 10 COLORES</div>${basics.map(card).join('')}
        <div class="grid-head">ESPECIALES</div>${specials.map((s, i) => card(s, i + basics.length)).join('')}`;
    };
    const paintInfo = () => {
      const s = skinById(sel);
      const R = RARITY[s.rarity];
      $(e, '#sn').innerHTML = `<div class="t-display worn" style="font-size:2.3rem">${s.name.toUpperCase()}</div>
        <span class="rarity" style="background:${R.color}">${R.label}</span>
        <div class="dim" style="font-size:.9rem;margin-top:.3rem;padding:0 1rem">${s.desc}</div>`;
      const own = S.owned.includes(s.id);
      const price = skinPrice(s);
      let html;
      if (own && S.equipped === s.id) html = `<button class="btn" style="width:100%" disabled>EQUIPADA</button>`;
      else if (own) html = `<button class="btn-primary" data-act="equip" style="width:100%;min-height:4rem;font-size:2.1rem"><span class="worn">EQUIPAR</span></button>`;
      else {
        const pct = Math.min(100, (S.coins / price) * 100);
        html = `<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.45rem"><div class="progress" style="flex:1"><i style="width:${pct}%"></i></div><span class="t-label" style="font-size:.85rem">${fmt(S.coins)} / ${fmt(price)}</span></div>
          <div class="btn-row"><button class="btn-primary" data-act="buy" style="flex:1.4;min-height:3.8rem;font-size:1.8rem"><img src="${icon('coin')}" style="width:1.9rem;border-radius:50%"><span>${fmt(price)}</span></button>
          <button class="btn" data-act="shop">MONEDAS</button></div>`;
      }
      $(e, '#act').innerHTML = html;
    };
    paintGrid();
    paintInfo();

    // animated preview
    const cv = $(e, '#stage');
    let raf, t0 = performance.now(), mouth = 0, blinkT = 2, blink = 0, tongueT = 1, tongue = 0;
    const loop = (now) => {
      const r = cv.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (cv.width !== Math.round(r.width * dpr)) { cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); }
      const g = cv.getContext('2d');
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, r.width, r.height);
      const t = (now - t0) / 1000;
      // pedestal glow
      const cx = r.width / 2, cy = r.height * 0.55;
      const grd = g.createRadialGradient(cx, cy + r.height * 0.18, 5, cx, cy + r.height * 0.18, r.width * 0.42);
      grd.addColorStop(0, 'rgba(255,215,130,0.45)');
      grd.addColorStop(1, 'rgba(255,215,130,0)');
      g.fillStyle = grd;
      g.beginPath();
      g.ellipse(cx, cy + r.height * 0.2, r.width * 0.42, r.height * 0.16, 0, 0, TAU);
      g.fill();
      blinkT -= 1 / 60; if (blinkT < 0) { blink = 1; blinkT = rand(2, 4); } blink = Math.max(0, blink - 0.12);
      tongueT -= 1 / 60; if (tongueT < 0) { tongue = 1; tongueT = rand(1.5, 3); } tongue = Math.max(0, tongue - 0.05);
      mouth = Math.max(0, Math.sin(t * 0.9) - 0.75) * 4;
      const pts = pathPoints(cx, cy, r.width * 0.3, r.height * 0.26, t * 1.1, 4.4, 60, 'eight');
      drawSnake(g, pts, skinById(sel), { R: r.height * 0.075, t, blink, tongue, mouth: clamp(mouth, 0, 1) });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    this.wire(e, {
      sk: (b) => { sel = b.dataset.id; grid.querySelectorAll('.skin-card').forEach((c) => c.classList.toggle('sel', c.dataset.id === sel)); paintInfo(); },
      equip: () => { S.equipped = sel; store.save(); paintGrid(); paintInfo(); this.toast('¡Skin equipada!'); },
      buy: () => {
        const s = skinById(sel);
        const price = skinPrice(s);
        if (S.coins < price) {
          return this.popup({
            title: 'MONEDAS INSUFICIENTES', icon: 'coins',
            text: `Te faltan <b>${fmt(price - S.coins)}</b> monedas para ${s.name}.`,
            buttons: [['CONSEGUIR MONEDAS', () => this.go('shop', { back: 'skins' }), true], ['LUEGO', null]],
          });
        }
        this.popup({
          title: '¿COMPRAR SKIN?', img: url('skins/' + s.id + '.jpg'),
          text: `${s.name} · <span style="color:${RARITY[s.rarity].color}">${RARITY[s.rarity].label}</span><br><b>${fmt(price)}</b> monedas`,
          buttons: [['COMPRAR', () => {
            store.spend(price);
            S.owned.push(s.id);
            S.equipped = s.id;
            store.save();
            paintGrid(); paintInfo();
            this.celebrate(s);
          }, true], ['CANCELAR', null]],
        });
      },
    });
    return { el: e, destroy: () => cancelAnimationFrame(raf) };
  }

  celebrate(s) {
    const o = this.overlay(`<div class="overlay dark">
      <div class="panel strong"><div class="inner">
        <div class="t-label glow-amber">¡SKIN DESBLOQUEADA!</div>
        <img src="${url('skins/' + s.id + '.jpg')}" style="width:11rem;border-radius:.6rem;box-shadow:0 0 2rem ${RARITY[s.rarity].color};animation:pop .6s var(--ease) both">
        <div class="ov-title worn">${s.name.toUpperCase()}</div>
        <span class="rarity" style="background:${RARITY[s.rarity].color}">${RARITY[s.rarity].label}</span>
        <button class="btn-primary" data-act="ok" style="width:100%"><span class="worn">GENIAL</span></button>
      </div></div></div>`);
    this.wire(o, { ok: () => this.closeOverlay(o) });
  }

  // ------------------------------------------------------------ shop
  scr_shop({ back = 'home' }) {
    this.setBg('deep');
    const e = el(`<section>
      ${this.topbar('TIENDA', back)}
      <div class="scroll stagger">
        <div class="panel" ${stag(0)} style="margin-bottom:1rem"><div class="inner" style="display:grid;grid-template-columns:7rem 1fr;gap:.8rem;align-items:center">
          <img src="${url('skins/forest.jpg')}" style="width:7rem;border-radius:.5rem;box-shadow:0 0 1.2rem rgba(232,176,74,.5)">
          <div><div class="t-display worn glow-amber" style="font-size:2rem">PACK DE INICIO</div>
            <div class="t-label" style="font-size:.9rem">SKIN RARA + 5.000 MONEDAS</div>
            <div class="dim" style="font-size:.8rem">Oferta única · −80 %</div>
            <button class="btn small" data-act="buy" data-coins="5000" data-skin="forest" style="margin-top:.4rem">1,99 US$</button></div>
        </div></div>
        <div class="pack-grid">
          ${ECONOMY.packs.map((p, i) => `<button class="pack ${p.tag ? 'best' : ''}" data-act="buy" data-coins="${p.coins}" ${stag(i + 1)}>
            ${p.tag ? `<span class="tag">${p.tag}</span>` : ''}
            <img src="${icon(i < 1 ? 'coin' : 'coins')}" alt="" style="transform:scale(${0.8 + i * 0.07})">
            <div class="amt">${fmt(p.coins)}</div><div class="nm">${p.name.toUpperCase()}</div>
            <div class="price">${p.price}</div></button>`).join('')}
        </div>
        <div class="demo-note" style="margin-top:1rem">DEMO: las compras son simuladas y no cobran nada.<br>En la versión final se usará Google Play Billing.</div>
        <div style="text-align:center"><button class="link" data-act="restore">Restaurar compras</button></div>
      </div>
    </section>`);
    this.wire(e, {
      buy: (b) => {
        const coins = Number(b.dataset.coins);
        this.popup({
          title: 'COMPRA DE DEMO', icon: 'coins', text: `Se añadirán <b>${fmt(coins)}</b> monedas${b.dataset.skin ? ' y la skin Guardián del Bosque' : ''}.<br><span class="dim">(simulado, sin cobro)</span>`,
          buttons: [['CONFIRMAR', () => {
            store.addCoins(coins);
            if (b.dataset.skin && !this.S().owned.includes(b.dataset.skin)) { this.S().owned.push(b.dataset.skin); store.save(); }
            this.toast(`+${fmt(coins)} monedas`);
          }, true], ['CANCELAR', null]],
        });
      },
      restore: () => this.toast('No hay compras que restaurar'),
    });
    return { el: e };
  }

  // ------------------------------------------------------------ settings
  scr_settings() {
    this.setBg('deep');
    const S = this.S();
    const set = S.settings;
    const e = el(`<section>
      ${this.topbar('AJUSTES')}
      <div class="scroll"><div class="panel"><div class="inner pad">
        <div class="sec">AUDIO</div>
        <div class="set-row"><span class="l"><img src="${icon('mode_frenzy')}">MÚSICA</span><button class="toggle ${set.music ? 'on' : ''}" data-act="tg" data-k="music"></button></div>
        <div class="set-row"><span class="l"><img src="${icon('play')}">EFECTOS DE SONIDO</span><button class="toggle ${set.sfx ? 'on' : ''}" data-act="tg" data-k="sfx"></button></div>
        <div class="demo-note" style="text-align:left">El sonido llega en la siguiente fase.</div>
        <div class="set-row"><span class="l"><img src="${icon('hz_wind')}">VIBRACIÓN</span><button class="toggle ${set.vibration ? 'on' : ''}" data-act="tg" data-k="vibration"></button></div>
        <div class="sec">CONTROLES</div>
        <div class="ctl-grid">${[['swipe', 'DESLIZAR'], ['buttons', 'FLECHAS'], ['joystick', 'PALANCA'], ['tap', 'TOQUES']].map(([v, l]) => `<button class="ctl ${set.controls === v ? 'on' : ''}" data-act="ctl" data-v="${v}"><span class="ctl-ic ctl-${v}"></span>${l}</button>`).join('')}</div>
        <div class="demo-note" id="ctlinfo" style="text-align:left;margin-top:.3rem">${CONTROL_INFO[set.controls] || ''}</div>
        <div class="sec">DEMO</div>
        <div class="set-row"><span>+5.000 MONEDAS</span><button class="btn small" data-act="coins">AÑADIR</button></div>
        <div class="set-row"><span>RULETA DE HOY</span><button class="btn small" data-act="wheel">REINICIAR</button></div>
        <div class="set-row"><span>PROGRESO</span><button class="btn small" data-act="reset">BORRAR</button></div>
        <div class="sec">CUENTA</div>
        <button class="btn" style="width:100%;margin-top:.4rem" data-act="soon">CONECTAR GOOGLE PLAY GAMES</button>
        <div class="btn-row" style="margin-top:.5rem"><button class="btn small" data-act="soon">PRIVACIDAD</button><button class="btn small" data-act="soon">SOPORTE</button></div>
        <div style="display:flex;flex-direction:column;align-items:center;margin-top:1rem;gap:.3rem"><img src="${url('ui/logo.png')}" style="width:5rem;opacity:.8"><span class="demo-note">VERSIÓN ${CONFIG.version}${CONFIG.tester ? ' · TESTER' : ''}</span></div>
      </div></div></div>
      ${this.nav('settings')}
    </section>`);
    this.wire(e, {
      tg: (b) => { set[b.dataset.k] = !set[b.dataset.k]; b.classList.toggle('on', set[b.dataset.k]); store.save(); },
      ctl: (b) => { set.controls = b.dataset.v; e.querySelectorAll('[data-act=ctl]').forEach((x) => x.classList.toggle('on', x === b)); $(e, '#ctlinfo').textContent = CONTROL_INFO[set.controls]; store.save(); },
      coins: () => { store.addCoins(5000); this.toast('+5.000 monedas'); },
      wheel: () => { S.wheelDay = ''; store.save(); this.toast('Ruleta disponible'); },
      reset: () => this.popup({
        title: '¿BORRAR PROGRESO?', icon: 'retry', text: 'Se perderán monedas, skins y niveles de la demo.',
        buttons: [['BORRAR', () => { store.reset(); this.go('home'); this.toast('Progreso borrado'); }, true], ['CANCELAR', null]],
      }),
      soon: () => this.toast('Disponible en la versión final'),
    });
    return { el: e };
  }

  // Android Back button. Returns true when the game handled it.
  back() {
    const ov = [...this.overEl.children].filter((o) => o.classList.contains('show'));
    if (ov.length) {
      const top = ov[ov.length - 1];
      if (top.classList.contains('ad')) return true;
      const b = top.querySelector('[data-act=resume],[data-act=close],[data-act=ok],[data-act=b][data-i="1"]');
      if (b) b.click();
      return true;
    }
    if (this.game) {
      if (['play', 'countdown', 'ready'].includes(this.game.state)) this.pause();
      return true;
    }
    if (this.cur && this.cur.name !== 'home' && this.cur.name !== 'splash') {
      const b = this.cur.el.querySelector('[data-act=back]');
      if (b) b.click(); else this.go('home');
      return true;
    }
    return false;
  }

  // ------------------------------------------------------------ overlays infra
  overlay(html) {
    const o = el(html);
    this.overEl.appendChild(o);
    requestAnimationFrame(() => o.classList.add('show'));
    return o;
  }

  closeOverlay(o) {
    if (!o || !o.parentNode) return;
    o.classList.remove('show');
    setTimeout(() => o.remove(), 300);
  }

  closeOverlays() {
    [...this.overEl.children].forEach((o) => this.closeOverlay(o));
  }

  popup({ title, text, icon: ic, img, buttons }) {
    const o = this.overlay(`<div class="overlay dark"><div class="panel strong"><div class="inner">
      ${ic ? `<img src="${icon(ic)}" style="width:4rem;border-radius:.4rem">` : ''}
      ${img ? `<img src="${img}" style="width:7rem;border-radius:.5rem">` : ''}
      <div class="ov-title worn" style="font-size:2.4rem">${title}</div>
      <div style="font-size:1.05rem;line-height:1.35">${text}</div>
      <div class="btn-row" style="flex-direction:column">${buttons.map(([l, , primary], i) => primary
        ? `<button class="btn-primary" data-act="b" data-i="${i}" style="min-height:3.8rem;font-size:1.9rem"><span class="worn">${l}</span></button>`
        : `<button class="btn" data-act="b" data-i="${i}">${l}</button>`).join('')}</div>
    </div></div></div>`);
    this.wire(o, {
      b: (b) => {
        this.closeOverlay(o);
        const fn = buttons[Number(b.dataset.i)][1];
        if (fn) setTimeout(fn, 120);
      },
    });
    return o;
  }

  // Simulated rewarded ad (AdMob in the real build).
  fakeAd(onReward) {
    const o = this.overlay(`<div class="ad">
      <span class="tagad">ANUNCIO · DEMO</span>
      <div class="x" id="adx">5</div>
      <img class="logo" src="${url('ui/logo.png')}" alt="">
      <div class="t">Aquí se mostrará un anuncio con recompensa de AdMob.<br>Espera unos segundos para recibir la recompensa.</div>
      <div class="loadbar" style="width:60%"><i id="adb"></i></div>
    </div>`);
    let left = 5;
    const bar = $(o, '#adb');
    requestAnimationFrame(() => { bar.style.transition = 'width 5s linear'; bar.style.width = '100%'; });
    const iv = setInterval(() => {
      left--;
      $(o, '#adx').textContent = left > 0 ? left : '✕';
      if (left <= 0) {
        clearInterval(iv);
        $(o, '#adx').addEventListener('click', () => { this.closeOverlay(o); onReward(); }, { once: true });
      }
    }, 1000);
  }

  // ------------------------------------------------------------ daily wheel
  openWheel() {
    const S = this.S();
    const ready = S.wheelDay !== store.today();
    const o = this.overlay(`<div class="overlay dark">
      <div class="panel strong"><div class="inner">
        <div class="ov-title worn">RULETA DIARIA</div>
        <div class="ov-sub" id="wsub">${ready ? 'Un giro gratis cada día' : 'Vuelve mañana para otro giro'}</div>
        <div class="wheel-wrap"><canvas id="wc" width="600" height="600"></canvas>
          <svg class="wheel-ptr" viewBox="0 0 60 72"><path d="M30 70 L8 18 Q30 -6 52 18 Z" fill="#2B2418" stroke="#E8B04A" stroke-width="3"/><circle cx="22" cy="20" r="4" fill="#FFB030"/><circle cx="38" cy="20" r="4" fill="#FFB030"/></svg>
        </div>
        <div id="wact" style="width:100%">${ready ? '<button class="btn-primary" data-act="spin" style="width:100%"><span class="worn">GIRAR</span></button>' : ''}</div>
        <button class="link" data-act="close">${ready ? 'Más tarde' : 'Cerrar'}</button>
      </div></div></div>`);
    const cv = $(o, '#wc');
    const g = cv.getContext('2d');
    const W = ECONOMY.wheel;
    let rot = 0;
    const draw = () => {
      g.clearRect(0, 0, 600, 600);
      g.save();
      g.translate(300, 300);
      // outer stone ring
      g.fillStyle = '#2A2A22';
      g.beginPath(); g.arc(0, 0, 290, 0, TAU); g.fill();
      g.strokeStyle = '#E8B04A'; g.lineWidth = 6; g.stroke();
      g.rotate(rot);
      const n = W.length, a = TAU / n;
      for (let i = 0; i < n; i++) {
        g.save();
        g.rotate(i * a - Math.PI / 2 - a / 2);
        g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 270, 0, a); g.closePath();
        g.fillStyle = i % 2 ? '#3A3A30' : '#5A4428';
        if (W[i].v === 100) g.fillStyle = '#7A5A1A';
        g.fill();
        g.strokeStyle = 'rgba(242,239,230,.35)'; g.lineWidth = 3; g.stroke();
        g.rotate(a / 2);
        g.fillStyle = '#F2EFE6';
        g.font = 'bold 54px "Bebas Neue", sans-serif';
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.translate(190, 0);
        g.rotate(Math.PI / 2);
        g.fillText(String(W[i].v), 0, 0);
        g.fillStyle = '#E8B04A';
        g.beginPath(); g.arc(0, 42, 13, 0, TAU); g.fill();
        g.restore();
      }
      g.restore();
      // hub
      g.save();
      g.translate(300, 300);
      g.fillStyle = '#1A1A14'; g.beginPath(); g.arc(0, 0, 62, 0, TAU); g.fill();
      g.strokeStyle = '#E8B04A'; g.lineWidth = 5; g.stroke();
      g.restore();
    };
    const logo = new Image();
    logo.onload = () => { draw(); g.drawImage(logo, 250, 250, 100, 100); };
    logo.src = url('ui/logo.png');
    draw();
    this.wire(o, {
      close: () => this.closeOverlay(o),
      spin: (b) => {
        b.disabled = true;
        // weighted result
        const tot = W.reduce((s, w) => s + w.w, 0);
        let r = Math.random() * tot, idx = 0;
        for (; idx < W.length; idx++) { r -= W[idx].w; if (r <= 0) break; }
        idx = Math.min(idx, W.length - 1);
        const a = TAU / W.length;
        const target = TAU * 6 - idx * a + rand(-a * 0.3, a * 0.3);
        const start = rot, t0 = performance.now(), dur = 4200;
        const anim = (now) => {
          const k = clamp((now - t0) / dur, 0, 1);
          rot = start + (target - start) * ease.outCubic(k);
          draw();
          if (logo.complete) g.drawImage(logo, 250, 250, 100, 100);
          if (k < 1) requestAnimationFrame(anim);
          else {
            const v = W[idx].v;
            S.wheelDay = store.today(); store.save();
            $(o, '#wsub').innerHTML = `<span class="glow-amber" style="font-size:1.4rem">¡HAS GANADO ${v} MONEDAS!</span>`;
            $(o, '#wact').innerHTML = `<button class="btn-primary" data-act="claim" style="width:100%"><span class="stack"><span class="worn">RECLAMAR</span><span class="sub">VER ANUNCIO</span></span></button>`;
            o.querySelector('[data-act=close]').textContent = 'Renunciar al premio';
            o.dataset.win = v;
          }
        };
        requestAnimationFrame(anim);
      },
      claim: () => {
        this.fakeAd(() => {
          const v = Number(o.dataset.win);
          store.addCoins(v);
          this.closeOverlay(o);
          this.toast(`+${v} monedas`);
          if (this.cur && this.cur.name === 'home') this.go('home');
        });
      },
    });
  }

  // ------------------------------------------------------------ game
  startGame(cfg) {
    this.lastCfg = cfg;
    if (this.game) this.game = null;
    this.closeOverlays();
    this.go('game', cfg);
  }

  scr_game(cfg) {
    const art = cfg.mode === 'story' ? cfg.level.mapInfo.key : { classic: 'maps/key06.jpg', frenzy: 'maps/key12.jpg', duel: 'maps/key09.jpg' }[cfg.mode];
    this.setBg('game', art);
    const S = this.S();
    const e = el(`<section style="padding:0">
      <div class="hud">
        <button class="icon-btn" data-act="pause"><img src="${icon('pause')}" alt="Pausa"></button>
        <div class="hud-center" id="hc"></div>
        <div class="hud-right"><div class="sc" id="hs">0</div><div class="lb">PUNTOS</div></div>
      </div>
      <div class="hud-bottom">
        <div class="tag-level" id="tl"></div>
        <div class="boost" id="bo"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="rgba(0,0,0,.5)" stroke="rgba(255,255,255,.15)" stroke-width="4"/><circle id="bor" cx="20" cy="20" r="16" fill="none" stroke="#FFC23A" stroke-width="4" stroke-dasharray="100.5" stroke-dashoffset="0" stroke-linecap="round"/></svg>x2</div>
      </div>
      ${S.settings.controls === 'buttons' ? `<div class="dpad"><button class="u" data-dir="up"><i></i></button><button class="l" data-dir="left"><i></i></button><button class="d" data-dir="down"><i></i></button><button class="r" data-dir="right"><i></i></button></div>` : ''}
      <div id="fxl"></div>
    </section>`);
    this.hudEl = e;
    const mode = cfg.mode;
    const hc = $(e, '#hc');
    if (mode === 'story') {
      hc.innerHTML = `<div class="hud-obj"><img src="${icon('orb_red')}" alt=""><span id="ho">0 / ${cfg.level.target}</span></div><div class="hud-bar"><i id="hb"></i></div>`;
      $(e, '#tl').textContent = `${cfg.level.guardian ? 'GUARDIÁN · ' : ''}NIVEL ${cfg.level.map}-${cfg.level.n} · ${cfg.level.mapInfo.name}`;
    } else if (mode === 'classic') {
      hc.innerHTML = `<div class="hud-obj"><img src="${icon('mode_classic')}" alt=""><span id="ho">LARGO 3</span></div><div class="t-label dim" style="font-size:.75rem">RÉCORD ${fmt(S.best.classic)}</div>`;
      $(e, '#tl').textContent = 'CLÁSICO';
    } else if (mode === 'frenzy') {
      hc.innerHTML = `<div class="timer-big" id="tm">1:00</div><div class="t-label dim" style="font-size:.75rem">RÉCORD ${fmt(S.best.frenzy)}</div>`;
      $(e, '#tl').textContent = 'ORBES FRENÉTICOS';
    } else if (mode === 'duel') {
      const b = BOTS[cfg.difficulty];
      hc.innerHTML = `<div class="duel-bars"><span class="you">TÚ <b id="dp">0</b></span><span class="vs">A ${b.target}</span><span class="rival"><b id="db">0</b> RIVAL</span></div>
        <div class="duel-mini"><div class="hud-bar"><i id="dpb"></i></div><div class="hud-bar" style="transform:scaleX(-1)"><i class="r" id="dbb"></i></div></div>`;
      $(e, '#tl').textContent = `DUELO · ${b.label}`;
    }

    // build the game
    this.game = new Game(this.view, this, { ...cfg, skinId: S.equipped, settings: S.settings });
    const game = this.game;
    this.updateCoinsRunTip = null;
    e.querySelectorAll('.dpad button').forEach((b) => b.addEventListener('pointerdown', (ev) => { ev.preventDefault(); game.input(b.dataset.dir); }));
    this.wire(e, { pause: () => this.pause() });
    return {
      el: e,
      destroy: () => { if (this.game === game) this.game = null; },
    };
  }

  fxLayer() { return this.hudEl && $(this.hudEl, '#fxl'); }

  countdown(done) {
    const layer = this.fxLayer();
    const ctl = this.S().settings.controls || 'swipe';
    if (this.hudEl) {
      const h = el(`<div class="ctl-hint"><span class="ctl-ic ctl-${ctl}"></span>${CONTROL_INFO[ctl]}</div>`);
      this.hudEl.appendChild(h);
      setTimeout(() => h.classList.add('out'), 3200);
      setTimeout(() => h.remove(), 3800);
    }
    const steps = ['3', '2', '1', '¡YA!'];
    let i = 0;
    const next = () => {
      if (!layer || !layer.isConnected) return;
      layer.innerHTML = `<div class="center-fx"><div class="count ${i === 3 ? 'go' : ''}">${steps[i]}</div></div>`;
      if (i === 3) { done(); setTimeout(() => { if (layer.isConnected) layer.innerHTML = ''; }, 700); return; }
      i++;
      setTimeout(next, 620);
    };
    next();
  }

  hud(h) {
    const e = this.hudEl;
    if (!e) return;
    const sc = $(e, '#hs');
    sc.textContent = fmt(h.score);
    sc.classList.remove('hud-bump'); void sc.offsetWidth; sc.classList.add('hud-bump');
    if (h.objective) {
      $(e, '#ho').textContent = `${h.objective.cur} / ${h.objective.target}`;
      $(e, '#hb').style.width = (h.objective.cur / h.objective.target) * 100 + '%';
    }
    if (h.length && $(e, '#ho')) $(e, '#ho').textContent = `LARGO ${h.length}`;
    if (h.duel) {
      $(e, '#dp').textContent = h.duel.p;
      $(e, '#db').textContent = h.duel.b;
      $(e, '#dpb').style.width = (h.duel.p / h.duel.target) * 100 + '%';
      $(e, '#dbb').style.width = (h.duel.b / h.duel.target) * 100 + '%';
    }
  }

  hudTimer(t) {
    const n = this.hudEl && $(this.hudEl, '#tm');
    if (!n) return;
    const s = Math.ceil(t);
    const txt = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    if (n.textContent !== txt) n.textContent = txt;
    n.classList.toggle('hurry', t < 10);
  }

  hudBoost(k) {
    const b = this.hudEl && $(this.hudEl, '#bo');
    if (!b) return;
    b.classList.toggle('on', k > 0);
    $(b, '#bor').setAttribute('stroke-dashoffset', String(100.5 * (1 - k)));
  }

  combo(n) {
    const layer = this.fxLayer();
    if (!layer) return;
    const c = el(`<div class="combo">COMBO x${n}</div>`);
    layer.appendChild(c);
    setTimeout(() => c.remove(), 1000);
  }

  banner(text, kind) {
    const layer = this.fxLayer();
    if (!layer) return;
    const b = el(`<div class="center-fx" style="top:30%"><div class="banner ${kind}">${text}</div></div>`);
    layer.appendChild(b);
    setTimeout(() => b.remove(), 1500);
  }

  flash(kind) {
    const f = $(this.app, '#flash');
    f.className = '';
    void f.offsetWidth;
    f.className = kind;
  }

  goldFlash() { this.flash('gold'); }
  hitFlash() { this.flash('hit'); }

  showHint(t) {
    const layer = this.fxLayer();
    if (!layer) return;
    this.hideHint();
    layer.appendChild(el(`<div class="hint" id="hint">${t}</div>`));
  }

  hideHint() {
    const h = this.hudEl && $(this.hudEl, '#hint');
    if (h) h.remove();
  }

  pause() {
    const game = this.game;
    if (!game || game.paused || !['play', 'countdown', 'ready'].includes(game.state)) return;
    game.paused = true;
    const cfg = this.lastCfg;
    const info = cfg.mode === 'story' ? `NIVEL ${cfg.level.map}-${cfg.level.n} · ORBES ${game.player.orbs}/${game.target}` : `PUNTOS ${fmt(game.score)}`;
    const o = this.overlay(`<div class="overlay"><div class="panel"><div class="inner">
      <img src="${icon('pause')}" style="width:3.6rem;border-radius:.4rem">
      <div class="ov-title worn">PAUSA</div>
      <div class="ov-sub">${info}</div>
      <button class="btn-primary" data-act="resume" style="width:100%"><span class="worn">CONTINUAR</span><i class="tri"></i></button>
      <div class="btn-row"><button class="btn" data-act="restart"><img class="ic" src="${icon('retry')}">REINICIAR</button><button class="btn" data-act="quit"><img class="ic" src="${icon('quit')}">SALIR</button></div>
    </div></div></div>`);
    this.wire(o, {
      resume: () => { this.closeOverlay(o); game.paused = false; },
      restart: () => this.startGame(this.lastCfg),
      quit: () => this.exitGame(),
    });
  }

  exitGame() {
    const m = this.lastCfg && this.lastCfg.mode;
    this.game = null;
    if (m === 'story') this.go('levels', { map: this.lastCfg.level.map });
    else if (m === 'duel') this.go('duel');
    else this.go('home');
  }

  // ------------------------------------------------------------ revive
  showRevive(info) {
    const game = this.game;
    if (!game) return;
    const S = this.S();
    const r = info.revives;
    if (r >= 2) { game.giveUp(); return; }
    const cost = ECONOMY.reviveCoins[r];
    const canAd = r === 0;
    let sub = info.mode === 'story' ? `Solo te faltan ${info.left} orbes` : info.mode === 'duel' ? '¡El duelo sigue abierto!' : `${fmt(info.score)} puntos`;
    if (r === 1) sub = 'Última oportunidad';
    const prog = info.target ? `<div style="width:100%;display:flex;align-items:center;gap:.5rem"><img src="${icon('orb_red')}" style="width:1.8rem;border-radius:.2rem"><div class="progress" style="flex:1"><i style="width:${(info.cur / info.target) * 100}%"></i></div><span class="t-display" style="font-size:1.4rem">${info.cur}/${info.target}</span></div>` : '';
    const enough = S.coins >= cost;
    const o = this.overlay(`<div class="overlay" style="justify-content:flex-end;padding-bottom:12%"><div class="panel"><div class="inner">
      <div class="ov-title worn">¡CASI!</div>
      <div class="ov-sub">${sub}</div>
      ${prog}
      ${canAd ? `<div class="revive-main"><button class="btn-primary" data-act="ad" style="width:100%"><img src="${icon('ad')}" style="width:2.2rem;border-radius:.25rem"><span class="stack"><span class="worn">REVIVIR</span><span class="sub">VER ANUNCIO</span></span></button>
        <div class="ring"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="rgba(10,14,11,.9)" stroke="rgba(255,255,255,.15)" stroke-width="3"/><circle id="rr" cx="20" cy="20" r="17" fill="none" stroke="#E8B04A" stroke-width="3" stroke-dasharray="106.8" stroke-dashoffset="0" stroke-linecap="round"/></svg><span id="rn">6</span></div></div>` : ''}
      <button class="${canAd ? 'btn' : 'btn-primary'}" data-act="coins" style="width:100%;${canAd ? '' : 'min-height:4rem;font-size:2rem'}"><img class="ic" src="${icon('coin')}" style="${canAd ? '' : 'width:2rem;height:2rem;border-radius:50%'}"><span>REVIVIR · ${cost}</span></button>
      ${enough ? '' : `<div class="t-label" style="color:#FF8A7A;font-size:.85rem">TE FALTAN ${fmt(cost - S.coins)} MONEDAS · <button class="link" data-act="getcoins" style="padding:0;color:var(--honey)">CONSEGUIR</button></div>`}
      <div class="btn-row"><button class="btn small" data-act="retry"><img class="ic" src="${icon('retry')}">REINTENTAR</button><button class="btn small" data-act="home"><img class="ic" src="${icon('home')}">SALIR</button></div>
      <button class="link" data-act="no">No, gracias</button>
    </div></div></div>`);
    // countdown to auto-decline
    let left = 6, paused = false;
    const rr = $(o, '#rr'), rn = $(o, '#rn');
    const t0 = performance.now();
    let acc = 0, last = t0;
    const tick = (now) => {
      if (!o.isConnected) return;
      if (!paused) acc += (now - last) / 1000;
      last = now;
      const k = clamp(acc / 6, 0, 1);
      if (rr) rr.setAttribute('stroke-dashoffset', String(106.8 * k));
      const nl = Math.max(0, Math.ceil(6 - acc));
      if (rn && nl !== left) { left = nl; rn.textContent = nl; }
      if (k >= 1) { decline(); return; }
      requestAnimationFrame(tick);
    };
    if (canAd) requestAnimationFrame(tick);
    const done = () => this.closeOverlay(o);
    const decline = () => { if (!o.isConnected) return; done(); game.giveUp(); };
    this.wire(o, {
      ad: () => { paused = true; this.fakeAd(() => { done(); game.revive(); }); },
      coins: () => {
        if (!store.spend(cost)) {
          paused = true;
          this.popup({
            title: 'MONEDAS INSUFICIENTES', icon: 'coins', text: `Necesitas <b>${cost}</b> monedas para revivir.`,
            buttons: [['CONSEGUIR MONEDAS', () => this.quickShop(() => { paused = false; }), true], ['VOLVER', () => { paused = false; }]],
          });
          return;
        }
        done();
        game.revive();
      },
      getcoins: () => { paused = true; this.quickShop(() => { paused = false; }); },
      retry: () => this.startGame(this.lastCfg),
      home: () => this.exitGame(),
      no: () => decline(),
    });
  }

  // Minimal in-game coin pack sheet (keeps the run alive).
  quickShop(onClose) {
    const o = this.overlay(`<div class="overlay dark"><div class="panel strong"><div class="inner">
      <div class="ov-title worn" style="font-size:2.4rem">MONEDAS</div>
      <div class="pack-grid" style="width:100%">${ECONOMY.packs.slice(0, 3).map((p, i) => `<button class="pack" data-act="buy" data-coins="${p.coins}"><img src="${icon(i ? 'coins' : 'coin')}"><div class="amt">${fmt(p.coins)}</div><div class="price">${p.price}</div></button>`).join('')}</div>
      <div class="demo-note">Compra simulada (demo)</div>
      <button class="btn" data-act="close" style="width:100%">VOLVER</button>
    </div></div></div>`);
    this.wire(o, {
      buy: (b) => { store.addCoins(Number(b.dataset.coins)); this.toast(`+${fmt(Number(b.dataset.coins))} monedas`); this.closeOverlay(o); onClose && onClose(); this.refreshReviveCoins(); },
      close: () => { this.closeOverlay(o); onClose && onClose(); },
    });
  }

  refreshReviveCoins() {
    // re-render the revive panel's "missing coins" line if present
    const warn = this.overEl.querySelector('[data-act=getcoins]');
    if (warn) warn.closest('.t-label').remove();
  }

  // ------------------------------------------------------------ results
  finish(res) {
    const S = this.S();
    const cfg = this.lastCfg;
    let html = '', coins = 0;
    const statRow = (items) => `<div class="stat-row">${items.map(([k, v]) => `<div><span class="v">${v}</span><span class="k">${k}</span></div>`).join('')}</div>`;
    const t = res.time;
    const time = `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

    if (res.mode === 'story') {
      const L = cfg.level;
      if (res.won) {
        const first = store.markCleared(L.map, L.n);
        coins = first ? L.reward : ECONOMY.replayReward;
        html = `<div class="t-label glow-amber">${L.guardian ? '¡GUARDIÁN DERROTADO!' : '¡OBJETIVO CUMPLIDO!'}</div>
          <div class="ov-title worn">NIVEL SUPERADO</div>
          <div class="ov-sub">${L.map}-${L.n} · ${L.mapInfo.name}</div>
          ${statRow([['ORBES', `${Math.min(res.orbs, L.target)}/${L.target}`], ['PUNTOS', fmt(res.score)], ['TIEMPO', time]])}
          <div class="coin-reward"><img src="${icon('coin')}"><span id="cr">+0</span></div>
          ${first ? '' : '<div class="demo-note">Nivel repetido: recompensa reducida</div>'}
          ${L.n < 10 ? `<button class="btn-primary" data-act="next" style="width:100%"><span class="worn">SIGUIENTE</span><i class="tri"></i></button>`
            : `<div class="t-label glow-amber">¡MAPA ${ROMAN[L.map - 1]} COMPLETADO!</div>${L.map < 16 ? `<button class="btn-primary" data-act="nextmap" style="width:100%"><span class="stack"><span class="worn">SIGUIENTE MAPA</span><span class="sub">${MAPS[L.map].name}</span></span></button>` : ''}`}
          <div class="btn-row"><button class="btn" data-act="retry"><img class="ic" src="${icon('retry')}">REPETIR</button><button class="btn" data-act="levels"><img class="ic" src="${icon('levels')}">NIVELES</button></div>`;
      } else {
        html = `<div class="ov-title worn">NIVEL FALLIDO</div>
          <div class="ov-sub">${L.map}-${L.n} · ${L.mapInfo.name}</div>
          ${statRow([['ORBES', `${res.orbs}/${L.target}`], ['PUNTOS', fmt(res.score)], ['TIEMPO', time]])}
          <button class="btn-primary" data-act="retry" style="width:100%"><span class="worn">REINTENTAR</span></button>
          <div class="btn-row"><button class="btn" data-act="levels"><img class="ic" src="${icon('levels')}">NIVELES</button><button class="btn" data-act="home"><img class="ic" src="${icon('home')}">INICIO</button></div>`;
      }
    } else if (res.mode === 'classic' || res.mode === 'frenzy') {
      const key = res.mode;
      const prevBest = S.best[key];
      const rec = res.score > prevBest;
      if (rec) { S.best[key] = res.score; store.save(); }
      coins = Math.floor(res.orbs / (key === 'classic' ? ECONOMY.classicCoinsPerOrbs : ECONOMY.frenzyCoinsPerOrbs));
      html = `${rec ? '<div class="newrec">¡NUEVO RÉCORD!</div>' : ''}
        <div class="ov-title worn">${key === 'frenzy' ? (res.won ? '¡TIEMPO!' : 'FIN DEL FRENESÍ') : 'FIN DE LA PARTIDA'}</div>
        <div class="big-num">${fmt(res.score)}</div>
        <div class="ov-sub">RÉCORD ${fmt(Math.max(prevBest, res.score))}</div>
        ${statRow(key === 'classic' ? [['ORBES', res.orbs], ['LARGO', res.length], ['TIEMPO', time]] : [['DORADOS', res.gold], ['LARGO', res.length], ['TIEMPO', time]])}
        <div class="coin-reward"><img src="${icon('coin')}"><span id="cr">+0</span></div>
        <button class="btn-primary" data-act="retry" style="width:100%"><span class="worn">JUGAR DE NUEVO</span></button>
        <div class="btn-row"><button class="btn" data-act="home"><img class="ic" src="${icon('home')}">INICIO</button><button class="btn" data-act="lb"><img class="ic" src="${icon('mode_leaderboard')}">RANKING</button></div>`;
    } else if (res.mode === 'duel') {
      const b = BOTS[cfg.difficulty];
      if (res.won) {
        const d = store.today();
        if (S.duelWins.day !== d) S.duelWins = { day: d, count: 0 };
        if (S.duelWins.count < ECONOMY.duelPaidWinsPerDay) { coins = ECONOMY.duelReward[cfg.difficulty]; S.duelWins.count++; }
        store.save();
      }
      html = `<div class="ov-title worn" style="color:${res.won ? 'var(--honey)' : '#FF8A7A'}">${res.won ? 'VICTORIA' : 'DERROTA'}</div>
        <div class="ov-sub">${res.won ? `${b.name} DERROTADO` : res.loseReason === 'bot' ? `${b.name} LLEGÓ PRIMERO` : `${b.name} TE HA VENCIDO`}</div>
        ${statRow([['TÚ', res.duel.p], ['RIVAL', res.duel.b], ['TIEMPO', time]])}
        ${res.won ? `<div class="coin-reward"><img src="${icon('coin')}"><span id="cr">+0</span></div>${coins ? '' : '<div class="demo-note">Límite diario de victorias pagadas alcanzado</div>'}` : ''}
        <button class="btn-primary" data-act="retry" style="width:100%"><span class="worn">REVANCHA</span></button>
        <div class="btn-row"><button class="btn" data-act="duel"><img class="ic" src="${icon('mode_duel')}">RIVALES</button><button class="btn" data-act="home"><img class="ic" src="${icon('home')}">INICIO</button></div>`;
    }

    const o = this.overlay(`<div class="overlay"><div class="panel"><div class="inner stagger">${html}</div></div></div>`);
    [...o.querySelectorAll('.inner > *')].forEach((n, i) => n.style.setProperty('--i', i));
    if (coins > 0) {
      store.addCoins(coins);
      // count-up animation
      const cr = $(o, '#cr');
      const t0 = performance.now();
      const up = (now) => {
        const k = clamp((now - t0) / 900, 0, 1);
        if (cr) cr.textContent = '+' + Math.round(coins * ease.outCubic(k));
        if (k < 1) requestAnimationFrame(up);
      };
      setTimeout(() => requestAnimationFrame(up), 450);
    } else {
      const cr = $(o, '#cr');
      if (cr) cr.textContent = '+0';
    }
    this.wire(o, {
      next: () => this.startGame({ mode: 'story', level: storyLevel(cfg.level.map, cfg.level.n + 1) }),
      retry: () => this.startGame(cfg),
      levels: () => { this.game = null; this.go('levels', { map: cfg.level.map, sel: Math.min(10, cfg.level.n + (res.won ? 1 : 0)) }); },
      nextmap: () => { this.game = null; this.go('levels', { map: cfg.level.map + 1 }); },
      home: () => { this.game = null; this.go('home'); },
      duel: () => { this.game = null; this.go('duel'); },
      lb: () => this.toast('Ranking con Google Play Games en la versión final'),
    });
  }
}
