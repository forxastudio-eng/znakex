// Sprite snake renderer: the real head / body / tail art from each skin sheet.
// The body texture is mapped along the (smoothed) path in thin strips so it
// bends with the snake; the tail texture continues the path; the head is the
// sheet's top-down head rotated to the movement direction.
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
const meta = new Map();

export function skinArt(skin) {
  const key = skin.art || skin.id;
  if (meta.has(key)) return meta.get(key);
  const head = IMG[`skins2/${key}/head.png`], body = IMG[`skins2/${key}/body.png`], tail = IMG[`skins2/${key}/tail.png`];
  if (!head || !body || !tail) return null;
  const m = { head, body, tail, ...measure(body, false) };
  m.tailProf = measure(tail, true);
  meta.set(key, m);
  return m;
}

// Opaque vertical extent of a texture (whole image, or only its left edge for
// tails) plus its average colour.
function measure(img, leftEdgeOnly) {
  const c = document.createElement('canvas');
  const W = leftEdgeOnly ? Math.min(10, img.width) : img.width;
  c.width = W; c.height = img.height;
  const g = c.getContext('2d');
  g.drawImage(img, 0, 0);
  let top = img.height, bot = 0, r = 0, gg = 0, b = 0, n = 0;
  try {
    const d = g.getImageData(0, 0, W, img.height).data;
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < W; x += leftEdgeOnly ? 1 : 2) {
        const i = (y * W + x) * 4;
        if (d[i + 3] > 160) {
          if (y < top) top = y;
          if (y > bot) bot = y;
          r += d[i]; gg += d[i + 1]; b += d[i + 2]; n++;
        }
      }
    }
  } catch { top = 0; bot = img.height - 1; n = 0; }
  if (top > bot) { top = 0; bot = img.height - 1; }
  const avg = n ? [r / n, gg / n, b / n] : [90, 110, 70];
  const hex = (k) => '#' + avg.map((v) => Math.min(255, Math.round(v * k)).toString(16).padStart(2, '0')).join('');
  return { top, bot: Math.max(bot, top + 1), fill: hex(1), dark: hex(0.35) };
}

/**
 * pts: polyline head -> tail (css px). o: {
 *   R (body half thickness), tongue, mouth, squash, bulges:[{d, amp}], glow, ghost, death, t,
 *   breaks: Set(i) where pts[i] -> pts[i+1] is a wrap-around jump, clip, fat, shadow
 * }
 */
