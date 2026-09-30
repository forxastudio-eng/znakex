// Languages. Spanish is the source text: every string in the game is written in Spanish and
// passed through t(); the other languages map that Spanish text to their own (js/lang/*.js).
// Placeholders: {n}, {m}... Plurals: the dictionary value can be { one, few, many, other }.
import { EN } from './lang/en.js';
import { PT } from './lang/pt.js';
import { ID } from './lang/id.js';
import { RU } from './lang/ru.js';
import { ES_PLURALS } from './lang/es.js';

export const LANGS = [
  { id: 'es', name: 'Español' },
  { id: 'en', name: 'English' },
  { id: 'pt', name: 'Português' },
  { id: 'id', name: 'Bahasa Indonesia' },
  { id: 'ru', name: 'Русский' },
];
const DICTS = { es: ES_PLURALS, en: EN, pt: PT, id: ID, ru: RU };

let cur = 'es';
let rules = new Intl.PluralRules('es');

export function setLang(l) {
  cur = DICTS[l] ? l : 'en';
  rules = new Intl.PluralRules(cur === 'pt' ? 'pt-BR' : cur);
  if (typeof document !== 'undefined') document.documentElement.lang = cur;
}
export const getLang = () => cur;

// first language of the phone that the game speaks; English otherwise
export function detectLang() {
  const list = (typeof navigator !== 'undefined' && (navigator.languages || [navigator.language])) || [];
  for (const l of list) {
    const k = String(l || '').toLowerCase().slice(0, 2);
    if (k === 'in') return 'id'; // old Android code for Indonesian
    if (DICTS[k]) return k;
  }
  return 'en';
}

const fill = (s, v) => (v ? s.replace(/\{(\w+)\}/g, (m, k) => (v[k] !== undefined ? v[k] : m)) : s);

export function t(s, v) {
  if (typeof s !== 'string' || !s) return s;
  const d = DICTS[cur];
  let r = d[s];
  if (r && typeof r === 'object') {
    const n = v && v.n !== undefined ? Number(v.n) : 1;
    r = r[n === 0 ? 'other' : rules.select(n)] || r.other; // '0 days', never '0 day' (Portuguese counts 0 as singular)
  }
  return fill(r === undefined ? s : r, v);
}

// counted text: tn('{n} días', 3) -> '3 días' / '3 days' / '3 дня'
export const tn = (s, n) => t(s, { n });
