// Sprite snake renderer: the real head / body / tail art from each skin sheet.
// The body is a sequence of the sheet's own modules (straight, variants and
// special segments) mapped along the smoothed path in thin strips so it bends
// with the snake. The head is the sheet's top-down head; neck and tail base are
// blended into the body so the pieces read as one animal.
import { clamp } from './util.js';
import { glowSprite } from './fx.js';
import { IMG } from './assets.js';

// Chaikin corner cutting, keeps both ends.
function chaikin(pts, iters) {
  let p = pts;
  for (let k = 0; k < iters; k++) {
    if (p.length < 3) return p;
    const q = [p[0]];
    for (let i = 0; i < p.length - 1; i++) {
      const a = p[i], b = p[i + 1];
      q.push({ x: a.x * 0.75 + b.x * 0.25, y: a.y * 0.75 + b.y * 0.25 });
      q.push({ x: a.x * 0.25 + b.x * 0.75, y: a.y * 0.25 + b.y * 0.75 });
    }
    q.push(p[p.length - 1]);
    p = q;
  }
  return p;
}

// Resample a polyline at a fixed step; samples carry distance from the head.
function resample(pts, step, d0) {
  const out = [];
  if (!pts.length) return out;
  out.push({ x: pts[0].x, y: pts[0].y, d: d0 });
  let dist = d0, next = d0 + step;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    const seg = Math.hypot(b.x - a.x, b.y - a.y);
    if (seg < 1e-6) continue;
    while (next <= dist + seg) {
      const t = (next - dist) / seg;
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, d: next });
      next += step;
    }
    dist += seg;
  }
  const last = pts[pts.length - 1];
  out.push({ x: last.x, y: last.y, d: dist });
  return out;
}

// ------------------------------------------------------------------ skin art
// Every skin sheet gives: head (top-down), body modules A/B/C, a special module (2 cells),
// a tail and 90-degree turn modules (t0..t2, built from A/B/C by tools/turns.py).
const meta = new Map();

function canvasOf(img, w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.drawImage(img, 0, 0, w, h);
  return { c, g };
}

// Vertical extent of a piece's core (rows opaque across at least half of its length, so fins and
// stray pixels do not count) plus its average colour.
function measure(img) {
  const { g } = canvasOf(img, img.width, img.height);
  let top = 0, bot = img.height - 1, r = 0, gg = 0, b = 0, n = 0;
  try {
    const W = img.width;
    const d = g.getImageData(0, 0, W, img.height).data;
    const cnt = new Float32Array(img.height);
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        if (d[i + 3] > 160) {
          cnt[y]++;
          if (x % 2 === 0) { r += d[i]; gg += d[i + 1]; b += d[i + 2]; n++; }
        }
      }
    }
    let first = -1, last = -1;
    for (let y = 0; y < img.height; y++) if (cnt[y] >= W * 0.5) { if (first < 0) first = y; last = y; }
    if (first >= 0) { top = first; bot = last; }
  } catch { n = 0; }
  const avg = n ? [r / n, gg / n, b / n] : [90, 110, 70];
  const hex = (k) => '#' + avg.map((v) => Math.min(255, Math.round(v * k)).toString(16).padStart(2, '0')).join('');
  return { img, top, bot: Math.max(bot, top + 1), fill: hex(1), dark: hex(0.35) };
}

// Thickness of a tail where it meets the body: measured a little way in, on the columns 8% to 30%.
function measureBase(img) {
  const x0 = Math.floor(img.width * 0.08), x1 = Math.max(x0 + 2, Math.floor(img.width * 0.3));
  const W = x1 - x0;
  const { g } = canvasOf(img, img.width, img.height);
  let top = 0, bot = img.height - 1;
  try {
    const d = g.getImageData(x0, 0, W, img.height).data;
    let first = -1, last = -1;
    for (let y = 0; y < img.height; y++) {
      let c = 0;
      for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3] > 160) c++;
      if (c >= W * 0.5) { if (first < 0) first = y; last = y; }
    }
    if (first >= 0) { top = first; bot = last; }
  } catch { /* keep full height */ }
  return { top, bot: Math.max(bot, top + 1) };
}

// The sheet heads end in a rounded, outlined neck that sat on top of the special module and broke the
// line of the body: the back of the head fades out with a soft gradient so the body shows through.
function fadeNeck(img) {
  const { c, g } = canvasOf(img, img.width, img.height);
  const h = img.height;
  const gr = g.createLinearGradient(0, h * 0.6, 0, h * 0.9);
  gr.addColorStop(0, 'rgba(0,0,0,0)');
  gr.addColorStop(1, 'rgba(0,0,0,1)');
  g.globalCompositeOperation = 'destination-out';
  g.fillStyle = gr;
  g.fillRect(0, h * 0.6, img.width, h * 0.4);
  return c;
}