export function drawSnake(g, pts, skin, o) {
  if (!pts || pts.length < 2) return;
  const art = skinArt(skin);
  if (!art) return;
  const R = o.R * (o.fat || 1);
  const t = o.t || 0;

  // strands split at wrap-around jumps, smoothed and finely resampled
  const strands = [];
  let cur = [pts[0]];
  for (let i = 0; i < pts.length - 1; i++) {
    if (o.breaks && o.breaks.has(i)) { strands.push(cur); cur = []; }
    cur.push(pts[i + 1]);
  }
  strands.push(cur);
  const step = Math.max(1.1, R * 0.12);
  let dAcc = 0;
  const S = [];
  for (const st of strands) {
    if (st.length === 1) st.push({ x: st[0].x + 0.01, y: st[0].y });
    const smp = resample(chaikin(st, 3), step, dAcc);
    dAcc = smp[smp.length - 1].d + step;
    S.push(smp);
  }
  const total = Math.max(dAcc - step, R);

  // tangent angle (pointing towards the head)
  for (const smp of S) {
    for (let i = 0; i < smp.length; i++) {
      const a = smp[Math.max(0, i - 2)], b = smp[Math.min(smp.length - 1, i + 2)];
      smp[i].a = Math.atan2(a.y - b.y, a.x - b.x);
    }
  }

  // thickness profile: swallowed orbs travel down the body as bulges
  const bulges = o.bulges || [];
  const thick = (d) => {
    let k = 1;
    for (const b of bulges) {
      const x = (d - b.d) / (R * 1.3);
      if (x > -3 && x < 3) k += b.amp * Math.exp(-x * x);
    }
    return k;
  };

  // the tail texture covers the last stretch of the path
  const tailImgW = art.tail.width, tailImgH = art.tail.height;
  const tailBase = art.tailProf.bot - art.tailProf.top + 1;
  const tailScale = (2 * R * 0.95) / tailBase;
  const tailLen = Math.min(tailImgW * tailScale, total * 0.42, R * (skin.tailLen || 5.2));
  const tailStart = total - tailLen;
  const neck = R * 0.8; // body strips start just behind the head centre

  g.save();
  if (o.clip) { g.beginPath(); g.rect(o.clip.x, o.clip.y, o.clip.w, o.clip.h); g.clip(); }
  if (o.ghost) g.globalAlpha = 0.45 + 0.4 * (0.5 + 0.5 * Math.sin(t * 22));
  if (o.death) g.filter = `grayscale(${Math.round(o.death * 100)}%) brightness(${(1 - o.death * 0.3).toFixed(2)})`;
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

  // soft drop shadow (drawn far away and pulled back with the shadow offset)
  if (o.shadow !== false) {
    g.save();
    const off = 20000;
    g.shadowColor = 'rgba(6,8,4,0.45)';
    g.shadowBlur = R * 0.8 * base.a;
    g.shadowOffsetX = (off + R * 0.25) * base.a;
    g.shadowOffsetY = R * 0.45 * base.d;
    g.strokeStyle = '#000';
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.lineWidth = R * 1.9;
    for (const smp of S) {
      g.beginPath();
      let started = false;
      for (const s of smp) {
        if (s.d > total - tailLen * 0.4) break;
        if (!started) { g.moveTo(s.x - off, s.y); started = true; } else g.lineTo(s.x - off, s.y);
      }
      g.stroke();
    }
    g.restore();
  }

  // underlay tube: hides hairline gaps between strips on tight curves
  g.lineCap = 'round';
  g.lineJoin = 'round';
  for (const smp of S) {
    for (const [col, w] of [[art.dark, 1.95], [art.fill, 1.55]]) {
      g.strokeStyle = col;
      g.lineWidth = R * w;
      g.beginPath();
      let started = false;
      for (const s of smp) {
        if (s.d < neck) continue;
        if (s.d > tailStart + R * 0.5) break;
        if (!started) { g.moveTo(s.x, s.y); started = true; } else g.lineTo(s.x, s.y);
      }
      g.stroke();
    }
  }

  // textured strips, from the tail towards the head
  const bw = art.body.width, bh = art.body.height;
  const bodyScale = (2 * R) / (art.bot - art.top + 1);
  const repeat = bw * bodyScale;
  const dw = step * 2.3;
  for (let si = S.length - 1; si >= 0; si--) {
    const smp = S[si];
    for (let i = smp.length - 1; i >= 0; i--) {
      const s = smp[i];
      if (s.d < neck) break;
      const c = Math.cos(s.a), sn = Math.sin(s.a);
      // strip axis: +x along the body (towards the tail), +y across it
      g.setTransform(-base.a * c, -base.d * sn, -base.a * sn, base.d * c, base.a * s.x + base.e, base.d * s.y + base.f);
      if (s.d >= tailStart) {
        const u = (s.d - tailStart) / tailLen;
        const sx = clamp(u * tailImgW, 0, tailImgW - 1);
        const sw = Math.max(1, (step / tailLen) * tailImgW);
        const h = tailImgH * tailScale;
        const cy = ((art.tailProf.top + art.tailProf.bot) / 2 - tailImgH / 2) * tailScale;
        g.drawImage(art.tail, sx, 0, Math.min(sw, tailImgW - sx), tailImgH, -dw / 2, -h / 2 - cy, dw, h);
      } else {
        const k = thick(s.d);
        const u = ((s.d - neck) % repeat + repeat) % repeat;
        const sx = (u / repeat) * bw;
        const sw = Math.max(1, step / bodyScale);
        const h = bh * bodyScale * k;
        const cy = ((art.top + art.bot) / 2 - bh / 2) * bodyScale * k;
        g.drawImage(art.body, sx, 0, Math.min(sw, bw - sx), bh, -dw / 2, -h / 2 - cy, dw, h);
      }
    }
  }
  g.setTransform(base);

  // head: the sheet's top-down head, rotated to the direction of travel
  const s0 = S[0][0];
  let k1 = 1;
  while (k1 < S[0].length - 1 && S[0][k1].d < R * 1.2) k1++;
  const s1 = S[0][k1];
  const ang = Math.atan2(s0.y - s1.y, s0.x - s1.x);
  drawHead(g, s0.x, s0.y, ang, R, art, skin, o);
  g.restore();
}

function drawHead(g, x, y, ang, R, art, skin, o) {
  const img = art.head;
  const w = R * 2 * 1.55 * (skin.headScale || 1);
  const h = w * (img.height / img.width);
  const sq = clamp(o.squash || 0, 0, 1);
  const tg = clamp(Math.max(o.tongue || 0, (o.mouth || 0) > 0.4 ? o.mouth : 0), 0, 1);
  const fwd = R * (0.25 + (skin.headShift || 0));
  g.save();
  g.translate(x, y);
  g.rotate(ang + Math.PI / 2); // the sprite faces up (-y)
  g.translate(0, -fwd);
  // forked tongue flicking out from under the snout
  if (tg > 0.02) {
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
  // eating: quick lunge and squash (the head art stays whole)
  g.translate(0, -sq * R * 0.2);
  g.scale(1 + sq * 0.1, 1 + sq * 0.14);
  g.save();
  const m = g.getTransform();
  const sc = Math.hypot(m.a, m.b);
  g.shadowColor = 'rgba(6,8,4,0.5)';
  g.shadowBlur = R * 0.6 * sc;
  g.shadowOffsetX = R * 0.25 * sc;
  g.shadowOffsetY = R * 0.4 * sc;
  g.drawImage(img, -w / 2, -h / 2, w, h);
  g.restore();
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
