// What the course and the speed test remember, and the small helpers both share.
// Everything is kept in the visitor's own browser (localStorage); nothing is sent anywhere.
import { langs, type Lang } from '../data/keyboard';
import type { Mode } from './typer';

export const STORE = {
  prefs: 'monotypist.prefs', // the choices below
  course: 'monotypist.course', // the course's level, per language
  tries: 'monotypist.tries', // the speed test's finished tries
};

export interface Prefs {
  lang: Lang;
  /** 'standin': an ordinary keyboard stands in; 'direct': a real MonoTypist. */
  kb: Mode;
  /** Words in a test; ignored while `time` is set. */
  words: number;
  /** Seconds a test lasts; 0 for a test by word count. */
  time: number;
  /** Mark the next key on the drawing. */
  hint: boolean;
  /** Mix numbers and symbols into the test. */
  advanced: boolean;
  /** The course: how many times in a row a new character must be typed right. */
  rigor: number;
}

const defaults: Prefs = { lang: 'us', kb: 'standin', words: 25, time: 0, hint: true, advanced: false, rigor: 5 };

export function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback; // storage switched off, or something else's data under this name
  }
}
export function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or switched off: the page works on, it just forgets */
  }
}

export function loadPrefs(): Prefs {
  const p = { ...defaults, ...read<Partial<Prefs>>(STORE.prefs, {}) };
  if (!langs.some((l) => l.id === p.lang)) p.lang = defaults.lang;
  if (p.kb !== 'standin' && p.kb !== 'direct') p.kb = defaults.kb;
  if (![10, 25, 50, 100].includes(p.words)) p.words = defaults.words;
  if (![0, 15, 30, 60].includes(p.time)) p.time = defaults.time;
  p.rigor = Math.min(9, Math.max(2, Math.round(Number(p.rigor)) || defaults.rigor));
  p.hint = !!p.hint;
  p.advanced = !!p.advanced;
  return p;
}
export const savePrefs = (p: Prefs) => write(STORE.prefs, p);

// A row of tabs used as a choice (the kit's script moves the selection on a click or an arrow key).
// `choose` selects the tab with the given value; `onChoice` calls back whenever the selection moves.
const selected = (list: Element) => list.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
export function choose(list: Element, value: string) {
  list.querySelectorAll<HTMLElement>('[role="tab"]').forEach((t) => {
    const on = t.dataset.value === value;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
  });
}
export function onChoice(list: Element, act: (value: string) => void) {
  let now = selected(list)?.dataset.value;
  new MutationObserver(() => {
    const value = selected(list)?.dataset.value;
    if (value === undefined || value === now) return;
    now = value;
    act(value);
  }).observe(list, { attributes: true, subtree: true, attributeFilter: ['aria-selected'] });
}

/** After a click on a control, typing goes on without a second click. A control reached by Tab keeps the focus. */
export function backToTyping(area: HTMLElement, ...controls: (Element | null)[]) {
  controls.forEach((c) => c?.addEventListener('click', (e) => { if ((e as MouseEvent).detail > 0) area.focus({ preventScroll: true }); }));
}