export function skinArt(skin) {
  const key = skin.art || skin.id;
  if (meta.has(key)) return meta.get(key);
  const get = (n) => IMG[`skins3/${key}/${n}.webp`];
  const head = get('head'), tail = get('tail'), sp = get('sp'), tongue = get('tongue') || null;
  const mods = [get('m0'), get('m1'), get('m2')];
  if (!head || !tail || !sp || mods.some((m) => !m)) return null;
  const mm = mods.map((m) => measure(m));
  const spm = measure(sp);
  // every piece is cut at one common scale per skin; core = body thickness in sprite pixels
  const core = mm.reduce((a, m) => a + (m.bot - m.top + 1), 0) / 3;
  const tb = measureBase(tail);
  const m = {
    head: fadeNeck(head), tail, tongue, mods: mm, sp: spm, tailProf: tb, core,
    ha: head.height / head.width,
    fill: mm[0].fill, dark: mm[0].dark,
  };
  meta.set(key, m);
  return m;
}

const CELL_PER_R = 1 / 0.34;

/**
 * pts: polyline head -> tail, one point per cell (css px). o: {
 *   R (base half thickness = 0.34 cell), tongue, mouth, squash, waves, glow, ghost, death, t,
 *   breaks: Set(i) where pts[i] -> pts[i+1] is a wrap-around jump, clip, shadow
 * }
 * Structure (cells): head 1 | special 2 | A B C A B C ... | tail 1
 */
