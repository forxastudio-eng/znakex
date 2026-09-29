// Save backup. The Google Play Games cloud save is wired in the native wrapper (Android),
// so on the web build we offer a portable save code instead.
import * as store from './store.js';

export const available = () => !!(window.Android && window.Android.cloudSave);

export function exportCode() {
  const raw = JSON.stringify(store.S());
  return btoa(unescape(encodeURIComponent(raw)));
}

export function importCode(code) {
  try {
    const obj = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
    if (!obj || typeof obj !== 'object' || typeof obj.coins !== 'number') return false;
    localStorage.setItem('znakex.demo.v1', JSON.stringify(obj));
    store.load();
    return true;
  } catch { return false; }
}
