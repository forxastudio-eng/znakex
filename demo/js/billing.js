// Real purchases with Google Play Billing (window.ZnakexBilling in the Android app). Prices come from
// Google Play in the player's currency. A purchase is granted and saved first, and only then confirmed
// to Google (coins are "consumed" so they can be bought again; the starter pack and the season pass are
// kept for ever and come back with "Restore purchases"). Without the app (browser, old test build) the
// shop simulates purchases.
import * as store from './store.js';
import { ECONOMY } from './data.js';

// product ids: they must be created with these exact ids in Play Console (Monetize > In-app products)
export const PRODUCTS = {
  ...Object.fromEntries(ECONOMY.packs.map((p) => [`coins_${p.coins}`, { coins: p.coins, consumable: true, price: p.price }])),
  starter_pack: { coins: 5000, skin: 'pirata', consumable: false, price: '1,99 US$' },
  season_pass_1: { pass: true, consumable: false, price: '4,99 €' },
};
export const packId = (p) => `coins_${p.coins}`;

const native = () => (typeof window !== 'undefined' && window.ZnakexBilling) || null;
export const real = () => !!native();

let prices = {};
let waiting = null; // callback of the purchase in progress
const listeners = [];
export const onChange = (f) => listeners.push(f);
const changed = () => listeners.forEach((f) => { try { f(); } catch { /* ignore */ } });

export const price = (id) => prices[id] || (PRODUCTS[id] && PRODUCTS[id].price) || '';
export const owns = (id) => (store.S().purchases || []).some((p) => p.id === id);

let grant = null; // set by the UI: (product, id) => void, e.g. the pass needs meta.buyPass()
export const setGranter = (f) => { grant = f; };

export function init() {
  if (!native()) return;
  window.__znakexBillingReady = () => { try { native().products(JSON.stringify(Object.keys(PRODUCTS))); } catch { /* ignore */ } };
  window.__znakexProducts = (p) => { prices = p || {}; changed(); };
  window.__znakexPurchase = (id, token, acked) => deliver(id, token, acked);
  window.__znakexBuyFailed = (cancelled) => { const f = waiting; waiting = null; f && f(cancelled ? 'cancel' : 'error'); };
  window.__znakexBuyPending = () => { const f = waiting; waiting = null; f && f('pending'); };
  try { if (native().ready()) window.__znakexBillingReady(); } catch { /* ignore */ }
}

function deliver(id, token, acked) {
  const prod = PRODUCTS[id];
  if (!prod) return;
  const S = store.S();
  S.purchases = S.purchases || [];
  const known = S.purchases.some((p) => p.token === token);
  if (!known) {
    // a kept item already confirmed before (new phone / reinstall): give back the item, not the coins again
    const giveCoins = !(acked && !prod.consumable);
    if (prod.coins && giveCoins) store.addCoins(prod.coins);
    if (prod.skin && !S.owned.includes(prod.skin)) S.owned.push(prod.skin);
    if (grant) grant(prod, id);
    S.purchases.push({ id, token, t: Date.now() });
    store.save();
  }
  try { native().finish(token, !!prod.consumable); } catch { /* ignore */ }
  const f = waiting; waiting = null;
  if (f) f('ok', prod);
  if (!known) changed();
}

// done(result, product): result = 'ok' | 'cancel' | 'pending' | 'error' | 'unavailable'
export function buy(id, done) {
  if (!native()) { done && done('unavailable'); return false; }
  waiting = done;
  let ok = false;
  try { ok = native().buy(id); } catch { ok = false; }
  if (!ok) { waiting = null; done && done('error'); }
  return ok;
}

export function restore(done) {
  if (!native()) { done && done(0); return; }
  window.__znakexRestored = (n) => { window.__znakexRestored = null; done && done(n); };
  try { native().restore(); } catch { done && done(-1); }
}
