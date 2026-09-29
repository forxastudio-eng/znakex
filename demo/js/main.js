// Boot: sizing, asset loading, main loop and input.
import * as store from './store.js';
import { loadAll } from './assets.js';
import { UI } from './ui.js';
import { Ambient } from './fx.js';
import { TIPS } from './data.js';

const app = document.getElementById('app');
const gameCanvas = document.getElementById('game');
const ambCanvas = document.getElementById('ambient');
const view = { canvas: gameCanvas, g: gameCanvas.getContext('2d'), W: 0, H: 0, dpr: 1 };
const amb = { g: ambCanvas.getContext('2d'), fx: new Ambient(34, ['#FFE7A0', '#E8F5A0', '#FFD36A', '#C8F0A0']) };

function resize() {
  const r = app.getBoundingClientRect();
  document.documentElement.style.fontSize = (r.width / 27) + 'px';
  const dpr = Math.min(2.5, window.devicePixelRatio || 1);
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
const ui = new UI(app, view);
window.addEventListener('resize', resize);
resize();

// ------------------------------------------------------------------ boot
ui.go('splash');
let tip = 0;
const tipTimer = setInterval(() => {
  const n = document.getElementById('ldtip');
  if (n) n.textContent = TIPS[++tip % TIPS.length];
}, 2600);

const t0 = performance.now();
Promise.all([
  loadAll((p) => ui.cur && ui.cur.progress && ui.cur.progress(p)),
  document.fonts ? document.fonts.ready : Promise.resolve(),
  new Promise((r) => setTimeout(r, 900)), // let the splash breathe
]).then(() => {
  clearInterval(tipTimer);
  ui.cur.progress && ui.cur.progress(1);
  ui.cur.ready(() => ui.go('home'));
  console.log('loaded in', Math.round(performance.now() - t0), 'ms');
});

// ------------------------------------------------------------------ loop
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const game = ui.game;
  if (game) {
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

// swipe: direction fires as soon as the finger travels far enough,
// and the origin resets so one continuous gesture can chain turns.
let sw = null;
app.addEventListener('pointerdown', (e) => {
  if (!ui.game || e.target.closest('button')) return;
  sw = { x: e.clientX, y: e.clientY, id: e.pointerId };
});
app.addEventListener('pointermove', (e) => {
  if (!sw || e.pointerId !== sw.id || !ui.game) return;
  const dx = e.clientX - sw.x, dy = e.clientY - sw.y;
  const th = Math.max(18, view.W * 0.045);
  if (Math.abs(dx) < th && Math.abs(dy) < th) return;
  const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  ui.game.input(dir);
  sw.x = e.clientX; sw.y = e.clientY;
});
const endSwipe = () => { sw = null; };
app.addEventListener('pointerup', endSwipe);
app.addEventListener('pointercancel', endSwipe);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) ui.pause();
});

// Expose for quick debugging in the console.
window.ZNAKEX = { ui, store, back: () => ui.back() };
