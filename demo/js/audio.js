// Sound engine (Web Audio). Files live in assets/audio/<name>.ogg|mp3|wav; anything missing is simply silent,
// so the game runs the same before and after the sound library is added.
import * as store from './store.js';

// the 30 effects of the library
export const SFX = [
  'ui_tap', 'ui_back', 'ui_open', 'ui_locked', 'coin', 'reward_chime',
  'eat_red', 'eat_gold', 'boost_loop', 'boost_end', 'turn', 'countdown_tick', 'countdown_go',
  'die_hit', 'die_liquid', 'crumble', 'revive', 'level_win', 'level_fail', 'star_pop',
  'item_spawn', 'item_pick', 'shield_break', 'magnet_loop', 'portal_whoosh', 'star_loop',
  'alert_pulse', 'map_change', 'mission_done', 'new_record',
];
// one theme per mode (+ menu and season)
export const MUSIC = ['mus_menu', 'mus_story', 'mus_classic', 'mus_frenzy', 'mus_duel', 'mus_season'];

let ctx = null, master = null, sfxBus = null, musBus = null;
const buffers = new Map(); // name -> AudioBuffer | null (missing)
const pending = new Map();
let music = null; // { name, src, gain }
let musicRate = 1, musicWant = null, ducked = false;
const loops = new Map();

const settings = () => store.S().settings;

export function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    sfxBus = ctx.createGain();
    musBus = ctx.createGain();
    sfxBus.connect(master); musBus.connect(master); master.connect(ctx.destination);
    applySettings();
    // start loading everything in the background
    [...SFX, ...MUSIC].forEach((n, i) => setTimeout(() => load(n), 60 * i));
  }
  if (ctx.state === 'suspended') ctx.resume();
  if (musicWant) playMusic(musicWant);
}

export function applySettings() {
  if (!ctx) return;
  const s = settings();
  const sv = s.sfxVol ?? 0.9, mv = s.musicVol ?? 0.8; // player volume sliders, 0..1
  sfxBus.gain.value = s.sfx === false ? 0 : sv;
  musBus.gain.value = s.music === false ? 0 : mv * (ducked ? 0.35 : 0.7);
}

async function load(name) {
  if (buffers.has(name)) return buffers.get(name);
  if (pending.has(name)) return pending.get(name);
  const job = (async () => {
    if (!ctx) return null;
    for (const ext of ['ogg', 'mp3', 'wav']) {
      try {
        const r = await fetch(`assets/audio/${name}.${ext}`);
        if (!r.ok) continue;
        const buf = await ctx.decodeAudioData(await r.arrayBuffer());
        buffers.set(name, buf);
        return buf;
      } catch { /* try the next format */ }
    }
    buffers.set(name, null);
    return null;
  })();
  pending.set(name, job);
  return job;
}

// one-shot effect. rate = pitch + speed, vol 0..1
export function play(name, { rate = 1, vol = 1, delay = 0 } = {}) {
  if (!ctx || ctx.state !== 'running') return null;
  const buf = buffers.get(name);
  if (buf === undefined) { load(name); return null; }
  if (!buf) return null;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.playbackRate.value = rate;
  const g = ctx.createGain();
  g.gain.value = vol;
  src.connect(g); g.connect(sfxBus);
  src.start(ctx.currentTime + delay);
  return src;
}

// looping effect (boost wind, magnet hum, star shimmer)
export function loop(name, { rate = 1, vol = 0.8 } = {}) {
  if (loops.has(name)) return loops.get(name);
  if (!ctx || ctx.state !== 'running') return null;
  const buf = buffers.get(name);
  if (buf === undefined) { load(name); return null; }
  if (!buf) return null;
  const src = ctx.createBufferSource();
  src.buffer = buf; src.loop = true; src.playbackRate.value = rate;
  const g = ctx.createGain();
  g.gain.value = 0;
  g.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.12);
  src.connect(g); g.connect(sfxBus);
  src.start();
  const h = { src, g, stop: () => { g.gain.cancelScheduledValues(ctx.currentTime); g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.18); setTimeout(() => { try { src.stop(); } catch { /* done */ } }, 260); loops.delete(name); } };
  loops.set(name, h);
  return h;
}

export function stopLoop(name) { const l = loops.get(name); if (l) l.stop(); }
export function stopAllLoops() { [...loops.values()].forEach((l) => l.stop()); }

// background music with a short crossfade
export async function playMusic(name) {
  musicWant = name;
  if (!ctx || ctx.state !== 'running') return;
  if (music && music.name === name) return;
  const buf = await load(name);
  if (musicWant !== name) return; // changed while loading
  if (music) { const old = music; old.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6); setTimeout(() => { try { old.src.stop(); } catch { /* done */ } }, 700); music = null; }
  if (!buf) return;
  const src = ctx.createBufferSource();
  src.buffer = buf; src.loop = true; src.playbackRate.value = musicRate;
  const g = ctx.createGain();
  g.gain.value = 0;
  g.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.8);
  src.connect(g); g.connect(musBus);
  src.start();
  music = { name, src, gain: g };
}

// the theme speeds up (and rises in pitch) with the golden orb
export function setMusicRate(r) {
  musicRate = r;
  if (music && ctx) music.src.playbackRate.linearRampToValueAtTime(r, ctx.currentTime + 0.35);
}

export function duck(on) { ducked = on; applySettings(); }
export function stopMusic() { musicWant = null; if (music) { const m = music; m.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4); setTimeout(() => { try { m.src.stop(); } catch { /* done */ } }, 500); music = null; } }
