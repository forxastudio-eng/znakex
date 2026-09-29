// Touch controls. The scheme comes from Settings:
//   swipe     – swipe in the direction you want (chained turns in one gesture)
//   buttons   – on-screen arrow pad (rendered by the HUD)
//   joystick  – floating stick that appears where the finger lands
//   tap       – tap the left / right half to turn left / right relative to the snake
import * as store from './store.js';

export function setupInput(app, ui, view) {
  let sw = null;
  let joy = null;

  const scheme = () => store.S().settings.controls || 'swipe';
  const inGame = (e) => ui.game && !e.target.closest('button') && !ui.overEl.querySelector('.overlay.show, .ad.show');

  function makeJoy(x, y) {
    const r = app.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = 'joy';
    el.innerHTML = '<i class="ar u"></i><i class="ar r"></i><i class="ar d"></i><i class="ar l"></i><div class="knob"></div>';
    el.style.left = (x - r.left) + 'px';
    el.style.top = (y - r.top) + 'px';
    app.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    return { el, knob: el.querySelector('.knob'), x, y, dir: null };
  }

  function dropJoy() {
    if (!joy) return;
    const el = joy.el;
    el.classList.remove('show');
    setTimeout(() => el.remove(), 220);
    joy = null;
  }

  function tapFx(side) {
    const f = document.createElement('div');
    f.className = 'tapfx ' + side;
    f.innerHTML = side === 'left' ? '⟲' : '⟳';
    app.appendChild(f);
    setTimeout(() => f.remove(), 450);
  }

  app.addEventListener('pointerdown', (e) => {
    if (!inGame(e)) return;
    const mode = scheme();
    if (mode === 'swipe') {
      sw = { x: e.clientX, y: e.clientY, id: e.pointerId };
    } else if (mode === 'joystick') {
      dropJoy();
      joy = makeJoy(e.clientX, e.clientY);
      joy.id = e.pointerId;
    } else if (mode === 'tap') {
      const r = app.getBoundingClientRect();
      const side = e.clientX - r.left < r.width / 2 ? 'left' : 'right';
      ui.game.turn(side);
      tapFx(side);
    }
  });

  app.addEventListener('pointermove', (e) => {
    if (!ui.game) return;
    if (sw && e.pointerId === sw.id) {
      const dx = e.clientX - sw.x, dy = e.clientY - sw.y;
      const th = Math.max(18, view.W * 0.045);
      if (Math.abs(dx) < th && Math.abs(dy) < th) return;
      ui.game.input(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
      sw.x = e.clientX; sw.y = e.clientY;
    } else if (joy && e.pointerId === joy.id) {
      const max = view.W * 0.1;
      let dx = e.clientX - joy.x, dy = e.clientY - joy.y;
      const d = Math.hypot(dx, dy);
      if (d > max) { dx *= max / d; dy *= max / d; }
      joy.knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      if (d > max * 0.35) {
        const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
        if (dir !== joy.dir) {
          joy.dir = dir;
          joy.el.dataset.dir = dir;
          ui.game.input(dir);
        }
      }
    }
  });

  const end = (e) => {
    if (sw && e.pointerId === sw.id) sw = null;
    if (joy && e.pointerId === joy.id) dropJoy();
  };
  app.addEventListener('pointerup', end);
  app.addEventListener('pointercancel', end);
}

export const CONTROL_INFO = {
  swipe: 'Desliza el dedo hacia donde quieras girar.',
  buttons: 'Usa las flechas de la parte inferior.',
  joystick: 'Toca donde quieras: aparece una palanca que puedes arrastrar.',
  tap: 'Toca la mitad izquierda o derecha para girar hacia ese lado.',
};
