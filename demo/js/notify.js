// Gentle reminders to come back and play (Android only, through window.ZnakexNotify).
// Never asked at the first launch: the game offers them after a few games, explains how they work,
// and only then Android asks for the permission. At most one a day, in the evening, only on days the
// player hasn't played, and they stop after 3 unanswered days. They can be turned off in Settings.
import * as store from './store.js';
import { t } from './i18n.js';

const MESSAGES = [
  'Tu racha diaria te espera: juega hoy para no perderla.',
  'La ruleta diaria ya está lista. ¿Qué te tocará hoy?',
  'Hay nuevas misiones y monedas esperándote en ZNAKEX.',
];
export const ASK_AFTER_GAMES = 3;

const native = () => (typeof window !== 'undefined' && window.ZnakexNotify) || null;
export const supported = () => !!native();

export function permission() {
  try { return native() ? native().permission() : 'denied'; } catch { return 'denied'; }
}

// refresh tomorrow's reminder (called at every launch, in the current language) or cancel it
export function sync() {
  const n = native();
  if (!n) return;
  const set = store.S().settings;
  try {
    if (set.notify && permission() === 'granted') n.schedule(JSON.stringify(MESSAGES.map((m) => t(m))));
    else n.cancel();
  } catch { /* not available */ }
}

// turn reminders on: Android shows its permission dialog if needed; cb(granted)
export function enable(cb) {
  const n = native();
  const set = store.S().settings;
  if (!n) { cb && cb(false); return; }
  const done = (granted) => {
    set.notify = !!granted;
    store.save();
    sync();
    cb && cb(!!granted);
  };
  if (permission() === 'granted') { done(true); return; }
  window.__znakexNotifyPermission = (granted) => { window.__znakexNotifyPermission = null; done(granted); };
  try { n.requestPermission(); } catch { done(false); }
}

export function disable() {
  store.S().settings.notify = false;
  store.save();
  sync();
}

// the game offers reminders once, after a few games, if the player hasn't decided yet
export function shouldOffer() {
  const S = store.S();
  return supported() && !S.notifyAsked && (S.gamesTotal || 0) >= ASK_AFTER_GAMES && permission() !== 'denied';
}
