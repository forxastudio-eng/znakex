// Screens, overlays and HUD (DOM layer over the canvases).
import { MODES, MAPS, SKINS, RARITY, BOTS, ECONOMY, TIPS, DIFFS, SEASON_MAP, skinById, skinPrice, storyLevel, tutorialLevel } from './data.js';
import * as meta from './meta.js';
import { PW } from './powerups.js';
import { drawOrb } from './orbs.js';
import { IMG } from './assets.js';
import * as cloud from './cloud.js';
import * as audio from './audio.js';
import * as store from './store.js';
import { url, ensureSkin } from './assets.js';
import { drawSnake, pathPoints } from './snakedraw.js';
import { fmt, TAU, ease, clamp, rand } from './util.js';
import { Game } from './game.js';
import { CONFIG } from './config.js';
import { CONTROL_INFO } from './input.js';
import { t, tn, LANGS, getLang, setLang } from './i18n.js';
import { BRAND_ICONS, PLAQUES } from './newmanifest.js';
import { pwPath } from './powerups.js';

// brand v2 icons (ivory symbols, gold rewards); the few the new set doesn't have (x2/x3 badges, map hazards) keep the old art
const BRAND = new Set(BRAND_ICONS);
const ICON_ALIAS = { ad: 'video' };
const icon = (n) => { n = ICON_ALIAS[n] || n; return BRAND.has(n) ? url(`brand/icons/${n}.webp`) : url(`ui/icons/${n}.png`); };
const kit = icon;
const pwi = (n) => url(pwPath(n));
const LOGO = url('brand/logo/logo_full.webp');
// plaque colours by meaning: 0 danger, 1 brand, 2 reward, 3 info, 4 special
const PLAQUE = ['danger', 'brand', 'reward', 'info', 'special'];
const plaqueImg = (idx) => url(`brand/plaques/${PLAQUE[idx] || PLAQUES[0]}.webp`);
// rarity frame drawn over a skin cover (assets/ui/rfr/<rarity>.png); without the file the card just keeps its coloured edge
const frameImg = (rarity) => `<img class="fr" src="${url('ui/rfr/' + rarity + '.png')}" alt="" onload="this.parentNode.classList.add('has-fr')" onerror="this.remove()">`;
// long texts (Russian, Portuguese) shrink so they stay between the plaque's end ornaments
const fit = (text, chars = 13) => { const n = String(text).replace(/<[^>]*>/g, '').length; return n > chars ? ` style="font-size:${(chars / n).toFixed(3)}em"` : ''; };
// measured fit (the estimate above can't know how wide Cyrillic glyphs are)
function fitPlaques(root) {
  requestAnimationFrame(() => root.querySelectorAll('.ptitle span b, .plaque span b').forEach((b) => {
    const box = b.parentElement.clientWidth;
    if (box && b.scrollWidth > box) b.style.fontSize = `${(parseFloat(getComputedStyle(b).fontSize) * box / b.scrollWidth * 0.96).toFixed(1)}px`;
  }));
}
const ptitle = (text, idx = 2, cls = '') => `<div class="ptitle p${idx} ${cls}"><img src="${plaqueImg(idx)}" alt=""><span><b${fit(text)}>${text}</b></span></div>`;
const fmtT = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
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
    document.addEventListener('achievement', (e) => e.detail.forEach((a, i) => setTimeout(() => this.toast(`<img src="${kit('medal_gold')}" style="height:1.6rem;vertical-align:-.4rem;margin-right:.4rem">${t('LOGRO')} · ${t(a.name).toUpperCase()}`, true), i * 2000)));
    document.addEventListener('mission', (e) => this.toast(`<img src="${kit('check_box')}" style="height:1.5rem;vertical-align:-.35rem;margin-right:.4rem">${t('MISIÓN LISTA')} · ${meta.missionText(e.detail)}`, true));
  }

  S() { return store.S(); }

  setBg(kind, art) {
    this.app.dataset.bg = kind;
    if (art) this.app.style.setProperty('--art', `url("${new URL(url(art), location.href).href}")`);
    else this.app.style.removeProperty('--art');
    this.bgVideo({ menu: 'menu', title: 'inicio' }[kind]);
  }

  // The title and menu art loop a short video over the still (off in low graphics mode).
  bgVideo(name) {
    const bg = $(this.app, '#bg');
    const old = $(bg, 'video');
    if (old && old.dataset.name === name) return;
    if (old) { old.classList.remove('on'); setTimeout(() => old.remove(), 800); }
    if (!name || this.S().settings.lowfx) return;
    const v = el(`<video muted loop playsinline autoplay preload="auto" data-name="${name}"></video>`);
    v.muted = true;
    v.src = url(`brand/video/${name}.mp4`);
    v.addEventListener('playing', () => v.classList.add('on'), { once: true });
    $(bg, '.bg-dim').before(v);
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
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
    if (name !== 'game' && name !== 'splash') audio.playMusic(name === 'season' ? 'mus_season' : 'mus_menu');
    let scr;
    try { scr = fn.call(this, params) || {}; } catch (err) {
      console.error('screen failed', name, err);
      if (name !== 'home') { this.go('home'); return; }
      throw err;
    }
    scr.name = name;
    scr.el.classList.add('screen');
    this.screensEl.appendChild(scr.el);
    fitPlaques(scr.el);
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
      <button class="icon-btn" data-act="back" data-to="${back}"><img src="${icon('back')}" alt=""></button>
      <div class="title t-display worn">${title}</div>
      ${this.coinPill()}
    </div>`;
  }

  nav(active) {
    const items = [['modes', 'modes', t('MODOS')], ['maps', 'maps', t('MAPAS')], ['home', 'home', t('INICIO')], ['skins', 'skins', t('SKINS')], ['settings', 'settings', t('AJUSTES')]];
    return `<nav class="nav">${items.map(([k, ic, l]) => `<button data-act="nav" data-to="${k}" class="${k === active ? 'on' : ''}"><img src="${icon(ic)}" alt="">${l}</button>`).join('')}</nav>`;
  }

  // common clicks available on every screen
  wire(root, handlers = {}) {
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]');
      if (!b || !root.contains(b)) return;
      const act = b.dataset.act;
      audio.play(b.disabled ? 'ui_locked' : act === 'back' ? 'ui_back' : 'ui_tap');
      if (handlers[act]) return handlers[act](b, e);
      if (act === 'nav' || act === 'back') this.go(b.dataset.to || 'home');
      else if (act === 'shop') this.go('shop', { back: this.cur ? this.cur.name : 'home' });
    });
  }

  toast(msg, reward = false) {
    if (reward) audio.play('reward_chime', { vol: 0.8 });
    const t = el(`<div class="toast">${msg}</div>`);
    this.app.appendChild(t);
    setTimeout(() => t.remove(), 1900);
  }

  credits() {
    const line = (k, v) => `<div class="cr-line"><span>${t(k)}</span><b>${v}</b></div>`;
    const o = this.overlay(`<div class="overlay dark"><div class="panel strong"><div class="inner pad" style="width:100%">
      ${ptitle(t('CRÉDITOS'), 1)}
      <div class="cr-studio"><span>${t('Un juego de')}</span><img src="${url('brand/logo/gpunlock_color.webp')}" alt="GPUnlock"></div>
      ${line('Diseño y dirección de arte', 'GPUnlock')}
      ${line('Desarrollo', 'GPUnlock')}
      ${line('Música y efectos', 'GPUnlock')}
      ${line('Fuentes', 'Bebas Neue · Barlow · Oswald · Roboto (SIL OFL 1.1)')}
      <div class="demo-note" style="margin-top:.6rem">ZNAKEX ${CONFIG.version} · © 2026 GPUnlock</div>
      <button class="btn-primary" data-act="close" style="width:100%;margin-top:.6rem"><span class="worn">${t('VOLVER')}</span></button>
    </div></div></div>`);
    this.wire(o, { close: () => this.closeOverlay(o) });
  }

  // ------------------------------------------------------------ studio intro (GPUnlock)
  // Plays over the loading screen (the game keeps loading underneath); a tap skips it.
  studioIntro() {
    const o = el(`<div class="studio-intro">
      <video muted playsinline preload="auto"></video>
      <div class="st-logo"><img alt="GPUnlock" src="${url('brand/logo/gpunlock_color.webp')}"><span class="st-word">GPUnlock</span></div>
      <div class="st-sub">${t('PRESENTA')}</div>
    </div>`);
    const img = $(o, 'img');
    if (img) img.addEventListener('load', () => o.classList.add('has-img'));
    this.app.appendChild(o);
    let gone = false;
    const end = () => { if (gone) return; gone = true; o.classList.add('out'); setTimeout(() => o.remove(), 500); };
    o.addEventListener('pointerup', end);
    // the brand reveal video (4 s); if it can't play (old WebView, low graphics) the animated logo shows instead
    const v = $(o, 'video');
    let timer = setTimeout(end, 2600);
    if (!this.S().settings.lowfx) {
      v.muted = true;
      v.src = url('brand/video/gpunlock.mp4');
      v.addEventListener('playing', () => { o.classList.add('has-video'); clearTimeout(timer); timer = setTimeout(end, 4600); }, { once: true });
      v.addEventListener('ended', () => setTimeout(end, 250));
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
    }
  }

  // ------------------------------------------------------------ splash
  scr_splash() {
    this.setBg('splash');
    const e = el(`<section>
      <img class="brand-logo" src="${LOGO}" alt="ZNAKEX" style="margin-top:6%">
      <div class="splash-bottom">
        <div class="panel" style="width:100%"><div class="inner pad" style="display:flex;flex-direction:column;align-items:center;gap:.6rem">
          <div class="t-label" id="ldt">${t('CARGANDO...')}</div>
          <div class="loadbar"><i id="ldb"></i></div>
          <div class="demo-note" id="ldtip">${t(TIPS[0])}</div>
        </div></div>
      </div>
    </section>`);
    return {
      el: e,
      progress: (p) => { $(e, '#ldb').style.width = Math.round(p * 100) + '%'; },
      ready: (onTap) => {
        this.setBg('title');
        $(e, '#ldt').outerHTML = `<div class="tap">${t('TOCA PARA JUGAR')}</div>`;
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
        <button class="avatar" data-act="nav" data-to="skins"><img src="${url('skins/' + S.equipped + '.webp')}" alt=""></button>
        ${CONFIG.tester ? `<span class="rarity" style="background:var(--amber)">${t('MODO TESTER')}</span>` : ''}
        ${this.coinPill()}
      </div>
      <img class="brand-logo sm" src="${LOGO}" alt="ZNAKEX" style="margin-top:.4rem">
      <div class="home-mid stagger">
        <div class="home-tools" ${stag(0)}>
          <button class="tool" data-act="missions"><img src="${kit('scroll_daily')}" alt=""><span>${t('MISIONES')}</span>${meta.claimableMissions() ? '<i class="dot"></i>' : ''}</button>
          <button class="tool" data-act="streak"><img src="${kit('flame')}" alt=""><span>${t('RACHA')}</span>${meta.streakState().claimedToday ? '' : '<i class="dot"></i>'}</button>
          <button class="tool" data-act="season"><img src="${kit('rosette')}" alt=""><span>${t('TEMPORADA')}</span>${meta.seasonActive() ? '<i class="dot"></i>' : ''}</button>
          <button class="tool" data-act="ach"><img src="${kit('medal_gold')}" alt=""><span>${t('LOGROS')}</span></button>
        </div>
        <div class="mode-sel" ${stag(0)}>
          <button class="arrow" data-act="mode" data-d="-1">‹</button>
          <div class="mode-chip"><div class="n worn" id="mn"></div><div class="s" id="ms"></div></div>
          <button class="arrow" data-act="mode" data-d="1">›</button>
        </div>
        <div class="home-row" ${stag(1)}>
          <button class="icon-btn" data-act="wheel"><img src="${icon('mode_spin')}" alt=""><span class="lbl">${t('RULETA')}</span>${wheelReady ? '<i class="dot"></i>' : ''}</button>
          <button class="btn-primary" data-act="play"><span class="worn">${t('JUGAR')}</span><i class="tri"></i></button>
          <button class="icon-btn" data-act="shop"><img src="${icon('shop')}" alt=""><span class="lbl">${t('TIENDA')}</span></button>
        </div>
        <div style="height:.6rem"></div>
      </div>
      ${this.nav('home')}
    </section>`);
    let idx = modeIdx;
    const paint = () => {
      const m = MODES[idx];
      $(e, '#mn').textContent = t(m.name);
      const cs = store.currentStory();
      $(e, '#ms').textContent = m.id === 'story' ? `${t('MAPA')} ${ROMAN[cs.map - 1]} · ${t('NIVEL')} ${cs.level} · ${t(DIFFS[S.diff].label)}`
        : m.id === 'classic' ? `${t('RÉCORD')} ${fmt(S.best.classic)}`
          : m.id === 'frenzy' ? `${t('RÉCORD')} ${fmt(S.best.frenzy)}` : `${t('FÁCIL')} · ${t('MEDIO')} · ${t('DIFÍCIL')}`;
      S.mode = m.id;
      store.save();
    };
    paint();
    this.wire(e, {
      mode: (b) => { idx = (idx + Number(b.dataset.d) + MODES.length) % MODES.length; paint(); },
      play: () => this.playMode(MODES[idx].id),
      wheel: () => this.openWheel(),
      missions: () => this.go('missions'),
      streak: () => this.openStreak(),
      season: () => this.go('season'),
      ach: () => this.go('ach'),
    });
    if (!this.streakShown && !meta.streakState().claimedToday) {
      this.streakShown = true;
      setTimeout(() => { if (this.cur && this.cur.name === 'home') this.openStreak(); }, 900);
    }
    return { el: e };
  }

  playMode(id) {
    if (id === 'story') {
      if (!this.S().tutorialSeen) return this.startGame({ mode: 'story', level: tutorialLevel() });
      const cs = store.currentStory();
      this.startGame({ mode: 'story', level: storyLevel(cs.map, cs.level, this.S().diff) });
    } else if (id === 'duel') this.go('duel');
    else this.startGame({ mode: id });
  }

  // ------------------------------------------------------------ modes
  scr_modes() {
    this.setBg('deep');
    const S = this.S();
    const rec = { story: `${t('PROGRESO')} ${store.totalCleared()}/160`, classic: `${t('RÉCORD')} ${fmt(S.best.classic)}`, frenzy: `${t('RÉCORD')} ${fmt(S.best.frenzy)}`, duel: t('RIVALES: 3') };
    const e = el(`<section>
      ${this.topbar(t('MODOS'))}
      <div class="scroll stagger">
        ${MODES.map((m, i) => `<button class="mode-card btn ${S.mode === m.id ? 'sel' : ''}" data-act="pick" data-id="${m.id}" ${stag(i)}>
          <div class="thumb" style="background-image:url(${url(m.img)})"></div>
          <div><div class="nm worn"><img src="${icon(m.icon)}" alt="">${t(m.name)}</div>
          <div class="ds">${t(m.desc)}</div><div class="sb">${t(m.sub)}</div><div class="rec glow-amber">${rec[m.id]}</div></div>
        </button>`).join('')}
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
      ${this.topbar(t('MAPAS'))}
      ${this.diffBar(this.S().diff)}
      <div class="t-label dim" style="text-align:center;font-size:.9rem;margin:.2rem 0 .5rem">${t('NIVELES')} ${store.totalCleared()}/160${CONFIG.tester ? ' · ' + t('MODO TESTER') : ''}</div>
      <div class="scroll stagger">
        ${MAPS.map((m, i) => {
          const open = store.mapUnlocked(m.id);
          const cl = store.clearedLevels(m.id);
          return `<button class="map-card ${open ? '' : 'locked'} ${open && cl < 10 && store.currentStory().map === m.id ? 'sel' : ''}" data-act="${open ? 'open' : 'locked'}" data-map="${m.id}" style="background-image:url(${url(m.key)});--i:${Math.min(i, 6)}">
          <img class="hz" src="${icon(m.hazard)}" alt="">
          ${open ? '' : `<div class="lock"><img src="${icon('lock')}" alt=""></div>`}
          <div class="info"><div><div class="nm worn">${ROMAN[i]} · ${m.name}</div>
            ${open ? `<div class="dots">${Array.from({ length: 10 }, (_, k) => `<i class="${k < cl ? 'on' : ''}"></i>`).join('')}</div>` : `<div class="t-label dim" style="font-size:.8rem">${t('SUPERA EL MAPA {m}', { m: ROMAN[i - 1] })}</div>`}
          </div>${open ? `<span class="btn small">${t(cl >= 10 ? 'REPETIR' : cl ? 'SEGUIR' : 'JUGAR')}</span>` : ''}</div>
        </button>`;
        }).join('')}
      </div>
      ${this.nav('maps')}
    </section>`);
    this.wire(e, {
      dif: (b) => { this.S().diff = b.dataset.d; store.save(); this.go('maps'); },
      open: (b) => this.go('levels', { map: Number(b.dataset.map) }),
      locked: () => this.toast(t('Completa los 10 niveles del mapa anterior')),
    });
    return { el: e };
  }

  // ------------------------------------------------------------ level select
  diffBar(active) {
    return `<div class="diffbar">${Object.values(DIFFS).map((d) => `<button class="dchip ${d.id === active ? 'on' : ''}" data-act="dif" data-d="${d.id}" style="--dc:${d.color}">${t(d.label)}</button>`).join('')}</div>`;
  }

  scr_levels({ map = 1, sel }) {
    this.setBg('deep');
    const dif = this.S().diff;
    const cl = store.clearedLevels(map, dif);
    const open = store.unlockedUpTo(map, dif);
    let selected = sel || Math.min(10, cl + 1);
    const P = [[50, 93], [74, 84], [52, 75], [26, 66], [48, 57], [74, 48], [52, 39], [26, 30], [46, 21], [58, 9]];
    const e = el(`<section style="background:url(${url(MAPS[map - 1].key)}) center/cover">
      <div style="position:absolute;inset:0;background:linear-gradient(to bottom, rgba(6,9,6,.55), rgba(6,9,6,.2) 30%, rgba(6,9,6,.35) 70%, rgba(6,9,6,.9))"></div>
      ${this.topbar(MAPS[map - 1].name, 'maps')}
      ${this.diffBar(dif)}
      <div class="levels-wrap" id="lw">
        <svg class="path" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline points="${P.map((p) => p.join(',')).join(' ')}" fill="none" stroke="rgba(242,239,230,.55)" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
        </svg>
        ${P.map(([x, y], i) => {
          const n = i + 1;
          const st = n <= cl ? 'cleared' : n === cl + 1 ? 'current' : n <= open ? 'cleared' : 'locked';
          const img = n === 10 ? (st === 'locked' ? 'locked' : 'guardian') : st;
          const rw = storyLevel(map, n, dif).reward;
          return `<button class="level-node ${st} ${n === 10 ? 'guardian' : ''}" data-act="lv" data-n="${n}" style="left:${x}%;top:${y}%">
            <img src="${url('ui/nodes/' + img + '.png')}" alt="">${n === 10 ? '' : `<span class="num">${n}</span>`}
            ${n <= cl ? `<span class="nstars">${[1, 2, 3].map((k) => `<img src="${kit(k <= store.starsOf(map, n, dif) ? 'star_gold' : 'star_empty')}" alt="">`).join('')}</span>` : `<span class="rw"><img src="${icon('coin')}" alt="">${rw}</span>`}</button>`;
        }).join('')}
      </div>
      <div class="panel" id="lp" style="margin-bottom:.4rem"></div>
    </section>`);
    const paint = () => {
      e.querySelectorAll('.level-node').forEach((n) => n.classList.toggle('sel', Number(n.dataset.n) === selected));
      const L = storyLevel(map, selected, dif);
      const locked = selected > open;
      $(e, '#lp').innerHTML = `<div class="inner level-panel">
        <div>
          <div class="t-display worn" style="font-size:2.1rem">${selected === 10 ? t('GUARDIÁN') + ' · ' : ''}${t('NIVEL')} ${map}-${selected}</div>
          <div class="obj"><img src="${icon('orb_red')}" alt="">${t('RECOGE {n} ORBES', { n: L.target })} <span class="dtag" style="--dc:${DIFFS[dif].color}">${t(DIFFS[dif].label)}</span></div>
          <div class="obj dim"><img src="${icon('coin')}" alt="">${selected <= cl ? `${t('REPETIR')}: +${ECONOMY.replayReward}` : `${t('RECOMPENSA')}: +${L.reward}`}</div>
          <div class="obj dim"><img src="${kit('star_gold')}" alt="">★★★: ${t('SIN MORIR Y EN MENOS DE {t}', { t: fmtT(Math.round((L.target * 12) / L.speed)) })}</div>
        </div>
        <button class="btn-primary" data-act="play" style="min-height:4rem;font-size:2.1rem;padding:0 1.4rem" ${locked ? 'disabled' : ''}>${locked ? '<img src="' + icon('lock') + '" style="width:2rem;border-radius:.2rem">' : `<span class="worn">${t('JUGAR')}</span>`}</button>
      </div>`;
    };
    paint();
    this.wire(e, {
      lv: (b) => { selected = Number(b.dataset.n); paint(); },
      dif: (b) => {
        this.S().diff = b.dataset.d; store.save();
        this.go('levels', { map });
      },
      play: () => {
        if (selected > open) return this.toast(t('Supera el nivel anterior para desbloquearlo'));
        this.startGame({ mode: 'story', level: storyLevel(map, selected, dif) });
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
      ${this.topbar(t('DUELO'), 'modes')}
      <div class="scroll stagger">
        ${keys.map((k, i) => {
          const b = BOTS[k];
          return `<button class="mode-card btn ${k === diff ? 'sel' : ''}" data-act="diff" data-k="${k}" ${stag(i)}>
            <canvas class="thumb" data-bot="${k}" width="220" height="220" style="background:radial-gradient(circle, rgba(60,50,40,.6), rgba(10,12,10,.8))"></canvas>
            <div><div class="nm worn">${t(b.label)} · ${b.name}</div>
            <div class="ds">${t('PRIMERO A {n} ORBES', { n: b.target })}</div>
            <div class="sb">${t(k === 'easy' ? 'Lento y despistado.' : k === 'medium' ? 'Va directo a por los orbes.' : 'Usa orbes dorados y te corta el paso.')}</div>
            <div class="rec glow-amber"><img src="${icon('coin')}" style="width:1rem;vertical-align:-.15rem;border-radius:50%"> +${ECONOMY.duelReward[k]} ${t('POR VICTORIA')}</div></div>
          </button>`;
        }).join('')}
        <div class="demo-note">${t('VICTORIAS PAGADAS HOY')}: ${wins}/${ECONOMY.duelPaidWinsPerDay}</div>
      </div>
      <button class="btn-primary" data-act="fight" style="margin:.4rem 0 .8rem"><span class="worn">${t('LUCHAR')}</span><i class="tri"></i></button>
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
    this.setBg('deep', 'brand/bg/skins.webp');
    const S = this.S();
    let sel = S.equipped;
    let cat = 'all';
    const e = el(`<section>
      ${this.topbar(t('SKINS'))}
      <div class="skin-stage"><canvas id="stage"></canvas></div>
      <div class="skin-name" id="sn"></div>
      <div class="scroll" style="margin-top:.4rem">
        <div class="t-label dim" style="text-align:center;font-size:.85rem;margin-bottom:.5rem" id="col"></div>
        <div id="tabs"></div>
        <div class="skin-grid stagger" id="grid"></div>
      </div>
      <div id="act" style="padding:.5rem 0 .2rem"></div>
      ${this.nav('skins')}
    </section>`);
    const grid = $(e, '#grid');
    const paintGrid = () => {
      $(e, '#col').textContent = `${t('COLECCIÓN')} ${S.owned.length}/${SKINS.length}`;
      const card = (s, i) => {
        const own = S.owned.includes(s.id);
        const rc = RARITY[s.rarity].color;
        return `<button class="skin-card ${own ? '' : 'locked'} ${s.id === sel ? 'sel' : ''}" data-act="sk" data-id="${s.id}" style="--rc:${rc};--i:${i}">
          <div class="ptw r-${s.rarity}"><img class="pt" src="${url('skins/' + s.id + '.webp')}" alt="">${frameImg(s.rarity)}</div>
          ${own ? '' : `<img class="lk" src="${icon('lock')}" alt="">`}
          ${S.equipped === s.id ? `<img class="eq" src="${icon('check')}" alt="">` : ''}
          <span class="rl" style="background:${rc}">${t(RARITY[s.rarity].label)}</span>
          <div class="foot">${s.short}</div>
        </button>`;
      };
      // quality categories: básicas, normales, especiales, míticas, legendarias and season skins
      const groups = [
        ['basic', t('BÁSICAS'), '#C9D2B4', SKINS.filter((s) => s.basic)],
        ...['normal', 'especial', 'mitico', 'legendario', 'temporada'].map((r) => [r, t({ normal: 'NORMALES', especial: 'ESPECIALES', mitico: 'MÍTICAS', legendario: 'LEGENDARIAS', temporada: 'TEMPORADA' }[r]), RARITY[r].color, SKINS.filter((s) => !s.basic && s.rarity === r)]),
      ].filter((gr) => gr[3].length);
      const tabs = `<div class="cat-tabs">${[['all', t('TODAS'), '#E8E2C8'], ...groups.map(([k, l, c]) => [k, l, c])].map(([k, l, c]) =>
        `<button class="cat ${cat === k ? 'on' : ''}" data-act="cat" data-cat="${k}" style="--cc:${c}">${l}</button>`).join('')}</div>`;
      let html = '', n = 0;
      for (const [k, l, c, list] of groups) {
        if (cat !== 'all' && cat !== k) continue;
        const own = list.filter((s) => S.owned.includes(s.id)).length;
        html += `<div class="grid-head" style="color:${c}">${l} · ${own}/${list.length}</div>${list.map((s) => card(s, n++)).join('')}`;
      }
      $(e, '#tabs').innerHTML = tabs;
      grid.innerHTML = html;
    };
    const paintInfo = () => {
      const s = skinById(sel);
      const R = RARITY[s.rarity];
      $(e, '#sn').innerHTML = `<div class="t-display worn" style="font-size:2.3rem">${t(s.name).toUpperCase()}</div>
        <span class="rarity" style="background:${R.color}">${t(R.label)}</span>
        <div class="dim" style="font-size:.9rem;margin-top:.3rem;padding:0 1rem">${t(s.desc)}</div>`;
      const own = S.owned.includes(s.id);
      const price = skinPrice(s);
      let html;
      if (own && S.equipped === s.id) html = `<button class="btn" style="width:100%" disabled>${t('EQUIPADA')}</button>`;
      else if (own) html = `<button class="btn-primary" data-act="equip" style="width:100%;min-height:4rem;font-size:2.1rem"><span class="worn">${t('EQUIPAR')}</span></button>`;
      else if (s.season) html = `<button class="btn" data-act="toseason" style="width:100%">${t('SE DESBLOQUEA EN LA TEMPORADA')}</button>`;
      else {
        const pct = Math.min(100, (S.coins / price) * 100);
        html = `<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.45rem"><div class="progress" style="flex:1"><i style="width:${pct}%"></i></div><span class="t-label" style="font-size:.85rem">${fmt(S.coins)} / ${fmt(price)}</span></div>
          <div class="btn-row"><button class="btn-primary" data-act="buy" style="flex:1.4;min-height:3.8rem;font-size:1.8rem"><img src="${icon('coin')}" style="width:1.9rem;border-radius:50%"><span>${fmt(price)}</span></button>
          <button class="btn" data-act="shop">${t('MONEDAS')}</button></div>`;
      }
      $(e, '#act').innerHTML = html;
    };
    paintGrid();
    paintInfo();
    ensureSkin(sel);

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
      const cx = r.width / 2, cy = r.height * 0.55;
      // test board: a little patch of the jungle floor with a rounded frame
      const bw = r.width * 0.9, bh = r.height * 0.86, bx = (r.width - bw) / 2, by = r.height * 0.07;
      g.save();
      g.beginPath();
      g.roundRect(bx, by, bw, bh, 14);
      g.clip();
      const ts = bw / 8;
      for (let j = 0; j < Math.ceil(bh / ts) + 1; j++) for (let i = 0; i < 8; i++) {
        const im = IMG[`mx/01/floor${(i * 3 + j * 5) % 4}.jpg`];
        if (im) g.drawImage(im, bx + i * ts, by + j * ts, ts + 0.5, ts + 0.5);
      }
      g.fillStyle = 'rgba(10,14,8,0.28)';
      g.fillRect(bx, by, bw, bh);
      g.restore();
      g.strokeStyle = 'rgba(232,176,74,.55)';
      g.lineWidth = 2;
      g.beginPath(); g.roundRect(bx, by, bw, bh, 14); g.stroke();
      blinkT -= 1 / 60; if (blinkT < 0) { blink = 1; blinkT = rand(2, 4); } blink = Math.max(0, blink - 0.12);
      tongueT -= 1 / 60; if (tongueT < 0) { tongue = 1; tongueT = rand(1.5, 3); } tongue = Math.max(0, tongue - 0.05);
      const rr = r.height * 0.075;
      const ahead = pathPoints(cx, cy, r.width * 0.3, r.height * 0.26, t * 1.1 + 0.55, 0.1, 2, 'eight')[0];
      const near = (Math.sin(t * 2.4) > 0.35);
      mouth = near ? 1 : 0;
      if (Math.sin(t * 2.4 - 0.6) > -0.2) drawOrb(g, ahead.x, ahead.y, rr * 2.6, Math.floor(t / 2.6) % 3 === 2 ? 'gold' : 'red', t, {});
      const pts = pathPoints(cx, cy, r.width * 0.3, r.height * 0.26, t * 1.1, 4.4, 60, 'eight');
      drawSnake(g, pts, skinById(sel), { R: rr, t, blink, tongue, mouth: clamp(mouth, 0, 1) });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    this.wire(e, {
      toseason: () => this.go('season'),
      cat: (b) => { cat = b.dataset.cat; paintGrid(); },
      sk: (b) => { sel = b.dataset.id; ensureSkin(sel); grid.querySelectorAll('.skin-card').forEach((c) => c.classList.toggle('sel', c.dataset.id === sel)); paintInfo(); },
      equip: () => { S.equipped = sel; store.save(); paintGrid(); paintInfo(); this.toast(t('¡Skin equipada!')); },
      buy: () => {
        const s = skinById(sel);
        const price = skinPrice(s);
        if (S.coins < price) {
          return this.popup({
            title: 'MONEDAS INSUFICIENTES', icon: 'coins',
            text: t('Te faltan <b>{n}</b> monedas para {s}.', { n: fmt(price - S.coins), s: t(s.name) }),
            buttons: [['CONSEGUIR MONEDAS', () => this.go('shop', { back: 'skins' }), true], ['LUEGO', null]],
          });
        }
        this.popup({
          title: '¿COMPRAR SKIN?', img: url('skins/' + s.id + '.webp'),
          text: `${t(s.name)} · <span style="color:${RARITY[s.rarity].color}">${t(RARITY[s.rarity].label)}</span><br>${t('<b>{n}</b> monedas', { n: fmt(price) })}`,
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
        <div class="t-label glow-amber">${t('¡SKIN DESBLOQUEADA!')}</div>
        <div class="ptw big r-${s.rarity}" style="box-shadow:0 0 2rem ${RARITY[s.rarity].color};animation:pop .6s var(--ease) both"><img class="pt" src="${url('skins/' + s.id + '.webp')}" alt="">${frameImg(s.rarity)}</div>
        <div class="ov-title worn">${t(s.name).toUpperCase()}</div>
        <span class="rarity" style="background:${RARITY[s.rarity].color}">${t(RARITY[s.rarity].label)}</span>
        <button class="btn-primary" data-act="ok" style="width:100%"><span class="worn">${t('GENIAL')}</span></button>
      </div></div></div>`);
    this.wire(o, { ok: () => this.closeOverlay(o) });
  }


  // ------------------------------------------------------------ missions
  scr_missions() {
    this.setBg('deep');
    let tab = 'daily';
    const e = el(`<section>
      ${this.topbar(t('MISIONES'))}
      <div class="tabs"><button class="tab on" data-act="tab" data-t="daily">${t('DIARIAS')}</button><button class="tab" data-act="tab" data-t="weekly">${t('SEMANALES')}</button></div>
      <div class="scroll" id="ml"></div>
      ${this.nav('home')}
    </section>`);
    const left = () => {
      const now = new Date();
      const next = tab === 'daily' ? Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
        : Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + (8 - (now.getUTCDay() || 7)));
      const s = Math.max(0, Math.floor((next - now.getTime()) / 1000));
      const h = Math.floor(s / 3600);
      return tab === 'daily' || h < 48 ? `${String(h).padStart(2, '0')}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}` : tn('{n} días', Math.floor(h / 24));
    };
    const paint = () => {
      const M = meta.missions();
      const list = tab === 'daily' ? M.daily : M.weekly;
      const ch = meta.WEEK_CHEST;
      $(e, '#ml').innerHTML = `<div class="stagger">${list.map((m, i) => `<div class="mission ${m.cur >= m.target ? 'done' : ''} ${m.claimed ? 'claimed' : ''}" ${stag(i)}>
          <img class="mi" src="${kit(tab === 'daily' ? 'scroll_daily' : 'scroll_weekly')}" alt="">
          <div class="mb"><div class="mt">${meta.missionText(m)}</div>
            <div class="mp"><div class="progress"><i style="width:${(m.cur / m.target) * 100}%"></i></div><span>${m.cur}/${m.target}</span></div></div>
          <div class="mr"><span class="coins"><img src="${icon('coin')}" alt="">${m.reward}</span>
            <button class="btn small" data-act="claim" data-id="${m.id}" ${m.claimed || m.cur < m.target ? 'disabled' : ''}>${m.claimed ? '✓' : t('RECLAMAR')}</button></div>
        </div>`).join('')}</div>
        <div class="t-label dim" style="text-align:center;margin:.5rem 0" id="cd">${t('SE RENUEVA EN {t}', { t: left() })}</div>
        <div class="chest-card ${M.chest ? 'claimed' : ''}">
          <img src="${kit(M.chest || M.claimedWeek >= ch.need ? 'chest_open' : 'chest_closed')}" alt="">
          <div class="mb"><div class="mt">${t('COFRE SEMANAL')}</div>
            <div class="steps">${Array.from({ length: ch.need }, (_, k) => `<i class="${k < M.claimedWeek ? 'on' : ''}"></i>`).join('')}</div>
            <div class="t-label dim" style="font-size:.8rem">${t('Reclama {n} misiones esta semana', { n: ch.need })}</div></div>
          <button class="btn small" data-act="chest" ${M.chest || M.claimedWeek < ch.need ? 'disabled' : ''}><img class="ic" src="${icon('coin')}" alt="">${M.chest ? '✓' : ch.coins}</button>
        </div>`;
    };
    paint();
    const iv = setInterval(() => { const c = $(e, '#cd'); if (c) c.textContent = t('SE RENUEVA EN {t}', { t: left() }); }, 1000);
    this.wire(e, {
      tab: (b) => { tab = b.dataset.t; e.querySelectorAll('.tab').forEach((x) => x.classList.toggle('on', x === b)); paint(); },
      claim: (b) => { const c = meta.claimMission(b.dataset.id); if (c) { this.toast(t('+{n} monedas', { n: c }), true); paint(); } },
      chest: () => { const c = meta.claimChest(); if (c) { this.toast(t('¡Cofre! +{n} monedas', { n: fmt(c) }), true); paint(); } },
    });
    return { el: e, destroy: () => clearInterval(iv) };
  }

  // ------------------------------------------------------------ daily streak
  openStreak() {
    const info = meta.streakState();
    const R = meta.STREAK_REWARDS;
    const tiles = R.map((c, i) => {
      const day = i + 1;
      const done = info.claimedToday ? day <= info.day : day < info.day;
      const today = !info.claimedToday && day === info.day;
      const big = day === 7;
      return `<div class="day ${done ? 'done' : ''} ${today ? 'today' : ''} ${big ? 'big' : ''}">
        <b>${day}</b><img src="${kit(big ? (done ? 'chest_open' : 'chest_closed') : 'calendar')}" alt=""><span><img src="${icon('coin')}" alt="">${fmt(c)}</span>
        ${done ? `<img class="stamp" src="${kit('collected')}" alt="">` : ''}${today ? `<em>${t('HOY')}</em>` : ''}</div>`;
    }).join('');
    const o = this.overlay(`<div class="overlay dark"><div class="panel strong"><div class="inner">
      ${ptitle(t('RACHA DIARIA'), 4)}
      <div class="ov-sub">${t('Vuelve cada día para ganar más')}</div>
      <div class="t-label glow-amber"><img src="${kit('flame')}" style="height:1.3rem;vertical-align:-.25rem"> ${t('RACHA')}: ${tn('{n} DÍAS', info.count)}</div>
      <div class="days">${tiles}</div>
      ${info.claimedToday ? `<button class="btn" data-act="close" style="width:100%" disabled>${t('YA RECLAMADO HOY')}</button>` : `<button class="btn-primary" data-act="claim" style="width:100%"><span class="worn">${t('RECLAMAR')}</span></button>
        <button class="link" data-act="claim2">${t('Ver anuncio para duplicar')}</button>`}
      <button class="link" data-act="close">${t('Cerrar')}</button>
    </div></div></div>`);
    const done = (double) => {
      const c = meta.claimStreak(double);
      if (c) this.toast(t('+{n} monedas', { n: fmt(c) }), true);
      this.closeOverlay(o);
      if (this.cur && this.cur.name === 'home') this.go('home');
    };
    this.wire(o, {
      claim: () => done(false),
      claim2: () => this.fakeAd(() => done(true)),
      close: () => this.closeOverlay(o),
    });
  }

  // ------------------------------------------------------------ achievements & statistics
  scr_ach() {
    this.setBg('deep');
    const S = this.S();
    const A = meta.ACHIEVEMENTS;
    const got = A.filter((a) => S.ach[a.id]).length;
    const st = S.stats;
    const fmtH = (s) => (s >= 3600 ? `${Math.floor(s / 3600)} h ${Math.floor((s % 3600) / 60)} ${t('min')}` : `${Math.floor(s / 60)} ${t('min')}`);
    const rows = [
      ['orb', t('Orbes comidos'), fmt(st.orbs)], ['flame', t('Mejor racha sin morir'), tn('{n} niveles', st.bestClean)], ['snake', t('Serpiente más larga'), st.maxLen],
      ['map', t('Mapas completados'), `${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].filter((m) => store.clearedLevels(m, 'easy') >= 10 || store.clearedLevels(m, 'normal') >= 10 || store.clearedLevels(m, 'hard') >= 10).length}/16`],
      ['star_gold', t('Estrellas conseguidas'), `${store.totalStars('easy') + store.totalStars('normal') + store.totalStars('hard')}`], ['bars', t('Duelos ganados'), st.duelWins], ['chest_closed', t('Objetos recogidos'), st.items],
    ];
    const e = el(`<section>
      ${this.topbar(t('LOGROS') + ' ' + got + '/' + A.length)}
      <div class="scroll">
        <div class="medal-grid stagger">${A.map((a, i) => {
          const have = !!S.ach[a.id];
          const p = meta.achievementProgress(a);
          return `<div class="medal ${have ? 'on' : ''}" ${stag(i)}><img src="${kit(have ? 'medal_' + a.tier : 'medal_locked')}" alt="">
            <b>${t(a.name)}</b><small>${t(a.text)}</small><div class="progress"><i style="width:${(p / a.need) * 100}%"></i></div></div>`;
        }).join('')}</div>
        <div class="sec">${t('ESTADÍSTICAS')}</div>
        <div class="stat-list">${rows.map(([ic, k, v]) => `<div><img src="${ic === 'orb' ? icon('orb_red') : kit(ic)}" alt=""><span>${k}</span><b>${v}</b></div>`).join('')}
          <div><img src="${kit('cloud')}" alt=""><span>${t('Tiempo jugado')}</span><b>${fmtH(st.playSec)}</b></div></div>
        <button class="btn" data-act="share" style="width:100%;margin:.6rem 0">${t('COMPARTIR')}</button>
      </div>
      ${this.nav('home')}
    </section>`);
    this.wire(e, {
      share: async () => {
        const text = t('Llevo {o} orbes y {a} logros en ZNAKEX. ¿Me superas?', { o: fmt(st.orbs), a: `${got}/${A.length}` });
        try { if (navigator.share) await navigator.share({ title: 'ZNAKEX', text }); else { await navigator.clipboard.writeText(text); this.toast(t('Texto copiado')); } } catch { /* cancelled */ }
      },
    });
    return { el: e };
  }

  // ------------------------------------------------------------ season: map + pass
  scr_season({ tab = 'map', ch } = {}) {
    this.setBg('deep', 'brand/bg/temporada.webp');
    const S = this.S();
    const cleared = store.seasonCleared();
    const chapter = ch ?? (cleared >= 10 ? 1 : 0);
    const days = Math.ceil(meta.seasonLeft() / 86400000);
    const head = `<div class="season-head"><img src="${url('ui/season_badge.png')}" alt=""><div><div class="t-display worn" style="font-size:1.9rem">${meta.SEASON.name}</div>
      <div class="t-label dim" style="font-size:.85rem">${meta.seasonActive() ? (CONFIG.tester ? t('MODO TESTER') : t('TERMINA EN {t}', { t: tn('{n} DÍAS', days) })) : t('TEMPORADA FINALIZADA')}</div></div></div>
      <div class="tabs"><button class="tab ${tab === 'map' ? 'on' : ''}" data-act="stab" data-t="map">${t('MAPA')}</button><button class="tab ${tab === 'pass' ? 'on' : ''}" data-act="stab" data-t="pass">${t('PASE')}</button></div>`;
    if (tab === 'pass') return this.seasonPass(head);
    const P = [[50, 93], [74, 84], [52, 75], [26, 66], [48, 57], [74, 48], [52, 39], [26, 30], [46, 21], [58, 9]];
    let selected = clamp(cleared + 1 - chapter * 10, 1, 10);
    if (cleared >= 20) selected = 10;
    const e = el(`<section style="background:url(${url(SEASON_MAP.key)}) center/cover">
      <div style="position:absolute;inset:0;background:linear-gradient(to bottom, rgba(6,9,6,.55), rgba(6,9,6,.2) 30%, rgba(6,9,6,.35) 70%, rgba(6,9,6,.9))"></div>
      ${this.topbar(t('TEMPORADA'), 'home')}
      ${head}
      <div class="diffbar" style="grid-template-columns:repeat(2,1fr)"><button class="dchip ${chapter === 0 ? 'on' : ''}" data-act="chap" data-c="0" style="--dc:#E87532">${t('CAPÍTULO')} 1 · 1-10</button><button class="dchip ${chapter === 1 ? 'on' : ''}" data-act="chap" data-c="1" style="--dc:#E87532">${t('CAPÍTULO')} 2 · 11-20</button></div>
      <div class="levels-wrap compact" id="lw">
        <svg class="path" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="${P.map((p) => p.join(',')).join(' ')}" fill="none" stroke="rgba(242,239,230,.55)" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>
        ${P.map(([x, y], i) => {
          const n = chapter * 10 + i + 1;
          const open = n <= cleared + 1 && meta.seasonMapAccess(n);
          const st = n <= cleared ? 'cleared' : n === cleared + 1 && open ? 'current' : 'locked';
          const guardian = n === 10 || n === 20;
          const img = guardian ? (st === 'locked' ? 'locked' : 'guardian') : st;
          const stars = store.starsOf(17, n, 'normal');
          return `<button class="level-node ${st} ${guardian ? 'guardian' : ''}" data-act="lv" data-n="${n}" style="left:${x}%;top:${y}%">
            <img src="${url('ui/nodes/' + img + '.png')}" alt="">${guardian ? '' : `<span class="num">${n}</span>`}
            ${n <= cleared ? `<span class="nstars">${[1, 2, 3].map((k) => `<img src="${kit(k <= stars ? 'star_gold' : 'star_empty')}" alt="">`).join('')}</span>` : `<span class="rw"><img src="${icon('coin')}" alt="">${storyLevel(17, n).reward}</span>`}</button>`;
        }).join('')}
      </div>
      <div class="panel" id="lp" style="margin-bottom:.4rem"></div>
    </section>`);
    const paint = () => {
      const n = chapter * 10 + selected;
      const L = storyLevel(17, n);
      const gated = !meta.seasonMapAccess(n);
      const locked = n > cleared + 1 || gated || !meta.seasonActive();
      $(e, '#lp').innerHTML = `<div class="inner level-panel">
        <div>
          <div class="t-display worn" style="font-size:2.1rem">${L.guardian ? t('GUARDIÁN') + ' · ' : ''}${t('NIVEL')} ${n}</div>
          <div class="obj"><img src="${icon('orb_red')}" alt="">${t('RECOGE {n} ORBES', { n: L.target })}</div>
          <div class="obj dim">${gated ? t('Necesitas el pase premium (niveles 6-20)') : cleared >= 20 ? `<span style="color:var(--honey)">${t('¡Skin de temporada conseguida!')}</span>` : `${t('Completa los 20 niveles para la skin')} · ${cleared}/20`}</div>
        </div>
        <button class="btn-primary" data-act="play" style="min-height:4rem;font-size:2.1rem;padding:0 1.4rem">${gated ? `<span class="worn">${t('PASE')}</span>` : locked ? '<img src="' + icon('lock') + '" style="width:2rem;border-radius:.2rem">' : `<span class="worn">${t('JUGAR')}</span>`}</button>
      </div>`;
      e.querySelectorAll('.level-node').forEach((nd) => nd.classList.toggle('sel', Number(nd.dataset.n) === n));
    };
    paint();
    this.wire(e, {
      stab: (b) => this.go('season', { tab: b.dataset.t }),
      chap: (b) => this.go('season', { tab: 'map', ch: Number(b.dataset.c) }),
      lv: (b) => { selected = Number(b.dataset.n) - chapter * 10; paint(); },
      play: () => {
        const n = chapter * 10 + selected;
        if (!meta.seasonMapAccess(n)) return this.go('season', { tab: 'pass' });
        if (n > cleared + 1) return this.toast(t('Supera el nivel anterior'));
        if (!meta.seasonActive()) return this.toast(t('La temporada ha terminado'));
        this.startGame({ mode: 'story', level: storyLevel(17, n) });
      },
    });
    return { el: e };
  }

  seasonPass(head) {
    const S = this.S();
    const se = S.season;
    const tier = meta.seasonTier();
    const SE = meta.SEASON;
    const xpIn = se.xp - tier * SE.xpPerTier;
    const cell = (track, i) => {
      const r = (track === 'prem' ? SE.prem : SE.free)[i];
      const claimed = (track === 'prem' ? se.prem : se.free).includes(i);
      const reached = i < tier;
      const locked = track === 'prem' && !se.premium;
      const cls = claimed ? 'claimed' : reached && !locked ? 'ready' : 'lock';
      const realSkin = r.skin && SKINS.some((s) => s.id === r.skin);
      const inner = realSkin ? `<img class="sk" src="${url('skins/' + r.skin + '.webp')}" alt="">` : `<img src="${icon('coin')}" alt=""><b>${r.skin ? 1000 : r.c}</b>`;
      return `<button class="slot ${cls}" data-act="tclaim" data-t="${track}" data-i="${i}">${inner}${claimed ? '<i class="ck">✓</i>' : locked || !reached ? `<img class="lk2" src="${kit('slot_locked')}" alt="">` : ''}</button>`;
    };
    const e = el(`<section>
      ${this.topbar(t('TEMPORADA'), 'home')}
      ${head}
      <div class="pass-bar"><span class="t-display" style="font-size:1.5rem">${t('NIVEL')} ${tier}/${SE.tiers}</span><div class="progress" style="flex:1"><i style="width:${tier >= SE.tiers ? 100 : (xpIn / SE.xpPerTier) * 100}%"></i></div><span class="t-label" style="font-size:.85rem">${tier >= SE.tiers ? t('MÁX') : `${xpIn}/${SE.xpPerTier} ${t('PX')}`}</span></div>
      <div class="pass-cols"><span>${t('GRATIS')}</span><span>${t('PREMIUM')}</span></div>
      <div class="scroll"><div class="pass-list">${Array.from({ length: SE.tiers }, (_, i) => `<div class="tier ${i < tier ? 'reach' : ''}"><em>${i + 1}</em>${cell('free', i)}${cell('prem', i)}</div>`).join('')}</div></div>
      <div style="padding:.5rem 0 .2rem">
        ${se.premium ? `<div class="btn" style="width:100%;text-align:center">${t('PASE PREMIUM ACTIVO')} ✓</div>` : `<button class="btn-primary" data-act="buypass" style="width:100%"><span class="stack"><span class="worn">${t('OBTENER PASE PREMIUM')} · ${SE.price}</span><span class="sub">${t('Skins exclusivas · {n} monedas · Mapa completo', { n: fmt(SE.bonusCoins) })}</span></span></button>`}
        <div class="demo-note">${t('Puntos de pase: superar niveles, estrellas y misiones. Compra simulada (demo).')}</div>
      </div>
      ${this.nav('home')}
    </section>`);
    this.wire(e, {
      stab: (b) => this.go('season', { tab: b.dataset.t }),
      tclaim: (b) => {
        const r = meta.claimTier(b.dataset.t, Number(b.dataset.i));
        if (r) { this.toast(r.skin ? t('¡Skin de temporada!') : t('+{n} monedas', { n: r.c }), true); this.go('season', { tab: 'pass' }); }
        else if (b.dataset.t === 'prem' && !se.premium) this.toast(t('Recompensa del pase premium'));
        else if (Number(b.dataset.i) >= tier) this.toast(t('Sube de nivel de pase para reclamarla'));
      },
      buypass: () => this.popup({
        title: t('PASE DE TEMPORADA'), icon: 'coins', text: `${t('Skins exclusivas, <b>{n}</b> monedas, mapa completo y recompensas premium por <b>{p}</b>.', { n: fmt(SE.bonusCoins), p: SE.price })}<br><span class="dim">${t('Compra simulada en la demo.')}</span>`,
        buttons: [['COMPRAR', () => { meta.buyPass(); this.toast(t('¡Pase premium activado!'), true); this.go('season', { tab: 'pass' }); }, true], ['CANCELAR', null]],
      }),
    });
    return { el: e };
  }

  // ------------------------------------------------------------ shop
  scr_shop({ back = 'home' }) {
    this.setBg('deep', 'brand/bg/tienda.webp');
    const e = el(`<section>
      ${this.topbar(t('TIENDA'), back)}
      <div class="scroll stagger">
        <div class="panel" ${stag(0)} style="margin-bottom:1rem"><div class="inner" style="display:grid;grid-template-columns:7rem 1fr;gap:.8rem;align-items:center">
          <img src="${url('skins/pirata.webp')}" style="width:7rem;border-radius:.5rem;box-shadow:0 0 1.2rem rgba(232,176,74,.5)">
          <div><div class="t-display worn glow-amber" style="font-size:2rem">${t('PACK DE INICIO')}</div>
            <div class="t-label" style="font-size:.9rem">${t('SKIN ESPECIAL + {n} MONEDAS', { n: fmt(5000) })}</div>
            <div class="dim" style="font-size:.8rem">${t('Oferta única')} · −80 %</div>
            <button class="btn small" data-act="buy" data-coins="5000" data-skin="pirata" style="margin-top:.4rem">1,99 US$</button></div>
        </div></div>
        <div class="pack-grid">
          ${ECONOMY.packs.map((p, i) => `<button class="pack ${p.tag ? 'best' : ''}" data-act="buy" data-coins="${p.coins}" ${stag(i + 1)}>
            ${p.tag ? `<span class="tag">${t(p.tag)}</span>` : ''}
            <img src="${icon(i < 1 ? 'coin' : 'coins')}" alt="" style="transform:scale(${0.8 + i * 0.07})">
            <div class="amt">${fmt(p.coins)}</div><div class="nm">${t(p.name).toUpperCase()}</div>
            <div class="price">${p.price}</div></button>`).join('')}
        </div>
        <div class="demo-note" style="margin-top:1rem">${t('DEMO: las compras son simuladas y no cobran nada.')}<br>${t('En la versión final se usará Google Play Billing.')}</div>
        <div style="text-align:center"><button class="link" data-act="restore">${t('Restaurar compras')}</button></div>
      </div>
    </section>`);
    this.wire(e, {
      buy: (b) => {
        const coins = Number(b.dataset.coins);
        this.popup({
          title: t('COMPRA DE DEMO'), icon: 'coins', text: `${b.dataset.skin ? t('Se añadirán <b>{n}</b> monedas y la skin {s}.', { n: fmt(coins), s: t(skinById(b.dataset.skin).name) }) : t('Se añadirán <b>{n}</b> monedas.', { n: fmt(coins) })}<br><span class="dim">${t('(simulado, sin cobro)')}</span>`,
          buttons: [['CONFIRMAR', () => {
            store.addCoins(coins);
            if (b.dataset.skin && !this.S().owned.includes(b.dataset.skin)) { this.S().owned.push(b.dataset.skin); store.save(); }
            this.toast(t('+{n} monedas', { n: fmt(coins) }), true);
          }, true], ['CANCELAR', null]],
        });
      },
      restore: () => this.toast(t('No hay compras que restaurar')),
    });
    return { el: e };
  }

  // ------------------------------------------------------------ settings
  scr_settings() {
    this.setBg('deep');
    const S = this.S();
    const set = S.settings;
    const e = el(`<section>
      ${this.topbar(t('AJUSTES'))}
      <div class="scroll"><div class="panel"><div class="inner pad">
        <div class="sec">${t('IDIOMA')}</div>
        <div class="lang-grid">${LANGS.map((L) => `<button class="lang ${getLang() === L.id ? 'on' : ''}" data-act="lang" data-l="${L.id}">${L.name}</button>`).join('')}</div>
        <div class="sec">${t('AUDIO')}</div>
        ${this.volRow('music', icon('mode_frenzy'), 'MÚSICA')}
        ${this.volRow('sfx', icon('play'), 'EFECTOS DE SONIDO')}
        <div class="set-row"><span class="l"><img src="${icon('hz_wind')}">${t('VIBRACIÓN')}</span><button class="toggle ${set.vibration ? 'on' : ''}" data-act="tg" data-k="vibration"></button></div>
        <div class="set-row"><span class="l"><img src="${icon('hz_dark')}">${t('MODO DALTÓNICO')}</span><button class="toggle ${set.colorblind ? 'on' : ''}" data-act="tg" data-k="colorblind"></button></div>
        <div class="set-row"><span class="l"><img src="${icon('hz_wind')}">${t('GRÁFICOS BAJOS')}</span><button class="toggle ${set.lowfx ? 'on' : ''}" data-act="tg" data-k="lowfx"></button></div>
        <div class="demo-note" style="text-align:left">${t('Menos partículas y sin desenfoques: para móviles antiguos. Se activa solo si el juego va lento.')}</div>
        <div class="sec">${t('CONTROLES')}</div>
        <div class="ctl-grid">${[['swipe', 'DESLIZAR'], ['buttons', 'FLECHAS'], ['joystick', 'PALANCA'], ['tap', 'TOQUES']].map(([v, l]) => `<button class="ctl ${set.controls === v ? 'on' : ''}" data-act="ctl" data-v="${v}"><span class="ctl-ic ctl-${v}"></span>${t(l)}</button>`).join('')}</div>
        <div class="demo-note" id="ctlinfo" style="text-align:left;margin-top:.3rem">${t(CONTROL_INFO[set.controls] || '')}</div>
        <div class="sec">${t('CUENTA Y GUARDADO')}</div>
        <div class="set-row"><span class="l"><img src="${kit('gamepad')}">GOOGLE PLAY GAMES</span><span class="t-label dim" style="font-size:.8rem">${t(cloud.available() ? 'CONECTADO' : 'EN LA APP DE GOOGLE PLAY')}</span></div>
        <div class="set-row"><span class="l"><img src="${kit('cloud')}">${t('CÓDIGO DE GUARDADO')}</span><span style="display:flex;gap:.4rem"><button class="btn small" data-act="savecode">${t('COPIAR')}</button><button class="btn small" data-act="loadcode">${t('RESTAURAR')}</button></span></div>
        <div class="set-row"><span class="l"><img src="${kit('bulb')}">${t('TUTORIAL')}</span><button class="btn small" data-act="tutorial">${t('REPETIR')}</button></div>
        <div class="sec">DEMO</div>
        <div class="set-row"><span>+${fmt(5000)} ${t('MONEDAS')}</span><button class="btn small" data-act="coins">${t('AÑADIR')}</button></div>
        <div class="set-row"><span>${t('RULETA DE HOY')}</span><button class="btn small" data-act="wheel">${t('REINICIAR')}</button></div>
        <div class="set-row"><span>${t('PROGRESO')}</span><button class="btn small" data-act="reset">${t('BORRAR')}</button></div>
        <div class="sec">${t('CUENTA')}</div>
        <button class="btn" style="width:100%;margin-top:.4rem" data-act="soon">${t('CONECTAR GOOGLE PLAY GAMES')}</button>
        <div class="btn-row" style="margin-top:.5rem"><button class="btn small" data-act="soon">${t('PRIVACIDAD')}</button><button class="btn small" data-act="soon">${t('SOPORTE')}</button></div>
        <button class="btn" style="width:100%;margin-top:.5rem" data-act="credits">${t('CRÉDITOS')}</button>
        <div style="display:flex;flex-direction:column;align-items:center;margin-top:1rem;gap:.3rem"><img src="${LOGO}" style="width:6rem"><span class="demo-note">${t('VERSIÓN')} ${CONFIG.version}${CONFIG.tester ? ' · TESTER' : ''}</span></div>
      </div></div></div>
      ${this.nav('settings')}
    </section>`);
    this.wire(e, {
      savecode: async () => { const c = cloud.exportCode(); try { await navigator.clipboard.writeText(c); this.toast(t('Código copiado')); } catch { window.prompt(t('Copia tu código de guardado:'), c); } },
      loadcode: () => { const c = window.prompt(t('Pega tu código de guardado:')); if (c) { if (cloud.importCode(c)) { this.toast(t('Partida restaurada')); this.go('home'); } else this.toast(t('Código no válido')); } },
      lang: (b) => { setLang(b.dataset.l); set.lang = b.dataset.l; store.save(); this.go('settings'); },
      tutorial: () => this.startGame({ mode: 'story', level: tutorialLevel() }),
      tg: (b) => { set[b.dataset.k] = !set[b.dataset.k]; b.classList.toggle('on', set[b.dataset.k]); const vr = e.querySelector(`[data-vk=${b.dataset.k}]`); if (vr) vr.classList.toggle('off', !set[b.dataset.k]); audio.applySettings(); if (b.dataset.k === 'lowfx') { document.body.classList.toggle('lowfx', set.lowfx); window.dispatchEvent(new Event('resize')); } store.save(); },
      ctl: (b) => { set.controls = b.dataset.v; e.querySelectorAll('[data-act=ctl]').forEach((x) => x.classList.toggle('on', x === b)); $(e, '#ctlinfo').textContent = t(CONTROL_INFO[set.controls]); store.save(); },
      coins: () => { store.addCoins(5000); this.toast(t('+{n} monedas', { n: fmt(5000) }), true); },
      wheel: () => { S.wheelDay = ''; store.save(); this.toast(t('Ruleta disponible')); },
      reset: () => this.popup({
        title: '¿BORRAR PROGRESO?', icon: 'retry', text: t('Se perderán monedas, skins y niveles de la demo.'),
        buttons: [['BORRAR', () => { store.reset(); this.go('home'); this.toast(t('Progreso borrado')); }, true], ['CANCELAR', null]],
      }),
      soon: () => this.toast(t('Disponible en la versión final')),
      credits: () => this.credits(),
    });
    this.wireVolume(e);
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
    audio.play('ui_open', { vol: 0.7 });
    const o = el(html);
    this.overEl.appendChild(o);
    fitPlaques(o);
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
      <div class="ov-title worn" style="font-size:2.4rem">${t(title)}</div>
      <div style="font-size:1.05rem;line-height:1.35">${text}</div>
      <div class="btn-row" style="flex-direction:column">${buttons.map(([l, , primary], i) => primary
        ? `<button class="btn-primary" data-act="b" data-i="${i}" style="min-height:3.8rem;font-size:1.9rem"><span class="worn">${t(l)}</span></button>`
        : `<button class="btn" data-act="b" data-i="${i}">${t(l)}</button>`).join('')}</div>
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
      <span class="tagad">${t('ANUNCIO')} · DEMO</span>
      <div class="x" id="adx">5</div>
      <img class="logo" src="${LOGO}" alt="">
      <div class="t">${t('Aquí se mostrará un anuncio con recompensa de AdMob.')}<br>${t('Espera unos segundos para recibir la recompensa.')}</div>
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
        <div class="ov-title worn">${t('RULETA DIARIA')}</div>
        <div class="ov-sub" id="wsub">${t(ready ? 'Un giro gratis cada día' : 'Vuelve mañana para otro giro')}</div>
        <div class="wheel-wrap"><canvas id="wc" width="600" height="600"></canvas>
          <svg class="wheel-ptr" viewBox="0 0 60 72"><path d="M30 70 L8 18 Q30 -6 52 18 Z" fill="#2B2418" stroke="#E8B04A" stroke-width="3"/><circle cx="22" cy="20" r="4" fill="#FFB030"/><circle cx="38" cy="20" r="4" fill="#FFB030"/></svg>
        </div>
        <div id="wact" style="width:100%">${ready ? `<button class="btn-primary" data-act="spin" style="width:100%"><span class="worn">${t('GIRAR')}</span></button>` : ''}</div>
        <button class="link" data-act="close">${t(ready ? 'Más tarde' : 'Cerrar')}</button>
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
    logo.src = url('brand/logo/logo_mark.webp');
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
            $(o, '#wsub').innerHTML = `<span class="glow-amber" style="font-size:1.4rem">${t('¡HAS GANADO {n} MONEDAS!', { n: v })}</span>`;
            $(o, '#wact').innerHTML = `<button class="btn-primary" data-act="claim" style="width:100%"><span class="stack"><span class="worn">${t('RECLAMAR')}</span><span class="sub">${t('VER ANUNCIO')}</span></span></button>`;
            o.querySelector('[data-act=close]').textContent = t('Renunciar al premio');
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
          this.toast(t('+{n} monedas', { n: v }), true);
          if (this.cur && this.cur.name === 'home') this.go('home');
        });
      },
    });
  }

  // ------------------------------------------------------------ game
  startGame(cfg) {
    this.lastCfg = cfg;
    if (cfg.mode === 'duel') meta.track('duelplay');
    if (this.game) this.game = null;
    this.closeOverlays();
    // the equipped skin art is loaded on demand; it is almost always ready already
    ensureSkin(this.S().equipped).then(() => this.go('game', cfg));
  }

  scr_game(cfg) {
    const art = cfg.mode === 'story' ? (cfg.level.mapInfo.key) : { classic: 'maps/key06.jpg', frenzy: 'maps/key12.jpg', duel: 'maps/key09.jpg' }[cfg.mode];
    this.setBg('game', art);
    if (cfg.mode === 'story' && !cfg.level.season && cfg.level.map) audio.playMusic(`mus_map${String(cfg.level.map).padStart(2, '0')}`, 'mus_story');
    else audio.playMusic(cfg.mode === 'story' ? (cfg.level.season ? 'mus_season' : 'mus_story') : { classic: 'mus_classic', frenzy: 'mus_frenzy', duel: 'mus_duel' }[cfg.mode]);
    audio.setMusicRate(1);
    const S = this.S();
    const e = el(`<section style="padding:0">
      <div class="hud">
        <button class="icon-btn" data-act="pause"><img src="${icon('pause')}" alt=""></button>
        <div class="hud-center" id="hc"></div>
        <div class="hud-right"><div class="sc" id="hs">0</div><div class="lb">${t('PUNTOS')}</div></div>
      </div>
      <div class="hud-bottom">
        <div class="tag-level" id="tl"></div>
        <div class="pw-row" id="pwr"></div>
        <div class="boost" id="bo"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="rgba(0,0,0,.5)" stroke="rgba(255,255,255,.15)" stroke-width="4"/><circle id="bor" cx="20" cy="20" r="16" fill="none" stroke="#FFC23A" stroke-width="4" stroke-dasharray="100.5" stroke-dashoffset="0" stroke-linecap="round"/></svg>x2</div>
      </div>
      ${S.settings.controls === 'buttons' ? `<div class="dpad"><button class="u" data-dir="up"><i></i></button><button class="l" data-dir="left"><i></i></button><button class="d" data-dir="down"><i></i></button><button class="r" data-dir="right"><i></i></button></div>` : ''}
      <div id="fxl"></div>
    </section>`);
    this.hudEl = e;
    document.body.classList.add('in-game');
    const mode = cfg.mode;
    const hc = $(e, '#hc');
    if (mode === 'story') {
      hc.innerHTML = `<div class="hud-obj"><img src="${icon('orb_red')}" alt=""><span id="ho">0 / ${cfg.level.target}</span></div><div class="hud-bar"><i id="hb"></i></div>`;
      const G = cfg.level.guardian ? t('GUARDIÁN') + ' · ' : '';
      $(e, '#tl').textContent = cfg.level.tutorial ? `${t('TUTORIAL')} · ${t('NIVEL')} 0`
        : cfg.level.season ? `${G}${t('TEMPORADA')} · ${t('NIVEL')} ${cfg.level.n}`
          : `${G}${t('NIVEL')} ${cfg.level.map}-${cfg.level.n} · ${cfg.level.mapInfo.name} · ${t(DIFFS[cfg.level.diff].label)}`;
    } else if (mode === 'classic') {
      hc.innerHTML = `<div class="hud-obj"><img src="${icon('mode_classic')}" alt=""><span id="ho">${t('LARGO')} 4</span></div><div class="t-label dim" style="font-size:.75rem">${t('RÉCORD')} ${fmt(S.best.classic)}</div>`;
      $(e, '#tl').textContent = t('CLÁSICO');
    } else if (mode === 'frenzy') {
      hc.innerHTML = `<div class="timer-big" id="tm">1:00</div><div class="t-label dim" style="font-size:.75rem">${t('RÉCORD')} ${fmt(S.best.frenzy)}</div>`;
      $(e, '#tl').textContent = t('ORBES FRENÉTICOS');
    } else if (mode === 'duel') {
      const b = BOTS[cfg.difficulty];
      hc.innerHTML = `<div class="duel-bars"><span class="you">${t('TÚ')} <b id="dp">0</b></span><span class="vs">${t('A {n}', { n: b.target })}</span><span class="rival"><b id="db">0</b> ${t('RIVAL')}</span></div>
        <div class="duel-mini"><div class="hud-bar"><i id="dpb"></i></div><div class="hud-bar" style="transform:scaleX(-1)"><i class="r" id="dbb"></i></div></div>`;
      $(e, '#tl').textContent = `${t('DUELO')} · ${t(b.label)}`;
    }

    // build the game
    this.game = new Game(this.view, this, { ...cfg, skinId: S.equipped, settings: S.settings });
    const game = this.game;
    this.updateCoinsRunTip = null;
    e.querySelectorAll('.dpad button').forEach((b) => b.addEventListener('pointerdown', (ev) => { ev.preventDefault(); game.input(b.dataset.dir); }));
    this.wire(e, { pause: () => this.pause() });
    requestAnimationFrame(() => { if (this.game === game) game.resize(); });
    return {
      el: e,
      destroy: () => { document.body.classList.remove('in-game'); if (this.game === game) this.game = null; },
    };
  }

  fxLayer() { return this.hudEl && $(this.hudEl, '#fxl'); }

  // keeps the warning strip and the d-pad in the free space under the board
  placeUnderBoard(under, H, strip, boardTop = 0) {
    const e = this.hudEl;
    if (!e) return;
    this.warnTop = under + 4;
    this.boardTop = boardTop;
    const tag = e.querySelector('.hud-bottom');
    if (tag && e.querySelector('.dpad')) { tag.style.bottom = 'auto'; tag.style.top = `${Math.round(under + 6)}px`; tag.style.justifyContent = 'center'; }
    const pad = e.querySelector('.dpad');
    if (pad) {
      const rem = parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
      const ph = rem * 8.35;
      const free = H - (under + strip);
      const inset = parseFloat(window.getComputedStyle(document.documentElement).getPropertyValue('--sab')) || 0;
      const bot = Math.max(rem * 0.6 + inset, (free - ph) / 2 + inset * 0.5);
      pad.style.bottom = `calc(${Math.round(bot)}px + env(safe-area-inset-bottom, 0px))`;
    }
  }

  warnBanner(sec) {
    const layer = this.hudEl; // not #fxl: the countdown rewrites that layer
    if (!layer) return;
    const w = el(`<div class="plaque strip p0" style="top:${Math.round(this.warnTop || 0)}px;animation-duration:${sec}s"><img src="${plaqueImg(0)}" alt=""><span><b${fit(t('EVITA LOS OBSTÁCULOS'), 16)}>${t('EVITA LOS OBSTÁCULOS')}</b></span></div>`);
    layer.appendChild(w);
    fitPlaques(w);
    setTimeout(() => w.remove(), sec * 1000 + 100);
  }

  countdown(done) {
    const layer = this.fxLayer();
    const ctl = this.S().settings.controls || 'swipe';
    if (this.hudEl && ctl !== 'buttons' && !(this.lastCfg && this.lastCfg.level && this.lastCfg.level.tutorial)) {
      const h = el(`<div class="ctl-hint"><span class="ctl-ic ctl-${ctl}"></span>${t(CONTROL_INFO[ctl])}</div>`);
      const dp = this.hudEl.querySelector('.dpad');
      if (dp) h.style.bottom = `${Math.round(window.innerHeight - dp.getBoundingClientRect().top + 8)}px`;
      this.hudEl.appendChild(h);
      setTimeout(() => h.classList.add('out'), 3200);
      setTimeout(() => h.remove(), 3800);
    }
    const steps = ['3', '2', '1', t('¡YA!')];
    let i = 0;
    const next = () => {
      if (!layer || !layer.isConnected) return;
      layer.innerHTML = `<div class="center-fx"><div class="count ${i === 3 ? 'go' : ''}">${steps[i]}</div></div>`;
      audio.play(i === 3 ? 'countdown_go' : 'countdown_tick');
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
    if (h.length && $(e, '#ho')) $(e, '#ho').textContent = `${t('LARGO')} ${h.length}`;
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
    const c = el(`<div class="combo">${t('COMBO')} x${n}</div>`);
    layer.appendChild(c);
    setTimeout(() => c.remove(), 1000);
  }

  banner(text, kind) {
    this.plaque(text, kind === 'gold' ? 2 : 1, 1.6);
  }

  flash(kind) {
    const f = $(this.app, '#flash');
    f.className = '';
    void f.offsetWidth;
    f.className = kind;
  }

  goldFlash() { this.flash('gold'); }
  hitFlash() { this.flash('hit'); }

  showHint(text) {
    const layer = this.fxLayer();
    if (!layer) return;
    this.hideHint();
    layer.appendChild(el(`<div class="hint" id="hint">${t(text)}</div>`));
  }

  hideHint() {
    const h = this.hudEl && $(this.hudEl, '#hint');
    if (h) h.remove();
  }

  // wide banner plaque (banner kit) that announces an event on top of the board
  plaque(text, idx, sec = 2) {
    if (!this.hudEl) return;
    const p = el(`<div class="plaque p${idx}" style="top:${Math.round((this.boardTop || 60) + 6)}px;animation-duration:${sec}s"><img src="${plaqueImg(idx)}" alt=""><span><b${fit(t(text), 12)}>${t(text)}</b></span></div>`);
    this.hudEl.appendChild(p);
    fitPlaques(p);
    setTimeout(() => p.remove(), sec * 1000 + 80);
  }

  // time bars: an orb icon and how much of the effect is left (force field: two segments = two hits)
  pwHud(st) {
    const row = this.hudEl && $(this.hudEl, '#pwr');
    if (!row) return;
    const items = [['gold', st.gold || 0, 'orb_gold'], ['shield', st.shield > 0 ? st.shield / 2 : 0, 'shield', st.shield], ['magnet', st.magnet, 'hud_magnet'], ['portal', st.portal, 'hud_portal'], ['star', st.star, 'hud_star']];
    for (const [k, v, img, n] of items) {
      let c = $(row, `[data-k=${k}]`);
      if (v <= 0) { if (c) c.remove(); continue; }
      if (!c) {
        const src = k === 'gold' ? icon('orb_gold') : pwi(img);
        c = el(`<div class="pw-bar ${k}" data-k="${k}"><img src="${src}" alt=""><div class="bar"><i></i>${k === 'shield' ? '<u></u>' : ''}</div></div>`);
        row.appendChild(c);
      }
      $(c, 'i').style.width = `${Math.round(clamp(v, 0, 1) * 100)}%`;
      c.classList.toggle('low', k !== 'shield' && v < 0.25);
    }
  }

  shiftFlash() { this.flash('white'); }

  tutStep(i) {
    if (!this.hudEl) return;
    const T = [
      ['DESLIZA PARA GIRAR', 'Mueve el dedo hacia donde quieras ir. Prueba con dos giros.', 'swipe'],
      ['COME EL ORBE ROJO', 'Cada orbe rojo te hace crecer un poquito y suma al objetivo.', 'orb'],
      ['ORBE DORADO', '¡Crece x3 y vas al doble de velocidad unos segundos!', 'star_gold'],
      ['EVITA LOS OBSTÁCULOS', 'Agua, lava y pinchos te eliminan. Recoge el campo de fuerza: rompe 2 obstáculos.', 'eye'],
    ][i];
    const old = $(this.hudEl, '.tut-panel');
    if (old) old.remove();
    const p = el(`<div class="tut-panel" style="top:${Math.round(this.warnTop || 0)}px"><img class="ic" src="${T[2] === 'orb' ? icon('orb_red') : kit(T[2])}" alt="">
      <div><div class="tt">${t(T[0])} <span>${i + 1}/4</span></div><div class="tx">${t(T[1])}</div></div></div>`);
    this.hudEl.appendChild(p);
    if (i === 0) {
      const h = el(`<img class="tut-hand" src="${kit('swipe')}" alt="">`);
      this.hudEl.appendChild(h);
      setTimeout(() => h.remove(), 6500);
    }
  }

  pause() {
    const game = this.game;
    if (!game || game.paused || !['play', 'countdown', 'ready'].includes(game.state)) return;
    game.paused = true;
    audio.duck(true);
    const cfg = this.lastCfg;
    const info = cfg.mode === 'story' ? `${t('NIVEL')} ${cfg.level.map}-${cfg.level.n} · ${t('ORBES')} ${game.player.orbs}/${game.target}` : `${t('PUNTOS')} ${fmt(game.score)}`;
    const o = this.overlay(`<div class="overlay"><div class="panel"><div class="inner">
      <img src="${icon('pause')}" style="width:3.6rem;border-radius:.4rem">
      ${ptitle(t('PAUSA'), 1)}
      <div class="ov-sub">${info}</div>
      <button class="btn-primary" data-act="resume" style="width:100%"><span class="worn">${t('CONTINUAR')}</span><i class="tri"></i></button>
      <button class="btn" data-act="pset" style="width:100%"><img class="ic" src="${icon('settings')}">${t('AJUSTES')}</button>
      <div class="btn-row"><button class="btn" data-act="restart"><img class="ic" src="${icon('retry')}">${t('REINICIAR')}</button><button class="btn" data-act="quit"><img class="ic" src="${icon('quit')}">${t('SALIR')}</button></div>
    </div></div></div>`);
    this.wire(o, {
      pset: () => this.pauseSettings(),
      resume: () => { this.closeOverlay(o); game.paused = false; audio.duck(false); },
      restart: () => { audio.duck(false); this.startGame(this.lastCfg); },
      quit: () => { audio.duck(false); this.exitGame(); },
    });
  }

  // sound row: on/off switch plus a volume slider (music / effects)
  volRow(k, ic, label) {
    const set = this.S().settings;
    const v = Math.round((set[k + 'Vol'] ?? (k === 'music' ? 0.8 : 0.9)) * 100);
    return `<div class="set-row vol"><span class="l"><img src="${ic}">${t(label)}</span><button class="toggle ${set[k] ? 'on' : ''}" data-act="tg" data-k="${k}"></button></div>
      <div class="vol-row ${set[k] ? '' : 'off'}" data-vk="${k}"><input type="range" min="0" max="100" step="5" value="${v}" data-vol="${k}" style="--v:${v}%" aria-label="${t(label)}"><b>${v}</b></div>`;
  }

  // live volume changes from the sliders of a settings panel
  wireVolume(root) {
    const set = this.S().settings;
    root.querySelectorAll('input[data-vol]').forEach((inp) => {
      const k = inp.dataset.vol;
      inp.addEventListener('input', () => {
        set[k + 'Vol'] = Number(inp.value) / 100;
        inp.style.setProperty('--v', inp.value + '%');
        inp.nextElementSibling.textContent = inp.value;
        if (!set[k]) { set[k] = true; const tg = root.querySelector(`[data-act=tg][data-k=${k}]`); if (tg) tg.classList.add('on'); inp.parentElement.classList.remove('off'); }
        audio.applySettings();
      });
      inp.addEventListener('change', () => { store.save(); if (k === 'sfx') audio.play('coin'); });
    });
  }

  // settings without leaving the game (audio, vibration, accessibility, controls)
  pauseSettings() {
    const set = this.S().settings;
    const row = (k, ic, label) => `<div class="set-row"><span class="l"><img src="${ic}">${t(label)}</span><button class="toggle ${set[k] ? 'on' : ''}" data-act="tg" data-k="${k}"></button></div>`;
    const o = this.overlay(`<div class="overlay dark"><div class="panel strong"><div class="inner pad" style="width:100%">
      ${ptitle(t('AJUSTES'), 1)}
      ${this.volRow('music', icon('mode_frenzy'), 'MÚSICA')}
      ${this.volRow('sfx', icon('play'), 'EFECTOS DE SONIDO')}
      ${row('vibration', icon('hz_wind'), 'VIBRACIÓN')}
      ${row('colorblind', icon('hz_dark'), 'MODO DALTÓNICO')}
      ${row('lowfx', icon('hz_wind'), 'GRÁFICOS BAJOS')}
      <div class="sec">${t('CONTROLES')}</div>
      <div class="ctl-grid">${[['swipe', 'DESLIZAR'], ['buttons', 'FLECHAS'], ['joystick', 'PALANCA'], ['tap', 'TOQUES']].map(([v, l]) => `<button class="ctl ${set.controls === v ? 'on' : ''}" data-act="ctl" data-v="${v}"><span class="ctl-ic ctl-${v}"></span>${t(l)}</button>`).join('')}</div>
      <button class="btn-primary" data-act="back" style="width:100%;margin-top:.5rem"><span class="worn">${t('VOLVER')}</span></button>
    </div></div></div>`);
    this.wire(o, {
      tg: (b) => {
        set[b.dataset.k] = !set[b.dataset.k];
        b.classList.toggle('on', set[b.dataset.k]);
        if (b.dataset.k === 'lowfx') { document.body.classList.toggle('lowfx', set.lowfx); if (this.game) this.game.low = set.lowfx; }
        const vr = o.querySelector(`[data-vk=${b.dataset.k}]`); if (vr) vr.classList.toggle('off', !set[b.dataset.k]);
        audio.applySettings();
        store.save();
      },
      ctl: (b) => {
        set.controls = b.dataset.v;
        o.querySelectorAll('[data-act=ctl]').forEach((x) => x.classList.toggle('on', x === b));
        this.syncDpad();
        store.save();
      },
      back: () => this.closeOverlay(o),
    });
    this.wireVolume(o);
  }

  // arrows appear / disappear when the control scheme changes in the middle of a game
  syncDpad() {
    const e = this.hudEl;
    if (!e) return;
    const want = this.S().settings.controls === 'buttons';
    const has = e.querySelector('.dpad');
    if (want && !has) {
      const d = el('<div class="dpad"><button class="u" data-dir="up"><i></i></button><button class="l" data-dir="left"><i></i></button><button class="d" data-dir="down"><i></i></button><button class="r" data-dir="right"><i></i></button></div>');
      e.appendChild(d);
      d.querySelectorAll('button').forEach((b) => b.addEventListener('pointerdown', (ev) => { ev.preventDefault(); this.game && this.game.input(b.dataset.dir); }));
    } else if (!want && has) has.remove();
    const tag = e.querySelector('.hud-bottom');
    if (tag && !want) { tag.style.top = ''; tag.style.bottom = ''; }
    if (this.game) this.game.resize();
  }

  // first time an item shows up: the game stops, the item is highlighted and explained with icons
  itemIntro(type, px, py, onClose) {
    const D = {
      shield: ['CAMPO DE FUERZA', pwi('shield'), [[kit('check_box'), 'Rompe 2 obstáculos o pinchos'], [kit('star_glow'), 'Toma el color de tu skin'], [kit('bulb'), 'No protege del agua ni de la lava']]],
      magnet: ['IMÁN DE ORBES', pwi('hud_magnet'), [[icon('orb_red'), 'Atrae los orbes cercanos'], [kit('refresh'), 'Dura 8 segundos'], [kit('bulb'), 'Se ve su alcance alrededor de ti']]],
      portal: ['PORTAL DE REGRESO', pwi('portal'), [[kit('check_box'), 'Si chocas, no pierdes: vuelves al inicio'], [kit('refresh'), 'Dura 8 segundos'], [kit('bulb'), 'Conservas todo tu largo']]],
      star: ['ESTRELLA DORADA', pwi('star'), [[icon('x2'), 'Velocidad x2'], [kit('star_gold'), 'Invencible: nada te afecta'], [kit('refresh'), 'Dura 6 segundos · el mapa da la vuelta']]],
    }[type];
    const R = 3.2 * 16;
    const o = this.overlay(`<div class="overlay item-intro" style="background:radial-gradient(circle at ${px}px ${py}px, transparent 0, transparent ${R}px, rgba(4,6,4,.84) ${R + 60}px)">
      <div class="spot" style="left:${px}px;top:${py}px"></div>
      <div class="panel strong" style="margin-top:auto"><div class="inner">
        <div class="t-label glow-amber">${t('¡NUEVO OBJETO!')}</div>
        <div class="ii-head"><img src="${D[1]}" alt=""><div class="t-display worn" style="font-size:2rem">${t(D[0])}</div></div>
        <div class="ii-lines">${D[2].map(([ic, tx]) => `<div><img src="${ic}" alt=""><span>${t(tx)}</span></div>`).join('')}</div>
        <button class="btn-primary" data-act="ok" style="width:100%"><span class="worn">${t('¡ENTENDIDO!')}</span></button>
      </div></div></div>`);
    this.wire(o, { ok: () => { this.closeOverlay(o); onClose && onClose(); } });
  }

  exitGame() {
    const m = this.lastCfg && this.lastCfg.mode;
    this.game = null;
    // season levels live on their own map screen (map 17 is not in the story list)
    if (m === 'story' && this.lastCfg.level.season) this.go('season');
    else if (m === 'story' && this.lastCfg.level.tutorial) this.go('home');
    else if (m === 'story') this.go('levels', { map: this.lastCfg.level.map });
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
    let sub = info.mode === 'story' ? tn('Te faltaron {n} orbes', info.left) : info.mode === 'duel' ? t('¡El duelo sigue abierto!') : t('{n} puntos', { n: fmt(info.score) });
    if (r === 1) sub = t('Última oportunidad');
    const prog = info.target ? `<div style="width:100%;display:flex;align-items:center;gap:.5rem"><img src="${icon('orb_red')}" style="width:1.8rem;border-radius:.2rem"><div class="progress" style="flex:1"><i style="width:${(info.cur / info.target) * 100}%"></i></div><span class="t-display" style="font-size:1.4rem">${info.cur}/${info.target}</span></div>` : '';
    const enough = S.coins >= cost;
    const tip = this.deathTip(info);
    const tipHtml = `<div class="tip-chip"><img src="${kit('bulb')}" alt=""><span>${tip}</span></div>`;
    const adCoin = `<button class="chip-ad" data-act="adcoin"><img src="${kit('plus1')}" alt=""><span>${t('+1 MONEDA')} · ${t('VER ANUNCIO')}</span></button>`;
    const o = this.overlay(`<div class="overlay" style="justify-content:flex-end;padding-bottom:12%"><div class="panel"><div class="inner">
      ${ptitle(t(info.target && info.left / info.target > 0.4 ? '¡AY!' : '¡CASI!'), 0)}
      <div class="ov-sub">${sub}</div>
      ${prog}
      ${tipHtml}
      ${canAd ? `<div class="revive-main"><button class="btn-primary" data-act="ad" style="width:100%"><img src="${icon('ad')}" style="width:2.2rem;border-radius:.25rem"><span class="stack"><span class="worn">${t('REVIVIR')}</span><span class="sub">${t('VER ANUNCIO')}</span></span></button>
        <div class="ring"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="rgba(10,14,11,.9)" stroke="rgba(255,255,255,.15)" stroke-width="3"/><circle id="rr" cx="20" cy="20" r="17" fill="none" stroke="#E8B04A" stroke-width="3" stroke-dasharray="106.8" stroke-dashoffset="0" stroke-linecap="round"/></svg><span id="rn">6</span></div></div>` : ''}
      <button class="${canAd ? 'btn' : 'btn-primary'}" data-act="coins" style="width:100%;${canAd ? '' : 'min-height:4rem;font-size:2rem'}"><img class="ic" src="${icon('coin')}" style="${canAd ? '' : 'width:2rem;height:2rem;border-radius:50%'}"><span>${t('REVIVIR')} · ${cost}</span></button>
      ${enough ? '' : `<div class="t-label" style="color:#FF8A7A;font-size:.85rem">${t('TE FALTAN {n} MONEDAS', { n: fmt(cost - S.coins) })} · <button class="link" data-act="getcoins" style="padding:0;color:var(--honey)">${t('CONSEGUIR')}</button></div>`}
      ${adCoin}
      <div class="btn-row"><button class="btn small" data-act="retry"><img class="ic" src="${icon('retry')}">${t('REINTENTAR')}</button><button class="btn small" data-act="home"><img class="ic" src="${icon('home')}">${t('SALIR')}</button></div>
      <button class="link" data-act="no">${t('No, gracias')}</button>
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
            title: 'MONEDAS INSUFICIENTES', icon: 'coins', text: t('Necesitas <b>{n}</b> monedas para revivir.', { n: cost }),
            buttons: [['CONSEGUIR MONEDAS', () => this.quickShop(() => { paused = false; }), true], ['VOLVER', () => { paused = false; }]],
          });
          return;
        }
        done();
        game.revive();
      },
      getcoins: () => { paused = true; this.quickShop(() => { paused = false; }); },
      adcoin: (b) => {
        paused = true;
        this.fakeAd(() => { store.addCoins(1); this.toast(t('+1 moneda'), true); b.remove(); paused = false; });
      },
      retry: () => this.startGame(this.lastCfg),
      home: () => this.exitGame(),
      no: () => decline(),
    });
  }

  // One short line about what just happened, tuned to the map and the way the player died.
  deathTip(info) {
    const LETHAL = { 1: 'El río', 2: 'El estanque', 3: 'El agua', 4: 'El río de esporas', 5: 'La arena movediza', 6: 'El lodo tóxico', 7: 'El agua helada', 8: 'El abismo de cristal', 9: 'El agua profunda', 10: 'La lava', 11: 'El mar', 12: 'El foso', 13: 'El vacío', 14: 'El agua sagrada', 15: 'La ciénaga', 16: 'El canal de energía', 17: 'El pantano maldito' };
    if (info.mode === 'duel') return t('Corta el paso al rival, pero no cruces su cuerpo.');
    if (info.reason === 'hazard') {
      if (info.cellT === 6) return t('Los pinchos te eliminan. Recoge el campo de fuerza para romperlos.');
      return t('{x} te elimina. Cruza por los puentes.', { x: t(LETHAL[info.map] || 'El terreno') });
    }
    if (info.reason === 'obstacle') return t('Los obstáculos bloquean el paso. Rodéalos o rómpelos con el campo de fuerza.');
    if (info.reason === 'wall') return t('Los muros del borde te detienen. Gira antes de llegar.');
    if (info.reason === 'self') return t('Cuidado con tu cola: deja espacio para girar.');
    return t('Planifica tu ruta un par de casillas por delante.');
  }

  // Minimal in-game coin pack sheet (keeps the run alive).
  quickShop(onClose) {
    const o = this.overlay(`<div class="overlay dark"><div class="panel strong"><div class="inner">
      <div class="ov-title worn" style="font-size:2.4rem">${t('MONEDAS')}</div>
      <div class="pack-grid" style="width:100%">${ECONOMY.packs.slice(0, 3).map((p, i) => `<button class="pack" data-act="buy" data-coins="${p.coins}"><img src="${icon(i ? 'coins' : 'coin')}"><div class="amt">${fmt(p.coins)}</div><div class="price">${p.price}</div></button>`).join('')}</div>
      <div class="demo-note">${t('Compra simulada (demo)')}</div>
      <button class="btn" data-act="close" style="width:100%">${t('VOLVER')}</button>
    </div></div></div>`);
    this.wire(o, {
      buy: (b) => { store.addCoins(Number(b.dataset.coins)); this.toast(t('+{n} monedas', { n: fmt(Number(b.dataset.coins)) }), true); this.closeOverlay(o); onClose && onClose(); this.refreshReviveCoins(); },
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
    const statRow = (items) => `<div class="stat-row">${items.map(([k, v]) => `<div><span class="v">${v}</span><span class="k">${t(k)}</span></div>`).join('')}</div>`;
    const time = fmtT(res.time);

    if (res.mode === 'story' && res.tutorial) {
      coins = res.won ? 100 : 0;
      if (res.won) { S.tutorialSeen = true; store.save(); }
      html = `<div class="t-label glow-amber">${t('TUTORIAL')}</div>
        ${ptitle(t('¡LISTO PARA JUGAR!'), 1)}
        <div class="ov-sub">${t('Ya conoces los orbes, los obstáculos y el campo de fuerza')}</div>
        <div class="coin-reward"><img src="${icon('coin')}"><span id="cr">+0</span></div>
        <button class="btn-primary" data-act="first" style="width:100%"><span class="worn">${t('JUGAR')} ${t('NIVEL')} 1-1</span><i class="tri"></i></button>
        <div class="btn-row"><button class="btn" data-act="retry"><img class="ic" src="${icon('retry')}">${t('REPETIR')}</button><button class="btn" data-act="home"><img class="ic" src="${icon('home')}">${t('INICIO')}</button></div>`;
    } else if (res.mode === 'story') {
      const L = cfg.level;
      const back = L.season ? 'season' : 'levels';
      if (res.won) {
        const first = store.markCleared(L.map, L.n, L.diff);
        const gained = store.setStars(L.map, L.n, res.stars, L.diff);
        coins = (first ? L.reward : ECONOMY.replayReward) + gained * 15;
        // progress hooks: missions, achievements, season points
        meta.track('level');
        if (res.deaths === 0) meta.track('level_clean');
        if (gained) meta.track('star', gained);
        if (res.stars === 3) meta.track('star3');
        meta.addSeasonXp((L.season ? 25 : first ? 15 : 5) + (res.stars === 3 ? 10 : 0));
        const skinNow = L.season && L.n === 20 && meta.seasonSkinUnlock();
        for (let k = 0; k < res.stars; k++) audio.play('star_pop', { rate: 1 + 0.12 * k, delay: 0.5 + k * 0.3 });
        html = `<div class="t-label glow-amber">${t(L.guardian ? '¡GUARDIÁN DERROTADO!' : '¡OBJETIVO CUMPLIDO!')}</div>
          ${ptitle(t('¡NIVEL SUPERADO!'), 2)}
          <div class="ov-sub">${L.season ? t('TEMPORADA') + ' · ' + t('NIVEL') + ' ' + L.n : L.map + '-' + L.n} · ${L.mapInfo.name}</div>
          <div class="star-row">${[
            [t('Objetivo'), true], [t('Sin morir'), res.deaths === 0], [`${t('Rápido')} · ${fmtT(res.par)}`, res.stars === 3],
          ].map(([cap, on], i) => `<div class="star ${on ? 'on' : ''}" style="--d:${0.35 + i * 0.3}s"><img src="${kit(on ? 'star_gold' : 'star_empty')}" alt=""><span>${cap}</span></div>`).join('')}</div>
          ${res.stars === 3 ? ptitle(t('¡PERFECTO!'), 2, 'small') : ''}
          ${statRow([['ORBES', `${Math.min(res.orbs, L.target)}/${L.target}`], ['PUNTOS', fmt(res.score)], ['TIEMPO', time]])}
          <div class="coin-reward"><img src="${icon('coin')}"><span id="cr">+0</span></div>
          ${first ? '' : `<div class="demo-note">${t('Nivel repetido: recompensa reducida')}</div>`}
          ${skinNow ? `<div class="t-label glow-amber">${t('¡SKIN DE TEMPORADA DESBLOQUEADA!')}</div>` : ''}
          <button class="ad-x2" data-act="x2"><img src="${kit('x2')}" alt=""><span>x2 ${t('MONEDAS')} · ${t('VER ANUNCIO')}</span><img class="vid" src="${kit('video')}" alt=""></button>
          ${L.season ? (L.n < 20 ? `<button class="btn-primary" data-act="next" style="width:100%"><span class="worn">${t('SIGUIENTE')}</span><i class="tri"></i></button>` : `<div class="t-label glow-amber">${t('¡TEMPORADA COMPLETADA!')}</div>`)
            : L.n < 10 ? `<button class="btn-primary" data-act="next" style="width:100%"><span class="worn">${t('SIGUIENTE')}</span><i class="tri"></i></button>`
              : `<div class="t-label glow-amber">${t('¡MAPA {m} COMPLETADO!', { m: ROMAN[L.map - 1] })}</div>${L.map < 16 ? `<button class="btn-primary" data-act="nextmap" style="width:100%"><span class="stack"><span class="worn">${t('SIGUIENTE MAPA')}</span><span class="sub">${MAPS[L.map].name}</span></span></button>` : ''}`}
          <div class="btn-row"><button class="btn" data-act="retry"><img class="ic" src="${icon('retry')}">${t('REPETIR')}</button><button class="btn" data-act="levels"><img class="ic" src="${icon('levels')}">${t('NIVELES')}</button></div>`;
      } else {
        html = `${ptitle(t('NIVEL FALLIDO'), 0)}
          <div class="ov-sub">${L.season ? t('TEMPORADA') + ' · ' + t('NIVEL') + ' ' + L.n : L.map + '-' + L.n} · ${L.mapInfo.name}</div>
          ${statRow([['ORBES', `${res.orbs}/${L.target}`], ['PUNTOS', fmt(res.score)], ['TIEMPO', time]])}
          <button class="btn-primary" data-act="retry" style="width:100%"><span class="worn">${t('REINTENTAR')}</span></button>
          <div class="btn-row"><button class="btn" data-act="levels"><img class="ic" src="${icon('levels')}">${t('NIVELES')}</button><button class="btn" data-act="home"><img class="ic" src="${icon('home')}">${t('INICIO')}</button></div>`;
      }
      void back;
    } else if (res.mode === 'classic' || res.mode === 'frenzy') {
      const key = res.mode;
      const prevBest = S.best[key];
      const rec = res.score > prevBest;
      if (rec) { S.best[key] = res.score; store.save(); }
      coins = Math.floor(res.orbs / (key === 'classic' ? ECONOMY.classicCoinsPerOrbs : ECONOMY.frenzyCoinsPerOrbs));
      html = `${rec ? ptitle(t('¡NUEVO RÉCORD!'), 2, 'small') : ''}
        ${ptitle(t(key === 'frenzy' ? (res.won ? '¡TIEMPO!' : 'FIN DEL FRENESÍ') : 'FIN DE LA PARTIDA'), 2)}
        <div class="big-num">${fmt(res.score)}</div>
        <div class="ov-sub">${t('RÉCORD')} ${fmt(Math.max(prevBest, res.score))}</div>
        ${statRow(key === 'classic' ? [['ORBES', res.orbs], ['LARGO', res.length], ['TIEMPO', time]] : [['DORADOS', res.gold], ['LARGO', res.length], ['TIEMPO', time]])}
        <div class="coin-reward"><img src="${icon('coin')}"><span id="cr">+0</span></div>
        ${coins > 0 ? `<button class="ad-x2" data-act="x2"><img src="${kit('x2')}" alt=""><span>x2 ${t('MONEDAS')} · ${t('VER ANUNCIO')}</span><img class="vid" src="${kit('video')}" alt=""></button>` : ''}
        <button class="btn-primary" data-act="retry" style="width:100%"><span class="worn">${t('JUGAR DE NUEVO')}</span></button>
        <div class="btn-row"><button class="btn" data-act="home"><img class="ic" src="${icon('home')}">${t('INICIO')}</button><button class="btn" data-act="lb"><img class="ic" src="${icon('mode_leaderboard')}">${t('RANKING')}</button></div>`;
    } else if (res.mode === 'duel') {
      const b = BOTS[cfg.difficulty];
      if (res.won) {
        const d = store.today();
        if (S.duelWins.day !== d) S.duelWins = { day: d, count: 0 };
        if (S.duelWins.count < ECONOMY.duelPaidWinsPerDay) { coins = ECONOMY.duelReward[cfg.difficulty]; S.duelWins.count++; }
        store.save();
        meta.track('duelwin');
      }
      html = `${ptitle(t(res.won ? 'VICTORIA' : 'DERROTA'), res.won ? 2 : 0)}
        <div class="ov-sub">${t(res.won ? '{b} DERROTADO' : res.loseReason === 'bot' ? '{b} LLEGÓ PRIMERO' : '{b} TE HA VENCIDO', { b: b.name })}</div>
        ${statRow([['TÚ', res.duel.p], ['RIVAL', res.duel.b], ['TIEMPO', time]])}
        ${res.won ? `<div class="coin-reward"><img src="${icon('coin')}"><span id="cr">+0</span></div>${coins ? '' : `<div class="demo-note">${t('Límite diario de victorias pagadas alcanzado')}</div>`}` : ''}
        <button class="btn-primary" data-act="retry" style="width:100%"><span class="worn">${t('REVANCHA')}</span></button>
        <div class="btn-row"><button class="btn" data-act="duel"><img class="ic" src="${icon('mode_duel')}">${t('RIVALES')}</button><button class="btn" data-act="home"><img class="ic" src="${icon('home')}">${t('INICIO')}</button></div>`;
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
      next: () => this.startGame({ mode: 'story', level: storyLevel(cfg.level.map, cfg.level.n + 1, cfg.level.diff) }),
      retry: () => this.startGame(cfg),
      levels: () => { this.game = null; if (cfg.level.season) this.go('season'); else this.go('levels', { map: cfg.level.map, sel: Math.min(10, cfg.level.n + (res.won ? 1 : 0)) }); },
      nextmap: () => { this.game = null; this.go('levels', { map: cfg.level.map + 1 }); },
      first: () => this.startGame({ mode: 'story', level: storyLevel(1, 1, this.S().diff) }),
      x2: (b) => {
        this.fakeAd(() => {
          store.addCoins(coins);
          this.toast(t('+{n} monedas más', { n: fmt(coins) }), true);
          const cr = $(o, '#cr'); if (cr) cr.textContent = '+' + fmt(coins * 2);
          b.remove();
        });
      },
      home: () => { this.game = null; this.go('home'); },
      duel: () => { this.game = null; this.go('duel'); },
      lb: () => this.toast(t('Ranking con Google Play Games en la versión final')),
    });
  }
}
