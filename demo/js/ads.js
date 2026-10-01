// Ads. Real ads (AdMob) come from the Android app through window.ZnakexAds once it is connected;
// in a browser or until then, a simulated ad screen is shown instead. Ads only ever appear between
// games or when the player asks for one (revive, x2 coins...), never over the board during play.
export const ADS_EVERY = 10; // a short ad after every 10 games (a rewarded ad watched by choice resets the count)

let pending = null;
// the Android app calls this when its ad closes: ok = the ad was watched (reward earned)
if (typeof window !== 'undefined') {
  window.__znakexAdDone = (ok) => { const f = pending; pending = null; if (f) f(ok !== false); };
}

export function nativeReady(kind) {
  try { return !!(window.ZnakexAds && window.ZnakexAds.isReady(kind)); } catch { return false; }
}

// kind: 'interstitial' | 'rewarded'. Returns false when no real ad is available (the caller simulates one).
export function showNative(kind, done) {
  if (!nativeReady(kind)) return false;
  pending = done;
  try { window.ZnakexAds.show(kind); } catch { pending = null; return false; }
  return true;
}