export function drawSnake(g, pts, skin, o) {
  if (!pts || pts.length < 2) return;
  const art = skinArt(skin);
  if (!art) return;
  const R = o.R;
  const C = R * CELL_PER_R; // one cell
  const T = C * 0.7 * (skin.thick || 1); // body thickness; 1 module = 1 cell
  const u = T / art.core; // sprite px -> screen px (same for head, special and tail: real proportions)
  const t = o.t || 0;

  // tail geometry: base as thick as the body, natural proportions, squeezed at most to 1.8 cells
  const tailBaseH = art.tailProf.bot - art.tailProf.top + 1;
  const tailScale = T / tailBaseH;
  const tailLen = clamp(art.tail.width * tailScale, C, C * (skin.tailLen || 1.6));
  const tailExt = tailLen - C * 0.5;

  // strands split at wrap-around jumps, smoothed and finely resampled
  const strands = [];
  let cur = [pts[0]];
  for (let i = 0; i < pts.length - 1; i++) {
    if (o.breaks && o.breaks.has(i)) { strands.push(cur); cur = []; }
    cur.push(pts[i + 1]);
  }
  strands.push(cur);
  {
    const st = strands[strands.length - 1];
    if (st.length === 1) st.push({ x: st[0].x + 0.01, y: st[0].y });
    const a = st[st.length - 2], b = st[st.length - 1];
    const dl = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    st.push({ x: b.x + ((b.x - a.x) / dl) * tailExt, y: b.y + ((b.y - a.y) / dl) * tailExt });
  }
  const step = Math.max(1.1, R * 0.12);
  let dAcc = 0;
  const S = [];
  for (const st of strands) {
    if (st.length === 1) st.push({ x: st[0].x + 0.01, y: st[0].y });
    const smp = resample(chaikin(st, 3), step, dAcc);
    dAcc = smp[smp.length - 1].d + step;
    S.push(smp);
  }
  const total = Math.max(dAcc - step, C);
  const tailStart = Math.max(total - tailExt - C * 0.5, C * 1.2);

  // tangent angle (pointing towards the head)
  for (const smp of S) {
    for (let i = 0; i < smp.length; i++) {
      const a = smp[Math.max(0, i - 2)], b = smp[Math.min(smp.length - 1, i + 2)];
      smp[i].a = Math.atan2(a.y - b.y, a.x - b.x);
    }
  }

  // --- head geometry: natural proportions, never stretched
  let hw = art.head.width * u * (skin.headW || 1), hh = hw * art.ha;
  if (hw > T * 2.1) { hh *= (T * 2.1) / hw; hw = T * 2.1; }
  if (hh > C * 1.8) { hw *= (C * 1.8) / hh; hh = C * 1.8; }
  const fwd = C * 0.5 - hh / 2 + hh * (skin.headFwd || 0);

  g.save();
  if (o.clip) { g.beginPath(); g.rect(o.clip.x, o.clip.y, o.clip.w, o.clip.h); g.clip(); }
  if (o.ghost) g.globalAlpha = 0.45 + 0.4 * (0.5 + 0.5 * Math.sin(t * 22));
  const base = g.getTransform();

  // boost aura (and a faint permanent aura for glowing skins)
  if (o.glow > 0 || skin.aura) {
    g.save();
    g.globalCompositeOperation = 'lighter';
    const col = o.glow > 0 ? '#FFD36A' : skin.aura;
    const sp = glowSprite(col, 64);
    const k = o.glow > 0 ? 0.26 * o.glow : 0.09 + 0.05 * Math.sin(t * 3);
    for (const smp of S) {
      for (let i = 0; i < smp.length; i += 7) {
        const s = smp[i];
        const rr = R * (2.4 + 0.3 * Math.sin(t * 9 - s.d * 0.05));
        g.globalAlpha = k;
        g.drawImage(sp, s.x - rr, s.y - rr, rr * 2, rr * 2);
      }
    }
    g.restore();
  }

  // soft drop shadow: a few stacked translucent strokes (no shadowBlur, which is very slow on phones)
  if (o.shadow !== false) {
    g.save();
    g.translate(R * 0.25, R * 0.45);
    g.strokeStyle = '#060804';
    g.lineCap = 'round';
    g.lineJoin = 'round';
    for (const [w, a] of [[1.25, 0.07], [1.05, 0.09], [0.88, 0.12]]) {
      g.globalAlpha = a;
      g.lineWidth = T * w * 1.3;
      for (const smp of S) {
        g.beginPath();
        let started = false;
        for (const s of smp) {
          if (s.d > total - tailLen * 0.4) break;
          if (!started) { g.moveTo(s.x, s.y); started = true; } else g.lineTo(s.x, s.y);
        }
        g.stroke();
      }
    }
    g.restore();
  }

  // underlay tube: hides hairline gaps between strips on tight curves
  g.lineCap = 'round';
  g.lineJoin = 'round';
  for (const smp of S) {
    for (const [col, w] of [[art.dark, 1.02], [art.fill, 0.84]]) {
      g.strokeStyle = col;
      g.lineWidth = T * w;
      g.beginPath();
      let started = false;
      for (const s of smp) {
        if (s.d < C * 0.4) continue;
        if (s.d > tailStart + C * 0.3) break;
        if (!started) { g.moveTo(s.x, s.y); started = true; } else g.lineTo(s.x, s.y);
      }
      g.stroke();
    }
  }

  // textured strips, from the tail towards the head
  const dw = step * 2.3;
  const spStart = C * 0.5, spEnd = C * 2.5;
  // the special keeps its real proportions: centred on its two cells, never longer than them
  const spLen = Math.min(art.sp.img.width * u, spEnd - spStart);
  const spA = (spStart + spEnd) / 2 - spLen / 2, spB = spA + spLen;
  const fade = C * 0.3;
  const ga = g.globalAlpha;
  for (let si = S.length - 1; si >= 0; si--) {
    const smp = S[si];
    for (let i = smp.length - 1; i >= 0; i--) {
      const s = smp[i];
      if (s.d < C * 0.3) break;
      const c = Math.cos(s.a), sn = Math.sin(s.a);
      // strip axis: +x along the body (towards the tail), +y across it
      g.setTransform(-base.a * c, -base.d * sn, -base.a * sn, base.d * c, base.a * s.x + base.e, base.d * s.y + base.f);
      let im;
      if (s.d >= tailStart - fade) {
        im = art.tail; const u = Math.max(0, s.d - tailStart) / tailLen;
        if (u >= 1) continue;
        if (s.d < tailStart) {
          // overlap zone: finish the module strip, then fade the tail base in over it
          drawMod(s);
          g.globalAlpha = ga * (1 - (tailStart - s.d) / fade);
        }
        const h = im.height * tailScale;
        const cy = ((art.tailProf.top + art.tailProf.bot) / 2 - im.height / 2) * tailScale;
        const sx = clamp(u * im.width, 0, im.width - 1);
        const sw = Math.max(1, (step / tailLen) * im.width);
        g.drawImage(im, sx, 0, Math.min(sw, im.width - sx), im.height, -dw / 2, -h / 2 - cy, dw, h);
        g.globalAlpha = ga;
        continue;
      }
      drawMod(s);
    }
  }
  g.setTransform(base);
  // one strip of the special or of a body module at distance s.d from the head
  function drawMod(s) {
    let im, m, u2, len;
    let k;
    if (s.d >= spA && s.d < spB) { m = art.sp; u2 = (s.d - spA) / (spB - spA); len = spB - spA; k = u; }
    else {
      // modules: one per cell, A B C repeating from the end of the special's two cells;
      // the cells around a short special continue with module C / A
      const cellI = Math.floor((s.d - spEnd) / C);
      m = art.mods[((cellI % 3) + 3) % 3]; u2 = (s.d - spEnd - cellI * C) / C; len = C;
      k = T / (m.bot - m.top + 1);
    }
    im = m.img;
    const cy = ((m.top + m.bot) / 2 - im.height / 2) * k;
    const sx = clamp(u2 * im.width, 0, im.width - 1);
    const sw = Math.max(1, (step / len) * im.width);
    g.drawImage(im, sx, 0, Math.min(sw, im.width - sx), im.height, -dw / 2, -im.height * k / 2 - cy, dw, im.height * k);
  }

  // eating glow: a soft light in the colour of the orb runs from the head to the tail, fading as it goes
  if (o.waves && o.waves.length) {
    g.save();
    g.globalCompositeOperation = 'lighter';
    for (const w of o.waves) {
      const sp = glowSprite(w.color, 64);
      const front = w.t * (total + R * 4);
      const life = 1 - w.t;
      for (const smp of S) {
        for (let i = 0; i < smp.length; i += 2) {
          const q = smp[i];
          const x = (q.d - front) / (R * 4.5);
          const a = (0.5 * Math.exp(-x * x) + 0.16 * (1 - q.d / total)) * life * life;
          if (a < 0.02) continue;
          g.globalAlpha = Math.min(0.6, a);
          g.drawImage(sp, q.x - R * 1.8, q.y - R * 1.8, R * 3.6, R * 3.6);
        }
      }
    }
    g.restore();
  }

  // head: the sheet's top-down head, rotated to the direction of travel
  const s0 = S[0][0];
  let k1 = 1;
  while (k1 < S[0].length - 1 && S[0][k1].d < R * 1.2) k1++;
  const s1 = S[0][k1];
  const ang = Math.atan2(s0.y - s1.y, s0.x - s1.x);
  // sinking into water / lava / acid: the head shrinks and fades under the surface
  const sk = clamp(o.sink || 0, 0, 1);
  if (sk < 0.98) {
    const k = 1 - 0.45 * sk;
    drawHead(g, s0.x, s0.y, ang, R, art, skin, sk ? { ...o, tongue: 0, mouth: 0, fade: Math.pow(1 - sk, 1.4) } : o, { hw: hw * k, hh: hh * k, fwd: fwd * k });
  }
  g.restore();
}

