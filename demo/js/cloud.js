// Progress saved with the player's Google account (Google Play Games "Saved Games", through
// window.ZnakexGames in the Android app). The player signs in automatically when they use Play Games;
// the cloud copy is loaded at start and merged keeping the most progress, and every change is uploaded
// a few seconds later (and when the app goes to the background). A portable save code is kept as a backup.
import * as store from './store.js';

const native = () => (typeof window !== 'undefined' && window.ZnakexGames) || null;
const st = { signed: false, name: '', loaded: false, timer: 0, listeners: [] };

export const available = () => { try { return !!(native() && native().available()); } catch { return false; } };
export const signedIn = () => st.signed;
export const playerName = () => st.name;
export const onChange = (f) => st.listeners.push(f);
const changed = () => st.listeners.forEach((f) => { try { f(); } catch { /* ignore */ } });

export function init() {
  if (!available()) return;
  window.__znakexGames = (ok, name) => {
    st.signed = !!ok;
    st.name = name || '';
    if (ok && !st.loaded) { try { native().load(); } catch { /* ignore */ } }
    changed();
  };
  window.__znakexCloudLoaded = (json) => {
    st.loaded = true;
    let remote = null;
    try { remote = json ? JSON.parse(json) : null; } catch { remote = null; }
    if (remote && typeof remote === 'object' && store.mergeCloud(remote)) changed();
    upload(); // the merged result goes back to the cloud
  };
  store.onSave(() => schedule());
  try { native().refresh(); } catch { /* ignore */ } // the sign-in may have finished before the game loaded
}

export function signIn() { try { native() && native().signIn(); } catch { /* ignore */ } }

function schedule() {
  if (!st.signed || !st.loaded) return;
  clearTimeout(st.timer);
  st.timer = setTimeout(upload, 4000);
}

export function upload() {
  clearTimeout(st.timer);
  if (!st.signed || !st.loaded || !native()) return;
  const S = store.S();
  try { native().save(JSON.stringify(S), `${store.totalCleared('normal')}/160 · ${S.coins}`); } catch { /* ignore */ }
}

// best scores also go to the Play Games leaderboards
export function submitScore(mode, score) {
  if (!st.signed || !native()) return;
  try { native().submit(mode, Math.round(score)); } catch { /* ignore */ }
}

export function showLeaderboard(mode) {
  if (!native()) return false;
  if (!st.signed) { signIn(); return true; }
  try { native().showLeaderboard(mode || ''); } catch { /* ignore */ }
  return true;
}

export function exportCode() {
  const raw = JSON.stringify(store.S());
  return btoa(unescape(encodeURIComponent(raw)));
}

export function importCode(code) {
  try {
    const obj = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
    if (!obj || typeof obj !== 'object' || typeof obj.coins !== 'number') return false;
    localStorage.setItem(store.KEY, JSON.stringify(obj));
    store.load();
    store.save();
    return true;
  } catch { return false; }
}
