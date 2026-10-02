// Boot: sizing, asset loading, main loop and input.
import * as store from './store.js';
import { loadAll } from './assets.js';
import { UI } from './ui.js';
import { Ambient } from './fx.js';
import { TIPS } from './data.js';
import { t, setLang, detectLang } from './i18n.js';
import { setupInput } from './input.js';
import * as audio from './audio.js';
import * as notify from './notify.js';
import * as cloud from './cloud.js';
import * as billing from './billing.js';

const app = document.getElementById('app');
const gameCanvas = document.getElementById('game');
const ambCanvas = document.getElementById('ambient');
const view = { canvas: gameCanvas, g: gameCanvas.getContext('2d'), W: 0, H: 0, dpr: 1 };
const amb = { g: ambCanvas.getContext('2d'), fx: new Ambient(34, ['#FFE7A0', '#E8F5A0', '#FFD36A', '#C8F0A0']) };

function resize() {
  const r = app.getBoundingClientRect();
  document.documentElement.style.fontSize = (r.width / 27) + 'px';
  const low = store.S().settings.lowfx;
  const dpr = Math.min(low ? 1.5 : 2, window.devicePixelRatio || 1);
  view.W = r.width; view.H = r.height; view.dpr = dpr;
  for (const c of [gameCanvas, ambCanvas]) {
    c.width = Math.round(r.width * dpr);
    c.height = Math.round(r.height * dpr);
  }
  view.g.setTransform(dpr, 0, 0, dpr, 0, 0);
  amb.g.setTransform(dpr, 0, 0, dpr, 0, 0);
  amb.fx.resize(r.width, r.height);
  if (ui && ui.game) ui.game.resize();
}

store.load();
// language: ?lang= (testing), the one chosen in the settings, or the phone's own
setLang(new URLSearchParams(location.search).get('lang') || store.S().settings.lang || detectLang());
document.body.classList.toggle('lowfx', !!store.S().settings.lowfx);
const ui = new UI(app, view);
window.addEventListener('resize', resize);
resize();

// ------------------------------------------------------------------ boot
// Google Play services (Android app only): progress in the player's Google account and real purchases
cloud.init();
billing.init();
// sound from the very start (the WebView allows it without a tap; in a browser the first tap starts it)
audio.unlock();
ui.go('splash');
ui.studioIntro();
let tip = 0;
const tipTimer = setInterval(() => {
  const n = document.getElementById('ldtip');
  if (n) n.textContent = t(TIPS[++tip % TIPS.length]);
}, 2600);

const t0 = performance.now();
Promise.all([
  loadAll((p) => ui.cur && ui.cur.progress && ui.cur.progress(p), [...new Set([store.S().equipped, 'basica'])]),
  document.fonts ? document.fonts.ready : Promise.resolve(),
  new Promise((r) => setTimeout(r, 900)), // let the splash breathe
]).then(() => {
  clearInterval(tipTimer);
  ui.cur.progress && ui.cur.progress(1);
  ui.cur.ready(() => ui.go('home'));
  notify.sync(); // refresh tomorrow's reminder (in the current language) — a visit today means none today
  console.log('loaded in', Math.round(performance.now() - t0), 'ms');
});

// ------------------------------------------------------------------ loop
let last = performance.now();
let perfN = 0, perfSum = 0;
function frame(now) {
  const raw = (now - last) / 1000;
  const dt = Math.min(0.05, raw);
  last = now;
  // one-off check on the first seconds of play: on a slow phone switch to low graphics automatically
  const set = store.S().settings;
  if (!set.perfChecked && ui.game && ui.game.state === 'play' && raw < 0.5) {
    perfSum += raw; perfN++;
    if (perfN >= 150) {
      set.perfChecked = true;
      if (perfSum / perfN > 0.026 && !set.lowfx) {
        set.lowfx = true;
        document.body.classList.add('lowfx');
        ui.lowfxAuto = true;
        resize();
      }
      store.save();
    }
  }
  const game = ui.game;
  if (game) {
    if (game.state === 'play' && !game.paused) { store.S().stats.playSec += dt; }
    if (!game.paused) game.update(dt);
    game.render();
    amb.g.clearRect(0, 0, view.W, view.H);
  } else {
    view.g.clearRect(0, 0, view.W, view.H);
    amb.fx.update(dt, now / 1000);
    amb.g.clearRect(0, 0, view.W, view.H);
    amb.fx.draw(amb.g, now / 1000, 0.9);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// ------------------------------------------------------------------ input
const KEYS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right' };
window.addEventListener('keydown', (e) => {
  const game = ui.game;
  if (!game) return;
  if (KEYS[e.key]) { e.preventDefault(); game.input(KEYS[e.key]); }
  else if (e.key === 'Escape' || e.key === 'p') ui.pause();
});

setupInput(app, ui, view);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) { ui.pause(); ui.pauseMedia(); audio.suspend(); }
  else { ui.resumeMedia(); audio.resume(); }
});
window.addEventListener('pageshow', () => ui.resumeMedia());

// Expose for quick debugging in the console.
document.addEventListener('pointerdown', () => audio.unlock(), { capture: true });
// called by the Android shell (MainActivity.onPause / onResume)
window.ZNAKEX = { ui, store, back: () => ui.back(), onPause: () => { ui.pause(); ui.pauseMedia(); audio.suspend(); cloud.upload(); }, onResume: () => { ui.resumeMedia(); audio.resume(); } };
