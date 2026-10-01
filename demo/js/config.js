// Build flags. The tester APK ships build.js with { tester: true }:
// every level, skin and mode unlocked plus plenty of coins.
// In a browser, ?tester=1 in the URL does the same.
const build = (typeof window !== 'undefined' && window.ZNAKEX_BUILD) || {};
const params = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();

export const CONFIG = {
  tester: !!build.tester || params.has('tester'),
  version: build.version || '0.1-demo',
  privacyUrl: 'https://sites.google.com/view/znakexpoliticadeprivacidad/p%C3%A1gina-principal',
  supportEmail: 'gpunlocked2002@gmail.com',
};