function drawHead(g, x, y, ang, R, art, skin, o, hd) {
  const img = art.head;
  const { hw: w, hh: h, fwd } = hd;
  const sq = clamp(o.squash || 0, 0, 1);
  const tg = clamp(Math.max(o.tongue || 0, (o.mouth || 0) > 0.4 ? o.mouth : 0), 0, 1);
  g.save();
  if (o.fade !== undefined) g.globalAlpha *= o.fade;
  g.translate(x, y);
  g.rotate(ang + Math.PI / 2); // the sprite faces up (-y)
  g.translate(0, -fwd);
  // forked tongue flicking out from under the snout (the sheet's own tongue when it has one)
  if (tg > 0.02) {
    const tim = art.tongue;
    if (tim) {
      const k = w / img.width;
      const tw = tim.width * k, th = tim.height * k;
      const out = th * 0.62 * tg;
      g.drawImage(tim, -tw / 2, -h * 0.44 - out, tw, th);
    } else {
      const len = R * 1.1 * tg;
      const tipY = -h * 0.42;
      g.strokeStyle = skin.tongue || '#C7354A';
      g.lineWidth = Math.max(1.4, R * 0.12);
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.beginPath();
      g.moveTo(0, tipY + R * 0.4);
      g.lineTo(0, tipY - len);
      g.lineTo(-R * 0.22, tipY - len - R * 0.3);
      g.moveTo(0, tipY - len);
      g.lineTo(R * 0.22, tipY - len - R * 0.3);
      g.stroke();
    }
  }
  // eating: quick lunge and squash (the head art stays whole)
  g.translate(0, -sq * R * 0.2);
  g.scale(1 + sq * 0.1, 1 + sq * 0.14);
  g.save();
  g.globalAlpha *= 0.32;
  g.drawImage(glowSprite('#000000', 64), -w * 0.55 + R * 0.25, -h * 0.5 + R * 0.4, w * 1.1, h * 0.72); // front of the head only (the neck fades into the body)
  g.restore();
  g.drawImage(img, -w / 2, -h / 2, w, h);
  if (skin.eyeGlow) {
    g.globalCompositeOperation = 'lighter';
    g.globalAlpha = 0.22 + 0.1 * Math.sin((o.t || 0) * 3);
    const sp = glowSprite(skin.eyeGlow, 64);
    g.drawImage(sp, -w * 0.7, -h * 0.65, w * 1.4, h * 1.1);
  }
  g.restore();
}

// Paths used by the menus and the skins preview.
export function pathPoints(cx, cy, w, h, t, len, n = 40, kind = 'eight') {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const u = t - (i / n) * len;
    if (kind === 'eight') pts.push({ x: cx + Math.sin(u) * w, y: cy + Math.sin(u * 2) * h });
    else pts.push({ x: cx + Math.cos(u) * w, y: cy + Math.sin(u) * h });
  }
  return pts;
}
